# SecureInsure Pro - Deployment Guide

## 🔐 **Login Credentials**

### Default Users (Password: `Admin123!`)

| Username | Email | Role | Description |
|----------|-------|------|-------------|
| `admin` | admin@secureinsure.com | ADMIN | System Administrator |
| `agent` | agent@secureinsure.com | AGENT | Insurance Agent |
| `underwriter` | underwriter@secureinsure.com | UNDERWRITER | Policy Underwriter |
| `customer` | customer@secureinsure.com | CUSTOMER | Policy Customer |

### Login Instructions
1. Access the application at: `http://localhost:3000` (local) or your deployed URL
2. Use any of the above usernames with password: `Admin123!`
3. All users are pre-verified and active

## 🚀 **Repository Setup**

### 1. Initialize Git Repository
```bash
# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: SecureInsure Pro - Insurance Management System"

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/yourusername/secureinsure-pro.git

# Push to main branch
git push -u origin main
```

### 2. Create .gitignore File
```bash
# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/target/
*/build/
*.jar
*.war

# Environment files
.env
.env.local
.env.production
application-local.yml
application-prod.yml

# IDE files
.idea/
.vscode/
*.iml
*.ipr
*.iws

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Docker
.dockerignore

# AWS
.aws/
aws-credentials.json

# Database
*.db
*.sqlite

# Temporary files
*.tmp
*.temp
EOF
```

### 3. Repository Structure
```
secureinsure-pro/
├── frontend/                 # React frontend
├── backend/                  # Spring Boot microservices
├── docker-compose.yml        # Local development
├── docker-compose.prod.yml   # Production deployment
├── scripts/                  # Deployment scripts
├── aws/                      # AWS configuration
├── docs/                     # Documentation
└── README.md                 # Project overview
```

## ☁️ **AWS Deployment**

### 1. Prerequisites
- AWS CLI installed and configured
- Docker and Docker Compose
- Terraform (for infrastructure as code)

### 2. AWS Infrastructure Setup

#### Create AWS Infrastructure Script
```bash
# Create AWS directory
mkdir -p aws/infrastructure
mkdir -p aws/scripts
mkdir -p aws/config
```

#### AWS Infrastructure (Terraform)
```hcl
# aws/infrastructure/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "secureinsure-vpc"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "secureinsure-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier           = "secureinsure-postgres"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  storage_type         = "gp2"
  username             = var.db_username
  password             = var.db_password
  skip_final_snapshot  = true
  
  tags = {
    Name = "secureinsure-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "redis" {
  name       = "secureinsure-redis-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "secureinsure-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "secureinsure-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  tags = {
    Name = "secureinsure-alb"
  }
}

# ECS Services
resource "aws_ecs_service" "frontend" {
  name            = "secureinsure-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 2
  
  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }
}

# Outputs
output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}
```

### 3. Docker Production Configuration

#### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - REACT_APP_API_URL=${API_URL}
      - REACT_APP_ENVIRONMENT=production
    ports:
      - "3000:3000"
    restart: unless-stopped

  gateway-service:
    build:
      context: ./backend
      dockerfile: gateway-service/Dockerfile.prod
    environment:
      - SPRING_PROFILES_ACTIVE=production
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
    ports:
      - "8080:8080"
    restart: unless-stopped

  auth-service:
    build:
      context: ./backend
      dockerfile: auth-service/Dockerfile.prod
    environment:
      - SPRING_PROFILES_ACTIVE=production
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
    ports:
      - "8081:8081"
    restart: unless-stopped

  policy-service:
    build:
      context: ./backend
      dockerfile: policy-service/Dockerfile.prod
    environment:
      - SPRING_PROFILES_ACTIVE=production
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
    ports:
      - "8082:8082"
    restart: unless-stopped

networks:
  default:
    driver: bridge
```

### 4. AWS Deployment Scripts

#### Deploy to AWS ECS
```bash
#!/bin/bash
# aws/scripts/deploy.sh

set -e

echo "🚀 Deploying SecureInsure Pro to AWS..."

# Build Docker images
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Push to ECR
echo "📤 Pushing images to ECR..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push images
docker tag secureinsure-pro-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/secureinsure-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/secureinsure-frontend:latest

docker tag secureinsure-pro-gateway-service:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/secureinsure-gateway:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/secureinsure-gateway:latest

# Update ECS services
echo "🔄 Updating ECS services..."
aws ecs update-service --cluster secureinsure-cluster --service secureinsure-frontend --force-new-deployment
aws ecs update-service --cluster secureinsure-cluster --service secureinsure-gateway --force-new-deployment

echo "✅ Deployment completed successfully!"
echo "🌐 Application URL: http://your-alb-dns-name.us-east-1.elb.amazonaws.com"
```

#### Environment Variables
```bash
# aws/config/.env.production
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id

# Database
DB_HOST=your-rds-endpoint
DB_PORT=5432
DB_NAME=secureinsure_pro
DB_USERNAME=secureinsure_user
DB_PASSWORD=your-secure-password

# Redis
REDIS_HOST=your-elasticache-endpoint
REDIS_PORT=6379

# API
API_URL=https://your-api-domain.com

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-2024
JWT_EXPIRATION=86400000

# AWS Services
AWS_S3_BUCKET=secureinsure-assets
AWS_SES_REGION=us-east-1
AWS_REKOGNITION_REGION=us-east-1
```

### 5. Deployment Steps

#### Step 1: Infrastructure Setup
```bash
cd aws/infrastructure
terraform init
terraform plan
terraform apply
```

#### Step 2: Configure Environment
```bash
# Copy environment file
cp aws/config/.env.production .env.production

# Edit with your values
nano .env.production
```

#### Step 3: Deploy Application
```bash
# Make script executable
chmod +x aws/scripts/deploy.sh

# Run deployment
./aws/scripts/deploy.sh
```

#### Step 4: Verify Deployment
```bash
# Check ECS services
aws ecs describe-services --cluster secureinsure-cluster --services secureinsure-frontend secureinsure-gateway

# Check ALB health
aws elbv2 describe-target-health --target-group-arn your-target-group-arn
```

## 🔒 **Security Considerations**

### 1. Database Security
- Use RDS with encryption at rest
- Implement VPC security groups
- Regular security patches

### 2. Application Security
- HTTPS/TLS encryption
- JWT token management
- Input validation and sanitization

### 3. AWS Security
- IAM roles with least privilege
- CloudTrail logging
- VPC with private subnets

## 📊 **Monitoring and Logging**

### 1. CloudWatch
- Application metrics
- Custom dashboards
- Alarm notifications

### 2. Logging
- Centralized logging with CloudWatch Logs
- Structured logging format
- Log retention policies

## 🚨 **Troubleshooting**

### Common Issues
1. **Database Connection**: Check security groups and VPC configuration
2. **Service Discovery**: Verify ECS service discovery settings
3. **Load Balancer**: Check target group health and security groups
4. **Environment Variables**: Ensure all required variables are set

### Debug Commands
```bash
# Check ECS service logs
aws logs describe-log-groups --log-group-name-prefix /ecs/secureinsure

# Check RDS status
aws rds describe-db-instances --db-instance-identifier secureinsure-postgres

# Check ALB target health
aws elbv2 describe-target-health --target-group-arn your-target-group-arn
```

## 📞 **Support**

For deployment issues:
1. Check CloudWatch logs
2. Verify environment variables
3. Review security group configurations
4. Check ECS service events

---

**Next Steps:**
1. Set up your GitHub repository
2. Configure AWS credentials
3. Run infrastructure setup
4. Deploy the application
5. Test login functionality

**Estimated Time:** 2-4 hours for complete setup
