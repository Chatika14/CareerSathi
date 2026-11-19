from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.entities import User, Profile, Skill, StudentSkill, CareerPath, CareerCompetency
from app.schemas.schemas import (
    SkillResponse, StudentSkillCreate, StudentSkillUpdate,
    StudentSkillResponse, SkillGapAnalysisResponse, SkillGapItem
)
from app.services.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[SkillResponse])
async def list_skills(db: AsyncSession = Depends(get_db)):
    stmt = select(Skill).order_by(Skill.category, Skill.name)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/my", response_model=List[StudentSkillResponse])
async def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(StudentSkill)
        .where(StudentSkill.user_id == current_user.id)
        .options(selectinload(StudentSkill.skill))
        .order_by(StudentSkill.updated_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=StudentSkillResponse)
async def add_or_update_student_skill(
    data: StudentSkillCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Find or create skill in master catalog
    skill_name_clean = data.skill_name.strip()
    skill_stmt = select(Skill).where(Skill.name.ilike(skill_name_clean))
    skill = (await db.execute(skill_stmt)).scalar_one_or_none()
    if not skill:
        skill = Skill(
            name=skill_name_clean,
            category=data.category or "Technical",
            description=f"Skill competencies in {skill_name_clean}"
        )
        db.add(skill)
        await db.flush()

    # Check if student already has this skill
    ss_stmt = select(StudentSkill).where(
        StudentSkill.user_id == current_user.id,
        StudentSkill.skill_id == skill.id
    )
    student_skill = (await db.execute(ss_stmt)).scalar_one_or_none()

    if student_skill:
        student_skill.proficiency = data.proficiency
        student_skill.evidence_type = data.evidence_type or student_skill.evidence_type
        student_skill.last_assessed_at = datetime.utcnow()
    else:
        student_skill = StudentSkill(
            user_id=current_user.id,
            skill_id=skill.id,
            proficiency=data.proficiency,
            evidence_type=data.evidence_type or "Self-reported",
            last_assessed_at=datetime.utcnow()
        )
        db.add(student_skill)

    await db.commit()

    # Reload with relation
    reloaded_stmt = (
        select(StudentSkill)
        .where(StudentSkill.id == student_skill.id)
        .options(selectinload(StudentSkill.skill))
    )
    return (await db.execute(reloaded_stmt)).scalar_one()

@router.patch("/{student_skill_id}", response_model=StudentSkillResponse)
async def update_student_skill(
    student_skill_id: str,
    data: StudentSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(StudentSkill)
        .where(StudentSkill.id == student_skill_id, StudentSkill.user_id == current_user.id)
        .options(selectinload(StudentSkill.skill))
    )
    student_skill = (await db.execute(stmt)).scalar_one_or_none()
    if not student_skill:
        raise HTTPException(status_code=404, detail="Skill entry not found.")

    student_skill.proficiency = data.proficiency
    if data.evidence_type:
        student_skill.evidence_type = data.evidence_type
    student_skill.last_assessed_at = datetime.utcnow()

    await db.commit()
    await db.refresh(student_skill)
    return student_skill

@router.delete("/{student_skill_id}")
async def delete_student_skill(
    student_skill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(StudentSkill).where(
        StudentSkill.id == student_skill_id,
        StudentSkill.user_id == current_user.id
    )
    student_skill = (await db.execute(stmt)).scalar_one_or_none()
    if not student_skill:
        raise HTTPException(status_code=404, detail="Skill entry not found.")

    await db.delete(student_skill)
    await db.commit()
    return {"message": "Skill removed successfully."}

@router.get("/gap-analysis", response_model=SkillGapAnalysisResponse)
async def get_skill_gap_analysis(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile_stmt = select(Profile).where(Profile.id == current_user.id)
    profile = (await db.execute(profile_stmt)).scalar_one_or_none()
    target_role = profile.target_role if profile and profile.target_role else "Full-Stack Developer"

    # Find matching career path
    career_stmt = select(CareerPath).where(
        (CareerPath.title.ilike(f"%{target_role}%")) | (CareerPath.slug.ilike(f"%{target_role}%"))
    )
    career = (await db.execute(career_stmt)).scalars().first()
    if not career:
        # Fallback to first available career path
        career = (await db.execute(select(CareerPath).limit(1))).scalars().first()

    # Get student's current skills map
    my_skills_stmt = (
        select(StudentSkill)
        .where(StudentSkill.user_id == current_user.id)
        .options(selectinload(StudentSkill.skill))
    )
    my_skills = (await db.execute(my_skills_stmt)).scalars().all()
    user_skill_map = {ms.skill.name.lower(): ms.proficiency for ms in my_skills}

    # Get competencies for the career
    items: List[SkillGapItem] = []
    matching_count = 0

    if career:
        comp_stmt = (
            select(CareerCompetency, Skill)
            .join(Skill, CareerCompetency.skill_id == Skill.id)
            .where(CareerCompetency.career_path_id == career.id)
        )
        comp_rows = (await db.execute(comp_stmt)).all()

        for comp, sk in comp_rows:
            sk_name_lower = sk.name.lower()
            current_level = user_skill_map.get(sk_name_lower)

            if not current_level:
                status = "missing"
            elif current_level == comp.target_level or (comp.target_level == "Beginner" and current_level in ["Intermediate", "Advanced"]):
                status = "acquired"
                matching_count += 1
            else:
                status = "to_strengthen"
                matching_count += 0.5

            items.append(SkillGapItem(
                skill_name=sk.name,
                category=sk.category,
                target_level=comp.target_level,
                current_level=current_level,
                status=status,
                priority=comp.priority,
                related_roadmap_task=f"Practice {sk.name} in hands-on projects"
            ))

    total = len(items) if items else 1
    pct = round((matching_count / total * 100), 1)

    return SkillGapAnalysisResponse(
        target_role=target_role,
        total_competencies=len(items),
        matching_skills_count=int(matching_count),
        readiness_percentage=pct,
        skills=items
    )
