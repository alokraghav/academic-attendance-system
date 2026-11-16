from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from backend.app.core.database import get_db
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.core.config import settings
from backend.app.models.models import Profile, Student, Faculty
from backend.app.schemas.schemas import (
    LoginRequest, Token, ForgotPasswordRequest, ResetPasswordRequest, ProfileOut
)
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.email == request.email).first()
    if not profile or not verify_password(request.password, profile.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not profile.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact administrator.",
        )
    
    access_token = create_access_token(
        subject=profile.id,
        role=profile.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    user_info = {
        "id": profile.id,
        "email": profile.email,
        "full_name": profile.full_name,
        "role": profile.role,
        "phone": profile.phone,
        "avatar_url": profile.avatar_url,
    }

    # Attach student or faculty reference id if available
    if profile.role == "student" and profile.student_profile:
        user_info["student_id"] = profile.student_profile.id
        user_info["roll_number"] = profile.student_profile.roll_number
        user_info["course_id"] = profile.student_profile.course_id
        user_info["department_id"] = profile.student_profile.department_id
    elif profile.role == "faculty" and profile.faculty_profile:
        user_info["faculty_id"] = profile.faculty_profile.id
        user_info["employee_id"] = profile.faculty_profile.employee_id
        user_info["department_id"] = profile.faculty_profile.department_id

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_info
    }


@router.get("/me")
def get_me(current_user: Profile = Depends(get_current_user)):
    user_info = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "phone": current_user.phone,
        "avatar_url": current_user.avatar_url,
        "is_active": current_user.is_active,
    }
    if current_user.role == "student" and current_user.student_profile:
        user_info["student_id"] = current_user.student_profile.id
        user_info["roll_number"] = current_user.student_profile.roll_number
        user_info["registration_number"] = current_user.student_profile.registration_number
        user_info["course_id"] = current_user.student_profile.course_id
        user_info["department_id"] = current_user.student_profile.department_id
        user_info["batch_year"] = current_user.student_profile.batch_year
    elif current_user.role == "faculty" and current_user.faculty_profile:
        user_info["faculty_id"] = current_user.faculty_profile.id
        user_info["employee_id"] = current_user.faculty_profile.employee_id
        user_info["department_id"] = current_user.faculty_profile.department_id
        user_info["designation"] = current_user.faculty_profile.designation
        user_info["qualification"] = current_user.faculty_profile.qualification
        
    return user_info


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.email == req.email).first()
    if not profile:
        # Avoid user enumeration in public responses
        return {"message": "If the email is registered, a password reset instruction has been generated."}
    
    # Generate reset token
    reset_token = create_access_token(
        subject=profile.id,
        role="reset",
        expires_delta=timedelta(minutes=30)
    )
    return {
        "message": "Password reset link/token generated successfully.",
        "reset_token": reset_token
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    from backend.app.core.security import decode_token
    payload = decode_token(req.token)
    if not payload or payload.get("role") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    
    user_id = payload.get("sub")
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User not found.")
    
    profile.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully. You can now login with your new password."}
