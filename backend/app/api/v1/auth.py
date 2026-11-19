from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.entities import User, Profile
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserResponse, ProfileUpdate, ProfileResponse
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    stmt = select(User).where(User.email == data.email.lower().strip())
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Secure role: registrations default to student unless explicitly seeded
    role = "student"
    new_user = User(
        email=data.email.lower().strip(),
        hashed_password=hash_password(data.password),
        role=role
    )
    db.add(new_user)
    await db.flush()

    new_profile = Profile(
        id=new_user.id,
        full_name=data.full_name.strip(),
        onboarding_completed=False
    )
    db.add(new_profile)
    await db.commit()

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "role": new_user.role,
            "full_name": new_profile.full_name,
            "onboarding_completed": False
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == data.email.lower().strip())
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    profile_stmt = select(Profile).where(Profile.id == user.id)
    profile = (await db.execute(profile_stmt)).scalar_one_or_none()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": profile.full_name if profile else "Student",
            "onboarding_completed": profile.onboarding_completed if profile else False
        }
    }

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile_stmt = select(Profile).where(Profile.id == current_user.id)
    profile = (await db.execute(profile_stmt)).scalar_one_or_none()

    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "profile": {
            "full_name": profile.full_name if profile else "",
            "college_name": profile.college_name if profile else None,
            "degree": profile.degree if profile else None,
            "branch": profile.branch if profile else None,
            "current_year": profile.current_year if profile else None,
            "current_semester": profile.current_semester if profile else None,
            "graduation_year": profile.graduation_year if profile else None,
            "weekly_hours": profile.weekly_hours if profile else 10,
            "target_role": profile.target_role if profile else None,
            "career_interests": profile.career_interests if profile else [],
            "preferred_learning_style": profile.preferred_learning_style if profile else None,
            "onboarding_completed": profile.onboarding_completed if profile else False
        }
    }

@router.patch("/me", response_model=ProfileResponse)
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile_stmt = select(Profile).where(Profile.id == current_user.id)
    profile = (await db.execute(profile_stmt)).scalar_one_or_none()
    if not profile:
        profile = Profile(id=current_user.id, full_name="Student")
        db.add(profile)

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(profile, field, val)

    await db.commit()
    await db.refresh(profile)
    return profile
