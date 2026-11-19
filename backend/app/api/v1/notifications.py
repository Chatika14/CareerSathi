from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.entities import User, Notification
from app.schemas.schemas import NotificationResponse
from app.services.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()

@router.patch("/{notification_id}", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    )
    notification = (await db.execute(stmt)).scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found.")

    notification.read_at = datetime.utcnow()
    await db.commit()
    await db.refresh(notification)
    return notification

@router.post("/mark-all-read")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.read_at.is_(None))
        .values(read_at=datetime.utcnow())
    )
    await db.execute(stmt)
    await db.commit()
    return {"message": "All notifications marked as read."}
