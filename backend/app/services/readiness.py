from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from app.models.entities import (
    Profile, StudentSkill, Roadmap, RoadmapTask, RoadmapPhase,
    Resume, ResumeAnalysis, InterviewSession, PracticeAttempt,
    CareerPath, CareerCompetency
)
from app.schemas.schemas import ReadinessOverviewResponse, ReadinessMetric

async def calculate_readiness(user_id: str, db: AsyncSession) -> ReadinessOverviewResponse:
    # 1. Profile completion
    profile_stmt = select(Profile).where(Profile.id == user_id)
    profile_res = await db.execute(profile_stmt)
    profile = profile_res.scalar_one_or_none()

    profile_score = 0
    if profile:
        fields = [profile.college_name, profile.degree, profile.branch, profile.target_role, profile.graduation_year]
        completed_fields = sum(1 for f in fields if f)
        profile_score = int((completed_fields / len(fields)) * 100) if fields else 0

    # 2. Roadmap progress
    roadmap_stmt = select(Roadmap).where(Roadmap.user_id == user_id, Roadmap.status == "active")
    roadmap_res = await db.execute(roadmap_stmt)
    active_roadmap = roadmap_res.scalar_one_or_none()

    roadmap_score = 0
    if active_roadmap:
        tasks_stmt = (
            select(
                func.count(RoadmapTask.id),
                func.sum(case((RoadmapTask.status == "completed", 1), else_=0))
            )
            .join(RoadmapPhase, RoadmapTask.phase_id == RoadmapPhase.id)
            .where(RoadmapPhase.roadmap_id == active_roadmap.id)
        )
        task_counts = (await db.execute(tasks_stmt)).one()
        total_tasks = task_counts[0] or 0
        completed_tasks = task_counts[1] or 0
        if total_tasks > 0:
            roadmap_score = int((completed_tasks / total_tasks) * 100)

    # 3. Skills competency match
    skills_score = 0
    student_skills_stmt = select(StudentSkill).where(StudentSkill.user_id == user_id)
    student_skills = (await db.execute(student_skills_stmt)).scalars().all()
    if student_skills:
        # Score based on having at least 5 skills recorded, giving bonus for Intermediate/Advanced
        skill_points = 0
        for s in student_skills:
            if s.proficiency == "Advanced":
                skill_points += 20
            elif s.proficiency == "Intermediate":
                skill_points += 15
            else:
                skill_points += 10
        skills_score = min(100, skill_points)

    # 4. Resume Review Score
    resume_score = 0
    resume_analysis_stmt = (
        select(ResumeAnalysis)
        .join(Resume, ResumeAnalysis.resume_id == Resume.id)
        .where(Resume.user_id == user_id, Resume.deleted_at.is_(None))
        .order_by(ResumeAnalysis.created_at.desc())
    )
    latest_analysis = (await db.execute(resume_analysis_stmt)).scalars().first()
    if latest_analysis:
        resume_score = int(latest_analysis.review_score)

    # 5. Practice & Interview Engagement
    practice_count_stmt = select(func.count(PracticeAttempt.id)).where(PracticeAttempt.user_id == user_id)
    practice_count = (await db.execute(practice_count_stmt)).scalar() or 0

    interview_count_stmt = select(func.count(InterviewSession.id)).where(
        InterviewSession.user_id == user_id,
        InterviewSession.status == "completed"
    )
    interview_count = (await db.execute(interview_count_stmt)).scalar() or 0

    # Target: 5 practice questions + 1 completed interview session
    practice_points = min(50, practice_count * 10)
    interview_points = min(50, interview_count * 50)
    practice_score = practice_points + interview_points

    # Weighted calculation
    # Profile: 15%, Skills: 25%, Roadmap: 25%, Resume: 20%, Practice: 15%
    overall = int(
        (profile_score * 0.15) +
        (skills_score * 0.25) +
        (roadmap_score * 0.25) +
        (resume_score * 0.20) +
        (practice_score * 0.15)
    )

    if overall >= 75:
        rating_label = "Placement Ready"
    elif overall >= 45:
        rating_label = "Actively Developing"
    else:
        rating_label = "Foundation Building"

    metrics = [
        ReadinessMetric(
            label="Profile & Goal Definition",
            score=profile_score,
            weight=0.15,
            description="Completeness of target career role, degree, and weekly preparation commitment.",
            action_item="Complete all onboarding details in your profile." if profile_score < 100 else "Profile fully configured."
        ),
        ReadinessMetric(
            label="Technical Skill Competencies",
            score=skills_score,
            weight=0.25,
            description="Documented proficiency in core languages, frameworks, and engineering tools.",
            action_item="Log at least 5 core technical skills in your skills inventory." if skills_score < 70 else "Competencies well documented."
        ),
        ReadinessMetric(
            label="Roadmap Milestone Progress",
            score=roadmap_score,
            weight=0.25,
            description="Progress in completing prioritized learning modules and hands-on projects.",
            action_item="Generate a personalized roadmap and start Phase 1." if roadmap_score == 0 else "Continue working on current phase tasks."
        ),
        ReadinessMetric(
            label="Resume Review Score",
            score=resume_score,
            weight=0.20,
            description="Quality of bullet points, quantified project achievements, and section structure.",
            action_item="Upload your resume to receive a comprehensive review score." if resume_score == 0 else "Review actionable suggestions to increase resume impact."
        ),
        ReadinessMetric(
            label="Practice & Interview Drills",
            score=practice_score,
            weight=0.15,
            description="Active completion of aptitude questions and structured mock interview sessions.",
            action_item="Complete a technical mock interview session." if practice_score < 50 else "Great practice consistency!"
        ),
    ]

    next_actions = []
    if not profile or not profile.onboarding_completed:
        next_actions.append({"title": "Finish Student Onboarding", "link": "/app/onboarding", "type": "profile"})
    if not active_roadmap:
        next_actions.append({"title": "Generate Career Roadmap", "link": "/app/roadmap", "type": "roadmap"})
    if not latest_analysis:
        next_actions.append({"title": "Upload Resume for AI Review", "link": "/app/resume", "type": "resume"})
    if interview_count == 0:
        next_actions.append({"title": "Start First Mock Interview", "link": "/app/interviews", "type": "interview"})
    if practice_count < 3:
        next_actions.append({"title": "Solve Aptitude Practice Questions", "link": "/app/practice/aptitude", "type": "practice"})

    if not next_actions:
        next_actions.append({"title": "Explore Verified Job Opportunities", "link": "/app/jobs", "type": "jobs"})

    return ReadinessOverviewResponse(
        overall_readiness_score=overall,
        rating_label=rating_label,
        metrics=metrics,
        next_actions=next_actions,
        disclaimer="The CareerSaathi preparation indicator reflects structured self-study and preparation activity on this platform. It does not represent an actual employer ATS score or guaranteed hiring outcome."
    )
