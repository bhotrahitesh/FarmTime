#!/bin/bash

# FarmTime AWS Deployment Script
# This script helps deploy the FarmTime backend to AWS ECS with RDS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-ap-south-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-farmtime-backend}"
ECS_CLUSTER="${ECS_CLUSTER:-farmtime-cluster}"
ECS_SERVICE="${ECS_SERVICE:-farmtime-backend-service}"
TASK_FAMILY="${TASK_FAMILY:-farmtime-backend}"

echo -e "${GREEN}FarmTime AWS Deployment Script${NC}"
echo "================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"

# ECR Repository URL
ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

echo -e "\n${YELLOW}Step 1: Building Docker image...${NC}"
cd ../backend
docker build -f Dockerfile.aws -t ${ECR_REPOSITORY}:latest .

echo -e "\n${YELLOW}Step 2: Logging into AWS ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URL}

echo -e "\n${YELLOW}Step 3: Creating ECR repository (if not exists)...${NC}"
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} 2>/dev/null || \
    aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${AWS_REGION}

echo -e "\n${YELLOW}Step 4: Tagging Docker image...${NC}"
docker tag ${ECR_REPOSITORY}:latest ${ECR_URL}:latest
docker tag ${ECR_REPOSITORY}:latest ${ECR_URL}:$(date +%Y%m%d-%H%M%S)

echo -e "\n${YELLOW}Step 5: Pushing Docker image to ECR...${NC}"
docker push ${ECR_URL}:latest
docker push ${ECR_URL}:$(date +%Y%m%d-%H%M%S)

echo -e "\n${YELLOW}Step 6: Updating ECS service...${NC}"
aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --force-new-deployment \
    --region ${AWS_REGION}

echo -e "\n${GREEN}Deployment initiated successfully!${NC}"
echo -e "${YELLOW}Monitoring deployment status...${NC}"

# Wait for service to stabilize
aws ecs wait services-stable \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE} \
    --region ${AWS_REGION}

echo -e "\n${GREEN}Deployment completed successfully!${NC}"

# Get the load balancer URL
ALB_ARN=$(aws ecs describe-services \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE} \
    --region ${AWS_REGION} \
    --query 'services[0].loadBalancers[0].targetGroupArn' \
    --output text)

if [ "$ALB_ARN" != "None" ]; then
    ALB_NAME=$(aws elbv2 describe-target-groups \
        --target-group-arns ${ALB_ARN} \
        --region ${AWS_REGION} \
        --query 'TargetGroups[0].LoadBalancerArns[0]' \
        --output text)
    
    ALB_DNS=$(aws elbv2 describe-load-balancers \
        --load-balancer-arns ${ALB_NAME} \
        --region ${AWS_REGION} \
        --query 'LoadBalancers[0].DNSName' \
        --output text)
    
    echo -e "\n${GREEN}Application URL: http://${ALB_DNS}${NC}"
    echo -e "${GREEN}Health Check: http://${ALB_DNS}/api/health${NC}"
fi

echo -e "\n${GREEN}Done!${NC}"
