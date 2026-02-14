"""
SmartEdu AI – Auth API Routes
Registration, login, token refresh.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Tenant, UserRole
from schemas import LoginRequest, RegisterRequest, TokenResponse, RefreshTokenRequest, UserResponse
from auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check existing user
    stmt = select(User).where(User.email == body.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="User already exists")

    # Get or create default tenant
    stmt = select(Tenant).where(Tenant.slug == "default")
    result = await db.execute(stmt)
    tenant = result.scalar_one_or_none()
    if not tenant:
        tenant = Tenant(id=uuid.uuid4(), name="Default", slug="default")
        db.add(tenant)
        await db.flush()

    user = User(
        tenant_id=tenant.id,
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
        role=UserRole(body.role.value) if hasattr(body.role, 'value') else body.role,
    )
    db.add(user)
    await db.flush()

    access_token = create_access_token(user.id, user.role, tenant.id)
    return TokenResponse(
        access_token=access_token,
        expires_in=900,
        role=user.role,
        name=user.name
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT tokens."""
    stmt = select(User).where(User.email == body.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    access_token = create_access_token(user.id, user.role, user.tenant_id)
    return TokenResponse(
        access_token=access_token,
        expires_in=900,
        role=user.role,
        name=user.name
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh an access token using a refresh token."""
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=400, detail="Invalid token type")

    stmt = select(User).where(User.id == payload["sub"])
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid user")

    access_token = create_access_token(user.id, user.role, user.tenant_id)
    return TokenResponse(access_token=access_token, expires_in=900)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user
