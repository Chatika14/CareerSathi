from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.entities import User, JobApplication, SavedJob, Resume, ResumeAnalysis
from app.services.auth import get_current_user
from app.services.readiness import calculate_readiness

router = APIRouter()

@router.get("/overview")
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    readiness = await calculate_readiness(current_user.id, db)

    # Job and application counts
    saved_count_stmt = select(func.count(SavedJob.id)).where(SavedJob.user_id == current_user.id)
    saved_count = (await db.execute(saved_count_stmt)).scalar() or 0

    apps_count_stmt = select(func.count(JobApplication.id)).where(JobApplication.user_id == current_user.id)
    apps_count = (await db.execute(apps_count_stmt)).scalar() or 0

    return {
        "readiness": readiness,
        "saved_jobs_count": saved_count,
        "applications_count": apps_count
    }
