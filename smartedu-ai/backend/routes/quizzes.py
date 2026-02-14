"""
SmartEdu AI – Quiz API Routes
"""

import httpx
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from datetime import datetime

from database import get_db
from models import Quiz, Question, QuizAttempt, Course, QuizStatus
from schemas import QuizGenerateRequest, QuizResponse, QuizAttemptSubmit, QuizAttemptResponse
from auth import get_current_user, require_role

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


@router.get("", response_model=list[QuizResponse])
async def list_quizzes(
    course_id: UUID = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List quizzes (optionally filtered by course)."""
    stmt = select(Quiz).join(Course).where(Course.tenant_id == current_user["tenant_id"])
    if course_id:
        stmt = stmt.where(Quiz.course_id == course_id)
    if current_user["role"] == "student":
        stmt = stmt.where(Quiz.status == QuizStatus.PUBLISHED)

    result = await db.execute(stmt)
    quizzes = result.scalars().all()
    return [QuizResponse.model_validate(q) for q in quizzes]


@router.post("/generate", response_model=QuizResponse, status_code=201)
async def generate_quiz(
    body: QuizGenerateRequest,
    current_user: dict = Depends(require_role("teacher", "admin")),
    db: AsyncSession = Depends(get_db),
):
    """AI-generate a quiz from course material."""
    # Verify course ownership
    stmt = select(Course).where(
        Course.id == body.course_id,
        Course.tenant_id == current_user["tenant_id"],
    )
    result = await db.execute(stmt)
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Call AI Worker to generate real questions
    questions_data = []
    try:
        import httpx
        from config import settings
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.AI_WORKER_URL}/generate-quiz",
                json={
                    "topic": body.topic,
                    "num_questions": body.num_questions,
                    "difficulty": body.difficulty.value,
                    "question_type": body.question_type,
                    "context": "" # TODO: Pass relevant course context
                },
                timeout=60.0
            )
            if resp.status_code == 200:
                questions_data = resp.json().get("questions", [])
            else:
                logger.error(f"AI Worker quiz error: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.error(f"Failed to call AI worker for quiz: {e}")

    # Create the quiz record
    quiz = Quiz(
        course_id=body.course_id,
        title=f"AI-Generated: {body.topic}",
        description=f"Quiz on {body.topic} ({body.difficulty.value} difficulty)",
        difficulty=body.difficulty.value,
        is_ai_generated=True,
        ai_prompt=body.topic,
        status=QuizStatus.DRAFT,
    )
    db.add(quiz)
    await db.flush()

    # Create the generated questions
    if not questions_data:
        # Fallback to a single placeholder if AI failed completely
        questions_data = [{
            "question_text": f"Wait, I'm still learning about {body.topic}. Can you ask again later?",
            "options": ["Yes", "No", "Maybe", "I'll try"],
            "correct_answer": "Yes",
            "explanation": "AI generation fallback.",
            "difficulty": body.difficulty.value
        }]

    for i, q_data in enumerate(questions_data):
        question = Question(
            quiz_id=quiz.id,
            question_text=q_data.get("question_text", "Missing question text"),
            question_type=body.question_type,
            difficulty=q_data.get("difficulty", body.difficulty.value),
            options=q_data.get("options"),
            correct_answer=q_data.get("correct_answer"),
            explanation=q_data.get("explanation", ""),
            order=i,
        )
        db.add(question)

    await db.flush()
    await db.refresh(quiz)


    return QuizResponse.model_validate(quiz)


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get quiz details (hides correct answers for students)."""
    stmt = select(Quiz).join(Course).where(
        Quiz.id == quiz_id,
        Course.tenant_id == current_user["tenant_id"],
    )
    result = await db.execute(stmt)
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return QuizResponse.model_validate(quiz)


@router.post("/{quiz_id}/submit", response_model=QuizAttemptResponse)
async def submit_quiz(
    quiz_id: UUID,
    body: QuizAttemptSubmit,
    current_user: dict = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Submit a quiz attempt and auto-grade."""
    stmt = select(Quiz).where(Quiz.id == quiz_id)
    result = await db.execute(stmt)
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Calculate score
    correct = 0
    total = len(quiz.questions)
    for q in quiz.questions:
        if body.answers.get(str(q.id)) == q.correct_answer:
            correct += 1

    score = (correct / total * 100) if total > 0 else 0

    attempt = QuizAttempt(
        quiz_id=quiz_id,
        student_id=current_user["user_id"],
        score=score,
        total_points=total,
        answers=body.answers,
        completed_at=datetime.utcnow(),
    )
    db.add(attempt)

    return QuizAttemptResponse.model_validate(attempt)
