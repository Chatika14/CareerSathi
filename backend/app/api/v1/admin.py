from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.database import get_db
from app.models.entities import User, Profile, JobListing, PracticeQuestion, CareerPath, AIUsageLog
from app.services.auth import get_current_admin

router = APIRouter()

class AdminJobCreate(BaseModel):
    title: str
    company: str
    location: str
    work_mode: str = "Hybrid"
    employment_type: str = "Full-time"
    description: str
    required_skills: List[str]
    eligibility_text: Optional[str] = None
    application_url: str
    source_name: str
    is_demo: bool = False

class AdminJobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    eligibility_text: Optional[str] = None
    application_url: Optional[str] = None
    status: Optional[str] = None

class AdminQuestionCreate(BaseModel):
    question_type: str  # aptitude or coding
    title: str
    prompt: str
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: str = "Medium"
    topic: str
    constraints: Optional[str] = None

@router.get("/overview")
async def get_admin_overview(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    users_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    jobs_count = (await db.execute(select(func.count(JobListing.id)))).scalar() or 0
    questions_count = (await db.execute(select(func.count(PracticeQuestion.id)))).scalar() or 0
    careers_count = (await db.execute(select(func.count(CareerPath.id)))).scalar() or 0
    ai_calls_count = (await db.execute(select(func.count(AIUsageLog.id)))).scalar() or 0

    recent_logs = (
        await db.execute(
            select(AIUsageLog)
            .order_by(AIUsageLog.created_at.desc())
            .limit(10)
        )
    ).scalars().all()

    return {
        "stats": {
            "total_users": users_count,
            "total_jobs": jobs_count,
            "total_questions": questions_count,
            "total_careers": careers_count,
            "total_ai_calls": ai_calls_count
        },
        "recent_ai_activity": [
            {
                "id": log.id,
                "feature": log.feature,
                "provider": log.provider,
                "latency_ms": log.latency_ms,
                "status": log.status,
                "created_at": log.created_at
            }
            for log in recent_logs
        ]
    }

@router.get("/users")
async def list_users(
    search: Optional[str] = Query(None),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User, Profile)
        .outerjoin(Profile, User.id == Profile.id)
        .order_by(User.created_at.desc())
    )
    if search:
        term = f"%{search.strip()}%"
        stmt = stmt.where((User.email.ilike(term)) | (Profile.full_name.ilike(term)))

    rows = (await db.execute(stmt)).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "full_name": profile.full_name if profile else "N/A",
            "college_name": profile.college_name if profile else None,
            "target_role": profile.target_role if profile else None,
            "onboarding_completed": profile.onboarding_completed if profile else False,
            "created_at": user.created_at
        }
        for user, profile in rows
    ]

@router.post("/jobs")
async def create_job(
    data: AdminJobCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    job = JobListing(
        title=data.title,
        company=data.company,
        location=data.location,
        work_mode=data.work_mode,
        employment_type=data.employment_type,
        description=data.description,
        required_skills_json=data.required_skills,
        eligibility_text=data.eligibility_text,
        application_url=data.application_url,
        source_name=data.source_name,
        last_verified_at=datetime.utcnow(),
        status="active",
        is_demo=data.is_demo
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return {"message": "Job listing created successfully.", "id": job.id}

@router.patch("/jobs/{job_id}")
async def update_job(
    job_id: str,
    data: AdminJobUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(JobListing).where(JobListing.id == job_id)
    job = (await db.execute(stmt)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found.")

    update_dict = data.model_dump(exclude_unset=True)
    if "required_skills" in update_dict:
        job.required_skills_json = update_dict.pop("required_skills")
    for k, v in update_dict.items():
        setattr(job, k, v)

    job.last_verified_at = datetime.utcnow()
    await db.commit()
    return {"message": "Job listing updated successfully."}

@router.post("/questions")
async def create_question(
    data: AdminQuestionCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    q = PracticeQuestion(
        question_type=data.question_type,
        title=data.title,
        prompt=data.prompt,
        options_json=data.options,
        correct_answer=data.correct_answer,
        explanation=data.explanation,
        difficulty=data.difficulty,
        topic=data.topic,
        constraints=data.constraints,
        active=True
    )
    db.add(q)
    await db.commit()
    await db.refresh(q)
    return {"message": "Question created successfully.", "id": q.id}
