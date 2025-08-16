#!/bin/bash

# SecureInsure Pro Production Deployment Script
# This script deploys the entire application stack to production

set -e  # Exit on any error

# Configuration
PROJECT_NAME="secureinsure-pro"
DOCKER_REGISTRY="your-registry.com"
DOCKER_NAMESPACE="secureinsure"
VERSION=$(git describe --tags --always --dirty)
ENVIRONMENT="production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install it and try again."
        exit 1
    fi
    
    # Check if required environment variables are set
    if [ -z "$DOCKER_REGISTRY" ] || [ "$DOCKER_REGISTRY" = "your-registry.com" ]; then
        log_error "Please set DOCKER_REGISTRY environment variable."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build and tag Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build frontend
    log_info "Building frontend image..."
    docker build -t $DOCKER_REGISTRY/$DOCKER_NAMESPACE/frontend:$VERSION ./frontend
    docker tag $DOCKER_REGISTRY/$DOCKER_NAMESPACE/frontend:$VERSION $DOCKER_REGISTRY/$DOCKER_NAMESPACE/frontend:latest
    
    # Build backend services
    services=("gateway-service" "auth-service" "policy-service" "claims-service" "admin-service" "notification-service" "search-service")
    
    for service in "${services[@]}"; do
        log_info "Building $service image..."
        docker build -t $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$service:$VERSION ./backend/$service
        docker tag $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$service:$VERSION $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$service:latest
    done
    
    log_success "All images built successfully"
}

# Push images to registry
push_images() {
    log_info "Pushing images to registry..."
    
    # Push frontend
    log_info "Pushing frontend image..."
    docker push $DOCKER_REGISTRY/$DOCKER_NAMESPACE/frontend:$VERSION
    docker push $DOCKER_REGISTRY/$DOCKER_NAMESPACE/frontend:latest
    
    # Push backend services
    services=("gateway-service" "auth-service" "policy-service" "claims-service" "admin-service" "notification-service" "search-service")
    
    for service in "${services[@]}"; do
        log_info "Pushing $service image..."
        docker push $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$service:$VERSION
        docker push $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$service:latest
    done
    
    log_success "All images pushed successfully"
}

# Create production environment file
create_env_file() {
    log_info "Creating production environment file..."
    
    cat > .env.production << EOF
# Production Environment Variables
VERSION=$VERSION
ENVIRONMENT=$ENVIRONMENT

# Database
POSTGRES_USER=secureinsure_prod
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_DB=secureinsure_prod

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# JWT
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRATION=86400000

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true

# Security
RATE_LIMIT_ENABLED=true
CORS_ALLOWED_ORIGINS=https://yourdomain.com
EOF
    
    log_success "Production environment file created"
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f docker-compose.yml down --remove-orphans
    
    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose -f docker-compose.yml pull
    
    # Start services
    log_info "Starting services..."
    docker-compose -f docker-compose.yml --env-file .env.production up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health
    
    log_success "Production deployment completed"
}

# Check service health
check_service_health() {
    log_info "Checking service health..."
    
    services=("frontend" "gateway-service" "auth-service" "policy-service" "claims-service" "admin-service" "notification-service" "search-service")
    
    for service in "${services[@]}"; do
        log_info "Checking $service health..."
        
        # Wait for service to be ready
        timeout=60
        counter=0
        
        while [ $counter -lt $timeout ]; do
            if docker-compose -f docker-compose.yml ps $service | grep -q "Up"; then
                log_success "$service is running"
                break
            fi
            
            counter=$((counter + 5))
            sleep 5
        done
        
        if [ $counter -eq $timeout ]; then
            log_error "$service failed to start within $timeout seconds"
            exit 1
        fi
    done
    
    log_success "All services are healthy"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    sleep 20
    
    # Run migrations for each service
    services=("auth-service" "policy-service" "claims-service" "admin-service" "notification-service")
    
    for service in "${services[@]}"; do
        log_info "Running migrations for $service..."
        docker-compose -f docker-compose.yml exec -T $service java -jar app.jar --spring.profiles.active=docker
    done
    
    log_success "Database migrations completed"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create monitoring directories
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/grafana/provisioning/datasources
    mkdir -p monitoring/grafana/provisioning/dashboards
    
    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'gateway-service'
    static_configs:
      - targets: ['gateway-service:8080']
    metrics_path: '/actuator/prometheus'

  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:8081']
    metrics_path: '/actuator/prometheus'

  - job_name: 'policy-service'
    static_configs:
      - targets: ['policy-service:8082']
    metrics_path: '/actuator/prometheus'

  - job_name: 'claims-service'
    static_configs:
      - targets: ['claims-service:8083']
    metrics_path: '/actuator/prometheus'

  - job_name: 'admin-service'
    static_configs:
      - targets: ['admin-service:8084']
    metrics_path: '/actuator/prometheus'

  - job_name: 'notification-service'
    static_configs:
      - targets: ['notification-service:8085']
    metrics_path: '/actuator/prometheus'

  - job_name: 'search-service'
    static_configs:
      - targets: ['search-service:8086']
    metrics_path: '/actuator/prometheus'
EOF
    
    # Create Grafana datasource configuration
    cat > monitoring/grafana/provisioning/datasources/datasource.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF
    
    log_success "Monitoring setup completed"
}

# Create SSL certificates (self-signed for testing)
create_ssl_certificates() {
    log_info "Creating SSL certificates..."
    
    mkdir -p nginx/ssl
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    
    log_success "SSL certificates created"
}

# Main deployment function
main() {
    log_info "Starting SecureInsure Pro production deployment..."
    log_info "Version: $VERSION"
    log_info "Environment: $ENVIRONMENT"
    
    # Check prerequisites
    check_prerequisites
    
    # Create SSL certificates
    create_ssl_certificates
    
    # Setup monitoring
    setup_monitoring
    
    # Create production environment file
    create_env_file
    
    # Build images
    build_images
    
    # Push images
    push_images
    
    # Deploy to production
    deploy_production
    
    # Run migrations
    run_migrations
    
    log_success "SecureInsure Pro production deployment completed successfully!"
    log_info "Application is available at: https://localhost"
    log_info "Grafana dashboard: http://localhost:3001 (admin/admin)"
    log_info "Prometheus: http://localhost:9090"
    log_info "Kibana: http://localhost:5601"
}

# Run main function
main "$@" 