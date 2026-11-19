from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.entities import User, JobListing, SavedJob, JobApplication, StudentSkill, Skill
from app.schemas.schemas import JobListingResponse
from app.services.auth import get_current_user

router = APIRouter()

def _calculate_alignment(job_skills: List[str], user_skills: List[str]) -> int:
    if not job_skills:
        return 75
    job_set = {s.lower() for s in job_skills}
    user_set = {s.lower() for s in user_skills}
    matching = len(job_set.intersection(user_set))
    return int((matching / len(job_set)) * 100)

@router.get("", response_model=List[JobListingResponse])
async def list_jobs(
    search: Optional[str] = Query(None),
    work_mode: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(JobListing).where(JobListing.status == "active")
    if search:
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            (JobListing.title.ilike(term)) |
            (JobListing.company.ilike(term)) |
            (JobListing.location.ilike(term))
        )
    if work_mode:
        stmt = stmt.where(JobListing.work_mode.ilike(work_mode))
    if employment_type:
        stmt = stmt.where(JobListing.employment_type.ilike(employment_type))

    stmt = stmt.order_by(JobListing.created_at.desc())
    res = await db.execute(stmt)
    jobs = res.scalars().all()

    # Get user skills for alignment
    skills_stmt = (
        select(Skill.name)
        .join(StudentSkill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.user_id == current_user.id)
    )
    user_skills = (await db.execute(skills_stmt)).scalars().all()

    # Get user saved jobs
    saved_stmt = select(SavedJob.job_id).where(SavedJob.user_id == current_user.id)
    saved_job_ids = set((await db.execute(saved_stmt)).scalars().all())

    # Get user applications
    apps_stmt = select(JobApplication.job_id, JobApplication.status).where(JobApplication.user_id == current_user.id)
    app_map = dict((await db.execute(apps_stmt)).all())

    output = []
    for j in jobs:
        req_skills = j.required_skills_json or []
        alignment = _calculate_alignment(req_skills, list(user_skills))
        output.append(JobListingResponse(
            id=j.id,
            title=j.title,
            company=j.company,
            location=j.location,
            work_mode=j.work_mode,
            employment_type=j.employment_type,
            description=j.description,
            required_skills=req_skills,
            eligibility_text=j.eligibility_text,
            application_url=j.application_url,
            source_name=j.source_name,
            last_verified_at=j.last_verified_at,
            deadline=j.deadline,
            status=j.status,
            is_demo=j.is_demo,
            is_saved=(j.id in saved_job_ids),
            application_status=app_map.get(j.id),
            profile_alignment=alignment
        ))
    return output

@router.get("/{job_id}", response_model=JobListingResponse)
async def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(JobListing).where(JobListing.id == job_id)
    job = (await db.execute(stmt)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found.")

    skills_stmt = (
        select(Skill.name)
        .join(StudentSkill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.user_id == current_user.id)
    )
    user_skills = (await db.execute(skills_stmt)).scalars().all()

    saved_stmt = select(SavedJob).where(SavedJob.user_id == current_user.id, SavedJob.job_id == job.id)
    is_saved = bool((await db.execute(saved_stmt)).scalar_one_or_none())

    app_stmt = select(JobApplication.status).where(JobApplication.user_id == current_user.id, JobApplication.job_id == job.id)
    app_status = (await db.execute(app_stmt)).scalar_one_or_none()

    req_skills = job.required_skills_json or []
    alignment = _calculate_alignment(req_skills, list(user_skills))

    return JobListingResponse(
        id=job.id,
        title=job.title,
        company=job.company,
        location=job.location,
        work_mode=job.work_mode,
        employment_type=job.employment_type,
        description=job.description,
        required_skills=req_skills,
        eligibility_text=job.eligibility_text,
        application_url=job.application_url,
        source_name=job.source_name,
        last_verified_at=job.last_verified_at,
        deadline=job.deadline,
        status=job.status,
        is_demo=job.is_demo,
        is_saved=is_saved,
        application_status=app_status,
        profile_alignment=alignment
    )

@router.post("/{job_id}/save")
async def toggle_save_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify job exists
    job = (await db.execute(select(JobListing).where(JobListing.id == job_id))).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found.")

    stmt = select(SavedJob).where(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id)
    existing = (await db.execute(stmt)).scalar_one_or_none()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"saved": False, "message": "Job removed from saved list."}
    else:
        new_save = SavedJob(user_id=current_user.id, job_id=job_id)
        db.add(new_save)
        await db.commit()
        return {"saved": True, "message": "Job saved successfully."}
