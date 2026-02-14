"""
SmartEdu AI – AI Suggestion Routes
Personalized course and material recommendations for students.
"""

from fastapi import APIRouter, Depends, HTTPException
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Enrollment, Course, User
from schemas import SuggestionResponse
from auth import get_current_user
from config import settings

router = APIRouter(prefix="/suggestions", tags=["AI Suggestions"])


@router.get("", response_model=SuggestionResponse)
async def get_suggestions(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get personalized course recommendations for the student.
    Analyses current enrollment and uses AI to find overlapping educational paths.
    """
    
    # Fetch current enrollment for context
    stmt = (
        select(Course.title)
        .join(Enrollment, Enrollment.course_id == Course.id)
        .where(Enrollment.student_id == current_user["user_id"])
    )
    enrollment_result = await db.execute(stmt)
    current_courses = enrollment_result.scalars().all()
    
    # Prepare interests based on course titles (simple heuristic)
    # in a real app, this would come from a user_profile.interests list
    interests = list(set([title.split()[0] for title in current_courses])) or ["Technology", "Science", "Arts"]

    # Call AI Worker Suggestions Service
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{settings.AI_WORKER_URL}/suggestions",
                json={
                    "interests": interests,
                    "recent_courses": list(current_courses)
                },
                timeout=20.0
            )
            
            if resp.status_code == 200:
                return resp.json()
            else:
                return {"suggestions": _get_fallback_suggestions()}
        except Exception as e:
            print(f"❌ Suggestion fetch failed: {e}")
            return {"suggestions": _get_fallback_suggestions()}


def _get_fallback_suggestions():
    return [
        {
            "title": "Introduction to SmartEdu",
            "description": "Learn how to use AI to maximize your learning speed.",
            "reason": "Highly recommended for all new users."
        },
        {
            "title": "Academic Writing with AI",
            "description": "Master the art of prompt engineering for essays.",
            "reason": "Useful for your future research projects."
        }
    ]
