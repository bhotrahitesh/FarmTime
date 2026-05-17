# FarmTime AWS Deployment Guide

Complete guide for deploying FarmTime backend to AWS with RDS PostgreSQL database.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Architecture](#architecture)
- [Deployment Options](#deployment-options)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Switching Between Deployments](#switching-between-deployments)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Cost Estimation](#cost-estimation)
- [Troubleshooting](#troubleshooting)

## Overview

This deployment uses:
- **AWS ECS Fargate** for containerized backend hosting
- **AWS RDS PostgreSQL** for managed database
- **Application Load Balancer** for traffic distribution
- **AWS Secrets Manager** for secure credential storage
- **CloudWatch** for logging and monitoring

## Prerequisites

### Required Tools
```bash
# AWS CLI
brew install awscli
aws configure

# Docker
brew install docker

# Optional: AWS CDK (for infrastructure as code)
npm install -g aws-cdk
```

### AWS Account Requirements
- Active AWS account
- IAM user with appropriate permissions
- AWS CLI configured with credentials

### Required Permissions
Your IAM user needs permissions for:
- ECS (Elastic Container Service)
- ECR (Elastic Container Registry)
- RDS (Relational Database Service)
- VPC (Virtual Private Cloud)
- EC2 (for security groups, subnets)
- Secrets Manager
- CloudWatch Logs
- Application Load Balancer

## Architecture

```
Internet
    ↓
Application Load Balancer (ALB)
    ↓
ECS Fargate Tasks (Backend)
    ↓
RDS PostgreSQL Database
```

### Network Architecture
- **VPC**: 10.0.0.0/16
- **Public Subnets**: 10.0.1.0/24, 10.0.2.0/24 (for ALB)
- **Private Subnets**: 10.0.3.0/24, 10.0.4.0/24 (for RDS)
- **ECS Tasks**: Run in public subnets with public IP (or private with NAT Gateway)

## Deployment Options

### Option 1: Automated Setup (Recommended for First Time)
Use the provided scripts for complete infrastructure setup.

### Option 2: Manual Setup via AWS Console
Step-by-step manual configuration through AWS Console.

### Option 3: Infrastructure as Code (Advanced)
Use AWS CDK or Terraform for reproducible deployments.

## Quick Start

### 1. Automated Infrastructure Setup

```bash
# Navigate to scripts directory
cd scripts

# Make scripts executable
chmod +x setup-aws-infrastructure.sh deploy-aws.sh

# Run infrastructure setup
./setup-aws-infrastructure.sh
```

This script will create:
- VPC and networking components
- Security groups
- RDS PostgreSQL database
- ECS cluster
- CloudWatch log groups
- Secrets Manager secrets

**Important**: Save the database password and RDS endpoint shown at the end!

### 2. Create Application Load Balancer

The ALB needs to be created manually or via AWS Console:

```bash
# Via AWS Console:
# 1. Go to EC2 → Load Balancers → Create Load Balancer
# 2. Choose Application Load Balancer
# 3. Name: farmtime-alb
# 4. Scheme: Internet-facing
# 5. Select the VPC and public subnets created above
# 6. Select the ALB security group
# 7. Create target group:
#    - Name: farmtime-backend-tg
#    - Target type: IP
#    - Protocol: HTTP, Port: 8080
#    - Health check path: /api/health
# 8. Complete the creation
```

### 3. Create ECS Task Definition

Create a file `task-definition.json`:

```json
{
  "family": "farmtime-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::{ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "farmtime-backend",
      "image": "{ACCOUNT_ID}.dkr.ecr.{REGION}.amazonaws.com/farmtime-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "aws"
        },
        {
          "name": "JWT_EXPIRATION",
          "value": "86400000"
        }
      ],
      "secrets": [
        {
          "name": "SPRING_DATASOURCE_URL",
          "valueFrom": "arn:aws:secretsmanager:{REGION}:{ACCOUNT_ID}:secret:farmtime/db/url"
        },
        {
          "name": "SPRING_DATASOURCE_USERNAME",
          "valueFrom": "arn:aws:secretsmanager:{REGION}:{ACCOUNT_ID}:secret:farmtime/db/username"
        },
        {
          "name": "SPRING_DATASOURCE_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:{REGION}:{ACCOUNT_ID}:secret:farmtime/db/password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:{REGION}:{ACCOUNT_ID}:secret:farmtime/jwt/secret"
        },
        {
          "name": "CORS_ALLOWED_ORIGINS",
          "valueFrom": "arn:aws:secretsmanager:{REGION}:{ACCOUNT_ID}:secret:farmtime/cors/origins"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/farmtime-backend",
          "awslogs-region": "{REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register the task definition:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### 4. Create ECS Service

```bash
aws ecs create-service \
  --cluster farmtime-cluster \
  --service-name farmtime-backend-service \
  --task-definition farmtime-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/farmtime-backend-tg/xxx,containerName=farmtime-backend,containerPort=8080" \
  --health-check-grace-period-seconds 60
```

### 5. Deploy Application

```bash
# Set environment variables
export AWS_REGION=ap-south-1
export ECR_REPOSITORY=farmtime-backend
export ECS_CLUSTER=farmtime-cluster
export ECS_SERVICE=farmtime-backend-service

# Run deployment script
./deploy-aws.sh
```

## Detailed Setup

### Step 1: Create VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create Internet Gateway
aws ec2 create-internet-gateway

# Attach IGW to VPC
aws ec2 attach-internet-gateway --vpc-id vpc-xxx --internet-gateway-id igw-xxx

# Create Subnets (repeat for each subnet)
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24 --availability-zone ap-south-1a
```

### Step 2: Create Security Groups

```bash
# ALB Security Group
aws ec2 create-security-group \
  --group-name farmtime-alb-sg \
  --description "Security group for FarmTime ALB" \
  --vpc-id vpc-xxx

# Add ingress rules
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0
```

### Step 3: Create RDS Database

```bash
# Create DB Subnet Group
aws rds create-db-subnet-group \
  --db-subnet-group-name farmtime-db-subnet-group \
  --db-subnet-group-description "Subnet group for FarmTime RDS" \
  --subnet-ids subnet-xxx subnet-yyy

# Create RDS Instance
aws rds create-db-instance \
  --db-instance-identifier farmtime-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username farmtime_admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxx \
  --db-subnet-group-name farmtime-db-subnet-group \
  --db-name farmtime_db \
  --backup-retention-period 7 \
  --no-publicly-accessible
```

### Step 4: Store Secrets

```bash
# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier farmtime-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# Create secrets
aws secretsmanager create-secret \
  --name farmtime/db/url \
  --secret-string "jdbc:postgresql://${RDS_ENDPOINT}:5432/farmtime_db"

aws secretsmanager create-secret \
  --name farmtime/db/username \
  --secret-string "farmtime_admin"

aws secretsmanager create-secret \
  --name farmtime/db/password \
  --secret-string "YOUR_SECURE_PASSWORD"

# Generate and store JWT secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
aws secretsmanager create-secret \
  --name farmtime/jwt/secret \
  --secret-string "${JWT_SECRET}"

aws secretsmanager create-secret \
  --name farmtime/cors/origins \
  --secret-string "https://yourdomain.com"
```

## Switching Between Deployments

### Current Deployment: Render + Neon DB
Your existing `render.yaml` configuration remains unchanged and can be used anytime.

```bash
# Deploy to Render (existing setup)
git push origin main
# Render auto-deploys from main branch
```

### New Deployment: AWS ECS + RDS

```bash
# Deploy to AWS
cd scripts
./deploy-aws.sh
```

### Configuration Files

| File | Purpose | Deployment |
|------|---------|------------|
| `render.yaml` | Render deployment config | Render + Neon |
| `aws-deploy.yml` | AWS infrastructure config | AWS ECS + RDS |
| `docker-compose.aws.yml` | Local AWS testing | Local development |
| `backend/Dockerfile` | Original Dockerfile | Render |
| `backend/Dockerfile.aws` | AWS-optimized Dockerfile | AWS ECS |
| `application.properties` | Default/local config | Local |
| `application-neon.properties` | Neon DB config | Render |
| `application-aws.properties` | AWS RDS config | AWS |

### Environment Variables by Deployment

**Render (Neon DB)**:
```bash
SPRING_PROFILES_ACTIVE=neon
SPRING_DATASOURCE_URL=<neon-db-url>
```

**AWS (RDS)**:
```bash
SPRING_PROFILES_ACTIVE=aws
SPRING_DATASOURCE_URL=jdbc:postgresql://<rds-endpoint>:5432/farmtime_db
```

## Monitoring and Maintenance

### View Logs

```bash
# CloudWatch Logs
aws logs tail /ecs/farmtime-backend --follow

# ECS Service Events
aws ecs describe-services \
  --cluster farmtime-cluster \
  --services farmtime-backend-service \
  --query 'services[0].events'
```

### Check Health

```bash
# Get ALB DNS
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names farmtime-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

# Test health endpoint
curl http://${ALB_DNS}/api/health
```

### Database Backup

RDS automatically creates daily backups (retention: 7 days).

Manual snapshot:
```bash
aws rds create-db-snapshot \
  --db-instance-identifier farmtime-db \
  --db-snapshot-identifier farmtime-db-snapshot-$(date +%Y%m%d)
```

### Update Application

```bash
# Make code changes, then:
cd scripts
./deploy-aws.sh
```

### Scale Service

```bash
# Scale to 2 tasks
aws ecs update-service \
  --cluster farmtime-cluster \
  --service farmtime-backend-service \
  --desired-count 2
```

## Cost Estimation

### Monthly Costs (Approximate)

| Service | Configuration | Monthly Cost (USD) |
|---------|--------------|-------------------|
| RDS PostgreSQL | db.t3.micro, 20GB | $15-20 |
| ECS Fargate | 0.5 vCPU, 1GB RAM | $15-20 |
| Application Load Balancer | Standard | $16-20 |
| Data Transfer | ~10GB/month | $5-10 |
| CloudWatch Logs | 1GB/month | $1-5 |
| Secrets Manager | 5 secrets | $2-3 |
| **Total** | | **$54-78** |

### Cost Optimization Tips

1. **Use RDS Reserved Instances** - Save up to 40% with 1-year commitment
2. **Enable RDS Auto-Scaling** - Scale storage only when needed
3. **Use CloudWatch Logs Retention** - Set to 7 days instead of indefinite
4. **Schedule ECS Tasks** - Scale down during off-hours
5. **Use AWS Free Tier** - First 12 months include free tier benefits

### Free Tier Eligible (First 12 Months)
- RDS: 750 hours/month of db.t3.micro
- ECS: First 500,000 GB-seconds free
- ALB: 750 hours/month
- CloudWatch: 10 custom metrics, 5GB logs

## Troubleshooting

### Issue: Task Fails to Start

**Check logs**:
```bash
aws logs tail /ecs/farmtime-backend --follow
```

**Common causes**:
- Database connection failure
- Missing secrets
- Insufficient memory/CPU
- Security group misconfiguration

### Issue: Database Connection Timeout

**Verify**:
1. Security group allows traffic from backend SG to RDS SG on port 5432
2. RDS is in the same VPC
3. Database endpoint is correct in Secrets Manager

```bash
# Test from ECS task
aws ecs execute-command \
  --cluster farmtime-cluster \
  --task <task-id> \
  --container farmtime-backend \
  --interactive \
  --command "/bin/sh"

# Inside container:
nc -zv <rds-endpoint> 5432
```

### Issue: Health Check Failing

**Check**:
1. Application is listening on port 8080
2. Health endpoint `/api/health` returns 200
3. Security group allows traffic on port 8080

```bash
# View target health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>
```

### Issue: High Costs

**Analyze**:
```bash
# Check RDS metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=farmtime-db \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

**Optimize**:
- Review CloudWatch metrics
- Reduce task count during off-hours
- Optimize database queries
- Enable RDS Performance Insights

### Issue: Cannot Access Application

**Verify**:
1. ALB is internet-facing
2. ALB security group allows inbound traffic on port 80/443
3. Target group has healthy targets
4. DNS is resolving correctly

```bash
# Check ALB status
aws elbv2 describe-load-balancers --names farmtime-alb

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>
```

## Rollback to Render/Neon

If you need to rollback to Render deployment:

1. **No changes needed** - Your Render deployment continues to work
2. **Update mobile app** - Point to Render URL
3. **Stop AWS resources** (to avoid costs):

```bash
# Stop ECS service
aws ecs update-service \
  --cluster farmtime-cluster \
  --service farmtime-backend-service \
  --desired-count 0

# Optional: Delete RDS (creates final snapshot)
aws rds delete-db-instance \
  --db-instance-identifier farmtime-db \
  --final-db-snapshot-identifier farmtime-db-final-snapshot
```

## Next Steps

1. **Set up Custom Domain**
   - Register domain in Route 53
   - Create SSL certificate in ACM
   - Add HTTPS listener to ALB

2. **Enable Auto-Scaling**
   - Configure ECS service auto-scaling
   - Set up CloudWatch alarms

3. **Implement CI/CD**
   - Use GitHub Actions or AWS CodePipeline
   - Automate deployments

4. **Enhanced Monitoring**
   - Set up CloudWatch dashboards
   - Configure SNS alerts
   - Enable X-Ray tracing

5. **Security Hardening**
   - Enable AWS WAF
   - Implement rate limiting
   - Regular security audits

## Support

For issues or questions:
- Check CloudWatch Logs: `/ecs/farmtime-backend`
- Review ECS service events
- Consult AWS documentation
- Contact AWS Support (if you have a support plan)

## Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
