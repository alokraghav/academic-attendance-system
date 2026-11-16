from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from backend.app.core.database import get_db
from backend.app.models.models import (
    Student, Subject, Attendance, ClassSession, LeaveApplication, Faculty, Profile
)
from backend.app.services.attendance_service import AttendanceService, calculate_percentage
from backend.app.services.report_service import ReportService
from backend.app.api.deps import require_faculty, require_any_authenticated

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

def _format_response(data: list, title: str, file_format: str, filename_prefix: str) -> Response:
    fmt = file_format.lower()
    if fmt == "csv":
        csv_content = ReportService.generate_csv(data)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}_{date.today()}.csv"'}
        )
    else: # Excel
        excel_bytes = ReportService.generate_excel(data, title=title, sheet_name="Attendance_Report")
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}_{date.today()}.xlsx"'}
        )

@router.get("/student", dependencies=[Depends(require_faculty)])
def get_student_report(
    student_id: Optional[str] = None,
    format: str = Query("excel", pattern="^(excel|csv)$"),
    db: Session = Depends(get_db)
):
    """Generates Student Attendance Report with overall percentage and subject-wise breakdown."""
    students_q = db.query(Student).join(Profile, Student.profile_id == Profile.id)
    if student_id:
        students_q = students_q.filter(Student.id == student_id)
    students = students_q.all()

    data = []
    for s in students:
        overall = AttendanceService.get_student_overall_attendance(db, s.id)
        data.append({
            "Roll Number": s.roll_number,
            "Registration No": s.registration_number,
            "Student Name": s.profile.full_name,
            "Course": s.course.code if s.course else "BCA",
            "Conducted Classes": overall["total_conducted"],
            "Attended Classes": overall["total_attended"],
            "Missed Classes": overall["total_missed"],
            "Attendance Percentage (%)": overall["overall_percentage"],
            "Defaulter Status": "Defaulter (<75%)" if overall["is_defaulter"] else "Regular (>=75%)",
            "Classes Needed for 75%": overall["required_classes_to_75"]
        })

    return _format_response(data, "Student Attendance Report", format, "Student_Attendance_Report")


@router.get("/subject", dependencies=[Depends(require_faculty)])
def get_subject_report(
    subject_id: Optional[str] = None,
    format: str = Query("excel", pattern="^(excel|csv)$"),
    db: Session = Depends(get_db)
):
    """Generates Subject-wise Attendance Report."""
    subs_q = db.query(Subject)
    if subject_id:
        subs_q = subs_q.filter(Subject.id == subject_id)
    subjects = subs_q.all()

    data = []
    for sub in subjects:
        # Total sessions conducted
        conducted = db.query(ClassSession).filter(
            ClassSession.subject_id == sub.id,
            ClassSession.status == "completed"
        ).count()
        
        # Enrolled students stats
        from backend.app.models.models import Enrollment
        enrollments = db.query(Enrollment).filter(Enrollment.subject_id == sub.id).all()
        for enr in enrollments:
            st = enr.student
            st_stat = AttendanceService.get_student_subject_attendance(db, st.id, sub.id)
            data.append({
                "Subject Code": sub.code,
                "Subject Name": sub.name,
                "Roll Number": st.roll_number,
                "Student Name": st.profile.full_name if st.profile else "N/A",
                "Total Conducted": st_stat["total_conducted"],
                "Classes Attended": st_stat["attended"],
                "Classes Missed": st_stat["missed"],
                "Attendance Percentage (%)": st_stat["percentage"],
                "Is Defaulter": "YES (<75%)" if st_stat["is_defaulter"] else "NO",
                "Classes Needed for 75%": st_stat["required_classes_to_75"]
            })

    return _format_response(data, "Subject-wise Attendance Report", format, "Subject_Attendance_Report")


@router.get("/date-wise", dependencies=[Depends(require_faculty)])
def get_date_wise_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    subject_id: Optional[str] = None,
    format: str = Query("excel", pattern="^(excel|csv)$"),
    db: Session = Depends(get_db)
):
    """Generates Date-wise Class and Attendance Report."""
    q = db.query(Attendance).join(ClassSession, Attendance.session_id == ClassSession.id)
    if start_date:
        q = q.filter(ClassSession.session_date >= start_date)
    if end_date:
        q = q.filter(ClassSession.session_date <= end_date)
    if subject_id:
        q = q.filter(ClassSession.subject_id == subject_id)
        
    records = q.order_by(ClassSession.session_date.desc()).limit(500).all()
    data = []
    for r in records:
        data.append({
            "Date": str(r.session.session_date) if r.session else "",
            "Time": r.session.session_time if r.session else "",
            "Subject Code": r.session.subject.code if (r.session and r.session.subject) else "",
            "Subject Name": r.session.subject.name if (r.session and r.session.subject) else "",
            "Roll Number": r.student.roll_number if r.student else "",
            "Student Name": r.student.profile.full_name if (r.student and r.student.profile) else "",
            "Attendance Status": r.status.upper(),
            "Remarks": r.remarks or ""
        })

    return _format_response(data, "Date-wise Attendance Report", format, "Date_Attendance_Report")


@router.get("/defaulters", dependencies=[Depends(require_faculty)])
def get_defaulter_report(
    subject_id: Optional[str] = None,
    department_id: Optional[str] = None,
    format: str = Query("excel", pattern="^(excel|csv)$"),
    db: Session = Depends(get_db)
):
    """
    Generates Official Defaulter Report (Attendance < 75.00%).
    Contains: Student Name, Roll Number, Subject, Attended Classes, Total Classes,
    Attendance Percentage, Additional classes needed to reach 75%.
    """
    defaulters = AttendanceService.get_defaulters_list(db, subject_id=subject_id, department_id=department_id)
    data = []
    for d in defaulters:
        data.append({
            "Student Name": d["student_name"],
            "Roll Number": d["roll_number"],
            "Registration No": d["registration_number"],
            "Subject Code": d["subject_code"],
            "Subject Name": d["subject_name"],
            "Attended Classes": d["attended_classes"],
            "Total Classes": d["total_classes"],
            "Attendance Percentage (%)": d["attendance_percentage"],
            "Additional Classes Needed (75%)": d["additional_classes_needed"]
        })

    return _format_response(data, "Official Defaulter Report (Attendance Below 75%)", format, "Defaulter_Report")


@router.get("/faculty", dependencies=[Depends(require_faculty)])
def get_faculty_report(
    format: str = Query("excel", pattern="^(excel|csv)$"),
    db: Session = Depends(get_db)
):
    """Generates Faculty Teaching and Class Session Report."""
    faculty_list = db.query(Faculty).all()
    data = []
    for f in faculty_list:
        conducted_sessions = db.query(ClassSession).filter(
            ClassSession.faculty_id == f.id,
            ClassSession.status == "completed"
        ).count()
        from backend.app.models.models import FacultySubject
        assigned_subs = db.query(FacultySubject).filter(FacultySubject.faculty_id == f.id).count()
        data.append({
            "Employee ID": f.employee_id,
            "Faculty Name": f.profile.full_name if f.profile else "",
            "Department": f.department.name if f.department else "N/A",
            "Designation": f.designation,
            "Assigned Subjects Count": assigned_subs,
            "Total Classes Conducted": conducted_sessions,
            "Joining Date": str(f.joining_date) if f.joining_date else "N/A"
        })

    return _format_response(data, "Faculty Teaching and Attendance Summary Report", format, "Faculty_Attendance_Report")


@router.get("/leave", dependencies=[Depends(require_faculty)])
def get_leave_report(
    status_filter: Optional[str] = None,
    format: str = Query("excel", pattern="^(excel|csv)$"),
    db: Session = Depends(get_db)
):
    """Generates Leave Application Report."""
    q = db.query(LeaveApplication)
    if status_filter:
        q = q.filter(LeaveApplication.status == status_filter)
    leaves = q.order_by(LeaveApplication.created_at.desc()).all()
    data = []
    for l in leaves:
        data.append({
            "Application ID": l.id[:8],
            "Roll Number": l.student.roll_number if l.student else "N/A",
            "Student Name": l.student.profile.full_name if (l.student and l.student.profile) else "N/A",
            "Leave Type": l.leave_type.capitalize(),
            "Start Date": str(l.start_date),
            "End Date": str(l.end_date),
            "Reason": l.reason,
            "Status": l.status.upper(),
            "Reviewed By": l.reviewer.full_name if l.reviewer else "Pending Review",
            "Review Remarks": l.review_remarks or "None",
            "Applied At": l.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return _format_response(data, "Student Leave Applications Report", format, "Leave_Applications_Report")
