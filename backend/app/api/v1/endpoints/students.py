from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash
from backend.app.models.models import Student, Profile, Department, Course, Semester, Enrollment
from backend.app.schemas.schemas import StudentCreate, StudentOut
from backend.app.services.attendance_service import AttendanceService
from backend.app.api.deps import require_admin, require_faculty, require_any_authenticated, get_current_user

router = APIRouter(prefix="/students", tags=["Students Management"])

def _build_student_out(student: Student) -> StudentOut:
    return StudentOut(
        id=student.id,
        profile_id=student.profile_id,
        roll_number=student.roll_number,
        registration_number=student.registration_number,
        department_id=student.department_id,
        course_id=student.course_id,
        current_semester_id=student.current_semester_id,
        batch_year=student.batch_year,
        full_name=student.profile.full_name if student.profile else "",
        email=student.profile.email if student.profile else "",
        phone=student.profile.phone if student.profile else None,
        department_name=student.department.name if student.department else None,
        course_name=student.course.name if student.course else None,
        semester_number=student.current_semester.semester_number if student.current_semester else None,
        created_at=student.created_at
    )

@router.get("", response_model=List[StudentOut], dependencies=[Depends(require_faculty)])
def list_students(
    department_id: Optional[str] = None,
    course_id: Optional[str] = None,
    semester_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Student).join(Profile, Student.profile_id == Profile.id)
    if department_id:
        q = q.filter(Student.department_id == department_id)
    if course_id:
        q = q.filter(Student.course_id == course_id)
    if semester_id:
        q = q.filter(Student.current_semester_id == semester_id)
    if search:
        search_fmt = f"%{search}%"
        q = q.filter(
            or_(
                Profile.full_name.ilike(search_fmt),
                Profile.email.ilike(search_fmt),
                Student.roll_number.ilike(search_fmt),
                Student.registration_number.ilike(search_fmt),
            )
        )
    students = q.order_by(Student.roll_number).all()
    return [_build_student_out(s) for s in students]

@router.get("/{student_id}", dependencies=[Depends(require_any_authenticated)])
def get_student(student_id: str, db: Session = Depends(get_db), current_user: Profile = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Authorization: Student can only view their own profile, Faculty/Admin can view any
    if current_user.role == "student" and (not current_user.student_profile or current_user.student_profile.id != student_id):
        raise HTTPException(status_code=403, detail="Access denied to view this student profile")
    
    out = _build_student_out(student).model_dump()
    # Attach overall attendance calculation
    out["attendance_summary"] = AttendanceService.get_student_overall_attendance(db, student.id)
    return out

@router.post("", response_model=StudentOut, dependencies=[Depends(require_admin)])
def create_student(st_in: StudentCreate, db: Session = Depends(get_db)):
    # Check if email exists
    if db.query(Profile).filter(Profile.email == st_in.email).first():
        raise HTTPException(status_code=400, detail="User with this email already exists")
    # Check roll number
    if db.query(Student).filter(Student.roll_number == st_in.roll_number).first():
        raise HTTPException(status_code=400, detail="Student with this roll number already exists")
    # Check registration number
    if db.query(Student).filter(Student.registration_number == st_in.registration_number).first():
        raise HTTPException(status_code=400, detail="Student with this registration number already exists")

    # Create profile
    profile = Profile(
        email=st_in.email,
        full_name=st_in.full_name,
        role="student",
        phone=st_in.phone,
        hashed_password=get_password_hash(st_in.password),
        is_active=True
    )
    db.add(profile)
    db.flush()

    # Create student record
    student = Student(
        profile_id=profile.id,
        roll_number=st_in.roll_number,
        registration_number=st_in.registration_number,
        department_id=st_in.department_id,
        course_id=st_in.course_id,
        current_semester_id=st_in.current_semester_id,
        batch_year=st_in.batch_year
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return _build_student_out(student)

@router.delete("/{student_id}", dependencies=[Depends(require_admin)])
def delete_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    profile = student.profile
    db.delete(student)
    if profile:
        db.delete(profile)
    db.commit()
    return {"message": "Student deleted successfully"}
