"""
SmartEdu AI – Pydantic Request/Response Schemas
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


# ── Enums ──

class RoleEnum(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"
    super_admin = "super_admin"


class DifficultyEnum(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


# ── Auth ──

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=12)
    role: RoleEnum = RoleEnum.student


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    role: str
    name: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── User ──

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: RoleEnum
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


# ── Course ──

class CourseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    code: Optional[str] = None
    description: Optional[str] = None
    semester: Optional[str] = None


class CourseResponse(BaseModel):
    id: UUID
    title: str
    code: Optional[str]
    description: Optional[str]
    semester: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    courses: List[CourseResponse]
    total: int


# ── Tenant ──

class TenantResponse(BaseModel):
    id: UUID
    name: str
    domain: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TopTenantInfo(BaseModel):
    name: str
    user_count: int
    course_count: int
    plan: str

class SystemHealthInfo(BaseModel):
    service: str
    status: str
    uptime: str
    latency: str

class AdminDashboardStats(BaseModel):
    total_users: int
    active_tenants: int
    total_courses: int
    ai_requests_today: int
    revenue_estimate: str
    top_tenants: List[TopTenantInfo]
    system_health: List[SystemHealthInfo]


# ── Quiz ──

class QuizGenerateRequest(BaseModel):
    course_id: UUID
    topic: str = Field(..., min_length=3)
    num_questions: int = Field(default=10, ge=1, le=50)
    difficulty: DifficultyEnum = DifficultyEnum.medium
    question_type: str = "mcq"


class QuestionResponse(BaseModel):
    id: UUID
    question_text: str
    question_type: str
    difficulty: str
    options: Optional[list] = None
    points: int

    class Config:
        from_attributes = True


class QuizResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    status: str
    difficulty: str
    time_limit_minutes: Optional[int]
    is_ai_generated: bool
    questions: List[QuestionResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class QuizAttemptSubmit(BaseModel):
    answers: dict  # {question_id: selected_answer}


class QuizAttemptResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    score: Optional[float]
    total_points: Optional[int]
    started_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Analytics ──

class StudentAnalytics(BaseModel):
    total_quizzes: int
    average_score: float
    mastery_by_topic: dict
    study_streak: int
    total_study_hours: float


class ClassAnalytics(BaseModel):
    total_students: int
    average_score: float
    pass_rate: float
    at_risk_count: int
    score_distribution: dict
    score_distribution: dict
    topic_performance: dict


class TeacherAnalytics(BaseModel):
    active_students: int
    active_courses: int
    quizzes_created: int
    average_class_score: float


# ── AI ──

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    course_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    response: str
    tokens_used: int
    sources: List[str] = []


class ChatMessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageResponse]


class CourseDocumentResponse(BaseModel):
    id: UUID
    filename: str
    file_type: str
    file_size: int
    is_processed: bool
    uploaded_at: datetime

    class Config:
        from_attributes = True


class CourseSuggestion(BaseModel):
    title: str
    description: str
    reason: str

class SuggestionResponse(BaseModel):
    suggestions: List[CourseSuggestion]


# ── Health ──

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    environment: str
    services: dict
