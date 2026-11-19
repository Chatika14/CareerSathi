import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
from app.config import settings
from app.database import get_db
from app.models.entities import User, Profile, Resume, ResumeAnalysis
from app.schemas.schemas import ResumeResponse, ResumeAnalysisResponse
from app.services.auth import get_current_user
from app.services.resume_parser import extract_text_from_pdf
from app.services.ai.service import ai_service

router = APIRouter()

@router.post("", response_model=ResumeResponse)
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Extract text and validate file
    text_content = await extract_text_from_pdf(file)
    
    # Save file to private storage
    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.RESUME_STORAGE_DIR, safe_name)
    
    # Reset file pointer and write to disk
    await file.seek(0)
    file_bytes = await file.read()
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # If target_role not explicitly supplied, check user's profile
    if not target_role:
        prof_res = await db.execute(select(Profile).where(Profile.id == current_user.id))
        prof = prof_res.scalar_one_or_none()
        target_role = prof.target_role if prof and prof.target_role else "Software Engineer"

    # Create Resume entity
    resume = Resume(
        id=file_id,
        user_id=current_user.id,
        storage_path=file_path,
        original_filename=file.filename or "resume.pdf",
        mime_type="application/pdf",
        file_size=len(file_bytes),
        extracted_text=text_content
    )
    db.add(resume)
    await db.flush()

    # Perform AI resume analysis
    analysis_data = await ai_service.analyze_resume(
        resume_text=text_content,
        target_role=target_role,
        user_id=current_user.id,
        db=db
    )

    review_score = float(analysis_data.get("review_score", 75.0))
    score_breakdown = analysis_data.get("score_breakdown", {
        "impact_and_metrics": 70.0,
        "technical_skills_relevance": 80.0,
        "structure_and_clarity": 75.0,
        "action_verbs": 75.0
    })

    analysis = ResumeAnalysis(
        resume_id=resume.id,
        target_role=target_role,
        parsed_data_json={
            "sections": analysis_data.get("parsed_sections", {}),
            "score_breakdown": score_breakdown
        },
        feedback_json={
            "strengths": analysis_data.get("strengths", []),
            "missing_elements": analysis_data.get("missing_elements", []),
            "actionable_suggestions": analysis_data.get("actionable_suggestions", [])
        },
        review_score=review_score
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(resume)

    return ResumeResponse(
        id=resume.id,
        original_filename=resume.original_filename,
        mime_type=resume.mime_type,
        file_size=resume.file_size,
        created_at=resume.created_at,
        latest_analysis=ResumeAnalysisResponse(
            id=analysis.id,
            resume_id=resume.id,
            target_role=analysis.target_role,
            review_score=analysis.review_score,
            score_breakdown=score_breakdown,
            parsed_sections=analysis.parsed_data_json.get("sections", {}),
            strengths=analysis.feedback_json.get("strengths", []),
            missing_elements=analysis.feedback_json.get("missing_elements", []),
            actionable_suggestions=analysis.feedback_json.get("actionable_suggestions", []),
            created_at=analysis.created_at
        )
    )

@router.get("", response_model=List[ResumeResponse])
async def list_my_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Resume)
        .where(Resume.user_id == current_user.id, Resume.deleted_at.is_(None))
        .options(selectinload(Resume.analyses))
        .order_by(Resume.created_at.desc())
    )
    res = await db.execute(stmt)
    resumes = res.scalars().all()

    output = []
    for r in resumes:
        latest = r.analyses[-1] if r.analyses else None
        latest_analysis_resp = None
        if latest:
            latest_analysis_resp = ResumeAnalysisResponse(
                id=latest.id,
                resume_id=r.id,
                target_role=latest.target_role,
                review_score=latest.review_score,
                score_breakdown=latest.parsed_data_json.get("score_breakdown", {}),
                parsed_sections=latest.parsed_data_json.get("sections", {}),
                strengths=latest.feedback_json.get("strengths", []),
                missing_elements=latest.feedback_json.get("missing_elements", []),
                actionable_suggestions=latest.feedback_json.get("actionable_suggestions", []),
                created_at=latest.created_at
            )
        output.append(ResumeResponse(
            id=r.id,
            original_filename=r.original_filename,
            mime_type=r.mime_type,
            file_size=r.file_size,
            created_at=r.created_at,
            latest_analysis=latest_analysis_resp
        ))
    return output

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Resume)
        .where(Resume.id == resume_id, Resume.user_id == current_user.id, Resume.deleted_at.is_(None))
        .options(selectinload(Resume.analyses))
    )
    resume = (await db.execute(stmt)).scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    latest = resume.analyses[-1] if resume.analyses else None
    latest_analysis_resp = None
    if latest:
        latest_analysis_resp = ResumeAnalysisResponse(
            id=latest.id,
            resume_id=resume.id,
            target_role=latest.target_role,
            review_score=latest.review_score,
            score_breakdown=latest.parsed_data_json.get("score_breakdown", {}),
            parsed_sections=latest.parsed_data_json.get("sections", {}),
            strengths=latest.feedback_json.get("strengths", []),
            missing_elements=latest.feedback_json.get("missing_elements", []),
            actionable_suggestions=latest.feedback_json.get("actionable_suggestions", []),
            created_at=latest.created_at
        )

    return ResumeResponse(
        id=resume.id,
        original_filename=resume.original_filename,
        mime_type=resume.mime_type,
        file_size=resume.file_size,
        created_at=resume.created_at,
        latest_analysis=latest_analysis_resp
    )

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id)
    resume = (await db.execute(stmt)).scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    # Soft delete record and clean up local file if exists
    resume.deleted_at = datetime.utcnow()
    if os.path.exists(resume.storage_path):
        try:
            os.remove(resume.storage_path)
        except Exception:
            pass

    await db.commit()
    return {"message": "Resume deleted successfully."}
