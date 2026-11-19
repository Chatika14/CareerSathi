from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.entities import User, InterviewSession, InterviewQuestion, InterviewAnswer
from app.schemas.schemas import (
    InterviewSessionCreate, InterviewSessionResponse,
    InterviewAnswerSubmit, InterviewQuestionResponse
)
from app.services.auth import get_current_user
from app.services.ai.service import ai_service

router = APIRouter()

CURATED_INTERVIEW_QUESTIONS = {
    "technical": [
        "Explain how database indexing works, and discuss the trade-offs between B-Tree and Hash indexes.",
        "What is the difference between synchronous and asynchronous I/O? When would you prefer an event loop over multi-threading?",
        "Describe how you would design a rate limiter for a public REST API. What data structures would you employ?",
        "Explain the concept of database transactions and the ACID properties. What are dirty reads and phantom reads?",
        "How does HTTP/2 differ from HTTP/1.1 and HTTP/3? What problems does multiplexing solve?"
    ],
    "hr": [
        "Tell me about a challenging technical project you worked on. What obstacles did you face and how did you resolve them?",
        "How do you prioritize your time when you have conflicting deadlines between coursework and project deliverables?",
        "Describe a situation where you had a disagreement with a peer or teammate on a technical decision. How was it resolved?",
        "Where do you see your engineering skills evolving over the next two to three years?",
        "Why are you interested in this specific career path and what steps have you taken toward it?"
    ],
    "behavioral": [
        "Describe a time when you received constructive feedback that changed how you approach a project.",
        "Tell me about a time you had to learn an unfamiliar technology or framework under a tight deadline.",
        "Can you share an experience where a production bug or unexpected system failure occurred? What was your post-mortem process?",
        "Give an example of a goal you set for yourself and how you tracked your progress to achieve it."
    ]
}

@router.get("", response_model=List[InterviewSessionResponse])
async def list_interview_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(InterviewSession)
        .where(InterviewSession.user_id == current_user.id)
        .options(
            selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answers)
        )
        .order_by(InterviewSession.created_at.desc())
    )
    res = await db.execute(stmt)
    sessions = res.scalars().all()

    output = []
    for s in sessions:
        q_list = []
        for q in s.questions:
            ans = q.answers[-1] if q.answers else None
            q_list.append(InterviewQuestionResponse(
                id=q.id,
                question_text=q.question_text,
                category=q.category,
                sort_order=q.sort_order,
                answer={
                    "answer_text": ans.answer_text,
                    "feedback": ans.feedback_json
                } if ans else None
            ))
        output.append(InterviewSessionResponse(
            id=s.id,
            target_role=s.target_role,
            interview_type=s.interview_type,
            difficulty=s.difficulty,
            status=s.status,
            created_at=s.created_at,
            completed_at=s.completed_at,
            questions=q_list,
            summary=s.summary_json
        ))
    return output

@router.post("", response_model=InterviewSessionResponse)
async def create_interview_session(
    data: InterviewSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    session = InterviewSession(
        user_id=current_user.id,
        target_role=data.target_role,
        interview_type=data.interview_type,
        difficulty=data.difficulty,
        status="in_progress"
    )
    db.add(session)
    await db.flush()

    # Pick questions matching type
    pool = CURATED_INTERVIEW_QUESTIONS.get(data.interview_type.lower(), CURATED_INTERVIEW_QUESTIONS["technical"])
    count = min(len(pool), max(1, data.question_count))
    selected_texts = pool[:count]

    created_questions = []
    for idx, text in enumerate(selected_texts):
        q = InterviewQuestion(
            session_id=session.id,
            question_text=text,
            category=data.interview_type.capitalize(),
            sort_order=idx
        )
        db.add(q)
        created_questions.append(q)

    await db.commit()

    return InterviewSessionResponse(
        id=session.id,
        target_role=session.target_role,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        status=session.status,
        created_at=session.created_at,
        questions=[
            InterviewQuestionResponse(
                id=q.id,
                question_text=q.question_text,
                category=q.category,
                sort_order=q.sort_order,
                answer=None
            )
            for q in created_questions
        ]
    )

@router.get("/{session_id}", response_model=InterviewSessionResponse)
async def get_interview_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(InterviewSession)
        .where(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id)
        .options(
            selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answers)
        )
    )
    session = (await db.execute(stmt)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found or access denied.")

    q_list = []
    for q in session.questions:
        ans = q.answers[-1] if q.answers else None
        q_list.append(InterviewQuestionResponse(
            id=q.id,
            question_text=q.question_text,
            category=q.category,
            sort_order=q.sort_order,
            answer={
                "answer_text": ans.answer_text,
                "feedback": ans.feedback_json
            } if ans else None
        ))

    return InterviewSessionResponse(
        id=session.id,
        target_role=session.target_role,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        status=session.status,
        created_at=session.created_at,
        completed_at=session.completed_at,
        questions=q_list,
        summary=session.summary_json
    )

@router.post("/{session_id}/questions/{question_id}/answer")
async def submit_question_answer(
    session_id: str,
    question_id: str,
    data: InterviewAnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify session ownership
    sess_stmt = select(InterviewSession).where(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    )
    session = (await db.execute(sess_stmt)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or access denied.")

    # Verify question belongs to session
    q_stmt = select(InterviewQuestion).where(
        InterviewQuestion.id == question_id,
        InterviewQuestion.session_id == session.id
    )
    question = (await db.execute(q_stmt)).scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found in this session.")

    # Run AI rubric evaluation
    eval_feedback = await ai_service.evaluate_interview_answer(
        question=question.question_text,
        student_answer=data.answer_text,
        target_role=session.target_role,
        interview_type=session.interview_type,
        user_id=current_user.id,
        db=db
    )

    answer = InterviewAnswer(
        question_id=question.id,
        answer_text=data.answer_text,
        feedback_json=eval_feedback
    )
    db.add(answer)
    await db.commit()

    return {
        "question_id": question.id,
        "answer_text": data.answer_text,
        "feedback": eval_feedback
    }

@router.post("/{session_id}/complete", response_model=InterviewSessionResponse)
async def complete_interview_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(InterviewSession)
        .where(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id)
        .options(
            selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answers)
        )
    )
    session = (await db.execute(stmt)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Calculate summary metrics
    total_q = len(session.questions)
    answered_q = sum(1 for q in session.questions if q.answers)

    correctness_scores = []
    clarity_scores = []
    completeness_scores = []

    for q in session.questions:
        if q.answers:
            fb = q.answers[-1].feedback_json
            if isinstance(fb, dict):
                correctness_scores.append(fb.get("correctness_score", 7))
                clarity_scores.append(fb.get("clarity_score", 7))
                completeness_scores.append(fb.get("completeness_score", 7))

    avg_correctness = round(sum(correctness_scores) / len(correctness_scores), 1) if correctness_scores else 0
    avg_clarity = round(sum(clarity_scores) / len(clarity_scores), 1) if clarity_scores else 0
    avg_completeness = round(sum(completeness_scores) / len(completeness_scores), 1) if completeness_scores else 0

    session.status = "completed"
    session.completed_at = datetime.utcnow()
    session.summary_json = {
        "total_questions": total_q,
        "answered_questions": answered_q,
        "average_correctness": avg_correctness,
        "average_clarity": avg_clarity,
        "average_completeness": avg_completeness,
        "overall_evaluation": "Solid interview practice session. Focus on verbalizing trade-offs and complexity analysis."
    }

    q_list = []
    for q in session.questions:
        ans = q.answers[-1] if q.answers else None
        q_list.append(InterviewQuestionResponse(
            id=q.id,
            question_text=q.question_text,
            category=q.category,
            sort_order=q.sort_order,
            answer={
                "answer_text": ans.answer_text,
                "feedback": ans.feedback_json
            } if ans else None
        ))

    await db.commit()

    return InterviewSessionResponse(
        id=session.id,
        target_role=session.target_role,
        interview_type=session.interview_type,
        difficulty=session.difficulty,
        status=session.status,
        created_at=session.created_at,
        completed_at=session.completed_at,
        questions=q_list,
        summary=session.summary_json
    )
