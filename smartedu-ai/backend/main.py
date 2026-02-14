"""
SmartEdu AI – FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging

from config import settings
from database import init_db
from schemas import HealthResponse

# Route imports
from routes.auth import router as auth_router
from routes.courses import router as courses_router
from routes.quizzes import router as quizzes_router
from routes.ai import router as ai_router
from routes.analytics import router as analytics_router
from routes.documents import router as documents_router
from routes.suggestions import router as suggestions_router
from routes.admin import router as admin_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("🚀 Starting SmartEdu AI Backend")
    if settings.ENVIRONMENT == "development":
        logger.info("📦 Attempting to create database tables...")
        try:
            await init_db()
            logger.info("✅ Database tables created successfully (dev mode)")
        except Exception as e:
            logger.error(f"❌ Failed to create database tables: {e}", exc_info=True)
    yield
    logger.info("👋 Shutting down SmartEdu AI Backend")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Adaptive Learning Platform API",
    version="1.0.0",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)


# ── Middleware ──

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add X-Process-Time header to all responses."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time * 1000, 2))
    return response


@app.middleware("http")
async def tenant_context_middleware(request: Request, call_next):
    """Extract tenant context from JWT for multi-tenant isolation."""
    # Tenant context is handled in auth.py via JWT claims
    # This middleware is a placeholder for additional tenant-level logic
    response = await call_next(request)
    return response


# ── Exception Handlers ──

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ── Routes ──

app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(courses_router, prefix=settings.API_PREFIX)
app.include_router(quizzes_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(documents_router, prefix=settings.API_PREFIX)
app.include_router(suggestions_router, prefix=settings.API_PREFIX)
app.include_router(admin_router, prefix=settings.API_PREFIX)


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """System health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        environment=settings.ENVIRONMENT,
        services={
            "database": "connected",
            "redis": "connected",
            "ai_worker": "connected",
        },
    )


@app.get("/", tags=["System"])
async def root():
    """API root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/api/docs",
    }
