#!/bin/bash

# SecureInsure Pro Deployment Script
# This script deploys the entire application stack

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="secureinsure-pro"
DOCKER_REGISTRY="your-registry.com"
VERSION=${1:-latest}
ENVIRONMENT=${2:-development}

echo -e "${BLUE}🚀 SecureInsure Pro Deployment${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    if ! command -v mvn &> /dev/null; then
        print_warning "Maven is not installed - will use Docker builds only"
    fi
    
    print_status "Prerequisites check completed"
}

# Build backend services
build_backend() {
    print_info "Building backend services..."
    
    cd backend
    
    # Build all services with Maven
    if command -v mvn &> /dev/null; then
        print_info "Building with Maven..."
        mvn clean install -DskipTests
        print_status "Maven build completed"
    fi
    
    # Build Docker images
    print_info "Building Docker images..."
    
    services=("gateway-service" "auth-service" "policy-service" "claims-service" "notification-service" "admin-service" "search-service")
    
    for service in "${services[@]}"; do
        print_info "Building $service..."
        cd "$service"
        docker build -t "$DOCKER_REGISTRY/$service:$VERSION" .
        cd ..
    done
    
    cd ..
    print_status "Backend services built successfully"
}

# Build frontend
build_frontend() {
    print_info "Building frontend..."
    
    cd frontend
    
    # Install dependencies
    print_info "Installing dependencies..."
    npm ci --only=production
    
    # Build production version
    print_info "Building production version..."
    npm run build
    
    # Build Docker image
    print_info "Building Docker image..."
    docker build -t "$DOCKER_REGISTRY/frontend:$VERSION" .
    
    cd ..
    print_status "Frontend built successfully"
}

# Deploy with Docker Compose
deploy_docker_compose() {
    print_info "Deploying with Docker Compose..."
    
    # Set environment variables
    export VERSION=$VERSION
    export ENVIRONMENT=$ENVIRONMENT
    
    # Stop existing services
    print_info "Stopping existing services..."
    docker-compose down --remove-orphans
    
    # Pull latest images
    print_info "Pulling latest images..."
    docker-compose pull
    
    # Start services
    print_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    print_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health
    
    print_status "Docker Compose deployment completed"
}

# Check service health
check_service_health() {
    print_info "Checking service health..."
    
    services=(
        "gateway-service:8080"
        "auth-service:8081"
        "policy-service:8082"
        "claims-service:8083"
        "notification-service:8084"
        "admin-service:8085"
        "search-service:8086"
        "frontend:3000"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        
        if curl -f "http://localhost:$port/actuator/health" &> /dev/null 2>&1; then
            print_status "$name is healthy"
        else
            print_warning "$name health check failed"
        fi
    done
}

# Deploy to production (AWS)
deploy_production() {
    if [ "$ENVIRONMENT" = "production" ]; then
        print_info "Deploying to production (AWS)..."
        
        cd infrastructure/aws
        
        # Initialize Terraform
        print_info "Initializing Terraform..."
        terraform init
        
        # Plan deployment
        print_info "Planning deployment..."
        terraform plan -var="version=$VERSION" -out=tfplan
        
        # Apply deployment
        print_info "Applying deployment..."
        terraform apply tfplan
        
        cd ../..
        
        print_status "Production deployment completed"
    fi
}

# Run database migrations
run_migrations() {
    print_info "Running database migrations..."
    
    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations for each service
    services=("policy-service" "auth-service" "claims-service" "notification-service" "admin-service" "search-service")
    
    for service in "${services[@]}"; do
        print_info "Running migrations for $service..."
        docker-compose exec "$service" java -jar app.jar --spring.flyway.migrate
    done
    
    print_status "Database migrations completed"
}

# Main deployment function
main() {
    echo ""
    print_info "Starting deployment process..."
    
    # Check prerequisites
    check_prerequisites
    
    # Build services
    build_backend
    build_frontend
    
    # Deploy
    deploy_docker_compose
    
    # Run migrations
    run_migrations
    
    # Deploy to production if specified
    deploy_production
    
    echo ""
    print_status "🎉 Deployment completed successfully!"
    echo ""
    print_info "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  API Gateway: http://localhost:8080"
    echo "  Swagger UI: http://localhost:8080/swagger-ui.html"
    echo ""
    print_info "To view logs: docker-compose logs -f"
    print_info "To stop services: docker-compose down"
}

# Run main function
main "$@" 