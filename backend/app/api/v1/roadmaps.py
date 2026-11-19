from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from typing import List, Optional
from app.database import get_db
from app.models.entities import User, Profile, Roadmap, RoadmapPhase, RoadmapTask, CareerPath, StudentSkill, Skill
from app.schemas.schemas import RoadmapGenerateRequest, RoadmapResponse, RoadmapTaskUpdate, RoadmapTaskResponse, RoadmapPhaseResponse
from app.services.auth import get_current_user
from app.services.ai.service import ai_service

router = APIRouter()

def _calculate_progress(phases: List[RoadmapPhase]):
    total = 0
    completed = 0
    for p in phases:
        for t in p.tasks:
            total += 1
            if t.status == "completed":
                completed += 1
    pct = round((completed / total * 100), 1) if total > 0 else 0.0
    return total, completed, pct

@router.get("", response_model=Optional[RoadmapResponse])
async def get_active_roadmap(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Roadmap)
        .where(Roadmap.user_id == current_user.id, Roadmap.status == "active")
        .options(
            selectinload(Roadmap.phases).selectinload(RoadmapPhase.tasks)
        )
        .order_by(Roadmap.created_at.desc())
    )
    res = await db.execute(stmt)
    roadmap = res.scalar_one_or_none()
    if not roadmap:
        return None

    total, completed, pct = _calculate_progress(roadmap.phases)
    return RoadmapResponse(
        id=roadmap.id,
        user_id=roadmap.user_id,
        career_path_id=roadmap.career_path_id,
        title=roadmap.title,
        description=roadmap.description,
        status=roadmap.status,
        created_at=roadmap.created_at,
        updated_at=roadmap.updated_at,
        total_tasks=total,
        completed_tasks=completed,
        progress_percentage=pct,
        phases=[
            RoadmapPhaseResponse(
                id=p.id,
                title=p.title,
                description=p.description,
                sort_order=p.sort_order,
                tasks=[
                    RoadmapTaskResponse(
                        id=t.id,
                        phase_id=t.phase_id,
                        title=t.title,
                        description=t.description,
                        estimated_hours=t.estimated_hours,
                        status=t.status,
                        resource_url=t.resource_url,
                        notes=t.notes,
                        sort_order=t.sort_order,
                        completed_at=t.completed_at
                    )
                    for t in p.tasks
                ]
            )
            for p in roadmap.phases
        ]
    )

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(
    data: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Archive any previous active roadmaps
    prev_stmt = select(Roadmap).where(Roadmap.user_id == current_user.id, Roadmap.status == "active")
    prev_roadmaps = (await db.execute(prev_stmt)).scalars().all()
    for pr in prev_roadmaps:
        pr.status = "archived"

    # Find matching career path if any
    career_stmt = select(CareerPath).where(
        (CareerPath.title.ilike(f"%{data.target_role}%")) | (CareerPath.slug.ilike(f"%{data.target_role}%"))
    )
    career_path = (await db.execute(career_stmt)).scalars().first()

    # Get student's current skills
    skills_stmt = (
        select(Skill.name)
        .join(StudentSkill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.user_id == current_user.id)
    )
    current_skills = (await db.execute(skills_stmt)).scalars().all()

    # Generate structured roadmap using AI service
    ai_output = await ai_service.generate_roadmap(
        target_role=data.target_role,
        weekly_hours=data.weekly_hours or 10,
        learning_style=data.preferred_learning_style or "Hands-on projects",
        current_skills=list(current_skills),
        user_id=current_user.id,
        db=db
    )

    roadmap = Roadmap(
        user_id=current_user.id,
        career_path_id=career_path.id if career_path else None,
        title=f"{data.target_role} Placement Roadmap",
        description=f"Personalized structured roadmap generated for {data.weekly_hours or 10} hours/week commitment.",
        status="active"
    )
    db.add(roadmap)
    await db.flush()

    phases_data = ai_output.get("phases", [])
    created_phases = []
    for p_idx, p_data in enumerate(phases_data):
        phase = RoadmapPhase(
            roadmap_id=roadmap.id,
            title=p_data.get("title", f"Phase {p_idx+1}"),
            description=p_data.get("description", ""),
            sort_order=p_idx
        )
        db.add(phase)
        await db.flush()

        tasks_data = p_data.get("tasks", [])
        for t_idx, t_data in enumerate(tasks_data):
            task = RoadmapTask(
                phase_id=phase.id,
                title=t_data.get("title", f"Task {t_idx+1}"),
                description=t_data.get("description", ""),
                estimated_hours=float(t_data.get("estimated_hours", 4.0)),
                status="todo",
                resource_url=t_data.get("resource_url"),
                sort_order=t_idx
            )
            db.add(task)
        created_phases.append(phase)

    # Update student's target role in profile
    profile_stmt = select(Profile).where(Profile.id == current_user.id)
    profile = (await db.execute(profile_stmt)).scalar_one_or_none()
    if profile:
        profile.target_role = data.target_role

    await db.commit()

    # Refetch full roadmap with eager loads
    full_stmt = (
        select(Roadmap)
        .where(Roadmap.id == roadmap.id)
        .options(selectinload(Roadmap.phases).selectinload(RoadmapPhase.tasks))
    )
    loaded_roadmap = (await db.execute(full_stmt)).scalar_one()
    total, completed, pct = _calculate_progress(loaded_roadmap.phases)

    return RoadmapResponse(
        id=loaded_roadmap.id,
        user_id=loaded_roadmap.user_id,
        career_path_id=loaded_roadmap.career_path_id,
        title=loaded_roadmap.title,
        description=loaded_roadmap.description,
        status=loaded_roadmap.status,
        created_at=loaded_roadmap.created_at,
        updated_at=loaded_roadmap.updated_at,
        total_tasks=total,
        completed_tasks=completed,
        progress_percentage=pct,
        phases=[
            RoadmapPhaseResponse(
                id=p.id,
                title=p.title,
                description=p.description,
                sort_order=p.sort_order,
                tasks=[
                    RoadmapTaskResponse(
                        id=t.id,
                        phase_id=t.phase_id,
                        title=t.title,
                        description=t.description,
                        estimated_hours=t.estimated_hours,
                        status=t.status,
                        resource_url=t.resource_url,
                        notes=t.notes,
                        sort_order=t.sort_order,
                        completed_at=t.completed_at
                    )
                    for t in p.tasks
                ]
            )
            for p in loaded_roadmap.phases
        ]
    )

@router.patch("/tasks/{task_id}", response_model=RoadmapTaskResponse)
async def update_roadmap_task(
    task_id: str,
    data: RoadmapTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(RoadmapTask)
        .join(RoadmapPhase, RoadmapTask.phase_id == RoadmapPhase.id)
        .join(Roadmap, RoadmapPhase.roadmap_id == Roadmap.id)
        .where(RoadmapTask.id == task_id, Roadmap.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Roadmap task not found or access denied.")

    if data.status is not None:
        task.status = data.status
        if data.status == "completed":
            task.completed_at = datetime.utcnow()
        else:
            task.completed_at = None

    if data.notes is not None:
        task.notes = data.notes

    await db.commit()
    await db.refresh(task)
    return task
