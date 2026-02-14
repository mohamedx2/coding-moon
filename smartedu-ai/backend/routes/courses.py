"""
SmartEdu AI – Course API Routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID

from database import get_db
from models import Course, Enrollment, User
from schemas import CourseCreate, CourseResponse, CourseListResponse
from auth import get_current_user, require_role

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=CourseListResponse)
async def list_courses(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List courses based on user role (teacher sees own courses, student sees enrolled)."""
    if current_user["role"] == "teacher":
        stmt = select(Course).where(
            Course.teacher_id == current_user["user_id"],
            Course.tenant_id == current_user["tenant_id"],
        )
    elif current_user["role"] == "student":
        stmt = (
            select(Course)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .where(
                Enrollment.student_id == current_user["user_id"],
                Course.tenant_id == current_user["tenant_id"],
            )
        )
    else:
        # Admin sees all courses in tenant
        stmt = select(Course).where(Course.tenant_id == current_user["tenant_id"])

    result = await db.execute(stmt)
    courses = result.scalars().all()

    return CourseListResponse(
        courses=[CourseResponse.model_validate(c) for c in courses],
        total=len(courses),
    )


@router.post("", response_model=CourseResponse, status_code=201)
async def create_course(
    body: CourseCreate,
    current_user: dict = Depends(require_role("teacher", "admin")),
    db: AsyncSession = Depends(get_db),
):
    """Create a new course (teacher or admin only)."""
    course = Course(
        tenant_id=current_user["tenant_id"],
        teacher_id=current_user["user_id"],
        title=body.title,
        code=body.code,
        description=body.description,
        semester=body.semester,
    )
    db.add(course)
    await db.flush()

    return CourseResponse.model_validate(course)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific course by ID (tenant-scoped)."""
    stmt = select(Course).where(
        Course.id == course_id,
        Course.tenant_id == current_user["tenant_id"],
    )
    result = await db.execute(stmt)
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return CourseResponse.model_validate(course)


@router.post("/{course_id}/enroll", status_code=201)
async def enroll_student(
    course_id: UUID,
    current_user: dict = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Enroll current student in a course."""
    # Verify course exists
    stmt = select(Course).where(Course.id == course_id, Course.tenant_id == current_user["tenant_id"])
    result = await db.execute(stmt)
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check duplicate enrollment
    stmt = select(Enrollment).where(
        Enrollment.student_id == current_user["user_id"],
        Enrollment.course_id == course_id,
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already enrolled")

    enrollment = Enrollment(student_id=current_user["user_id"], course_id=course_id)
    db.add(enrollment)

    return {"message": "Enrolled successfully"}
