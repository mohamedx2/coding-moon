-- ═══════════════════════════════════════════════
-- SmartEdu AI – Database Initialization Script
-- ═══════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ──
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'super_admin');
CREATE TYPE quiz_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE question_type AS ENUM ('mcq', 'short_answer', 'true_false');

-- ── Tenants ──
CREATE TABLE tenants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    domain      VARCHAR(255),
    plan        VARCHAR(50) DEFAULT 'free',
    is_active   BOOLEAN DEFAULT TRUE,
    settings    JSONB DEFAULT '{}',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ── Users ──
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email               VARCHAR(255) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    hashed_password     VARCHAR(255),
    role                user_role DEFAULT 'student',
    is_active           BOOLEAN DEFAULT TRUE,
    is_verified         BOOLEAN DEFAULT FALSE,
    avatar_url          VARCHAR(500),
    oauth_provider      VARCHAR(50),
    oauth_id            VARCHAR(255),
    two_factor_enabled  BOOLEAN DEFAULT FALSE,
    two_factor_secret   VARCHAR(255),
    ai_quota_used_today INTEGER DEFAULT 0,
    last_login          TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_user_tenant_email UNIQUE (tenant_id, email)
);

-- ── Courses ──
CREATE TABLE courses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    teacher_id  UUID NOT NULL REFERENCES users(id),
    title       VARCHAR(255) NOT NULL,
    code        VARCHAR(50),
    description TEXT,
    semester    VARCHAR(50),
    is_active   BOOLEAN DEFAULT TRUE,
    settings    JSONB DEFAULT '{}',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ── Enrollments ──
CREATE TABLE enrollments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    is_active   BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_enrollment UNIQUE (student_id, course_id)
);

-- ── Course Documents ──
CREATE TABLE course_documents (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id     UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    filename      VARCHAR(255) NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    file_type     VARCHAR(50) NOT NULL,
    file_size     INTEGER NOT NULL,
    is_processed  BOOLEAN DEFAULT FALSE,
    chunk_count   INTEGER DEFAULT 0,
    uploaded_at   TIMESTAMP DEFAULT NOW()
);

-- ── Quizzes ──
CREATE TABLE quizzes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id           UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    status              quiz_status DEFAULT 'draft',
    difficulty          difficulty_level DEFAULT 'medium',
    time_limit_minutes  INTEGER,
    is_ai_generated     BOOLEAN DEFAULT FALSE,
    ai_prompt           TEXT,
    due_date            TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ── Questions ──
CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_type   question_type DEFAULT 'mcq',
    difficulty      difficulty_level DEFAULT 'medium',
    options         JSONB,
    correct_answer  TEXT NOT NULL,
    explanation     TEXT,
    points          INTEGER DEFAULT 1,
    "order"         INTEGER DEFAULT 0
);

-- ── Quiz Attempts ──
CREATE TABLE quiz_attempts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id             UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score               FLOAT,
    total_points        INTEGER,
    answers             JSONB DEFAULT '{}',
    started_at          TIMESTAMP DEFAULT NOW(),
    completed_at        TIMESTAMP,
    time_spent_seconds  INTEGER
);

-- ── AI Usage Logs ──
CREATE TABLE ai_usage_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID NOT NULL REFERENCES tenants(id),
    user_id       UUID NOT NULL REFERENCES users(id),
    request_type  VARCHAR(50) NOT NULL,
    model         VARCHAR(100) NOT NULL,
    input_tokens  INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cost_usd      FLOAT DEFAULT 0.0,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- ── Audit Logs ──
CREATE TABLE audit_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID REFERENCES tenants(id),
    user_id       UUID REFERENCES users(id),
    action        VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id   VARCHAR(255),
    details       JSONB DEFAULT '{}',
    ip_address    VARCHAR(45),
    user_agent    VARCHAR(500),
    created_at    TIMESTAMP DEFAULT NOW()
);


-- ═══════════════════════════════
-- Row Level Security Policies
-- ═══════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Tenant isolation: users can only see data within their own tenant
CREATE POLICY tenant_isolation_users ON users
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_courses ON courses
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);


-- ═══════════════════════════════
-- Indexes for Performance
-- ═══════════════════════════════

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_tenant ON courses(tenant_id);
CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_ai_usage_tenant ON ai_usage_logs(tenant_id);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);


-- ═══════════════════════════════
-- Seed Data (Development)
-- ═══════════════════════════════

INSERT INTO tenants (id, name, slug, plan) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Default', 'default', 'free'),
    ('b1ffcd00-ad1c-4ef9-cc7e-7ccace491b22', 'Stanford University', 'stanford', 'enterprise'),
    ('c2aade11-be2d-4a10-dd8f-8ddbdf502c33', 'MIT', 'mit', 'enterprise');
