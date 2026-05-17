# FarmTime Deployment Architecture

Visual guide to understand both deployment options.

## Architecture Comparison

### Option 1: Render + Neon DB (Current/Free)

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Render Platform                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │  FarmTime Backend Container                        │     │
│  │  - Spring Boot Application                         │     │
│  │  - Port: 8080                                      │     │
│  │  - Profile: neon                                   │     │
│  │  - Auto-deploy from Git                            │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ PostgreSQL Connection
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Neon Database                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  PostgreSQL 15                                     │     │
│  │  - Database: farmtime_db                           │     │
│  │  - Serverless                                      │     │
│  │  - Auto-pause when idle                            │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘

Configuration:
- render.yaml
- backend/Dockerfile
- application-neon.properties
```

### Option 2: AWS ECS + RDS (New/Production)

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Application Load Balancer (ALB)                 │
│  - Health Check: /api/health                                │
│  - Port 80 (HTTP) / 443 (HTTPS)                             │
│  - Target Group: farmtime-backend-tg                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Port 8080
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS VPC (10.0.0.0/16)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Public Subnets (10.0.1.0/24, 10.0.2.0/24)  │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │    ECS Fargate Tasks (Auto-scaling 1-4)      │  │    │
│  │  │                                              │  │    │
│  │  │  ┌────────────────────────────────────────┐ │  │    │
│  │  │  │  FarmTime Backend Container            │ │  │    │
│  │  │  │  - Spring Boot Application             │ │  │    │
│  │  │  │  - Port: 8080                          │ │  │    │
│  │  │  │  - Profile: aws                        │ │  │    │
│  │  │  │  - CPU: 0.5 vCPU, RAM: 1GB            │ │  │    │
│  │  │  └────────────────────────────────────────┘ │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│                            │                                 │
│                            │ PostgreSQL (Port 5432)          │
│                            ▼                                 │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │       Private Subnets (10.0.3.0/24, 10.0.4.0/24)   │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │    RDS PostgreSQL (Multi-AZ Optional)        │  │    │
│  │  │                                              │  │    │
│  │  │  - Instance: db.t3.micro                    │  │    │
│  │  │  - Engine: PostgreSQL 15.4                  │  │    │
│  │  │  - Storage: 20GB (Auto-scaling)             │  │    │
│  │  │  - Backup: 7 days retention                 │  │    │
│  │  │  - Encrypted at rest                        │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Secrets
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  AWS Secrets Manager                         │
│  - farmtime/db/url                                          │
│  - farmtime/db/username                                     │
│  - farmtime/db/password                                     │
│  - farmtime/jwt/secret                                      │
│  - farmtime/cors/origins                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  CloudWatch Logs                             │
│  - Log Group: /ecs/farmtime-backend                         │
│  - Retention: 7 days                                        │
│  - Metrics & Alarms                                         │
└─────────────────────────────────────────────────────────────┘

Configuration:
- aws-deploy.yml
- backend/Dockerfile.aws
- application-aws.properties
- scripts/setup-aws-infrastructure.sh
- scripts/deploy-aws.sh
```

## Security Architecture

### Render + Neon DB

```
Security Layer 1: HTTPS (Render)
    ↓
Security Layer 2: Environment Variables (Render Dashboard)
    ↓
Security Layer 3: SSL Connection to Neon DB
```

### AWS ECS + RDS

```
Security Layer 1: ALB (Internet-facing)
    ↓
Security Layer 2: Security Group (ALB → Backend)
    ↓
Security Layer 3: VPC Isolation
    ↓
Security Layer 4: Security Group (Backend → RDS)
    ↓
Security Layer 5: Private Subnet (RDS)
    ↓
Security Layer 6: Secrets Manager (Credentials)
    ↓
Security Layer 7: Encrypted Storage (RDS)
    ↓
Security Layer 8: IAM Roles (Access Control)
```

## Network Flow

### Render Deployment

```
Mobile App
    │
    │ HTTPS Request
    ▼
Render Backend (farmtime-backend.onrender.com)
    │
    │ PostgreSQL Protocol
    ▼
Neon Database (neon.tech)
    │
    │ Response
    ▼
Mobile App
```

### AWS Deployment

```
Mobile App
    │
    │ HTTP/HTTPS Request
    ▼
Route 53 (Optional - Custom Domain)
    │
    ▼
Application Load Balancer (farmtime-alb-xxx.elb.amazonaws.com)
    │
    │ Health Check: /api/health
    │ Load Balance
    ▼
ECS Fargate Tasks (Multiple instances)
    │
    │ PostgreSQL Connection
    │ (via Security Group)
    ▼
RDS PostgreSQL (farmtime-db.xxx.rds.amazonaws.com)
    │
    │ Response
    ▼
Mobile App
```

## Data Flow

### User Authentication Flow

```
Mobile App
    │
    │ POST /api/auth/login
    ▼
Backend (Render or AWS)
    │
    │ Query User
    ▼
Database (Neon or RDS)
    │
    │ User Data
    ▼
Backend
    │
    │ Generate JWT (using JWT_SECRET)
    ▼
Mobile App
    │
    │ Store JWT Token
    │
    │ Subsequent Requests (with JWT Header)
    ▼
Backend
    │
    │ Validate JWT
    ▼
Protected Resources
```

### Attendance Recording Flow

```
Mobile App
    │
    │ POST /api/attendance (with JWT)
    ▼
Backend
    │
    │ Validate JWT
    │ Extract User Info
    ▼
Business Logic
    │
    │ Calculate Hours
    │ Apply IST Timezone
    ▼
Database
    │
    │ INSERT attendance record
    ▼
Response to Mobile App
```

## Deployment Flow

### Render Deployment

```
Developer
    │
    │ git commit & push
    ▼
GitHub Repository
    │
    │ Webhook
    ▼
Render Platform
    │
    │ Auto-detect Dockerfile
    │ Build Image
    │ Deploy Container
    ▼
Live Application
```

### AWS Deployment

```
Developer
    │
    │ Code Changes
    ▼
Run deploy-aws.sh
    │
    ├─→ Build Docker Image (Dockerfile.aws)
    │
    ├─→ Login to ECR
    │
    ├─→ Tag Image (latest + timestamp)
    │
    ├─→ Push to ECR
    │
    ├─→ Update ECS Service
    │
    └─→ Wait for Deployment
        │
        ▼
    ECS Pulls New Image
        │
        ▼
    Rolling Update (Zero Downtime)
        │
        ├─→ Start New Task
        │
        ├─→ Health Check
        │
        ├─→ Add to Load Balancer
        │
        └─→ Terminate Old Task
            │
            ▼
        Live Application
```

## Monitoring & Logging

### Render

```
Application Logs
    │
    ▼
Render Dashboard
    │
    ├─→ View Logs
    ├─→ Metrics (Basic)
    └─→ Health Status
```

### AWS

```
Application Logs
    │
    ▼
CloudWatch Logs
    │
    ├─→ Log Groups
    ├─→ Log Streams
    ├─→ Log Insights (Query)
    └─→ Export to S3

Metrics
    │
    ▼
CloudWatch Metrics
    │
    ├─→ CPU Utilization
    ├─→ Memory Utilization
    ├─→ Request Count
    ├─→ Response Time
    └─→ Database Connections

Alarms
    │
    ▼
SNS Notifications
    │
    ├─→ Email
    ├─→ SMS
    └─→ Slack (via Lambda)
```

## Scaling Strategy

### Render (Limited)

```
Single Instance
    │
    ├─→ Vertical Scaling (Upgrade Plan)
    └─→ No Horizontal Scaling
```

### AWS (Flexible)

```
Auto Scaling
    │
    ├─→ CPU > 70% → Scale Out (Add Tasks)
    │
    ├─→ CPU < 30% → Scale In (Remove Tasks)
    │
    ├─→ Min Tasks: 1
    │
    └─→ Max Tasks: 4 (Configurable)

Database Scaling
    │
    ├─→ Vertical: Upgrade Instance Class
    │
    ├─→ Storage: Auto-scaling
    │
    └─→ Read Replicas (Optional)
```

## Disaster Recovery

### Render + Neon

```
Backup Strategy:
├─→ Neon: Automatic backups (7 days)
├─→ Manual: pg_dump exports
└─→ Recovery: Restore from Neon backup

RTO (Recovery Time Objective): ~30 minutes
RPO (Recovery Point Objective): ~24 hours
```

### AWS

```
Backup Strategy:
├─→ RDS: Automated daily backups (7 days)
├─→ RDS: Manual snapshots (indefinite)
├─→ Point-in-time recovery (5 minutes)
└─→ Cross-region replication (Optional)

Disaster Recovery:
├─→ Multi-AZ Deployment (Automatic Failover)
├─→ Snapshot Restore
└─→ Cross-region DR (Advanced)

RTO (Recovery Time Objective): ~5-10 minutes
RPO (Recovery Point Objective): ~5 minutes
```

## Cost Breakdown

### Render + Neon DB (Free Tier)

```
Monthly Cost: $0
    │
    ├─→ Backend: Free (with limitations)
    ├─→ Database: Free (3GB, auto-pause)
    └─→ Bandwidth: Free (100GB)

Limitations:
    ├─→ Sleeps after 15 min inactivity
    ├─→ 512MB RAM
    ├─→ Shared CPU
    └─→ Limited concurrent connections
```

### AWS ECS + RDS

```
Monthly Cost: ~$54-78
    │
    ├─→ RDS db.t3.micro: $15-20
    │   ├─→ Instance: $12
    │   ├─→ Storage (20GB): $2
    │   └─→ Backup: $1
    │
    ├─→ ECS Fargate: $15-20
    │   ├─→ vCPU (0.5): $7
    │   └─→ Memory (1GB): $8
    │
    ├─→ ALB: $16-20
    │   ├─→ Hours: $16
    │   └─→ LCU: $2-4
    │
    ├─→ Data Transfer: $5-10
    │
    ├─→ CloudWatch: $1-5
    │
    └─→ Secrets Manager: $2-3

Benefits:
    ├─→ Always on (no sleep)
    ├─→ Better performance
    ├─→ Scalable
    └─→ Production SLA
```

## File Structure

```
FarmTime/
│
├── Deployment Configs
│   ├── render.yaml                    # Render deployment
│   ├── aws-deploy.yml                 # AWS infrastructure
│   └── docker-compose.aws.yml         # Local AWS testing
│
├── Docker Files
│   ├── backend/Dockerfile             # Render
│   └── backend/Dockerfile.aws         # AWS (optimized)
│
├── Application Configs
│   ├── application.properties         # Default/Local
│   ├── application-neon.properties    # Render (gitignored)
│   └── application-aws.properties     # AWS
│
├── Deployment Scripts
│   ├── scripts/setup-aws-infrastructure.sh
│   └── scripts/deploy-aws.sh
│
└── Documentation
    ├── AWS_DEPLOYMENT_GUIDE.md        # Complete AWS guide
    ├── AWS_SETUP_SUMMARY.md           # Quick summary
    ├── DEPLOYMENT_COMPARISON.md       # Render vs AWS
    ├── DEPLOYMENT_ARCHITECTURE.md     # This file
    ├── RENDER_DEPLOYMENT.md           # Render guide
    └── scripts/README.md              # Scripts docs
```

## Quick Reference

### Render Deployment
```bash
# Deploy
git push origin main

# View logs
# Via Render Dashboard

# Database
# Via Neon Console
```

### AWS Deployment
```bash
# One-time setup
cd scripts
./setup-aws-infrastructure.sh

# Deploy/Update
./deploy-aws.sh

# View logs
aws logs tail /ecs/farmtime-backend --follow

# Database
# Via AWS RDS Console
```

## Summary

Both architectures are production-ready and fully configured:

**Render + Neon DB**
- ✅ Simple, free, perfect for development
- ✅ Auto-deploy from Git
- ✅ Minimal maintenance

**AWS ECS + RDS**
- ✅ Enterprise-grade, scalable
- ✅ Full control and monitoring
- ✅ High availability

Choose based on your current needs, and switch anytime without code changes!
