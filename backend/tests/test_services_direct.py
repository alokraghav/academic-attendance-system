import pytest
from datetime import date
from backend.app.core.database import SessionLocal
from backend.app.models.models import Profile, Student, Faculty, ClassSession
from backend.app.schemas.schemas import (
    LoginRequest, AttendanceBatchSubmit, AttendanceRecordInput,
    LeaveApplicationCreate, LeaveApplicationReview
)
from backend.app.api.v1.endpoints.auth import login
from backend.app.api.v1.endpoints.dashboard import (
    get_admin_dashboard, get_faculty_dashboard, get_student_dashboard
)
from backend.app.api.v1.endpoints.attendance import mark_attendance, get_defaulters
from backend.app.api.v1.endpoints.leave import apply_leave, review_leave
from backend.app.api.v1.endpoints.reports import get_student_report, get_defaulter_report
from backend.app.services.attendance_service import AttendanceService

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_admin_login(db):
    req = LoginRequest(email="admin@smartacademic.edu", password="Admin@123")
    res = login(req, db)
    assert res["access_token"] is not None
    assert res["user"]["role"] == "admin"
    assert res["user"]["email"] == "admin@smartacademic.edu"

def test_faculty_login(db):
    req = LoginRequest(email="rajesh.sharma@smartacademic.edu", password="Faculty@123")
    res = login(req, db)
    assert res["access_token"] is not None
    assert res["user"]["role"] == "faculty"

def test_student_login(db):
    req = LoginRequest(email="student01@smartacademic.edu", password="Student@123")
    res = login(req, db)
    assert res["access_token"] is not None
    assert res["user"]["role"] == "student"

def test_admin_dashboard_stats(db):
    data = get_admin_dashboard(db)
    summary = data["summary"]
    assert summary["total_students"] >= 25
    assert summary["total_faculty"] >= 3
    assert summary["total_subjects"] >= 5
    assert "department_statistics" in data
    assert len(data["department_statistics"]) >= 2
    assert "recent_attendance" in data

def test_defaulters_calculation(db):
    defaulters = AttendanceService.get_defaulters_list(db)
    assert len(defaulters) > 0
    for d in defaulters:
        # Check defaulter rule: attendance percentage must be < 75.0%
        assert d["attendance_percentage"] < 75.00
        # Check required classes calculation: must be positive integer
        assert d["additional_classes_needed"] > 0
        # Verify formula: (attended + needed) / (total + needed) >= 0.75
        new_att = d["attended_classes"] + d["additional_classes_needed"]
        new_tot = d["total_classes"] + d["additional_classes_needed"]
        assert (new_att / new_tot) >= 0.75

def test_mark_attendance_and_correction(db):
    admin = db.query(Profile).filter(Profile.role == "admin").first()
    session = db.query(ClassSession).first()
    assert session is not None
    student = db.query(Student).first()
    assert student is not None

    # Mark attendance
    payload = AttendanceBatchSubmit(
        session_id=session.id,
        records=[
            AttendanceRecordInput(student_id=student.id, status="present", remarks="On time")
        ]
    )
    result = mark_attendance(payload, db=db, current_user=admin)
    assert result["present_count"] >= 1

    # Correct attendance to absent
    payload_corr = AttendanceBatchSubmit(
        session_id=session.id,
        records=[
            AttendanceRecordInput(student_id=student.id, status="absent", remarks="Corrected to absent")
        ]
    )
    result_corr = mark_attendance(payload_corr, db=db, current_user=admin)
    assert result_corr["absent_count"] >= 1

def test_leave_workflow(db):
    student_profile = db.query(Profile).filter(Profile.email == "student01@smartacademic.edu").first()
    admin_profile = db.query(Profile).filter(Profile.role == "admin").first()

    # Apply leave
    leave_in = LeaveApplicationCreate(
        leave_type="medical",
        start_date=date.today(),
        end_date=date.today(),
        reason="Viral fever symptoms",
        document_url=None
    )
    leave_app = apply_leave(leave_in, db=db, current_user=student_profile)
    assert leave_app.status == "pending"

    # Review leave
    review_in = LeaveApplicationReview(status="approved", review_remarks="Doctor note accepted")
    reviewed = review_leave(leave_app.id, review_in, db=db, current_user=admin_profile)
    assert reviewed.status == "approved"
    assert reviewed.review_remarks == "Doctor note accepted"

def test_csv_report_generation(db):
    res = get_student_report(student_id=None, format="csv", db=db)
    assert res.media_type == "text/csv"
    assert "Roll Number" in res.body.decode("utf-8")
    assert "Attendance Percentage" in res.body.decode("utf-8")

def test_excel_report_generation(db):
    res = get_defaulter_report(subject_id=None, format="excel", db=db)
    assert "spreadsheetml" in res.media_type
    assert len(res.body) > 2000 # Excel file header + data
