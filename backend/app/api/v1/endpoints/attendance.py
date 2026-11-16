from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import date, datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.models import (
    Attendance, ClassSession, Student, Subject, Enrollment, FacultySubject, Profile, Faculty
)
from backend.app.schemas.schemas import (
    ClassSessionCreate, ClassSessionOut, AttendanceBatchSubmit, AttendanceOut, DefaulterItem
)
from backend.app.services.attendance_service import (
    AttendanceService, calculate_percentage, is_defaulter, calculate_required_classes
)
from backend.app.api.deps import require_faculty, require_any_authenticated, get_current_user

router = APIRouter(prefix="/attendance", tags=["Attendance Management"])

@router.get("/sessions", response_model=List[ClassSessionOut], dependencies=[Depends(require_any_authenticated)])
def get_class_sessions(
    subject_id: Optional[str] = None,
    session_date: Optional[date] = None,
    faculty_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(ClassSession)
    if subject_id:
        q = q.filter(ClassSession.subject_id == subject_id)
    if session_date:
        q = q.filter(ClassSession.session_date == session_date)
    if faculty_id:
        q = q.filter(ClassSession.faculty_id == faculty_id)
        
    sessions = q.order_by(ClassSession.session_date.desc(), ClassSession.session_time.desc()).all()
    results = []
    for s in sessions:
        out = ClassSessionOut.model_validate(s)
        out.subject_code = s.subject.code if s.subject else None
        out.subject_name = s.subject.name if s.subject else None
        out.faculty_name = s.faculty.profile.full_name if (s.faculty and s.faculty.profile) else None
        results.append(out)
    return results

@router.post("/sessions", response_model=ClassSessionOut, dependencies=[Depends(require_faculty)])
def create_class_session(
    sess_in: ClassSessionCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    faculty_id = None
    if current_user.role == "faculty":
        if not current_user.faculty_profile:
            raise HTTPException(status_code=400, detail="Faculty profile not linked")
        faculty_id = current_user.faculty_profile.id
        # Verify faculty is assigned to this subject
        assignment = db.query(FacultySubject).filter(
            FacultySubject.faculty_id == faculty_id,
            FacultySubject.subject_id == sess_in.subject_id,
            FacultySubject.is_active == True
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="You are not authorized to conduct classes for this subject")
    else:
        # Admin creating session: pick assigned faculty or first faculty
        assigned = db.query(FacultySubject).filter(FacultySubject.subject_id == sess_in.subject_id).first()
        if assigned:
            faculty_id = assigned.faculty_id
        else:
            first_f = db.query(Faculty).first()
            if not first_f:
                raise HTTPException(status_code=400, detail="No faculty available to conduct class")
            faculty_id = first_f.id

    # Prevent duplicate session for same subject, date, and time
    existing = db.query(ClassSession).filter(
        ClassSession.subject_id == sess_in.subject_id,
        ClassSession.session_date == sess_in.session_date,
        ClassSession.session_time == sess_in.session_time
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"A class session already exists for this subject on {sess_in.session_date} at {sess_in.session_time}"
        )

    session = ClassSession(
        subject_id=sess_in.subject_id,
        faculty_id=faculty_id,
        session_date=sess_in.session_date,
        session_time=sess_in.session_time,
        topic=sess_in.topic,
        session_type=sess_in.session_type,
        status=sess_in.status,
        created_by=current_user.id
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    out = ClassSessionOut.model_validate(session)
    out.subject_code = session.subject.code if session.subject else None
    out.subject_name = session.subject.name if session.subject else None
    out.faculty_name = session.faculty.profile.full_name if (session.faculty and session.faculty.profile) else None
    return out

@router.get("/session/{session_id}/sheet", dependencies=[Depends(require_faculty)])
def get_session_attendance_sheet(session_id: str, db: Session = Depends(get_db)):
    """Returns enrolled students with their existing marked attendance (if any) for this session."""
    session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    enrollments = db.query(Enrollment).filter(Enrollment.subject_id == session.subject_id).all()
    # Existing attendance records
    existing_att = {
        att.student_id: att
        for att in db.query(Attendance).filter(Attendance.session_id == session_id).all()
    }

    students_sheet = []
    for enr in enrollments:
        st = enr.student
        att = existing_att.get(st.id)
        students_sheet.append({
            "student_id": st.id,
            "roll_number": st.roll_number,
            "registration_number": st.registration_number,
            "student_name": st.profile.full_name if st.profile else "",
            "status": att.status if att else "present", # default initial state
            "is_previously_marked": bool(att),
            "remarks": att.remarks if att else ""
        })

    return {
        "session_id": session.id,
        "subject_id": session.subject_id,
        "subject_code": session.subject.code,
        "subject_name": session.subject.name,
        "session_date": str(session.session_date),
        "session_time": session.session_time,
        "topic": session.topic,
        "status": session.status,
        "students": sorted(students_sheet, key=lambda x: x["roll_number"])
    }

@router.post("/mark", dependencies=[Depends(require_faculty)])
def mark_attendance(
    payload: AttendanceBatchSubmit,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """
    Submits or corrects attendance for a class session.
    Verifies faculty authorization, enrolled students, prevents duplication, and records who marked/modified.
    """
    session = None
    if payload.session_id:
        session = db.query(ClassSession).filter(ClassSession.id == payload.session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Class session not found")
    else:
        # Create session on the fly if not existing
        if not (payload.subject_id and payload.session_date and payload.session_time):
            raise HTTPException(status_code=400, detail="Must provide session_id or subject_id + session_date + session_time")
        
        # Check existing session
        session = db.query(ClassSession).filter(
            ClassSession.subject_id == payload.subject_id,
            ClassSession.session_date == payload.session_date,
            ClassSession.session_time == payload.session_time
        ).first()

        if not session:
            faculty_id = None
            if current_user.role == "faculty":
                if not current_user.faculty_profile:
                    raise HTTPException(status_code=400, detail="Faculty profile not linked")
                faculty_id = current_user.faculty_profile.id
            else:
                assigned = db.query(FacultySubject).filter(FacultySubject.subject_id == payload.subject_id).first()
                faculty_id = assigned.faculty_id if assigned else db.query(Faculty).first().id

            session = ClassSession(
                subject_id=payload.subject_id,
                faculty_id=faculty_id,
                session_date=payload.session_date,
                session_time=payload.session_time,
                topic=payload.topic or "Regular Lecture",
                session_type=payload.session_type or "regular",
                status="completed",
                created_by=current_user.id
            )
            db.add(session)
            db.commit()
            db.refresh(session)

    # Check faculty authorization if user is faculty
    if current_user.role == "faculty":
        if session.faculty_id != current_user.faculty_profile.id:
            # Check if assigned to subject
            is_assigned = db.query(FacultySubject).filter(
                FacultySubject.faculty_id == current_user.faculty_profile.id,
                FacultySubject.subject_id == session.subject_id
            ).first()
            if not is_assigned:
                raise HTTPException(status_code=403, detail="You are not authorized to mark attendance for this subject")

    # Get valid enrolled student IDs
    enrolled_ids = {
        enr.student_id
        for enr in db.query(Enrollment).filter(Enrollment.subject_id == session.subject_id).all()
    }

    # Record attendance items
    now = datetime.now(timezone.utc)
    present_count = 0
    absent_count = 0

    for rec in payload.records:
        if rec.student_id not in enrolled_ids:
            continue # Only mark enrolled students

        stat = rec.status.lower()
        if stat not in ["present", "absent"]:
            stat = "present"

        if stat == "present":
            present_count += 1
        else:
            absent_count += 1

        existing_record = db.query(Attendance).filter(
            Attendance.session_id == session.id,
            Attendance.student_id == rec.student_id
        ).first()

        if existing_record:
            # Authorized correction / update
            existing_record.status = stat
            existing_record.remarks = rec.remarks
            existing_record.modified_by = current_user.id
            existing_record.updated_at = now
        else:
            # New attendance record
            new_record = Attendance(
                session_id=session.id,
                student_id=rec.student_id,
                status=stat,
                marked_by=current_user.id,
                modified_by=None,
                remarks=rec.remarks,
                created_at=now,
                updated_at=now
            )
            db.add(new_record)

    db.commit()

    return {
        "message": "Attendance successfully recorded",
        "session_id": session.id,
        "subject_id": session.subject_id,
        "session_date": str(session.session_date),
        "total_marked": present_count + absent_count,
        "present_count": present_count,
        "absent_count": absent_count
    }

@router.get("/history", dependencies=[Depends(require_any_authenticated)])
def get_attendance_history(
    subject_id: Optional[str] = None,
    student_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # If logged in as student, restrict to their own records
    if current_user.role == "student":
        if not current_user.student_profile:
            raise HTTPException(status_code=400, detail="Student profile not found")
        student_id = current_user.student_profile.id

    q = db.query(Attendance).join(ClassSession, Attendance.session_id == ClassSession.id)
    if subject_id:
        q = q.filter(ClassSession.subject_id == subject_id)
    if student_id:
        q = q.filter(Attendance.student_id == student_id)
    if start_date:
        q = q.filter(ClassSession.session_date >= start_date)
    if end_date:
        q = q.filter(ClassSession.session_date <= end_date)

    records = q.order_by(ClassSession.session_date.desc(), Attendance.created_at.desc()).limit(150).all()
    results = []
    for r in records:
        results.append({
            "id": r.id,
            "session_id": r.session_id,
            "student_id": r.student_id,
            "student_name": r.student.profile.full_name if (r.student and r.student.profile) else "N/A",
            "roll_number": r.student.roll_number if r.student else "N/A",
            "subject_code": r.session.subject.code if (r.session and r.session.subject) else "N/A",
            "subject_name": r.session.subject.name if (r.session and r.session.subject) else "N/A",
            "session_date": str(r.session.session_date) if r.session else "N/A",
            "session_time": r.session.session_time if r.session else "N/A",
            "status": r.status,
            "remarks": r.remarks,
            "updated_at": r.updated_at
        })
    return results

@router.get("/defaulters", response_model=List[DefaulterItem], dependencies=[Depends(require_faculty)])
def get_defaulters(
    subject_id: Optional[str] = None,
    department_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """
    Calculates defaulters (attendance < 75.00%) using Python logic.
    Calculates additional classes required to reach 75%.
    """
    # If faculty, limit to assigned subjects if subject_id not provided
    if current_user.role == "faculty" and current_user.faculty_profile:
        if subject_id:
            return AttendanceService.get_defaulters_list(db, subject_id=subject_id, department_id=department_id)
        else:
            assigned = db.query(FacultySubject).filter(
                FacultySubject.faculty_id == current_user.faculty_profile.id,
                FacultySubject.is_active == True
            ).all()
            all_defaulters = []
            for a in assigned:
                sub_defs = AttendanceService.get_defaulters_list(db, subject_id=a.subject_id)
                all_defaulters.extend(sub_defs)
            return all_defaulters

    return AttendanceService.get_defaulters_list(db, subject_id=subject_id, department_id=department_id)
