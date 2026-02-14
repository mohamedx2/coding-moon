"""
SmartEdu AI – JWT Authentication Utilities
"""

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import settings

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: UUID, role: str, tenant_id: UUID) -> str:
    """Create a short-lived JWT access token."""
    payload = {
        "sub": str(user_id),
        "role": role.value if hasattr(role, 'value') else str(role),
        "tenant_id": str(tenant_id),
        "type": "access",
        "exp": datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: UUID) -> str:
    """Create a longer-lived refresh token."""
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """FastAPI dependency to get the current authenticated user from JWT."""
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    return {
        "user_id": UUID(payload["sub"]),
        "role": payload["role"],
        "tenant_id": UUID(payload["tenant_id"]),
    }


def require_role(*allowed_roles):
    """Dependency factory: restrict endpoint to specific roles."""
    # Pre-compute allowed role strings at definition time
    # UserRole enum: str(UserRole.admin) == "UserRole.admin" but UserRole.admin.value == "admin"
    allowed = [r.value if hasattr(r, 'value') else str(r) for r in allowed_roles]

    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user["role"]  # Already a plain string from JWT decode
        if user_role not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker
