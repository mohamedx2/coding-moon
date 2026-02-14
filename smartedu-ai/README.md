# 🎓 SmartEdu AI - Production-Ready DevOps Architecture

> **Enterprise-Level Multi-Tenant AI SaaS Platform**  
> Designed for 10,000 - 100,000+ active users

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Documentation](#architecture-documentation)
3. [Configuration Files](#configuration-files)
4. [Quick Start](#quick-start)
5. [Deployment Guide](#deployment-guide)
6. [Security](#security)
7. [Monitoring](#monitoring)
8. [Disaster Recovery](#disaster-recovery)
9. [Team Responsibilities](#team-responsibilities)

---

SmartEdu AI is a production-ready, multi-tenant AI-powered educational platform featuring:

- **Gemini 2.5 Flash**: Hyper-fast, context-aware AI tutor integrated via `google-genai` SDK.
- **Persistent Chat History**: Full conversation memory stored in PostgreSQL with contextual RAG.
- **Premium Sass UI**: High-fidelity glassmorphic design for the AI Assistant with modular CSS architecture.
- **Next.js 14+** frontend with SSR/SSG and Lucide-React icons.
- **FastAPI** backend with async multi-tenant isolation.
- **AI Worker Service**: Decoupled worker for intensive Gemini operations and quiz generation.
- **Full Dockerization**: One-command deployment for the entire stack.

### Key Features

✅ **AI Learning Assistant** with long-term memory and course-specific context.  
✅ **Multi-tenant architecture** with strict tenant isolation and RBAC.  
✅ **"Sass Perfect" UI** featuring glassmorphism, animations, and premium dark-mode.  
✅ **JWT Authentication** with dual-URL configuration for flexible hosting.  
✅ **Robust Error Handling** and automated usage logging for AI audit trails.  
✅ **Scalable Infrastructure** with PostgreSQL, Redis, and NGINX Proxy.  

---

## 📚 Architecture Documentation

### Core Architecture

| Document | Description |
|----------|-------------|
| [Infrastructure Architecture](./docs/architecture/01-infrastructure-architecture.md) | Complete system architecture, scaling strategy, network design |
| [Security Architecture](./docs/security/02-security-architecture.md) | Authentication, authorization, API security, multi-tenant isolation |
| [Disaster Recovery](./docs/deployment/03-disaster-recovery.md) | Backup strategy, failover procedures, recovery scenarios |
| [Production Hardening](./docs/deployment/04-production-hardening.md) | 100+ security and performance checklist items |

### Key Diagrams

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET / CDN                        │
└────────────────────────┬────────────────────────────────┘
                         │
                    Load Balancer
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    NGINX Proxy      NGINX Proxy     NGINX Proxy
        │                │                │
    ┌───┴────────────────┴────────────────┴───┐
    │                                          │
Frontend (Next.js)              Backend (FastAPI)
    │                                          │
    └──────────────┬───────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
   PostgreSQL    Redis    Vector DB
```

---

## ⚙️ Configuration Files

### Docker & Containers

| File | Purpose |
|------|---------|
| [`docker-compose.prod.yml`](./docker-compose.prod.yml) | Production Docker Compose with all services |
| [`devops/docker/Dockerfile.frontend`](./devops/docker/Dockerfile.frontend) | Optimized Next.js multi-stage build |
| [`devops/docker/Dockerfile.backend`](./devops/docker/Dockerfile.backend) | FastAPI with Gunicorn production server |

### NGINX & Reverse Proxy

| File | Purpose |
|------|---------|
| [`devops/nginx/nginx.conf`](./devops/nginx/nginx.conf) | Production NGINX configuration with SSL, rate limiting, security headers |

### CI/CD Pipeline

| File | Purpose |
|------|---------|
| [`devops/ci-cd/github-actions.yml`](./devops/ci-cd/github-actions.yml) | Complete CI/CD with security scanning, testing, blue-green deployment |

### Monitoring

| File | Purpose |
|------|---------|
| [`devops/monitoring/prometheus.yml`](./devops/monitoring/prometheus.yml) | Prometheus metrics collection configuration |

---

## 🚀 Quick Start

### Prerequisites

- Docker 24+ and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)
- AWS CLI configured (for production deployment)

### Local Development

```bash
# Clone repository
git clone https://github.com/your-org/smartedu-ai.git
cd smartedu-ai

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9090
```

### Production Deployment

```bash
# 1. Set up environment variables
export DB_PASSWORD="your-secure-password"
export JWT_SECRET_KEY="your-jwt-secret"
export OPENAI_API_KEY="sk-..."

# 2. Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 3. Set up SSL certificates
docker-compose exec certbot certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@smartedu.ai \
  --agree-tos \
  --no-eff-email \
  -d smartedu.ai \
  -d www.smartedu.ai

# 4. Reload NGINX
docker-compose exec nginx nginx -s reload

# 5. Verify deployment
curl https://smartedu.ai/health
curl https://smartedu.ai/api/health
```

---

## 🧠 How the AI Assistant Works

The SmartEdu AI Assistant leverages a stateful, RAG-enhanced pipeline to provide expert educational support:

1. **Persistent History Fetching**: On every message, the backend retrieves the last 10 turns of conversation from the `chat_messages` table.
2. **Contextual Enrichment**: If a `course_id` is passed, the system fetches course descriptions and document names to ground the AI's knowledge.
3. **Worker Relay**: The backend relays the message, history, and context to the `ai-worker` service.
4. **Gemini 2.5 Flash Processing**: The worker interacts with Google's Gemini API using the latest `google-genai` SDK for low-latency, high-reasoning responses.
5. **Token Auditing**: Usage is logged to the database for transparent quota management and analytics.

---

## 🔐 Security

### Authentication Flow

```
User Login
    ↓
Validate Credentials
    ↓
Generate Tokens:
    ├── Access Token (15 min, in memory)
    └── Refresh Token (7 days, httpOnly cookie)
    ↓
Return to Client
```

### Key Security Features

- **JWT with RS256** asymmetric signing
- **httpOnly cookies** for XSS protection
- **Token rotation** on refresh
- **2FA** for admin accounts
- **Rate limiting** (10 req/sec general, 2 req/min AI)
- **CORS** restricted to allowed origins
- **CSRF protection** with double-submit cookie
- **SQL injection** prevention (parameterized queries)
- **XSS protection** (input sanitization + CSP)

### Multi-Tenant Isolation

```sql
-- Row-level security policy
CREATE POLICY tenant_isolation ON users
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Every query automatically filtered by tenant
SELECT * FROM users WHERE id = :user_id;
-- Becomes: SELECT * FROM users WHERE id = :user_id AND tenant_id = :current_tenant_id
```

---

## 📊 Monitoring

### Metrics Stack

- **Prometheus**: Metrics collection from all services
- **Grafana**: Visualization and dashboards
- **Loki**: Log aggregation
- **Promtail**: Log shipping
- **Sentry**: Error tracking

### Key Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| **CPU Usage** | > 80% | Warning |
| **Memory Usage** | > 85% | Warning |
| **Error Rate** | > 1% | Critical |
| **Response Time (p95)** | > 500ms | Warning |
| **Database Connections** | > 180/200 | Warning |
| **Disk Usage** | > 85% | Critical |

### Accessing Monitoring

```bash
# Grafana
https://monitoring.smartedu.ai
# Default credentials: admin / (check GRAFANA_PASSWORD env var)

# Prometheus
http://localhost:9090

# Sentry
https://sentry.io/organizations/smartedu/
```

---

## 💾 Disaster Recovery

### Backup Schedule

| Type | Frequency | Retention | Storage |
|------|-----------|-----------|---------|
| **Full DB Backup** | Daily 2 AM UTC | 30 days | S3 Standard-IA |
| **Incremental** | Every 6 hours | 7 days | S3 Standard |
| **WAL Archive** | Continuous | 7 days | S3 Standard |
| **Long-term** | Weekly | 1 year | S3 Glacier |

### Recovery Objectives

- **RTO (Recovery Time Objective)**: < 2 hours
- **RPO (Recovery Point Objective)**: < 15 minutes

### Disaster Scenarios

1. **Database Corruption**: Restore from backup + WAL replay (< 1 hour)
2. **Region Failure**: Failover to DR region (< 30 minutes)
3. **Ransomware**: Restore from clean backup (< 4 hours)

See [Disaster Recovery Guide](./docs/deployment/03-disaster-recovery.md) for detailed procedures.

---

## 👥 Team Responsibilities

### DevOps Team
- Infrastructure provisioning
- CI/CD pipeline maintenance
- Monitoring and alerting
- Incident response

### Backend Team
- API development
- Database schema management
- Authentication/authorization
- AI service integration

### Frontend Team
- UI/UX implementation
- Client-side routing
- State management
- Performance optimization

### Security Team
- Security audits
- Penetration testing
- Compliance (GDPR, SOC 2)
- Incident response

### Database Team
- Database optimization
- Backup/restore procedures
- Replication management
- Performance tuning

---

## 📞 Support & Contact

### Production Issues

- **On-call**: PagerDuty rotation
- **Slack**: #smartedu-incidents
- **Email**: oncall@smartedu.ai

### Documentation

- **Wiki**: https://wiki.smartedu.ai
- **API Docs**: https://api.smartedu.ai/docs
- **Status Page**: https://status.smartedu.ai

---

## 📄 License

Proprietary - SmartEdu AI © 2024

---

## 🎉 Acknowledgments

Built with:
- **Google Gemini 2.5 Flash** (Intelligence Core)
- **FastAPI** (Pythonic Backend)
- **Next.js & Sass** (Premium Frontend)
- **PostgreSQL** (Persistent Memory)
- **Redis** (Real-time Cache)
- **NGINX** (Reverse Proxy)
- **Docker & Compose** (Orchestration)

---

**Last Updated**: 2024-02-13  
**Version**: 1.0.0  
**Maintained by**: DevOps Team
