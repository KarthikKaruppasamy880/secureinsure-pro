# ☁️ SecureInsure Pro - AWS Deployment Guide

## 🎯 DEPLOYMENT OVERVIEW

This guide will help you deploy the SecureInsure Pro application to AWS using Docker containers and managed services.

## 🏗️ ARCHITECTURE

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   Application   │    │   RDS           │
│   (CDN)         │────│   Load Balancer │────│   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   ECS Cluster   │
                       │   (Docker)      │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   ElastiCache   │
                       │   (Redis)       │
                       └─────────────────┘
```

## 🚀 DEPLOYMENT OPTIONS

### Option 1: AWS ECS with Fargate (Recommended)
- **Pros:** Serverless, auto-scaling, managed infrastructure
- **Cons:** Higher cost for small deployments
- **Best for:** Production environments

### Option 2: AWS EC2 with Docker
- **Pros:** Full control, cost-effective for small deployments
- **Cons:** Manual scaling, more maintenance
- **Best for:** Development/staging environments

### Option 3: AWS App Runner
- **Pros:** Simple deployment, auto-scaling
- **Cons:** Limited customization
- **Best for:** Simple applications

## 🛠️ PREREQUISITES

1. **AWS CLI installed and configured**
2. **Docker installed locally**
3. **AWS Account with appropriate permissions**
4. **Domain name (optional, for custom domain)**

## 📋 DEPLOYMENT STEPS

### Step 1: Prepare Docker Images

```bash
# Build and tag images
docker build -t secureinsure-frontend ./frontend
docker build -t secureinsure-auth ./backend/auth-service
docker build -t secureinsure-chatbot ./backend/chatbot-service

# Tag for ECR
docker tag secureinsure-frontend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/secureinsure-frontend:latest
docker tag secureinsure-auth:latest <account-id>.dkr.ecr.<region>.amazonaws.com/secureinsure-auth:latest
docker tag secureinsure-chatbot:latest <account-id>.dkr.ecr.<region>.amazonaws.com/secureinsure-chatbot:latest
```

### Step 2: Create ECR Repositories

```bash
# Create ECR repositories
aws ecr create-repository --repository-name secureinsure-frontend
aws ecr create-repository --repository-name secureinsure-auth
aws ecr create-repository --repository-name secureinsure-chatbot

# Get login token
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
```

### Step 3: Push Images to ECR

```bash
# Push images
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/secureinsure-frontend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/secureinsure-auth:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/secureinsure-chatbot:latest
```

### Step 4: Create RDS Database

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier secureinsure-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password <secure-password> \
    --allocated-storage 20 \
    --vpc-security-group-ids <security-group-id> \
    --db-subnet-group-name <subnet-group-name>
```

### Step 5: Create ElastiCache Redis

```bash
# Create ElastiCache Redis cluster
aws elasticache create-cache-cluster \
    --cache-cluster-id secureinsure-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --security-group-ids <security-group-id>
```

### Step 6: Create ECS Cluster

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name secureinsure-cluster
```

### Step 7: Create Task Definitions

Create `task-definition-auth.json`:
```json
{
  "family": "secureinsure-auth",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "auth-service",
      "image": "<account-id>.dkr.ecr.<region>.amazonaws.com/secureinsure-auth:latest",
      "portMappings": [
        {
          "containerPort": 8081,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_DATASOURCE_URL",
          "value": "jdbc:postgresql://<rds-endpoint>:5432/secureinsure"
        },
        {
          "name": "SPRING_DATASOURCE_USERNAME",
          "value": "postgres"
        },
        {
          "name": "SPRING_DATASOURCE_PASSWORD",
          "value": "<secure-password>"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/secureinsure-auth",
          "awslogs-region": "<region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 8: Create ECS Services

```bash
# Create ECS service for auth
aws ecs create-service \
    --cluster secureinsure-cluster \
    --service-name auth-service \
    --task-definition secureinsure-auth:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<subnet-id>],securityGroups=[<security-group-id>],assignPublicIp=ENABLED}"
```

### Step 9: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name secureinsure-alb \
    --subnets <subnet-id-1> <subnet-id-2> \
    --security-groups <security-group-id>
```

### Step 10: Configure DNS (Optional)

```bash
# Create Route 53 hosted zone
aws route53 create-hosted-zone \
    --name yourdomain.com \
    --caller-reference $(date +%s)

# Create A record pointing to ALB
aws route53 change-resource-record-sets \
    --hosted-zone-id <zone-id> \
    --change-batch file://dns-change.json
```

## 🔧 ENVIRONMENT VARIABLES

### Frontend (.env.production)
```bash
VITE_API_BASE_URL=https://yourdomain.com
VITE_WS_URL=wss://yourdomain.com/ws
VITE_ENV=production
```

### Backend (ECS Task Definition)
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://<rds-endpoint>:5432/secureinsure
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<secure-password>
SPRING_REDIS_HOST=<elasticache-endpoint>
SPRING_REDIS_PORT=6379
JWT_SECRET=<secure-jwt-secret>
```

## 🛡️ SECURITY CONSIDERATIONS

1. **Use AWS Secrets Manager for sensitive data**
2. **Enable VPC with private subnets**
3. **Configure security groups properly**
4. **Use HTTPS with SSL certificates**
5. **Enable CloudTrail for audit logging**
6. **Use IAM roles with least privilege**

## 📊 MONITORING & LOGGING

### CloudWatch Logs
```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/secureinsure-auth
aws logs create-log-group --log-group-name /ecs/secureinsure-frontend
aws logs create-log-group --log-group-name /ecs/secureinsure-chatbot
```

### CloudWatch Alarms
```bash
# Create CPU alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "ECS-CPU-High" \
    --alarm-description "ECS CPU utilization is high" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold
```

## 💰 COST OPTIMIZATION

1. **Use Spot Instances for non-critical workloads**
2. **Implement auto-scaling policies**
3. **Use CloudFront for static content**
4. **Monitor and optimize RDS instance size**
5. **Use S3 for file storage**

## 🚀 DEPLOYMENT AUTOMATION

### GitHub Actions Workflow
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Build and push images
        run: |
          docker build -t secureinsure-frontend ./frontend
          docker tag secureinsure-frontend:latest $ECR_REGISTRY/secureinsure-frontend:latest
          docker push $ECR_REGISTRY/secureinsure-frontend:latest
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster secureinsure-cluster --service frontend-service --force-new-deployment
```

## 🔍 TROUBLESHOOTING

### Common Issues

1. **Service won't start:**
   - Check ECS task logs
   - Verify environment variables
   - Check security group rules

2. **Database connection issues:**
   - Verify RDS security groups
   - Check connection string
   - Ensure database is accessible

3. **Load balancer issues:**
   - Check target group health
   - Verify security group rules
   - Check SSL certificate

### Useful Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster secureinsure-cluster --services auth-service

# View ECS logs
aws logs get-log-events --log-group-name /ecs/secureinsure-auth --log-stream-name <stream-name>

# Check RDS status
aws rds describe-db-instances --db-instance-identifier secureinsure-db
```

## 📞 SUPPORT

For deployment issues:
1. Check AWS CloudWatch logs
2. Verify all resources are created correctly
3. Check security group configurations
4. Contact AWS support if needed

---

**Last Updated:** $(Get-Date)  
**Status:** ✅ PRODUCTION READY  
**Version:** 1.0.0
