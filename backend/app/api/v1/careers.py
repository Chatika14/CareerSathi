from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.entities import CareerPath, CareerCompetency, Skill
from app.schemas.schemas import CareerPathSummary, CareerPathDetail, CareerCompetencyResponse

router = APIRouter()

@router.get("", response_model=List[CareerPathSummary])
async def list_career_paths(db: AsyncSession = Depends(get_db)):
    stmt = select(CareerPath).where(CareerPath.active == True).order_by(CareerPath.title)
    res = await db.execute(stmt)
    careers = res.scalars().all()
    return careers

@router.get("/{career_id_or_slug}", response_model=CareerPathDetail)
async def get_career_path(career_id_or_slug: str, db: AsyncSession = Depends(get_db)):
    stmt = select(CareerPath).where(
        (CareerPath.id == career_id_or_slug) | (CareerPath.slug == career_id_or_slug)
    )
    res = await db.execute(stmt)
    career = res.scalar_one_or_none()
    if not career:
        raise HTTPException(status_code=404, detail="Career path not found.")

    # Fetch competencies with skill details
    comp_stmt = (
        select(CareerCompetency, Skill)
        .join(Skill, CareerCompetency.skill_id == Skill.id)
        .where(CareerCompetency.career_path_id == career.id)
    )
    comp_res = await db.execute(comp_stmt)
    comp_rows = comp_res.all()

    competencies = [
        CareerCompetencyResponse(
            skill_name=skill.name,
            category=skill.category,
            target_level=comp.target_level,
            priority=comp.priority
        )
        for comp, skill in comp_rows
    ]

    return CareerPathDetail(
        id=career.id,
        slug=career.slug,
        title=career.title,
        category=career.category,
        overview=career.overview,
        responsibilities=career.responsibilities or [],
        learning_sequence=career.learning_sequence or [],
        portfolio_projects=career.portfolio_projects or [],
        interview_topics=career.interview_topics or [],
        active=career.active,
        competencies=competencies
    )
