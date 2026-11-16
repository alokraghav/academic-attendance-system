from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.models import (
    Department, Course, Semester, Subject, FacultySubject, Enrollment, Student, Faculty, Profile
)
from backend.app.schemas.schemas import (
    DepartmentCreate, DepartmentOut,
    CourseCreate, CourseOut,
    SemesterCreate, SemesterOut,
    SubjectCreate, SubjectOut,
    FacultySubjectCreate, FacultySubjectOut,
    EnrollmentCreate, EnrollmentOut
)
from backend.app.api.deps import require_admin, require_any_authenticated, get_current_user

router = APIRouter(prefix="/academics", tags=["Academics Management"])

# --- DEPARTMENTS ---
@router.get("/departments", response_model=List[DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).order_by(Department.name).all()

@router.post("/departments", response_model=DepartmentOut, dependencies=[Depends(require_admin)])
def create_department(dep_in: DepartmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Department).filter(Department.code == dep_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Department with code '{dep_in.code}' already exists")
    dep = Department(**dep_in.model_dump())
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep

@router.delete("/departments/{dep_id}", dependencies=[Depends(require_admin)])
def delete_department(dep_id: str, db: Session = Depends(get_db)):
    dep = db.query(Department).filter(Department.id == dep_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dep)
    db.commit()
    return {"message": "Department deleted successfully"}

# --- COURSES ---
@router.get("/courses", response_model=List[CourseOut])
def get_courses(department_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Course)
    if department_id:
        q = q.filter(Course.department_id == department_id)
    courses = q.order_by(Course.code).all()
    results = []
    for c in courses:
        out = CourseOut.model_validate(c)
        out.department_name = c.department.name if c.department else None
        results.append(out)
    return results

@router.post("/courses", response_model=CourseOut, dependencies=[Depends(require_admin)])
def create_course(c_in: CourseCreate, db: Session = Depends(get_db)):
    existing = db.query(Course).filter(Course.code == c_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Course with code '{c_in.code}' already exists")
    c = Course(**c_in.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    out = CourseOut.model_validate(c)
    out.department_name = c.department.name if c.department else None
    return out

@router.delete("/courses/{course_id}", dependencies=[Depends(require_admin)])
def delete_course(course_id: str, db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(c)
    db.commit()
    return {"message": "Course deleted successfully"}

# --- SEMESTERS ---
@router.get("/semesters", response_model=List[SemesterOut])
def get_semesters(course_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Semester)
    if course_id:
        q = q.filter(Semester.course_id == course_id)
    semesters = q.order_by(Semester.semester_number).all()
    results = []
    for s in semesters:
        out = SemesterOut.model_validate(s)
        out.course_name = s.course.name if s.course else None
        results.append(out)
    return results

@router.post("/semesters", response_model=SemesterOut, dependencies=[Depends(require_admin)])
def create_semester(s_in: SemesterCreate, db: Session = Depends(get_db)):
    sem = Semester(**s_in.model_dump())
    db.add(sem)
    db.commit()
    db.refresh(sem)
    out = SemesterOut.model_validate(sem)
    out.course_name = sem.course.name if sem.course else None
    return out

# --- SUBJECTS ---
@router.get("/subjects", response_model=List[SubjectOut])
def get_subjects(
    course_id: Optional[str] = None,
    semester_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Subject)
    if course_id:
        q = q.filter(Subject.course_id == course_id)
    if semester_id:
        q = q.filter(Subject.semester_id == semester_id)
    subjects = q.order_by(Subject.code).all()
    results = []
    for s in subjects:
        out = SubjectOut.model_validate(s)
        out.course_code = s.course.code if s.course else None
        out.semester_number = s.semester.semester_number if s.semester else None
        results.append(out)
    return results

@router.post("/subjects", response_model=SubjectOut, dependencies=[Depends(require_admin)])
def create_subject(sub_in: SubjectCreate, db: Session = Depends(get_db)):
    existing = db.query(Subject).filter(Subject.code == sub_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Subject with code '{sub_in.code}' already exists")
    s = Subject(**sub_in.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    out = SubjectOut.model_validate(s)
    out.course_code = s.course.code if s.course else None
    out.semester_number = s.semester.semester_number if s.semester else None
    return out

@router.delete("/subjects/{subject_id}", dependencies=[Depends(require_admin)])
def delete_subject(subject_id: str, db: Session = Depends(get_db)):
    sub = db.query(Subject).filter(Subject.id == subject_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(sub)
    db.commit()
    return {"message": "Subject deleted successfully"}

# --- FACULTY-SUBJECT ASSIGNMENT ---
@router.get("/faculty-subjects", response_model=List[FacultySubjectOut])
def get_faculty_subjects(
    faculty_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    academic_year: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(FacultySubject)
    if faculty_id:
        q = q.filter(FacultySubject.faculty_id == faculty_id)
    if subject_id:
        q = q.filter(FacultySubject.subject_id == subject_id)
    if academic_year:
        q = q.filter(FacultySubject.academic_year == academic_year)
    assignments = q.all()
    results = []
    for a in assignments:
        out = FacultySubjectOut.model_validate(a)
        out.faculty_name = a.faculty.profile.full_name if (a.faculty and a.faculty.profile) else None
        out.subject_code = a.subject.code if a.subject else None
        out.subject_name = a.subject.name if a.subject else None
        results.append(out)
    return results

@router.post("/faculty-subjects", response_model=FacultySubjectOut, dependencies=[Depends(require_admin)])
def assign_faculty_subject(assign_in: FacultySubjectCreate, db: Session = Depends(get_db)):
    existing = db.query(FacultySubject).filter(
        FacultySubject.faculty_id == assign_in.faculty_id,
        FacultySubject.subject_id == assign_in.subject_id,
        FacultySubject.academic_year == assign_in.academic_year
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Faculty already assigned to this subject for this academic year")
    a = FacultySubject(**assign_in.model_dump())
    db.add(a)
    db.commit()
    db.refresh(a)
    out = FacultySubjectOut.model_validate(a)
    out.faculty_name = a.faculty.profile.full_name if (a.faculty and a.faculty.profile) else None
    out.subject_code = a.subject.code if a.subject else None
    out.subject_name = a.subject.name if a.subject else None
    return out

@router.delete("/faculty-subjects/{assign_id}", dependencies=[Depends(require_admin)])
def unassign_faculty_subject(assign_id: str, db: Session = Depends(get_db)):
    a = db.query(FacultySubject).filter(FacultySubject.id == assign_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(a)
    db.commit()
    return {"message": "Faculty unassigned from subject"}

# --- STUDENT ENROLLMENTS ---
@router.get("/enrollments", response_model=List[EnrollmentOut])
def get_enrollments(
    subject_id: Optional[str] = None,
    student_id: Optional[str] = None,
    semester_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Enrollment)
    if subject_id:
        q = q.filter(Enrollment.subject_id == subject_id)
    if student_id:
        q = q.filter(Enrollment.student_id == student_id)
    if semester_id:
        q = q.filter(Enrollment.semester_id == semester_id)
    enrollments = q.all()
    results = []
    for e in enrollments:
        out = EnrollmentOut.model_validate(e)
        out.student_name = e.student.profile.full_name if (e.student and e.student.profile) else None
        out.roll_number = e.student.roll_number if e.student else None
        out.subject_code = e.subject.code if e.subject else None
        out.subject_name = e.subject.name if e.subject else None
        results.append(out)
    return results

@router.post("/enrollments", response_model=EnrollmentOut, dependencies=[Depends(require_admin)])
def enroll_student(enr_in: EnrollmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == enr_in.student_id,
        Enrollment.subject_id == enr_in.subject_id,
        Enrollment.academic_year == enr_in.academic_year
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this subject for this academic year")
    e = Enrollment(**enr_in.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    out = EnrollmentOut.model_validate(e)
    out.student_name = e.student.profile.full_name if (e.student and e.student.profile) else None
    out.roll_number = e.student.roll_number if e.student else None
    out.subject_code = e.subject.code if e.subject else None
    out.subject_name = e.subject.name if e.subject else None
    return out
