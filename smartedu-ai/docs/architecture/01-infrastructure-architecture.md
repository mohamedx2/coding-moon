# 🏗️ SmartEdu AI - Infrastructure Architecture

## Executive Summary

SmartEdu AI is a production-ready, multi-tenant AI-powered SaaS platform designed to scale from 10,000 to 100,000+ active users. This document outlines the complete infrastructure architecture optimized for high availability, security, and cost-efficiency.

---

## 1️⃣ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET / CDN                               │
│                    (CloudFlare / AWS CloudFront)                     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTPS (443)
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                     LOAD BALANCER (AWS ALB / NLB)                    │
│              SSL Termination │ Health Checks │ Auto-scaling          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
┌────────────────▼──────────────┐   ┌───────────▼────────────────────┐
│     NGINX REVERSE PROXY        │   │   NGINX REVERSE PROXY          │
│   (Container: nginx:alpine)    │   │   (Container: nginx:alpine)    │
│                                │   │                                │
│  • Rate Limiting               │   │  • Rate Limiting               │
│  • Security Headers            │   │  • Security Headers            │
│  • Request Routing             │   │  • Request Routing             │
│  • Static Asset Caching        │   │  • Static Asset Caching        │
│  • Gzip Compression            │   │  • Gzip Compression            │
│  • WebSocket Support           │   │  • WebSocket Support           │
└────────────────┬──────────────┘   └───────────┬────────────────────┘
                 │                               │
     ┌───────────┴───────────────────────────────┴──────────┐
     │                                                       │
┌────▼─────────────────┐  ┌──────────────────┐  ┌──────────▼─────────┐
│  FRONTEND CLUSTER    │  │  BACKEND CLUSTER │  │  AI WORKER CLUSTER │
│  (Next.js 14+)       │  │  (FastAPI)       │  │  (Python + LLM)    │
│                      │  │                  │  │                    │
│  • SSR/SSG Pages     │  │  • REST API      │  │  • Quiz Generation │
│  • Client Routing    │  │  • Auth Service  │  │  • RAG Processing  │
│  • Static Assets     │  │  • CRUD Ops      │  │  • ML Inference    │
│  • API Calls         │  │  • Validation    │  │  • Embeddings      │
│                      │  │  • RBAC Logic    │  │                    │
│  Replicas: 3-10      │  │  Replicas: 5-20  │  │  Replicas: 2-15    │
└──────────────────────┘  └─────────┬────────┘  └──────────┬─────────┘
                                    │                      │
                    ┌───────────────┴──────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────────────────────┐
│                        DATA LAYER                                     │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │  PostgreSQL 15+     │  │  Redis Cluster   │  │  Vector DB      │ │
│  │  (Primary + Replica)│  │  (Cache + Queue) │  │  (Pinecone/     │ │
│  │                     │  │                  │  │   Weaviate)     │ │
│  │  • User Data        │  │  • Session Store │  │                 │ │
│  │  • Courses          │  │  • Rate Limits   │  │  • Embeddings   │ │
│  │  • Quiz Results     │  │  • Job Queue     │  │  • RAG Search   │ │
│  │  • Analytics        │  │  • Cache Layer   │  │  • Similarity   │ │
│  │                     │  │                  │  │                 │ │
│  │  Read Replicas: 2   │  │  Nodes: 3        │  │  Managed SaaS   │ │
│  └─────────────────────┘  └──────────────────┘  └─────────────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                    SUPPORTING SERVICES                                 │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  S3 / Object     │  │  Monitoring      │  │  Secrets Manager │   │
│  │  Storage         │  │  Stack           │  │                  │   │
│  │                  │  │                  │  │  • API Keys      │   │
│  │  • User Uploads  │  │  • Prometheus    │  │  • DB Passwords  │   │
│  │  • Backups       │  │  • Grafana       │  │  • JWT Secrets   │   │
│  │  • Static Assets │  │  • Loki (Logs)   │  │  • OAuth Creds   │   │
│  │  • Exports       │  │  • Sentry        │  │                  │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Containerization Strategy

### Service Separation

Each service runs in isolated Docker containers for:
- **Security isolation** - Compromised container doesn't affect others
- **Independent scaling** - Scale services based on demand
- **Easy deployment** - Deploy services independently
- **Resource optimization** - Allocate resources per service needs

### Container Architecture

```yaml
Services:
  ├── nginx-proxy (nginx:alpine)
  ├── frontend (node:20-alpine)
  ├── backend (python:3.11-slim)
  ├── ai-worker (python:3.11-slim + CUDA optional)
  ├── postgres (postgres:15-alpine)
  ├── redis (redis:7-alpine)
  └── monitoring (prometheus, grafana, loki)
```

### Resource Allocation (Per Container)

| Service | CPU | Memory | Replicas | Notes |
|---------|-----|--------|----------|-------|
| **nginx** | 0.5 | 512MB | 2-3 | Lightweight proxy |
| **frontend** | 1.0 | 1GB | 3-10 | SSR requires memory |
| **backend** | 2.0 | 2GB | 5-20 | Main API workload |
| **ai-worker** | 4.0 | 8GB | 2-15 | GPU optional, memory-intensive |
| **postgres** | 4.0 | 8GB | 1+2 | Primary + read replicas |
| **redis** | 1.0 | 2GB | 3 | Cluster mode |

---

## 3️⃣ Reverse Proxy Architecture

### NGINX as Edge Proxy

**Why NGINX?**
- Industry-standard reverse proxy
- Handles 10,000+ concurrent connections
- Efficient static file serving
- Built-in rate limiting
- WebSocket support
- Low memory footprint

### Request Flow

```
User Request
    ↓
[NGINX Proxy]
    ↓
┌─── Static Assets (.js, .css, images) → Serve directly (cached)
│
├─── /api/* → Backend (FastAPI)
│
├─── /_next/* → Frontend (Next.js)
│
├─── /ws/* → WebSocket connections
│
└─── /* → Frontend (Next.js SSR)
```

### Key NGINX Features Implemented

1. **SSL/TLS Termination** - Decrypt HTTPS at proxy level
2. **Rate Limiting** - Prevent abuse (10 req/sec per IP)
3. **Security Headers** - HSTS, CSP, X-Frame-Options
4. **Gzip Compression** - Reduce bandwidth by 70%
5. **Static Caching** - Cache assets for 1 year
6. **Load Balancing** - Round-robin to backend replicas
7. **Health Checks** - Remove unhealthy backends
8. **Request Buffering** - Protect against slow clients

---

## 4️⃣ Scaling Strategy

### Horizontal Scaling (Preferred)

**Add more instances of the same service**

✅ **Advantages:**
- No downtime during scaling
- Better fault tolerance
- Cost-effective (use smaller instances)
- Easy rollback

**When to scale:**
- Frontend: CPU > 70% or Response Time > 500ms
- Backend: CPU > 80% or Queue Depth > 100
- AI Workers: Queue Wait Time > 30s

### Vertical Scaling (Limited Use)

**Increase resources of existing instances**

⚠️ **Use cases:**
- Database (PostgreSQL) - Requires restart
- Redis - Memory-bound workload
- AI Workers - GPU memory requirements

### Auto-Scaling Rules

```yaml
Frontend (Next.js):
  Min Replicas: 3
  Max Replicas: 10
  Scale Up: CPU > 70% for 2 minutes
  Scale Down: CPU < 30% for 5 minutes

Backend (FastAPI):
  Min Replicas: 5
  Max Replicas: 20
  Scale Up: CPU > 80% OR Request Queue > 100
  Scale Down: CPU < 40% for 10 minutes

AI Workers:
  Min Replicas: 2
  Max Replicas: 15
  Scale Up: Job Queue > 50 OR Wait Time > 30s
  Scale Down: Job Queue < 10 for 15 minutes
```

---

## 5️⃣ Load Balancing Strategy

### Layer 7 (Application) Load Balancer

**AWS ALB / GCP Load Balancer / Azure Application Gateway**

**Features:**
- Path-based routing (`/api/*` vs `/*`)
- Host-based routing (multi-domain support)
- SSL termination
- WebSocket support
- Health checks (HTTP 200 on `/health`)
- Session affinity (sticky sessions for WebSocket)

### Load Balancing Algorithms

1. **Round Robin** (Default)
   - Distributes requests evenly
   - Best for stateless services (Backend API)

2. **Least Connections**
   - Routes to server with fewest active connections
   - Best for long-running requests (AI Workers)

3. **IP Hash** (Session Affinity)
   - Same user → Same server
   - Required for WebSocket connections

### Health Check Configuration

```yaml
Health Check:
  Path: /health
  Interval: 10 seconds
  Timeout: 5 seconds
  Healthy Threshold: 2 consecutive successes
  Unhealthy Threshold: 3 consecutive failures
  Expected Status: 200
```

---

## 6️⃣ Network Architecture

### VPC Design (Cloud)

```
VPC: 10.0.0.0/16

├── Public Subnet (10.0.1.0/24)
│   ├── Load Balancer
│   └── NAT Gateway
│
├── Private Subnet - App Tier (10.0.10.0/24)
│   ├── NGINX Proxy
│   ├── Frontend Containers
│   ├── Backend Containers
│   └── AI Worker Containers
│
└── Private Subnet - Data Tier (10.0.20.0/24)
    ├── PostgreSQL (Primary + Replicas)
    ├── Redis Cluster
    └── Backup Storage
```

### Security Groups / Firewall Rules

| Source | Destination | Port | Protocol | Purpose |
|--------|-------------|------|----------|---------|
| Internet | Load Balancer | 443 | HTTPS | User traffic |
| Load Balancer | NGINX | 80 | HTTP | Internal routing |
| NGINX | Frontend | 3000 | HTTP | Next.js app |
| NGINX | Backend | 8000 | HTTP | FastAPI |
| Backend | PostgreSQL | 5432 | TCP | Database |
| Backend | Redis | 6379 | TCP | Cache/Queue |
| AI Worker | Vector DB | 443 | HTTPS | RAG queries |
| Monitoring | All Services | 9090 | HTTP | Metrics |

---

## 7️⃣ High Availability Design

### Multi-AZ Deployment

- **Load Balancer** - Deployed across 3 availability zones
- **Application Tier** - Replicas distributed across AZs
- **Database** - Primary in AZ-1, Replica in AZ-2
- **Redis** - Cluster mode with replicas in different AZs

### Failure Scenarios

| Failure | Impact | Recovery Time | Mitigation |
|---------|--------|---------------|------------|
| Single container crash | None | < 10 seconds | Auto-restart, health checks |
| AZ outage | Degraded performance | < 1 minute | Multi-AZ deployment |
| Database primary failure | Read-only mode | < 2 minutes | Auto-failover to replica |
| Complete region failure | Full outage | 15-30 minutes | Multi-region backup (optional) |

---

## 8️⃣ Performance Optimization

### Caching Strategy

```
Request Flow with Caching:

User Request
    ↓
[CDN Cache] (CloudFlare) - Static assets (1 year TTL)
    ↓ (Cache Miss)
[NGINX Cache] - API responses (5 min TTL)
    ↓ (Cache Miss)
[Redis Cache] - Database queries (15 min TTL)
    ↓ (Cache Miss)
[PostgreSQL] - Source of truth
```

### Database Optimization

1. **Read Replicas** - Offload read queries (analytics, reports)
2. **Connection Pooling** - Reuse connections (PgBouncer)
3. **Indexing** - B-tree indexes on frequently queried columns
4. **Partitioning** - Partition large tables by tenant_id
5. **Query Optimization** - Use EXPLAIN ANALYZE

### CDN Integration

- **Static Assets** - JS, CSS, images served from CDN
- **Edge Caching** - Cache API responses at edge locations
- **DDoS Protection** - CloudFlare/AWS Shield
- **Global Distribution** - Reduce latency worldwide

---

## 9️⃣ Cost Optimization

### Resource Right-Sizing

| Environment | Frontend | Backend | AI Workers | Database | Monthly Cost (AWS) |
|-------------|----------|---------|------------|----------|-------------------|
| **Development** | 1x t3.small | 1x t3.medium | 1x t3.large | 1x db.t3.small | ~$150 |
| **Staging** | 2x t3.medium | 2x t3.large | 1x c5.xlarge | 1x db.t3.medium | ~$400 |
| **Production (10k users)** | 3x t3.large | 5x c5.xlarge | 2x g4dn.xlarge | 1x db.r5.xlarge + 2 replicas | ~$2,500 |
| **Production (100k users)** | 10x c5.xlarge | 20x c5.2xlarge | 15x g4dn.2xlarge | 1x db.r5.4xlarge + 2 replicas | ~$15,000 |

### Cost Saving Strategies

1. **Spot Instances** - Use for AI workers (70% cost savings)
2. **Reserved Instances** - 1-year commitment for databases (40% savings)
3. **Auto-Scaling** - Scale down during off-peak hours
4. **S3 Lifecycle Policies** - Move old backups to Glacier
5. **CDN Caching** - Reduce origin requests by 80%

---

## 🔟 Deployment Topology

### Production Environment

```
Region: us-east-1 (Primary)

├── Availability Zone A
│   ├── Load Balancer (Active)
│   ├── NGINX Proxy (2 instances)
│   ├── Frontend (4 instances)
│   ├── Backend (8 instances)
│   ├── AI Workers (5 instances)
│   └── PostgreSQL Primary
│
├── Availability Zone B
│   ├── Load Balancer (Active)
│   ├── NGINX Proxy (1 instance)
│   ├── Frontend (3 instances)
│   ├── Backend (7 instances)
│   ├── AI Workers (5 instances)
│   └── PostgreSQL Replica
│
└── Availability Zone C
    ├── Load Balancer (Active)
    ├── Frontend (3 instances)
    ├── Backend (5 instances)
    ├── AI Workers (5 instances)
    └── PostgreSQL Replica
```

---

## 📊 Capacity Planning

### Traffic Projections

| Metric | 10k Users | 50k Users | 100k Users |
|--------|-----------|-----------|------------|
| **Daily Active Users** | 3,000 | 15,000 | 30,000 |
| **Peak Concurrent Users** | 500 | 2,500 | 5,000 |
| **Requests/Second (Peak)** | 200 | 1,000 | 2,000 |
| **Database Queries/Sec** | 500 | 2,500 | 5,000 |
| **AI Requests/Hour** | 1,000 | 5,000 | 10,000 |
| **Storage Growth/Month** | 50 GB | 250 GB | 500 GB |

### Infrastructure Requirements

**For 50,000 Active Users:**
- **Frontend**: 6 instances (c5.xlarge)
- **Backend**: 12 instances (c5.xlarge)
- **AI Workers**: 8 instances (g4dn.xlarge with GPU)
- **PostgreSQL**: db.r5.2xlarge + 2 read replicas
- **Redis**: 3-node cluster (cache.r5.large)
- **Storage**: 500 GB SSD + 2 TB S3
- **Bandwidth**: 10 TB/month

---

## ✅ Infrastructure Checklist

- [x] Multi-AZ deployment for high availability
- [x] Auto-scaling configured for all services
- [x] Load balancer with health checks
- [x] Database read replicas for performance
- [x] Redis cluster for caching and queues
- [x] CDN for static asset delivery
- [x] Monitoring and alerting setup
- [x] Automated backups configured
- [x] Disaster recovery plan documented
- [x] Cost optimization strategies implemented

---

**Next Steps:**
1. Review [NGINX Configuration](../devops/nginx/nginx.conf)
2. Review [Security Architecture](./02-security-architecture.md)
3. Review [CI/CD Pipeline](../devops/ci-cd/github-actions.yml)
