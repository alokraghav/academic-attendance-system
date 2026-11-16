from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import decode_token
from backend.app.models.models import Profile, Faculty, Student
from typing import List, Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Profile:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(Profile).filter(Profile.id == user_id).first()
    if not user:
        # Also check by email if sub was an email
        user = db.query(Profile).filter(Profile.email == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found",
            )
            
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
        
    return user


def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: Profile = Depends(get_current_user)) -> Profile:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires one of following roles {allowed_roles}, your role is {current_user.role}",
            )
        return current_user
    return role_checker

# Role specific dependencies
require_admin = require_roles(["admin"])
require_faculty = require_roles(["faculty", "admin"])
require_student = require_roles(["student", "admin"])
require_any_authenticated = require_roles(["admin", "faculty", "student"])
