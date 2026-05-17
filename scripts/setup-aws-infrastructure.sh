#!/bin/bash

# FarmTime AWS Infrastructure Setup Script
# This script sets up the complete AWS infrastructure for FarmTime

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-ap-south-1}"
PROJECT_NAME="farmtime"
VPC_CIDR="10.0.0.0/16"
PUBLIC_SUBNET_1_CIDR="10.0.1.0/24"
PUBLIC_SUBNET_2_CIDR="10.0.2.0/24"
PRIVATE_SUBNET_1_CIDR="10.0.3.0/24"
PRIVATE_SUBNET_2_CIDR="10.0.4.0/24"

echo -e "${GREEN}FarmTime AWS Infrastructure Setup${NC}"
echo "=================================="
echo -e "${YELLOW}This script will create:${NC}"
echo "  - VPC and Subnets"
echo "  - Security Groups"
echo "  - RDS PostgreSQL Database"
echo "  - ECS Cluster"
echo "  - Application Load Balancer"
echo "  - CloudWatch Log Groups"
echo "  - Secrets Manager secrets"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 1: Creating VPC...${NC}"
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block ${VPC_CIDR} \
    --region ${AWS_REGION} \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=${PROJECT_NAME}-vpc}]" \
    --query 'Vpc.VpcId' \
    --output text)
echo -e "${GREEN}VPC created: ${VPC_ID}${NC}"

# Enable DNS hostnames
aws ec2 modify-vpc-attribute \
    --vpc-id ${VPC_ID} \
    --enable-dns-hostnames \
    --region ${AWS_REGION}

echo -e "\n${BLUE}Step 2: Creating Internet Gateway...${NC}"
IGW_ID=$(aws ec2 create-internet-gateway \
    --region ${AWS_REGION} \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=${PROJECT_NAME}-igw}]" \
    --query 'InternetGateway.InternetGatewayId' \
    --output text)
echo -e "${GREEN}Internet Gateway created: ${IGW_ID}${NC}"

# Attach IGW to VPC
aws ec2 attach-internet-gateway \
    --vpc-id ${VPC_ID} \
    --internet-gateway-id ${IGW_ID} \
    --region ${AWS_REGION}

echo -e "\n${BLUE}Step 3: Creating Subnets...${NC}"

# Get availability zones
AZ1=$(aws ec2 describe-availability-zones --region ${AWS_REGION} --query 'AvailabilityZones[0].ZoneName' --output text)
AZ2=$(aws ec2 describe-availability-zones --region ${AWS_REGION} --query 'AvailabilityZones[1].ZoneName' --output text)

# Public Subnet 1
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id ${VPC_ID} \
    --cidr-block ${PUBLIC_SUBNET_1_CIDR} \
    --availability-zone ${AZ1} \
    --region ${AWS_REGION} \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-subnet-1}]" \
    --query 'Subnet.SubnetId' \
    --output text)
echo -e "${GREEN}Public Subnet 1 created: ${PUBLIC_SUBNET_1}${NC}"

# Public Subnet 2
PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id ${VPC_ID} \
    --cidr-block ${PUBLIC_SUBNET_2_CIDR} \
    --availability-zone ${AZ2} \
    --region ${AWS_REGION} \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-subnet-2}]" \
    --query 'Subnet.SubnetId' \
    --output text)
echo -e "${GREEN}Public Subnet 2 created: ${PUBLIC_SUBNET_2}${NC}"

# Private Subnet 1
PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id ${VPC_ID} \
    --cidr-block ${PRIVATE_SUBNET_1_CIDR} \
    --availability-zone ${AZ1} \
    --region ${AWS_REGION} \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-subnet-1}]" \
    --query 'Subnet.SubnetId' \
    --output text)
echo -e "${GREEN}Private Subnet 1 created: ${PRIVATE_SUBNET_1}${NC}"

# Private Subnet 2
PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id ${VPC_ID} \
    --cidr-block ${PRIVATE_SUBNET_2_CIDR} \
    --availability-zone ${AZ2} \
    --region ${AWS_REGION} \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-subnet-2}]" \
    --query 'Subnet.SubnetId' \
    --output text)
echo -e "${GREEN}Private Subnet 2 created: ${PRIVATE_SUBNET_2}${NC}"

echo -e "\n${BLUE}Step 4: Creating Route Tables...${NC}"

# Public Route Table
PUBLIC_RT=$(aws ec2 create-route-table \
    --vpc-id ${VPC_ID} \
    --region ${AWS_REGION} \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-rt}]" \
    --query 'RouteTable.RouteTableId' \
    --output text)
echo -e "${GREEN}Public Route Table created: ${PUBLIC_RT}${NC}"

# Add route to Internet Gateway
aws ec2 create-route \
    --route-table-id ${PUBLIC_RT} \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id ${IGW_ID} \
    --region ${AWS_REGION}

# Associate public subnets with public route table
aws ec2 associate-route-table --subnet-id ${PUBLIC_SUBNET_1} --route-table-id ${PUBLIC_RT} --region ${AWS_REGION}
aws ec2 associate-route-table --subnet-id ${PUBLIC_SUBNET_2} --route-table-id ${PUBLIC_RT} --region ${AWS_REGION}

echo -e "\n${BLUE}Step 5: Creating Security Groups...${NC}"

# ALB Security Group
ALB_SG=$(aws ec2 create-security-group \
    --group-name ${PROJECT_NAME}-alb-sg \
    --description "Security group for FarmTime ALB" \
    --vpc-id ${VPC_ID} \
    --region ${AWS_REGION} \
    --query 'GroupId' \
    --output text)
echo -e "${GREEN}ALB Security Group created: ${ALB_SG}${NC}"

# Add ingress rules for ALB
aws ec2 authorize-security-group-ingress --group-id ${ALB_SG} --protocol tcp --port 80 --cidr 0.0.0.0/0 --region ${AWS_REGION}
aws ec2 authorize-security-group-ingress --group-id ${ALB_SG} --protocol tcp --port 443 --cidr 0.0.0.0/0 --region ${AWS_REGION}

# Backend Security Group
BACKEND_SG=$(aws ec2 create-security-group \
    --group-name ${PROJECT_NAME}-backend-sg \
    --description "Security group for FarmTime Backend" \
    --vpc-id ${VPC_ID} \
    --region ${AWS_REGION} \
    --query 'GroupId' \
    --output text)
echo -e "${GREEN}Backend Security Group created: ${BACKEND_SG}${NC}"

# Add ingress rule for Backend (from ALB)
aws ec2 authorize-security-group-ingress --group-id ${BACKEND_SG} --protocol tcp --port 8080 --source-group ${ALB_SG} --region ${AWS_REGION}

# RDS Security Group
RDS_SG=$(aws ec2 create-security-group \
    --group-name ${PROJECT_NAME}-rds-sg \
    --description "Security group for FarmTime RDS" \
    --vpc-id ${VPC_ID} \
    --region ${AWS_REGION} \
    --query 'GroupId' \
    --output text)
echo -e "${GREEN}RDS Security Group created: ${RDS_SG}${NC}"

# Add ingress rule for RDS (from Backend)
aws ec2 authorize-security-group-ingress --group-id ${RDS_SG} --protocol tcp --port 5432 --source-group ${BACKEND_SG} --region ${AWS_REGION}

echo -e "\n${BLUE}Step 6: Creating DB Subnet Group...${NC}"
aws rds create-db-subnet-group \
    --db-subnet-group-name ${PROJECT_NAME}-db-subnet-group \
    --db-subnet-group-description "Subnet group for FarmTime RDS" \
    --subnet-ids ${PRIVATE_SUBNET_1} ${PRIVATE_SUBNET_2} \
    --region ${AWS_REGION}
echo -e "${GREEN}DB Subnet Group created${NC}"

echo -e "\n${BLUE}Step 7: Creating RDS PostgreSQL Database...${NC}"
echo -e "${YELLOW}Enter DB master password (or press Enter for auto-generated):${NC}"
read -s DB_PASSWORD
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 32)
    echo -e "${GREEN}Auto-generated password (save this!): ${DB_PASSWORD}${NC}"
fi

RDS_INSTANCE=$(aws rds create-db-instance \
    --db-instance-identifier ${PROJECT_NAME}-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.4 \
    --master-username farmtime_admin \
    --master-user-password "${DB_PASSWORD}" \
    --allocated-storage 20 \
    --storage-type gp3 \
    --storage-encrypted \
    --vpc-security-group-ids ${RDS_SG} \
    --db-subnet-group-name ${PROJECT_NAME}-db-subnet-group \
    --db-name farmtime_db \
    --backup-retention-period 7 \
    --no-publicly-accessible \
    --region ${AWS_REGION} \
    --query 'DBInstance.DBInstanceIdentifier' \
    --output text)
echo -e "${GREEN}RDS Instance creation initiated: ${RDS_INSTANCE}${NC}"
echo -e "${YELLOW}This will take several minutes...${NC}"

echo -e "\n${BLUE}Step 8: Creating ECS Cluster...${NC}"
aws ecs create-cluster \
    --cluster-name ${PROJECT_NAME}-cluster \
    --region ${AWS_REGION}
echo -e "${GREEN}ECS Cluster created${NC}"

echo -e "\n${BLUE}Step 9: Creating CloudWatch Log Group...${NC}"
aws logs create-log-group \
    --log-group-name /ecs/${PROJECT_NAME}-backend \
    --region ${AWS_REGION}
aws logs put-retention-policy \
    --log-group-name /ecs/${PROJECT_NAME}-backend \
    --retention-in-days 7 \
    --region ${AWS_REGION}
echo -e "${GREEN}CloudWatch Log Group created${NC}"

echo -e "\n${BLUE}Step 10: Waiting for RDS to be available...${NC}"
aws rds wait db-instance-available \
    --db-instance-identifier ${PROJECT_NAME}-db \
    --region ${AWS_REGION}

# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier ${PROJECT_NAME}-db \
    --region ${AWS_REGION} \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)
echo -e "${GREEN}RDS is available at: ${RDS_ENDPOINT}${NC}"

echo -e "\n${BLUE}Step 11: Creating Secrets in AWS Secrets Manager...${NC}"

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# Create secrets
aws secretsmanager create-secret \
    --name ${PROJECT_NAME}/db/url \
    --secret-string "jdbc:postgresql://${RDS_ENDPOINT}:5432/farmtime_db" \
    --region ${AWS_REGION} 2>/dev/null || echo "Secret already exists"

aws secretsmanager create-secret \
    --name ${PROJECT_NAME}/db/username \
    --secret-string "farmtime_admin" \
    --region ${AWS_REGION} 2>/dev/null || echo "Secret already exists"

aws secretsmanager create-secret \
    --name ${PROJECT_NAME}/db/password \
    --secret-string "${DB_PASSWORD}" \
    --region ${AWS_REGION} 2>/dev/null || echo "Secret already exists"

aws secretsmanager create-secret \
    --name ${PROJECT_NAME}/jwt/secret \
    --secret-string "${JWT_SECRET}" \
    --region ${AWS_REGION} 2>/dev/null || echo "Secret already exists"

aws secretsmanager create-secret \
    --name ${PROJECT_NAME}/cors/origins \
    --secret-string "https://yourdomain.com" \
    --region ${AWS_REGION} 2>/dev/null || echo "Secret already exists"

echo -e "${GREEN}Secrets created in Secrets Manager${NC}"

echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}Infrastructure Setup Complete!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo -e "${YELLOW}Important Information:${NC}"
echo -e "VPC ID: ${VPC_ID}"
echo -e "Public Subnets: ${PUBLIC_SUBNET_1}, ${PUBLIC_SUBNET_2}"
echo -e "Private Subnets: ${PRIVATE_SUBNET_1}, ${PRIVATE_SUBNET_2}"
echo -e "ALB Security Group: ${ALB_SG}"
echo -e "Backend Security Group: ${BACKEND_SG}"
echo -e "RDS Security Group: ${RDS_SG}"
echo -e "RDS Endpoint: ${RDS_ENDPOINT}"
echo -e "ECS Cluster: ${PROJECT_NAME}-cluster"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Create an Application Load Balancer using the AWS Console"
echo "2. Create ECS Task Definition and Service"
echo "3. Run the deploy-aws.sh script to deploy your application"
echo ""
echo -e "${RED}IMPORTANT: Save the database password shown above!${NC}"
