"""
SmartEdu AI – Backend Configuration
Loads settings from environment variables with defaults for development.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "SmartEdu AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    API_PREFIX: str = ""
    AI_WORKER_URL: str = "http://ai-worker:8001"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://smartedu:password@localhost:5432/smartedu"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Auth
    JWT_SECRET_KEY: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_MAX_TOKENS: int = 4096

    # Rate Limiting
    RATE_LIMIT_GENERAL: str = "10/second"
    RATE_LIMIT_AUTH: str = "5/minute"
    RATE_LIMIT_AI: str = "2/minute"

    # AI Quotas
    AI_QUOTA_STUDENT_DAILY: int = 50
    AI_QUOTA_TEACHER_DAILY: int = 500

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # Sentry
    SENTRY_DSN: Optional[str] = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
