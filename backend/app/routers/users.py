from datetime import datetime, timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from ..auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)


# =========================================================
# AUTH ROUTER
# =========================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(
            user_data.password
        ),
        role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =========================================================
# FORGOT PASSWORD
# =========================================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not registered"
        )

    # Generate secure reset token
    reset_token = secrets.token_urlsafe(32)

    # Token valid for 15 minutes
    reset_token_expiry = (
        datetime.utcnow() + timedelta(minutes=15)
    )

    user.reset_token = reset_token
    user.reset_token_expiry = reset_token_expiry

    db.commit()

    # DEVELOPMENT / INTERNSHIP DEMO ONLY
    # In production, this token should be sent by email.
    return {
        "message": "Password reset token generated successfully",
        "reset_token": reset_token,
        "expires_in_minutes": 15
    }


# =========================================================
# RESET PASSWORD
# =========================================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.reset_token == request.token
    ).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid reset token"
        )

    if not user.reset_token_expiry:
        raise HTTPException(
            status_code=400,
            detail="Reset token has expired"
        )

    if datetime.utcnow() > user.reset_token_expiry:
        # Clear expired token
        user.reset_token = None
        user.reset_token_expiry = None

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Reset token has expired"
        )

    # Update password
    user.hashed_password = hash_password(
        request.new_password
    )

    # Token can be used only once
    user.reset_token = None
    user.reset_token_expiry = None

    db.commit()

    return {
        "message": "Password reset successfully"
    }


# =========================================================
# GET CURRENT USER
# =========================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user