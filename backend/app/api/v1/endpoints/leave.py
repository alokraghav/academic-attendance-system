from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.models import LeaveApplication, Student, Profile
from backend.app.schemas.schemas import (
    LeaveApplicationCreate, LeaveApplicationReview, LeaveApplicationOut
)
from backend.app.api.deps import require_student, require_faculty, require_any_authenticated, get_current_user

router = APIRouter(prefix="/leave", tags=["Leave Management"])

def _build_leave_out(leave: LeaveApplication) -> LeaveApplicationOut:
    return LeaveApplicationOut(
        id=leave.id,
        student_id=leave.student_id,
        student_name=leave.student.profile.full_name if (leave.student and leave.student.profile) else None,
        roll_number=leave.student.roll_number if leave.student else None,
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
        document_url=leave.document_url,
        status=leave.status,
        reviewed_by=leave.reviewed_by,
        reviewer_name=leave.reviewer.full_name if leave.reviewer else None,
        review_remarks=leave.review_remarks,
        reviewed_at=leave.reviewed_at,
        created_at=leave.created_at
    )

@router.post("/apply", response_model=LeaveApplicationOut, dependencies=[Depends(require_student)])
def apply_leave(
    leave_in: LeaveApplicationCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only students can submit leave applications")
    
    if leave_in.end_date < leave_in.start_date:
        raise HTTPException(status_code=400, detail="End date cannot be prior to start date")

    leave = LeaveApplication(
        student_id=current_user.student_profile.id,
        leave_type=leave_in.leave_type,
        start_date=leave_in.start_date,
        end_date=leave_in.end_date,
        reason=leave_in.reason,
        document_url=leave_in.document_url,
        status="pending"
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return _build_leave_out(leave)

@router.get("/my-leaves", response_model=List[LeaveApplicationOut], dependencies=[Depends(require_student)])
def get_my_leaves(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Student profile not found")
        
    leaves = (
        db.query(LeaveApplication)
        .filter(LeaveApplication.student_id == current_user.student_profile.id)
        .order_by(LeaveApplication.created_at.desc())
        .all()
    )
    return [_build_leave_out(l) for l in leaves]

@router.get("/requests", response_model=List[LeaveApplicationOut], dependencies=[Depends(require_faculty)])
def get_all_leave_requests(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(LeaveApplication)
    if status_filter:
        q = q.filter(LeaveApplication.status == status_filter)
    leaves = q.order_by(LeaveApplication.created_at.desc()).all()
    return [_build_leave_out(l) for l in leaves]

@router.put("/{leave_id}/review", response_model=LeaveApplicationOut, dependencies=[Depends(require_faculty)])
def review_leave(
    leave_id: str,
    review_in: LeaveApplicationReview,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    leave = db.query(LeaveApplication).filter(LeaveApplication.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave application not found")
    
    if review_in.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")

    leave.status = review_in.status
    leave.review_remarks = review_in.review_remarks
    leave.reviewed_by = current_user.id
    leave.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(leave)
    return _build_leave_out(leave)
