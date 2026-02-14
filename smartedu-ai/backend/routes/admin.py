"""
SmartEdu AI – Admin Management Routes
Global analytics and platform management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from auth import require_role
from database import get_db
from models import User, Course, Tenant, AIUsageLog, UserRole
from schemas import UserResponse, CourseResponse, TenantResponse, AdminDashboardStats, TopTenantInfo, SystemHealthInfo

router = APIRouter(prefix="/admin", tags=["Admin Management"])


@router.get("/stats", response_model=AdminDashboardStats)
async def get_platform_stats(
    current_user: dict = Depends(require_role(UserRole.admin, UserRole.super_admin)),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve platform-wide statistics for the admin dashboard."""
    # Count total users
    user_count = await db.scalar(select(func.count(User.id)))
    # Count total courses
    course_count = await db.scalar(select(func.count(Course.id)))
    # Count active tenants
    tenant_count = await db.scalar(select(func.count(Tenant.id)).where(Tenant.is_active == True))
    
    # Calculate AI requests today
    today = func.current_date()
    ai_requests_today = await db.scalar(
        select(func.count(AIUsageLog.id)).where(func.date(AIUsageLog.created_at) == today)
    )

    # Get Top Tenants
    # For now, let's get tenants with most users
    tenant_stmt = (
        select(
            Tenant.name,
            func.count(User.id).label("user_count"),
            func.count(Course.id).label("course_count"),
            Tenant.plan
        )
        .join(User, Tenant.id == User.tenant_id, isouter=True)
        .join(Course, Tenant.id == Course.tenant_id, isouter=True)
        .group_by(Tenant.id)
        .order_by(func.count(User.id).desc())
        .limit(5)
    )
    tenant_results = await db.execute(tenant_stmt)
    top_tenants = [
        TopTenantInfo(
            name=row[0],
            user_count=row[1],
            course_count=row[2],
            plan=row[3]
        )
        for row in tenant_results
    ]

    # System Health (partially mock/partially real)
    system_health = [
        SystemHealthInfo(service="Frontend (Next.js)", status="healthy", uptime="99.99%", latency="42ms"),
        SystemHealthInfo(service="Backend (FastAPI)", status="healthy", uptime="99.98%", latency="87ms"),
        SystemHealthInfo(service="AI Worker", status="healthy", uptime="99.95%", latency="1.2s"),
        SystemHealthInfo(service="PostgreSQL", status="healthy", uptime="99.99%", latency="3ms"),
        SystemHealthInfo(service="Redis", status="healthy", uptime="100%", latency="1ms"),
    ]

    return {
        "total_users": user_count or 0,
        "active_tenants": tenant_count or 0,
        "total_courses": course_count or 0,
        "ai_requests_today": ai_requests_today or 0,
        "revenue_estimate": "$48.5K",  # Placeholder until billing is integrated
        "top_tenants": top_tenants,
        "system_health": system_health,
    }


@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    current_user: dict = Depends(require_role(UserRole.admin, UserRole.super_admin)),
    db: AsyncSession = Depends(get_db),
):
    """List users. Super admins see all, admins see their tenant's users."""
    if current_user["role"] == "super_admin":
        stmt = select(User)
    else:
        stmt = select(User).where(User.tenant_id == current_user["tenant_id"])
    
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/courses", response_model=List[CourseResponse])
async def list_all_courses(
    current_user: dict = Depends(require_role(UserRole.admin, UserRole.super_admin)),
    db: AsyncSession = Depends(get_db),
):
    """List courses. Super admins see all, admins see their tenant's courses."""
    if current_user["role"] == "super_admin":
        stmt = select(Course)
    else:
        stmt = select(Course).where(Course.tenant_id == current_user["tenant_id"])
    
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: str,
    current_user: dict = Depends(require_role(UserRole.admin, UserRole.super_admin)),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable a user's account."""
    if current_user["role"] == "super_admin":
        stmt = select(User).where(User.id == user_id)
    else:
        stmt = select(User).where(User.id == user_id, User.tenant_id == current_user["tenant_id"])
        
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = not user.is_active
    await db.commit()
    return {"status": "success", "is_active": user.is_active}


@router.get("/billing", status_code=status.HTTP_200_OK)
async def get_billing_summary(
    current_user: dict = Depends(require_role(UserRole.admin, UserRole.super_admin)),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve platform-wide billing and revenue summary."""
    # This is a placeholder for actual billing integration (e.g. Stripe)
    return {
        "mrr": "$48.5K",
        "arr": "$582K",
        "paying_tenants": 23,
        "churn_rate": "1.2%",
        "plan_distribution": [
            {"plan": "Enterprise", "count": 5, "revenue": "$12,495"},
            {"plan": "University", "count": 12, "revenue": "$5,988"},
            {"plan": "Pro", "count": 248, "revenue": "$4,712"},
            {"plan": "Free", "count": 1847, "revenue": "$0"},
        ],
        "ai_spend": {
            "monthly": "$3,847",
            "models": [
                {"model": "GPT-4 Turbo", "tokens": "2.1M", "cost": "$2,160"},
                {"model": "Embeddings", "tokens": "18M", "cost": "$720"},
                {"model": "Gemini 1.5 Flash", "tokens": "8.2M", "cost": "$967"},
            ]
        }
    }
