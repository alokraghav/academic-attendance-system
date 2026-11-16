from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash
from backend.app.models.models import Profile
from backend.app.schemas.schemas import ProfileOut
from backend.app.api.deps import require_admin

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("", response_model=List[ProfileOut], dependencies=[Depends(require_admin)])
def list_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Profile)
    if role:
        q = q.filter(Profile.role == role)
    return q.order_by(Profile.created_at.desc()).all()

@router.put("/{user_id}/status", dependencies=[Depends(require_admin)])
def toggle_user_status(user_id: str, is_active: bool, db: Session = Depends(get_db)):
    user = db.query(Profile).filter(Profile.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    db.commit()
    return {"message": f"User {'activated' if is_active else 'deactivated'} successfully"}

@router.put("/{user_id}/reset-password", dependencies=[Depends(require_admin)])
def admin_reset_password(user_id: str, new_password: str, db: Session = Depends(get_db)):
    user = db.query(Profile).filter(Profile.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Password reset successfully by admin"}
