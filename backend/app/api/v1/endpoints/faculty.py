from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash
from backend.app.models.models import Faculty, Profile, Department, FacultySubject, Subject, Enrollment, Student
from backend.app.schemas.schemas import FacultyCreate, FacultyOut
from backend.app.api.deps import require_admin, require_faculty, get_current_user

router = APIRouter(prefix="/faculty", tags=["Faculty Management"])

def _build_faculty_out(f: Faculty) -> FacultyOut:
    return FacultyOut(
        id=f.id,
        profile_id=f.profile_id,
        employee_id=f.employee_id,
        department_id=f.department_id,
        designation=f.designation,
        qualification=f.qualification,
        joining_date=f.joining_date,
        full_name=f.profile.full_name if f.profile else "",
        email=f.profile.email if f.profile else "",
        phone=f.profile.phone if f.profile else None,
        department_name=f.department.name if f.department else None,
        created_at=f.created_at
    )

@router.get("", response_model=List[FacultyOut])
def list_faculty(
    department_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Faculty).join(Profile, Faculty.profile_id == Profile.id)
    if department_id:
        q = q.filter(Faculty.department_id == department_id)
    if search:
        search_fmt = f"%{search}%"
        q = q.filter(
            or_(
                Profile.full_name.ilike(search_fmt),
                Profile.email.ilike(search_fmt),
                Faculty.employee_id.ilike(search_fmt),
                Faculty.designation.ilike(search_fmt),
            )
        )
    faculty_list = q.order_by(Faculty.employee_id).all()
    return [_build_faculty_out(f) for f in faculty_list]

@router.get("/my-subjects", dependencies=[Depends(require_faculty)])
def get_my_assigned_subjects(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Returns subjects assigned to the logged-in faculty (or all if admin)."""
    if current_user.role == "admin":
        subjects = db.query(Subject).all()
        return [
            {
                "id": s.id,
                "code": s.code,
                "name": s.name,
                "subject_type": s.subject_type,
                "credits": s.credits,
                "course_code": s.course.code if s.course else None,
                "semester_number": s.semester.semester_number if s.semester else None
            }
            for s in subjects
        ]
    
    if not current_user.faculty_profile:
        raise HTTPException(status_code=400, detail="User is not associated with a faculty profile")
    
    faculty_id = current_user.faculty_profile.id
    assigned = (
        db.query(FacultySubject)
        .filter(FacultySubject.faculty_id == faculty_id, FacultySubject.is_active == True)
        .all()
    )
    result = []
    for a in assigned:
        s = a.subject
        if s:
            result.append({
                "assignment_id": a.id,
                "subject_id": s.id,
                "code": s.code,
                "name": s.name,
                "subject_type": s.subject_type,
                "credits": s.credits,
                "academic_year": a.academic_year,
                "course_code": s.course.code if s.course else None,
                "semester_number": s.semester.semester_number if s.semester else None
            })
    return result

@router.get("/my-students", dependencies=[Depends(require_faculty)])
def get_my_students(
    subject_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Returns enrolled students for faculty's subjects."""
    if current_user.role == "faculty" and current_user.faculty_profile:
        # Verify faculty is assigned to this subject if subject_id is passed
        if subject_id:
            assigned = db.query(FacultySubject).filter(
                FacultySubject.faculty_id == current_user.faculty_profile.id,
                FacultySubject.subject_id == subject_id
            ).first()
            if not assigned:
                raise HTTPException(status_code=403, detail="You are not assigned to this subject")

    q = db.query(Enrollment).join(Student, Enrollment.student_id == Student.id).join(Profile, Student.profile_id == Profile.id)
    if subject_id:
        q = q.filter(Enrollment.subject_id == subject_id)
        
    enrollments = q.all()
    # Deduplicate students
    seen_student_ids = set()
    students = []
    for enr in enrollments:
        if enr.student_id not in seen_student_ids:
            seen_student_ids.add(enr.student_id)
            st = enr.student
            students.append({
                "student_id": st.id,
                "roll_number": st.roll_number,
                "registration_number": st.registration_number,
                "full_name": st.profile.full_name,
                "email": st.profile.email,
                "course_code": st.course.code if st.course else None,
                "semester_number": st.current_semester.semester_number if st.current_semester else None
            })
    return sorted(students, key=lambda x: x["roll_number"])

@router.post("", response_model=FacultyOut, dependencies=[Depends(require_admin)])
def create_faculty(f_in: FacultyCreate, db: Session = Depends(get_db)):
    if db.query(Profile).filter(Profile.email == f_in.email).first():
        raise HTTPException(status_code=400, detail="User with this email already exists")
    if db.query(Faculty).filter(Faculty.employee_id == f_in.employee_id).first():
        raise HTTPException(status_code=400, detail="Faculty with this employee ID already exists")

    profile = Profile(
        email=f_in.email,
        full_name=f_in.full_name,
        role="faculty",
        phone=f_in.phone,
        hashed_password=get_password_hash(f_in.password),
        is_active=True
    )
    db.add(profile)
    db.flush()

    faculty = Faculty(
        profile_id=profile.id,
        employee_id=f_in.employee_id,
        department_id=f_in.department_id,
        designation=f_in.designation,
        qualification=f_in.qualification,
        joining_date=f_in.joining_date
    )
    db.add(faculty)
    db.commit()
    db.refresh(faculty)
    return _build_faculty_out(faculty)

@router.delete("/{faculty_id}", dependencies=[Depends(require_admin)])
def delete_faculty(faculty_id: str, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    profile = faculty.profile
    db.delete(faculty)
    if profile:
        db.delete(profile)
    db.commit()
    return {"message": "Faculty deleted successfully"}
