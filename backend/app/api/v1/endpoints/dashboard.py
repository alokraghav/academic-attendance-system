from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from datetime import date, datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.models import (
    Student, Faculty, Subject, Department, ClassSession, Attendance, LeaveApplication, FacultySubject, Enrollment, Profile
)
from backend.app.services.attendance_service import (
    AttendanceService, calculate_percentage, is_defaulter
)
from backend.app.api.deps import require_admin, require_faculty, require_student, get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard Statistics"])

@router.get("/admin", dependencies=[Depends(require_admin)])
def get_admin_dashboard(db: Session = Depends(get_db)):
    today = date.today()

    total_students = db.query(func.count(Student.id)).scalar() or 0
    total_faculty = db.query(func.count(Faculty.id)).scalar() or 0
    total_subjects = db.query(func.count(Subject.id)).scalar() or 0

    # Today's attendance stats
    today_sessions = db.query(ClassSession.id).filter(ClassSession.session_date == today).all()
    today_session_ids = [s[0] for s in today_sessions]

    today_marked = 0
    today_present = 0
    if today_session_ids:
        today_marked = (
            db.query(func.count(Attendance.id))
            .filter(Attendance.session_id.in_(today_session_ids))
            .scalar() or 0
        )
        today_present = (
            db.query(func.count(Attendance.id))
            .filter(Attendance.session_id.in_(today_session_ids), Attendance.status == "present")
            .scalar() or 0
        )
    today_pct = calculate_percentage(today_present, today_marked)

    # Pending leave requests
    pending_leaves = db.query(func.count(LeaveApplication.id)).filter(LeaveApplication.status == "pending").scalar() or 0

    # Overall Defaulters count calculated in Python
    defaulters_list = AttendanceService.get_defaulters_list(db)
    # Unique students that are defaulters in at least 1 subject
    unique_defaulter_student_ids = set(d["student_id"] for d in defaulters_list)
    defaulter_count = len(unique_defaulter_student_ids)

    # Department-wise statistics
    dept_stats = []
    departments = db.query(Department).all()
    for d in departments:
        st_count = db.query(func.count(Student.id)).filter(Student.department_id == d.id).scalar() or 0
        fac_count = db.query(func.count(Faculty.id)).filter(Faculty.department_id == d.id).scalar() or 0
        dept_stats.append({
            "department_id": d.id,
            "department_code": d.code,
            "department_name": d.name,
            "students_count": st_count,
            "faculty_count": fac_count
        })

    # Recent attendance records
    recent_records = (
        db.query(Attendance)
        .join(ClassSession, Attendance.session_id == ClassSession.id)
        .order_by(Attendance.created_at.desc())
        .limit(8)
        .all()
    )
    recent_attendance = [
        {
            "id": r.id,
            "student_name": r.student.profile.full_name if (r.student and r.student.profile) else "N/A",
            "roll_number": r.student.roll_number if r.student else "N/A",
            "subject_code": r.session.subject.code if (r.session and r.session.subject) else "N/A",
            "session_date": str(r.session.session_date) if r.session else "N/A",
            "status": r.status
        }
        for r in recent_records
    ]

    return {
        "summary": {
            "total_students": total_students,
            "total_faculty": total_faculty,
            "total_subjects": total_subjects,
            "today_attendance_percentage": today_pct,
            "today_present_count": today_present,
            "today_total_marked": today_marked,
            "pending_leave_requests": pending_leaves,
            "defaulter_students_count": defaulter_count
        },
        "department_statistics": dept_stats,
        "recent_attendance": recent_attendance,
        "defaulters_preview": defaulters_list[:5]
    }


@router.get("/faculty", dependencies=[Depends(require_faculty)])
def get_faculty_dashboard(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    today = date.today()
    faculty_id = current_user.faculty_profile.id if current_user.faculty_profile else None
    
    # Assigned subjects
    assigned_q = db.query(FacultySubject).filter(FacultySubject.is_active == True)
    if faculty_id:
        assigned_q = assigned_q.filter(FacultySubject.faculty_id == faculty_id)
    assigned_subs = assigned_q.all()
    subject_ids = [a.subject_id for a in assigned_subs]

    # Total enrolled students across these subjects
    enrolled_students_count = 0
    if subject_ids:
        enrolled_students_count = (
            db.query(func.count(distinct(Enrollment.student_id)))
            .filter(Enrollment.subject_id.in_(subject_ids))
            .scalar() or 0
        )

    # Today's attendance marked by this faculty
    today_sessions = (
        db.query(ClassSession.id)
        .filter(ClassSession.session_date == today)
    )
    if faculty_id:
        today_sessions = today_sessions.filter(ClassSession.faculty_id == faculty_id)
    today_session_ids = [s[0] for s in today_sessions.all()]

    today_marked = 0
    today_present = 0
    if today_session_ids:
        today_marked = (
            db.query(func.count(Attendance.id))
            .filter(Attendance.session_id.in_(today_session_ids))
            .scalar() or 0
        )
        today_present = (
            db.query(func.count(Attendance.id))
            .filter(Attendance.session_id.in_(today_session_ids), Attendance.status == "present")
            .scalar() or 0
        )
    today_pct = calculate_percentage(today_present, today_marked)

    # Pending leave applications
    pending_leaves = db.query(func.count(LeaveApplication.id)).filter(LeaveApplication.status == "pending").scalar() or 0

    # Assigned subjects list with basic stats
    subjects_list = []
    for a in assigned_subs:
        s = a.subject
        if s:
            conducted = db.query(func.count(ClassSession.id)).filter(
                ClassSession.subject_id == s.id,
                ClassSession.status == "completed"
            ).scalar() or 0
            enr_count = db.query(func.count(Enrollment.id)).filter(Enrollment.subject_id == s.id).scalar() or 0
            subjects_list.append({
                "subject_id": s.id,
                "code": s.code,
                "name": s.name,
                "credits": s.credits,
                "enrolled_students": enr_count,
                "classes_conducted": conducted
            })

    # Defaulters in assigned subjects
    defaulters = []
    for s_id in subject_ids:
        defaulters.extend(AttendanceService.get_defaulters_list(db, subject_id=s_id))

    return {
        "summary": {
            "assigned_subjects_count": len(assigned_subs),
            "total_enrolled_students": enrolled_students_count,
            "today_attendance_percentage": today_pct,
            "today_marked_count": today_marked,
            "pending_leaves_count": pending_leaves,
            "defaulters_count": len(defaulters)
        },
        "assigned_subjects": subjects_list,
        "defaulters_preview": defaulters[:6]
    }


@router.get("/student", dependencies=[Depends(require_student)])
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Student profile not found")
        
    student = current_user.student_profile
    attendance_summary = AttendanceService.get_student_overall_attendance(db, student.id)

    # Recent attendance records
    recent_q = (
        db.query(Attendance)
        .join(ClassSession, Attendance.session_id == ClassSession.id)
        .filter(Attendance.student_id == student.id)
        .order_by(ClassSession.session_date.desc())
        .limit(5)
        .all()
    )
    recent_attendance = [
        {
            "id": r.id,
            "subject_code": r.session.subject.code if (r.session and r.session.subject) else "N/A",
            "subject_name": r.session.subject.name if (r.session and r.session.subject) else "N/A",
            "session_date": str(r.session.session_date) if r.session else "N/A",
            "status": r.status,
            "remarks": r.remarks
        }
        for r in recent_q
    ]

    # Recent leave applications
    leaves = (
        db.query(LeaveApplication)
        .filter(LeaveApplication.student_id == student.id)
        .order_by(LeaveApplication.created_at.desc())
        .limit(3)
        .all()
    )
    recent_leaves = [
        {
            "id": l.id,
            "leave_type": l.leave_type,
            "start_date": str(l.start_date),
            "end_date": str(l.end_date),
            "status": l.status,
            "review_remarks": l.review_remarks
        }
        for l in leaves
    ]

    return {
        "student": {
            "full_name": current_user.full_name,
            "roll_number": student.roll_number,
            "registration_number": student.registration_number,
            "course": student.course.name if student.course else "BCA",
            "semester": student.current_semester.semester_number if student.current_semester else 6,
            "batch_year": student.batch_year
        },
        "attendance": attendance_summary,
        "recent_attendance": recent_attendance,
        "recent_leaves": recent_leaves
    }
