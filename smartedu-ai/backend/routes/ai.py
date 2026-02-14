"""
SmartEdu AI – AI Chat API Routes
"""

import httpx
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, AIUsageLog, Course, CourseDocument, ChatMessage
from schemas import ChatMessage as ChatMessageSchema, ChatResponse, ChatHistoryResponse
from auth import get_current_user
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatMessageSchema,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message to the AI learning assistant."""
    # Check AI quota
    stmt = select(User).where(User.id == current_user["user_id"])
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    daily_limit = (
        settings.AI_QUOTA_TEACHER_DAILY
        if current_user["role"] == "teacher"
        else settings.AI_QUOTA_STUDENT_DAILY
    )

    if user.ai_quota_used_today >= daily_limit:
        raise HTTPException(
            status_code=429,
            detail=f"Daily AI quota exceeded ({daily_limit} requests/day)",
        )

    # Fetch context if course_id provided
    course_context = ""
    if body.course_id:
        try:
            course_stmt = select(Course).where(Course.id == body.course_id)
            result = await db.execute(course_stmt)
            course = result.scalar_one_or_none()
            if course:
                course_context = f"Course Title: {course.title}\nDescription: {course.description or 'No description provided'}"
                # Add some documents info for more context
                doc_stmt = select(CourseDocument).where(CourseDocument.course_id == body.course_id).limit(5)
                doc_result = await db.execute(doc_stmt)
                docs = doc_result.scalars().all()
                if docs:
                    doc_list = ", ".join([d.filename for d in docs])
                    course_context += f"\nAvailable course materials: {doc_list}"
        except Exception as e:
            logger.error(f"Error fetching course context: {e}")

    # Retrieve recent history for context (last 10 messages)
    history_stmt = (
        select(ChatMessage)
        .where(ChatMessage.user_id == current_user["user_id"])
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
    )
    history_result = await db.execute(history_stmt)
    history_msgs = history_result.scalars().all()
    # Reverse to get chronological order for the worker
    formatted_history = [
        {"role": m.role, "content": m.content} 
        for m in reversed(history_msgs)
    ]

    # Save user message
    user_msg = ChatMessage(
        user_id=current_user["user_id"],
        course_id=body.course_id,
        role="user",
        content=body.message
    )
    db.add(user_msg)

    # Call AI Worker
    response_text = "AI thinking..."
    tokens_used = 0
    sources = []
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.AI_WORKER_URL}/chat",
                json={
                    "message": body.message,
                    "course_id": str(body.course_id) if body.course_id else None,
                    "course_context": course_context,
                    "chat_history": formatted_history
                },
                timeout=45.0
            )
            if resp.status_code == 200:
                data = resp.json()
                response_text = data.get("response", "No response from AI.")
                tokens_used = data.get("tokens_used", 0)
                sources = data.get("sources", [])
            else:
                logger.error(f"AI Worker error: {resp.status_code} - {resp.text}")
                response_text = "I'm sorry, I'm having trouble processing that right now. Please try again in a moment."
    except Exception as e:
        logger.error(f"Failed to call AI worker: {e}")
        response_text = "An error occurred while communicating with the AI service. Please ensure the AI worker is active."

    # Save assistant message
    assistant_msg = ChatMessage(
        user_id=current_user["user_id"],
        course_id=body.course_id,
        role="assistant",
        content=response_text
    )
    db.add(assistant_msg)

    # Update quota
    user.ai_quota_used_today += 1

    # Log usage
    log = AIUsageLog(
        tenant_id=current_user["tenant_id"],
        user_id=current_user["user_id"],
        request_type="chat",
        model="gemini-2.0-flash", # Updated to reflect likely model used
        input_tokens=len(body.message.split()),
        output_tokens=len(response_text.split()),
        cost_usd=0.0,
    )
    db.add(log)
    await db.commit()

    return ChatResponse(
        response=response_text,
        tokens_used=tokens_used or (len(body.message.split()) + len(response_text.split())),
        sources=sources,
    )


@router.get("/history", response_model=ChatHistoryResponse)
async def get_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the user's chat history."""
    stmt = (
        select(ChatMessage)
        .where(ChatMessage.user_id == current_user["user_id"])
        .order_by(ChatMessage.created_at.asc())
    )
    result = await db.execute(stmt)
    messages = result.scalars().all()
    return ChatHistoryResponse(messages=messages)
