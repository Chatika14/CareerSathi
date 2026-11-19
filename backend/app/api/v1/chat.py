from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.entities import User, Profile, Roadmap, RoadmapPhase, RoadmapTask, ChatConversation, ChatMessage
from app.schemas.schemas import (
    ChatConversationCreate, ChatConversationResponse,
    ChatMessageCreate, ChatMessageResponse
)
from app.services.auth import get_current_user
from app.services.ai.service import ai_service

router = APIRouter()

@router.get("/conversations", response_model=List[ChatConversationResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ChatConversation)
        .where(ChatConversation.user_id == current_user.id)
        .options(selectinload(ChatConversation.messages))
        .order_by(ChatConversation.updated_at.desc())
    )
    res = await db.execute(stmt)
    convs = res.scalars().all()
    return convs

@router.post("/conversations", response_model=ChatConversationResponse)
async def create_conversation(
    data: ChatConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    conv = ChatConversation(
        user_id=current_user.id,
        title=data.title or "Career Guidance Session"
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)

    # Initial greeting from assistant
    welcome_msg = ChatMessage(
        conversation_id=conv.id,
        role="assistant",
        content="Hello! I am CareerSaathi AI. How can I assist you with your placement preparation, skill roadmaps, or interview readiness today?"
    )
    db.add(welcome_msg)
    await db.commit()

    reloaded_stmt = (
        select(ChatConversation)
        .where(ChatConversation.id == conv.id)
        .options(selectinload(ChatConversation.messages))
    )
    return (await db.execute(reloaded_stmt)).scalar_one()

@router.get("/conversations/{conversation_id}", response_model=ChatConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ChatConversation)
        .where(ChatConversation.id == conversation_id, ChatConversation.user_id == current_user.id)
        .options(selectinload(ChatConversation.messages))
    )
    conv = (await db.execute(stmt)).scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found or access denied.")
    return conv

@router.post("/conversations/{conversation_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    conversation_id: str,
    data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ChatConversation).where(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    )
    conv = (await db.execute(stmt)).scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found or access denied.")

    # Save user message
    user_msg = ChatMessage(
        conversation_id=conv.id,
        role="user",
        content=data.content.strip()
    )
    db.add(user_msg)
    await db.flush()

    # Build safe student context
    profile_stmt = select(Profile).where(Profile.id == current_user.id)
    profile = (await db.execute(profile_stmt)).scalar_one_or_none()

    roadmap_stmt = (
        select(Roadmap)
        .where(Roadmap.user_id == current_user.id, Roadmap.status == "active")
        .options(selectinload(Roadmap.phases).selectinload(RoadmapPhase.tasks))
    )
    active_roadmap = (await db.execute(roadmap_stmt)).scalar_one_or_none()

    roadmap_progress = "0%"
    if active_roadmap:
        total_tasks = sum(len(p.tasks) for p in active_roadmap.phases)
        completed_tasks = sum(sum(1 for t in p.tasks if t.status == "completed") for p in active_roadmap.phases)
        if total_tasks > 0:
            roadmap_progress = f"{int(completed_tasks / total_tasks * 100)}%"

    student_context = {
        "target_role": profile.target_role if profile and profile.target_role else "Software Engineer",
        "degree": profile.degree if profile else "B.Tech",
        "branch": profile.branch if profile else "CSE",
        "roadmap_progress": roadmap_progress
    }

    # Retrieve recent messages history
    msgs_stmt = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conv.id)
        .order_by(ChatMessage.created_at.asc())
    )
    history_rows = (await db.execute(msgs_stmt)).scalars().all()
    history_payload = [{"role": m.role, "content": m.content} for m in history_rows[-10:]]

    # Generate assistant response
    try:
        reply_text = await ai_service.chat(
            messages=history_payload,
            student_context=student_context,
            user_id=current_user.id,
            db=db
        )
    except Exception as e:
        reply_text = f"Notice: AI service response could not be completed ({str(e)}). Please try again."

    assistant_msg = ChatMessage(
        conversation_id=conv.id,
        role="assistant",
        content=reply_text
    )
    db.add(assistant_msg)
    conv.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(assistant_msg)

    return assistant_msg

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ChatConversation).where(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    )
    conv = (await db.execute(stmt)).scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found or access denied.")

    await db.delete(conv)
    await db.commit()
    return {"message": "Conversation deleted successfully."}
