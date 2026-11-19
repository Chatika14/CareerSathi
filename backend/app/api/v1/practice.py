from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from app.database import get_db
from app.models.entities import User, PracticeQuestion, PracticeAttempt
from app.schemas.schemas import PracticeQuestionResponse, PracticeAttemptSubmit, PracticeAttemptResponse
from app.services.auth import get_current_user

router = APIRouter()

@router.get("/questions", response_model=List[PracticeQuestionResponse])
async def list_practice_questions(
    question_type: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(PracticeQuestion).where(PracticeQuestion.active == True)
    if question_type:
        stmt = stmt.where(PracticeQuestion.question_type == question_type)
    if topic:
        stmt = stmt.where(PracticeQuestion.topic == topic)
    if difficulty:
        stmt = stmt.where(PracticeQuestion.difficulty == difficulty)

    stmt = stmt.order_by(PracticeQuestion.difficulty, PracticeQuestion.title)
    res = await db.execute(stmt)
    questions = res.scalars().all()

    return [
        PracticeQuestionResponse(
            id=q.id,
            question_type=q.question_type,
            title=q.title,
            prompt=q.prompt,
            options=q.options_json,
            difficulty=q.difficulty,
            topic=q.topic,
            constraints=q.constraints,
            input_output_examples=q.input_output_examples
        )
        for q in questions
    ]

@router.post("/questions/{question_id}/attempt", response_model=PracticeAttemptResponse)
async def submit_practice_attempt(
    question_id: str,
    data: PracticeAttemptSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    q_stmt = select(PracticeQuestion).where(PracticeQuestion.id == question_id)
    question = (await db.execute(q_stmt)).scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Practice question not found.")

    user_ans = data.answer.strip()
    is_correct = False
    feedback = ""

    if question.question_type == "aptitude":
        # Check against correct_answer
        correct_ans = (question.correct_answer or "").strip()
        is_correct = (user_ans.lower() == correct_ans.lower())
        feedback = "Correct! Well done." if is_correct else f"Incorrect. The correct answer is: {correct_ans}."
    else:
        # Coding question: solution logged for review
        is_correct = True
        feedback = "Solution logged. Review the editorial and reference solution below."

    attempt = PracticeAttempt(
        user_id=current_user.id,
        question_id=question.id,
        answer_json={"submitted": user_ans},
        is_correct=is_correct,
        feedback=feedback
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)

    return PracticeAttemptResponse(
        id=attempt.id,
        question_id=question.id,
        is_correct=is_correct,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        feedback=feedback,
        created_at=attempt.created_at
    )

@router.get("/history")
async def get_practice_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(PracticeAttempt, PracticeQuestion)
        .join(PracticeQuestion, PracticeAttempt.question_id == PracticeQuestion.id)
        .where(PracticeAttempt.user_id == current_user.id)
        .order_by(PracticeAttempt.created_at.desc())
    )
    res = await db.execute(stmt)
    rows = res.all()

    total = len(rows)
    correct_count = sum(1 for a, q in rows if a.is_correct)
    accuracy = round((correct_count / total * 100), 1) if total > 0 else 0.0

    return {
        "total_attempts": total,
        "correct_count": correct_count,
        "accuracy_percentage": accuracy,
        "recent_attempts": [
            {
                "attempt_id": a.id,
                "question_title": q.title,
                "question_type": q.question_type,
                "topic": q.topic,
                "difficulty": q.difficulty,
                "is_correct": a.is_correct,
                "submitted_at": a.created_at
            }
            for a, q in rows[:20]
        ]
    }
