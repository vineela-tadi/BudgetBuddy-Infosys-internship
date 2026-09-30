
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Profile, User
from ..schemas import ProfileCreate, ProfileResponse
from ..auth import get_current_user

router = APIRouter()


# GET MY PROFILE
@router.get("/", response_model=ProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    # Profile exists
    if profile:
        return {
            "name": current_user.name,
            "email": current_user.email,
            "phone": profile.phone or ""
        }

    # Profile does not exist yet
    # Still return login user's basic details
    return {
        "name": current_user.name,
        "email": current_user.email,
        "phone": ""
    }


# POST - CREATE PROFILE
@router.post("/", response_model=ProfileResponse)
def create_profile(
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    # Update user's basic details
    current_user.name = profile_data.name
    current_user.email = profile_data.email

    # Create profile
    new_profile = Profile(
        user_id=current_user.id,
        phone=profile_data.phone
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {
        "name": current_user.name,
        "email": current_user.email,
        "phone": new_profile.phone or ""
    }


# PUT - UPDATE PROFILE
@router.put("/", response_model=ProfileResponse)
def update_my_profile(
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    # If profile doesn't exist, create it
    if not profile:
        current_user.name = profile_data.name
        current_user.email = profile_data.email

        profile = Profile(
            user_id=current_user.id,
            phone=profile_data.phone
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

        return {
            "name": current_user.name,
            "email": current_user.email,
            "phone": profile.phone or ""
        }

    # Profile exists -> update
    current_user.name = profile_data.name
    current_user.email = profile_data.email
    profile.phone = profile_data.phone

    db.commit()
    db.refresh(profile)

    return {
        "name": current_user.name,
        "email": current_user.email,
        "phone": profile.phone or ""
    }