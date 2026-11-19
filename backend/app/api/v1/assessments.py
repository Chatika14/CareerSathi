from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.database import get_db
from app.models.entities import User, Profile, CareerAssessment, CareerPath
from app.schemas.schemas import AssessmentSubmit, AssessmentResponse, CareerRecommendation
from app.services.auth import get_current_user
from app.services.ai.service import ai_service

router = APIRouter()

ASSESSMENT_QUESTIONS = [
    {
        "id": "q1_work_preference",
        "category": "Work Focus",
        "question": "Which type of problems do you enjoy tackling most?",
        "options": [
            "Crafting clean, responsive user interfaces and visual interactions",
            "Designing scalable databases, background services, and robust APIs",
            "Building end-to-end applications that bridge both UI and cloud infrastructure",
            "Extracting insights, statistical trends, and predictive models from data",
            "Deploying distributed cloud services, CI/CD pipelines, and secure environments"
        ]
    },
    {
        "id": "q2_programming_comfort",
        "category": "Technical Foundation",
        "question": "What is your primary programming language or area of technical confidence?",
        "options": [
            "JavaScript / TypeScript / React / CSS",
            "Python (Data structures, backend libraries, scripting)",
            "Java / C++ (Core OOP, algorithms, systems)",
            "SQL, Python Data Science (Pandas, NumPy, Scikit-learn)",
            "Linux shell, Docker, Git, Cloud basics"
        ]
    },
    {
        "id": "q3_project_interest",
        "category": "Project Inclination",
        "question": "What kind of capstone project would you be most motivated to build from scratch?",
        "options": [
            "An interactive web application with dynamic dashboards and great UX",
            "A high-throughput REST API with authentication, rate-limiting, and SQL storage",
            "An intelligent AI-powered recommendation system or predictive dashboard",
            "An automated cloud deployment pipeline with containerization and monitoring",
            "A comprehensive test automation suite with automated defect reporting"
        ]
    },
    {
        "id": "q4_learning_style",
        "category": "Learning Style",
        "question": "How do you prefer to absorb new technical skills?",
        "options": [
            "Building hands-on projects and debugging real code",
            "Structured video courses followed by mini-assignments",
            "Reading official documentation and technical specifications",
            "Solving coding challenges and algorithmic drills"
        ]
    },
    {
        "id": "q5_weekly_commitment",
        "category": "Time Commitment",
        "question": "How many hours per week can you consistently commit to structured placement preparation?",
        "options": [
            "5-8 hours/week",
            "10-15 hours/week",
            "16-25 hours/week",
            "25+ hours/week"
        ]
    }
]

@router.get("/questions")
async def get_questions():
    return ASSESSMENT_QUESTIONS

@router.post("", response_model=AssessmentResponse)
async def submit_assessment(
    data: AssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile_stmt = select(Profile).where(Profile.id == current_user.id)
    profile = (await db.execute(profile_stmt)).scalar_one_or_none()

    profile_context = {
        "degree": profile.degree if profile else "B.Tech",
        "branch": profile.branch if profile else "Computer Science",
        "target_role": profile.target_role if profile else None,
        "weekly_hours": profile.weekly_hours if profile else 10
    }

    # Evaluate via AI service
    ai_result = await ai_service.generate_career_assessment(
        answers=data.answers,
        profile_context=profile_context,
        user_id=current_user.id,
        db=db
    )

    assessment = CareerAssessment(
        user_id=current_user.id,
        answers_json=data.answers,
        result_json=ai_result
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)

    raw_recs = ai_result.get("recommendations", [])
    recommendations = [
        CareerRecommendation(
            career_slug=r.get("career_slug", "full-stack-developer"),
            title=r.get("title", "Full-Stack Developer"),
            alignment_score=int(r.get("alignment_score", 85)),
            reasoning=r.get("reasoning", []),
            skills_to_develop=r.get("skills_to_develop", []),
            confidence_label=r.get("confidence_label", "Guidance Match")
        )
        for r in raw_recs
    ]

    return AssessmentResponse(
        id=assessment.id,
        created_at=assessment.created_at,
        recommendations=recommendations,
        summary=ai_result.get("summary", "Assessment guidance completed successfully."),
        limitations=ai_result.get("limitations", [
            "This guidance assessment is intended to help you choose a focus direction.",
            "It is based on self-reported inputs and does not represent an official certification or guaranteed placement."
        ])
    )

@router.get("/history")
async def get_assessment_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(CareerAssessment)
        .where(CareerAssessment.user_id == current_user.id)
        .order_by(CareerAssessment.created_at.desc())
    )
    res = await db.execute(stmt)
    records = res.scalars().all()
    return [
        {
            "id": r.id,
            "created_at": r.created_at,
            "result": r.result_json
        }
        for r in records
    ]
