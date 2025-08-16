#!/bin/bash

# SecureInsure Pro - AWS Deployment Script
# This script deploys the application to AWS ECS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}
ECR_REPOSITORY_URL=${ECR_REPOSITORY_URL:-""}
CLUSTER_NAME="secureinsure-cluster"
SERVICE_FRONTEND="secureinsure-frontend"
SERVICE_API="secureinsure-api"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Get AWS account ID if not provided
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        print_status "Using AWS Account ID: $AWS_ACCOUNT_ID"
    fi
    
    print_success "Prerequisites check completed"
}

# Function to build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build frontend
    print_status "Building frontend image..."
    docker build -t secureinsure-frontend:latest ./frontend
    
    # Build backend services
    print_status "Building backend service images..."
    docker build -t secureinsure-gateway:latest -f ./backend/gateway-service/Dockerfile ./backend
    docker build -t secureinsure-auth:latest -f ./backend/auth-service/Dockerfile ./backend
    docker build -t secureinsure-policy:latest -f ./backend/policy-service/Dockerfile ./backend
    
    print_success "Docker images built successfully"
}

# Function to create ECR repositories
create_ecr_repositories() {
    print_status "Creating ECR repositories..."
    
    # Create repositories if they don't exist
    aws ecr describe-repositories --repository-names secureinsure-frontend --region $AWS_REGION || \
        aws ecr create-repository --repository-name secureinsure-frontend --region $AWS_REGION
    
    aws ecr describe-repositories --repository-names secureinsure-gateway --region $AWS_REGION || \
        aws ecr create-repository --repository-name secureinsure-gateway --region $AWS_REGION
    
    aws ecr describe-repositories --repository-names secureinsure-auth --region $AWS_REGION || \
        aws ecr create-repository --repository-name secureinsure-auth --region $AWS_REGION
    
    aws ecr describe-repositories --repository-name secureinsure-policy --region $AWS_REGION || \
        aws ecr create-repository --repository-name secureinsure-policy --region $AWS_REGION
    
    print_success "ECR repositories created/verified"
}

# Function to push images to ECR
push_images_to_ecr() {
    print_status "Pushing images to ECR..."
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Tag and push frontend
    docker tag secureinsure-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/secureinsure-frontend:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/secureinsure-frontend:latest
    
    # Tag and push backend services
    docker tag secureinsure-gateway:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/secureinsure-gateway:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/secureinsure-gateway:latest
    
    docker tag secureinsure-auth:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/secureinsure-auth:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/secureinsure-auth:latest
    
    docker tag secureinsure-policy:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/secureinsure-policy:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/secureinsure-policy:latest
    
    print_success "Images pushed to ECR successfully"
}

# Function to update ECS services
update_ecs_services() {
    print_status "Updating ECS services..."
    
    # Update frontend service
    if aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_FRONTEND --region $AWS_REGION &> /dev/null; then
        print_status "Updating frontend service..."
        aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_FRONTEND --force-new-deployment --region $AWS_REGION
    else
        print_warning "Frontend service not found. Please create it first using Terraform."
    fi
    
    # Update API service
    if aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_API --region $AWS_REGION &> /dev/null; then
        print_status "Updating API service..."
        aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_API --force-new-deployment --region $AWS_REGION
    else
        print_warning "API service not found. Please create it first using Terraform."
    fi
    
    print_success "ECS services updated successfully"
}

# Function to wait for deployment
wait_for_deployment() {
    print_status "Waiting for deployment to complete..."
    
    # Wait for frontend service
    if aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_FRONTEND --region $AWS_REGION &> /dev/null; then
        print_status "Waiting for frontend service to stabilize..."
        aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_FRONTEND --region $AWS_REGION
    fi
    
    # Wait for API service
    if aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_API --region $AWS_REGION &> /dev/null; then
        print_status "Waiting for API service to stabilize..."
        aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_API --region $AWS_REGION
    fi
    
    print_success "Deployment completed successfully"
}

# Function to display deployment information
display_deployment_info() {
    print_status "Deployment completed successfully!"
    echo ""
    echo "🌐 Application Information:"
    echo "   - Frontend Service: $SERVICE_FRONTEND"
    echo "   - API Service: $SERVICE_API"
    echo "   - Cluster: $CLUSTER_NAME"
    echo "   - Region: $AWS_REGION"
    echo ""
    echo "📊 Check service status:"
    echo "   aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_FRONTEND $SERVICE_API --region $AWS_REGION"
    echo ""
    echo "📝 View logs:"
    echo "   aws logs describe-log-groups --log-group-name-prefix /ecs/secureinsure --region $AWS_REGION"
    echo ""
    echo "🔍 Monitor deployment:"
    echo "   aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_FRONTEND $SERVICE_API --region $AWS_REGION --query 'services[*].{Service:serviceName,Status:status,RunningCount:runningCount,DesiredCount:desiredCount}'"
}

# Main deployment function
main() {
    echo "🚀 SecureInsure Pro - AWS Deployment"
    echo "====================================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Build images
    build_images
    
    # Create ECR repositories
    create_ecr_repositories
    
    # Push images to ECR
    push_images_to_ecr
    
    # Update ECS services
    update_ecs_services
    
    # Wait for deployment
    wait_for_deployment
    
    # Display information
    display_deployment_info
}

# Run main function
main "$@"
