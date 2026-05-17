# FarmTime Deployment Scripts

Automated scripts for AWS infrastructure setup and deployment.

## Scripts Overview

### 1. setup-aws-infrastructure.sh
**Purpose**: One-time setup of complete AWS infrastructure

**What it creates**:
- VPC with public and private subnets
- Internet Gateway and Route Tables
- Security Groups (ALB, Backend, RDS)
- RDS PostgreSQL database
- ECS Cluster
- CloudWatch Log Groups
- AWS Secrets Manager secrets

**Usage**:
```bash
chmod +x setup-aws-infrastructure.sh
./setup-aws-infrastructure.sh
```

**Prerequisites**:
- AWS CLI installed and configured
- Appropriate IAM permissions
- OpenSSL (for generating secrets)

**Time**: ~15-20 minutes (RDS creation takes the longest)

**Important**: Save the database password and RDS endpoint displayed at the end!

### 2. deploy-aws.sh
**Purpose**: Deploy/update the backend application to AWS ECS

**What it does**:
- Builds Docker image using Dockerfile.aws
- Logs into AWS ECR
- Creates ECR repository (if needed)
- Tags and pushes Docker image
- Updates ECS service with new image
- Waits for deployment to complete
- Displays application URL

**Usage**:
```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```

**Environment Variables** (optional):
```bash
export AWS_REGION=ap-south-1
export ECR_REPOSITORY=farmtime-backend
export ECS_CLUSTER=farmtime-cluster
export ECS_SERVICE=farmtime-backend-service
```

**Time**: ~5-10 minutes

## Quick Start Guide

### First Time Setup

1. **Install Prerequisites**
   ```bash
   # Install AWS CLI
   brew install awscli
   
   # Configure AWS credentials
   aws configure
   ```

2. **Run Infrastructure Setup**
   ```bash
   cd scripts
   chmod +x *.sh
   ./setup-aws-infrastructure.sh
   ```

3. **Create Application Load Balancer** (Manual step via AWS Console)
   - Go to EC2 → Load Balancers → Create
   - Choose Application Load Balancer
   - Use the VPC and subnets created by the script
   - Create target group for port 8080
   - Health check path: `/api/health`

4. **Create ECS Task Definition and Service** (Manual step)
   - See AWS_DEPLOYMENT_GUIDE.md for detailed steps
   - Or use the AWS Console ECS wizard

5. **Deploy Application**
   ```bash
   ./deploy-aws.sh
   ```

### Subsequent Deployments

After initial setup, deploying updates is simple:

```bash
cd scripts
./deploy-aws.sh
```

## Script Details

### setup-aws-infrastructure.sh

**Configuration Variables** (at top of script):
```bash
AWS_REGION="ap-south-1"          # Change to your preferred region
PROJECT_NAME="farmtime"
VPC_CIDR="10.0.0.0/16"
PUBLIC_SUBNET_1_CIDR="10.0.1.0/24"
PUBLIC_SUBNET_2_CIDR="10.0.2.0/24"
PRIVATE_SUBNET_1_CIDR="10.0.3.0/24"
PRIVATE_SUBNET_2_CIDR="10.0.4.0/24"
```

**Created Resources**:
```
farmtime-vpc
├── farmtime-public-subnet-1 (10.0.1.0/24)
├── farmtime-public-subnet-2 (10.0.2.0/24)
├── farmtime-private-subnet-1 (10.0.3.0/24)
├── farmtime-private-subnet-2 (10.0.4.0/24)
├── farmtime-igw (Internet Gateway)
├── farmtime-public-rt (Route Table)
├── farmtime-alb-sg (Security Group)
├── farmtime-backend-sg (Security Group)
├── farmtime-rds-sg (Security Group)
├── farmtime-db (RDS PostgreSQL)
├── farmtime-cluster (ECS Cluster)
└── /ecs/farmtime-backend (CloudWatch Log Group)
```

**Secrets Created**:
- `farmtime/db/url` - Database connection URL
- `farmtime/db/username` - Database username
- `farmtime/db/password` - Database password
- `farmtime/jwt/secret` - JWT secret key
- `farmtime/cors/origins` - CORS allowed origins

### deploy-aws.sh

**Configuration Variables**:
```bash
AWS_REGION="${AWS_REGION:-ap-south-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-farmtime-backend}"
ECS_CLUSTER="${ECS_CLUSTER:-farmtime-cluster}"
ECS_SERVICE="${ECS_SERVICE:-farmtime-backend-service}"
TASK_FAMILY="${TASK_FAMILY:-farmtime-backend}"
```

**Deployment Steps**:
1. Build Docker image from `backend/Dockerfile.aws`
2. Login to ECR
3. Create ECR repository (if not exists)
4. Tag image with `latest` and timestamp
5. Push both tags to ECR
6. Force new deployment of ECS service
7. Wait for service to stabilize
8. Display application URL

## Troubleshooting

### Issue: AWS CLI not configured
```bash
Error: Unable to locate credentials

Solution:
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region
```

### Issue: Insufficient permissions
```bash
Error: User is not authorized to perform: ecs:CreateCluster

Solution:
Ensure your IAM user has the required permissions:
- ECS Full Access
- EC2 Full Access
- RDS Full Access
- VPC Full Access
- Secrets Manager Full Access
- CloudWatch Logs Full Access
```

### Issue: RDS creation fails
```bash
Error: DBSubnetGroupDoesNotCoverEnoughAZs

Solution:
Ensure you have subnets in at least 2 availability zones
Check the AZ1 and AZ2 variables in the script
```

### Issue: Docker build fails
```bash
Error: Cannot connect to Docker daemon

Solution:
# Start Docker Desktop
open -a Docker

# Or start Docker service
sudo systemctl start docker
```

### Issue: ECR push fails
```bash
Error: denied: Your authorization token has expired

Solution:
# Re-login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  {ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com
```

### Issue: ECS service update fails
```bash
Error: Service not found

Solution:
# Verify service exists
aws ecs describe-services \
  --cluster farmtime-cluster \
  --services farmtime-backend-service

# If not found, create the service first (see AWS_DEPLOYMENT_GUIDE.md)
```

## Manual Steps Required

The scripts automate most of the setup, but these steps must be done manually:

1. **Application Load Balancer**
   - Create ALB via AWS Console
   - Create target group
   - Configure listeners

2. **ECS Task Definition**
   - Register task definition
   - Configure container settings
   - Link to secrets

3. **ECS Service**
   - Create service
   - Link to ALB target group
   - Configure network settings

4. **Domain and SSL** (Optional)
   - Register domain in Route 53
   - Create SSL certificate in ACM
   - Add HTTPS listener to ALB

See `AWS_DEPLOYMENT_GUIDE.md` for detailed instructions.

## Cost Considerations

Running these scripts will create AWS resources that incur costs:

**Estimated Monthly Costs**:
- RDS db.t3.micro: $15-20
- ECS Fargate: $15-20
- ALB: $16-20
- Data Transfer: $5-10
- CloudWatch: $1-5
- Secrets Manager: $2-3
- **Total**: ~$54-78/month

**Free Tier** (first 12 months):
- 750 hours/month of RDS db.t3.micro
- 750 hours/month of ALB
- Limited ECS Fargate usage
- 5GB CloudWatch Logs

## Cleanup

To delete all AWS resources and stop incurring costs:

```bash
# Delete ECS Service
aws ecs delete-service \
  --cluster farmtime-cluster \
  --service farmtime-backend-service \
  --force

# Delete ECS Cluster
aws ecs delete-cluster --cluster farmtime-cluster

# Delete RDS (creates final snapshot)
aws rds delete-db-instance \
  --db-instance-identifier farmtime-db \
  --final-db-snapshot-identifier farmtime-db-final-snapshot

# Delete ALB (via AWS Console)

# Delete VPC and all resources (via AWS Console)
# Or use AWS CLI to delete each resource individually
```

## Best Practices

1. **Version Control**: Keep scripts in git
2. **Backup Secrets**: Save generated passwords securely
3. **Test First**: Run in a test AWS account first
4. **Monitor Costs**: Set up AWS billing alerts
5. **Regular Updates**: Keep AWS CLI and Docker updated
6. **Security**: Never commit AWS credentials
7. **Documentation**: Update scripts when making changes

## Additional Resources

- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [AWS RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Support

For issues:
1. Check script output for error messages
2. Review AWS CloudWatch Logs
3. Consult AWS documentation
4. Check `AWS_DEPLOYMENT_GUIDE.md`
5. Review `DEPLOYMENT_COMPARISON.md`

## Contributing

To improve these scripts:
1. Test changes thoroughly
2. Update documentation
3. Follow shell script best practices
4. Add error handling
5. Keep scripts idempotent (safe to run multiple times)
