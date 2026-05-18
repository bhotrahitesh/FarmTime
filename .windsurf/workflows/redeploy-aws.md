---
description: Redeploy FarmTime app to AWS after pulling latest Git updates
---

# Redeploy FarmTime to AWS EC2

Follow these steps to redeploy your FarmTime application to AWS EC2 after pulling the latest updates from Git.

## Prerequisites
- SSH access to AWS EC2 instance
- Docker and Docker Compose installed on EC2
- Git repository access

## Steps

### 1. SSH into AWS EC2 Instance
```bash
# Replace with your EC2 instance details
ssh -i ~/.ssh/your-key.pem ubuntu@13.127.116.232
# OR if you have SSH config set up:
ssh your-ec2-alias
```

### 2. Navigate to Project Directory
```bash
cd /path/to/FarmTime
# Or wherever your project is located on EC2
```

### 3. Pull Latest Changes from Git
// turbo
```bash
git pull origin main
```

### 4. Check for Database Migrations
Review if there are any new migration files:
```bash
ls -la backend/src/main/resources/db/migration/
```

### 5. Stop Current Container
// turbo
```bash
docker compose -f docker-compose.aws.yml down
```

### 6. Rebuild and Deploy with Latest Code
// turbo
```bash
docker compose -f docker-compose.aws.yml up -d --build
```

This command will:
- Build the Docker image from latest code using `Dockerfile.aws`
- Start the container in detached mode
- Connect to PostgreSQL on localhost (network_mode: host)
- Apply database migrations automatically (Flyway)

### 7. Monitor Deployment
Check container status and logs:
```bash
# Check if container is running
docker ps | grep farmtime-backend-aws

# View logs (follow mode)
docker logs -f farmtime-backend-aws

# View last 100 lines
docker logs --tail 100 farmtime-backend-aws
```

### 8. Verify Deployment
Test the health endpoint:
```bash
# Test health endpoint
curl http://localhost:8080/api/health

# Test from your local machine (replace with EC2 IP)
curl http://13.127.116.232:8080/api/health

# Test API endpoint
curl http://13.127.116.232:8080/api/employees
```

### 9. Update Mobile App (if needed)
If you made backend API changes, ensure the mobile app points to the correct URL:
- Backend URL should be: `http://13.127.116.232:8080`

## Alternative: Deploy from Local Machine

If you want to deploy without SSH-ing into EC2:

```bash
# 1. Pull latest code locally
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime
git pull origin main

# 2. SSH and deploy in one command
ssh your-ec2-alias "cd /path/to/FarmTime && git pull origin main && docker compose -f docker-compose.aws.yml up -d --build"
```

## Troubleshooting

### If deployment fails:

**Check container logs:**
```bash
docker logs farmtime-backend-aws
```

**Check if container is running:**
```bash
docker ps -a | grep farmtime
```

**Check PostgreSQL connection:**
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U admin -d farmtime_db
```

**Common issues:**
1. Database connection failure - Check PostgreSQL is running
2. Port 8080 already in use - Stop old container first
3. Build failures - Check Docker has enough disk space
4. Migration errors - Check migration files are valid

### Rollback to Previous Version

```bash
# 1. Check out previous commit
git log --oneline -n 5
git checkout <previous-commit-hash>

# 2. Rebuild and deploy
docker compose -f docker-compose.aws.yml up -d --build

# 3. Return to main branch when ready
git checkout main
```

### View Container Resource Usage

```bash
# Check CPU and memory usage
docker stats farmtime-backend-aws

# Check disk usage
docker system df
```

### Clean Up Old Images

```bash
# Remove unused images to free space
docker image prune -a

# Remove stopped containers
docker container prune
```

## Quick Commands Reference

```bash
# SSH to EC2
ssh your-ec2-alias

# Pull latest code
git pull origin main

# Redeploy (stop, rebuild, start)
docker compose -f docker-compose.aws.yml down && \
docker compose -f docker-compose.aws.yml up -d --build

# View logs
docker logs -f farmtime-backend-aws

# Check health
curl http://localhost:8080/api/health
```

## One-Line Deployment Command

```bash
# Complete deployment in one command (run on EC2)
cd /path/to/FarmTime && \
git pull origin main && \
docker compose -f docker-compose.aws.yml down && \
docker compose -f docker-compose.aws.yml up -d --build && \
docker logs -f farmtime-backend-aws
```

## Notes
- Deployment typically takes 2-3 minutes
- Database migrations run automatically on startup (Flyway)
- Container restarts automatically if it crashes (restart: unless-stopped)
- Backend runs on port 8080
- Uses host network mode to connect to PostgreSQL on localhost
- Health check runs every 30 seconds
