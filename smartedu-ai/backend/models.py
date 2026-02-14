"""
SmartEdu AI – SQLAlchemy Models
Multi-tenant data model with tenant isolation.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime,
    ForeignKey, Enum as SQLEnum, JSON, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
import enum


# ── Enums ──

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"
    super_admin = "super_admin"


class QuizStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class DifficultyLevel(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class QuestionType(str, enum.Enum):
    mcq = "mcq"
    short_answer = "short_answer"
    true_false = "true_false"


# ── Models ──

class Tenant(Base):
    """University or organization using the platform."""
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    domain = Column(String(255), nullable=True)
    plan = Column(String(50), default="free")
    is_active = Column(Boolean, default=True)
    settings = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="tenant", lazy="selectin")
    courses = relationship("Course", back_populates="tenant", lazy="selectin")


class User(Base):
    """Platform user (student, teacher, or admin)."""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    email = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Null for OAuth users
    role = Column(SQLEnum(UserRole, name="user_role", native_enum=True), default=UserRole.student)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    avatar_url = Column(String(500), nullable=True)
    oauth_provider = Column(String(50), nullable=True)
    oauth_id = Column(String(255), nullable=True)
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(255), nullable=True)
    ai_quota_used_today = Column(Integer, default=0)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Constraints
    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_user_tenant_email"),
    )

    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    enrollments = relationship("Enrollment", back_populates="student", lazy="selectin")
    quiz_attempts = relationship("QuizAttempt", back_populates="student", lazy="selectin")
    chat_messages = relationship("ChatMessage", back_populates="user", lazy="selectin", cascade="all, delete-orphan")


class Course(Base):
    """A course offered by a teacher within a tenant."""
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    code = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    semester = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    settings = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="courses")
    teacher = relationship("User", foreign_keys=[teacher_id])
    enrollments = relationship("Enrollment", back_populates="course", lazy="selectin")
    quizzes = relationship("Quiz", back_populates="course", lazy="selectin")
    documents = relationship("CourseDocument", back_populates="course", lazy="selectin")


class Enrollment(Base):
    """Student enrollment in a course."""
    __tablename__ = "enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", name="uq_enrollment"),
    )

    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class CourseDocument(Base):
    """Uploaded course material for RAG processing."""
    __tablename__ = "course_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    is_processed = Column(Boolean, default=False)
    chunk_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="documents")


class Quiz(Base):
    """A quiz (auto-generated or manual) for a course."""
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(QuizStatus, name="quizstatus", native_enum=True), default=QuizStatus.draft)
    difficulty = Column(SQLEnum(DifficultyLevel, name="difficultylevel", native_enum=True), default=DifficultyLevel.medium)
    time_limit_minutes = Column(Integer, nullable=True)
    is_ai_generated = Column(Boolean, default=False)
    ai_prompt = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    course = relationship("Course", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", lazy="selectin", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", lazy="selectin")


class Question(Base):
    """Individual quiz question."""
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionType, name="questiontype", native_enum=True), default=QuestionType.mcq)
    difficulty = Column(SQLEnum(DifficultyLevel, name="difficultylevel", native_enum=True), default=DifficultyLevel.medium)
    options = Column(JSON, nullable=True)  # List of options for MCQ
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    points = Column(Integer, default=1)
    order = Column(Integer, default=0)

    quiz = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    """A student's attempt at a quiz."""
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    score = Column(Float, nullable=True)
    total_points = Column(Integer, nullable=True)
    answers = Column(JSON, default=dict)  # {question_id: answer}
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    time_spent_seconds = Column(Integer, nullable=True)

    quiz = relationship("Quiz", back_populates="attempts")
    student = relationship("User", back_populates="quiz_attempts")


class AIUsageLog(Base):
    """Track AI API usage for cost control and analytics."""
    __tablename__ = "ai_usage_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    request_type = Column(String(50), nullable=False)  # quiz_generation, chat, embedding
    model = Column(String(100), nullable=False)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    """Persistent chat message history."""
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")
    course = relationship("Course")


class AuditLog(Base):
    """Audit trail for security-critical actions."""
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(255), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
