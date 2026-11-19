from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.entities import User, JobListing, JobApplication, SavedJob
from app.schemas.schemas import JobApplicationCreate, JobApplicationUpdate, JobApplicationResponse, JobListingResponse
from app.services.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[JobApplicationResponse])
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(JobApplication)
        .where(JobApplication.user_id == current_user.id)
        .options(selectinload(JobApplication.job))
        .order_by(JobApplication.updated_at.desc())
    )
    res = await db.execute(stmt)
    apps = res.scalars().all()

    output = []
    for a in apps:
        j = a.job
        output.append(JobApplicationResponse(
            id=a.id,
            job_id=a.job_id,
            status=a.status,
            applied_at=a.applied_at,
            notes=a.notes,
            updated_at=a.updated_at,
            job=JobListingResponse(
                id=j.id,
                title=j.title,
                company=j.company,
                location=j.location,
                work_mode=j.work_mode,
                employment_type=j.employment_type,
                description=j.description,
                required_skills=j.required_skills_json or [],
                eligibility_text=j.eligibility_text,
                application_url=j.application_url,
                source_name=j.source_name,
                last_verified_at=j.last_verified_at,
                deadline=j.deadline,
                status=j.status,
                is_demo=j.is_demo,
                is_saved=False,
                application_status=a.status,
                profile_alignment=None
            )
        ))
    return output

@router.post("", response_model=JobApplicationResponse)
async def create_application(
    data: JobApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    job = (await db.execute(select(JobListing).where(JobListing.id == data.job_id))).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found.")

    # Check if application already exists
    existing_stmt = select(JobApplication).where(
        JobApplication.user_id == current_user.id,
        JobApplication.job_id == data.job_id
    )
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()
    if existing:
        existing.status = data.status or "applied"
        if data.notes:
            existing.notes = data.notes
        existing.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(existing)
        app_record = existing
    else:
        app_record = JobApplication(
            user_id=current_user.id,
            job_id=data.job_id,
            status=data.status or "applied",
            notes=data.notes,
            applied_at=datetime.utcnow()
        )
        db.add(app_record)
        await db.commit()
        await db.refresh(app_record)

    return JobApplicationResponse(
        id=app_record.id,
        job_id=app_record.job_id,
        status=app_record.status,
        applied_at=app_record.applied_at,
        notes=app_record.notes,
        updated_at=app_record.updated_at,
        job=JobListingResponse(
            id=job.id,
            title=job.title,
            company=job.company,
            location=job.location,
            work_mode=job.work_mode,
            employment_type=job.employment_type,
            description=job.description,
            required_skills=job.required_skills_json or [],
            eligibility_text=job.eligibility_text,
            application_url=job.application_url,
            source_name=job.source_name,
            last_verified_at=job.last_verified_at,
            deadline=job.deadline,
            status=job.status,
            is_demo=job.is_demo,
            is_saved=False,
            application_status=app_record.status,
            profile_alignment=None
        )
    )

@router.patch("/{application_id}", response_model=JobApplicationResponse)
async def update_application(
    application_id: str,
    data: JobApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(JobApplication)
        .where(JobApplication.id == application_id, JobApplication.user_id == current_user.id)
        .options(selectinload(JobApplication.job))
    )
    app_record = (await db.execute(stmt)).scalar_one_or_none()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application record not found.")

    app_record.status = data.status
    if data.notes is not None:
        app_record.notes = data.notes
    app_record.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(app_record)

    j = app_record.job
    return JobApplicationResponse(
        id=app_record.id,
        job_id=app_record.job_id,
        status=app_record.status,
        applied_at=app_record.applied_at,
        notes=app_record.notes,
        updated_at=app_record.updated_at,
        job=JobListingResponse(
            id=j.id,
            title=j.title,
            company=j.company,
            location=j.location,
            work_mode=j.work_mode,
            employment_type=j.employment_type,
            description=j.description,
            required_skills=j.required_skills_json or [],
            eligibility_text=j.eligibility_text,
            application_url=j.application_url,
            source_name=j.source_name,
            last_verified_at=j.last_verified_at,
            deadline=j.deadline,
            status=j.status,
            is_demo=j.is_demo,
            is_saved=False,
            application_status=app_record.status,
            profile_alignment=None
        )
    )
