# SecureInsure Pro Deployment Script (PowerShell)
# This script deploys the entire application stack

param(
    [string]$Version = "latest",
    [string]$Environment = "development"
)

# Configuration
$ProjectName = "secureinsure-pro"
$DockerRegistry = "your-registry.com"

Write-Host "🚀 SecureInsure Pro Deployment" -ForegroundColor Blue
Write-Host "Version: $Version" -ForegroundColor Blue
Write-Host "Environment: $Environment" -ForegroundColor Blue
Write-Host ""

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Check prerequisites
function Check-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed"
        exit 1
    }
    
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not installed"
        exit 1
    }
    
    if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
        Write-Warning "Maven is not installed - will use Docker builds only"
    }
    
    Write-Status "Prerequisites check completed"
}

# Build backend services
function Build-Backend {
    Write-Info "Building backend services..."
    
    Set-Location backend
    
    # Build all services with Maven
    if (Get-Command mvn -ErrorAction SilentlyContinue) {
        Write-Info "Building with Maven..."
        mvn clean install -DskipTests
        Write-Status "Maven build completed"
    }
    
    # Build Docker images
    Write-Info "Building Docker images..."
    
    $services = @("gateway-service", "auth-service", "policy-service", "claims-service", "notification-service", "admin-service", "search-service")
    
    foreach ($service in $services) {
        Write-Info "Building $service..."
        Set-Location $service
        docker build -t "$DockerRegistry/$service`:$Version" .
        Set-Location ..
    }
    
    Set-Location ..
    Write-Status "Backend services built successfully"
}

# Build frontend
function Build-Frontend {
    Write-Info "Building frontend..."
    
    Set-Location frontend
    
    # Install dependencies
    Write-Info "Installing dependencies..."
    npm ci --only=production
    
    # Build production version
    Write-Info "Building production version..."
    npm run build
    
    # Build Docker image
    Write-Info "Building Docker image..."
    docker build -t "$DockerRegistry/frontend`:$Version" .
    
    Set-Location ..
    Write-Status "Frontend built successfully"
}

# Deploy with Docker Compose
function Deploy-DockerCompose {
    Write-Info "Deploying with Docker Compose..."
    
    # Set environment variables
    $env:VERSION = $Version
    $env:ENVIRONMENT = $Environment
    
    # Stop existing services
    Write-Info "Stopping existing services..."
    docker-compose down --remove-orphans
    
    # Pull latest images
    Write-Info "Pulling latest images..."
    docker-compose pull
    
    # Start services
    Write-Info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    Write-Info "Waiting for services to be healthy..."
    Start-Sleep -Seconds 30
    
    # Check service health
    Check-ServiceHealth
    
    Write-Status "Docker Compose deployment completed"
}

# Check service health
function Check-ServiceHealth {
    Write-Info "Checking service health..."
    
    $services = @(
        "gateway-service:8080",
        "auth-service:8081",
        "policy-service:8082",
        "claims-service:8083",
        "notification-service:8084",
        "admin-service:8085",
        "search-service:8086",
        "frontend:3000"
    )
    
    foreach ($service in $services) {
        $name, $port = $service.Split(":")
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port/actuator/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Status "$name is healthy"
            } else {
                Write-Warning "$name health check failed"
            }
        } catch {
            Write-Warning "$name health check failed"
        }
    }
}

# Deploy to production (AWS)
function Deploy-Production {
    if ($Environment -eq "production") {
        Write-Info "Deploying to production (AWS)..."
        
        Set-Location infrastructure/aws
        
        # Initialize Terraform
        Write-Info "Initializing Terraform..."
        terraform init
        
        # Plan deployment
        Write-Info "Planning deployment..."
        terraform plan -var="version=$Version" -out=tfplan
        
        # Apply deployment
        Write-Info "Applying deployment..."
        terraform apply tfplan
        
        Set-Location ../..
        
        Write-Status "Production deployment completed"
    }
}

# Run database migrations
function Run-Migrations {
    Write-Info "Running database migrations..."
    
    # Wait for database to be ready
    Write-Info "Waiting for database to be ready..."
    Start-Sleep -Seconds 10
    
    # Run migrations for each service
    $services = @("policy-service", "auth-service", "claims-service", "notification-service", "admin-service", "search-service")
    
    foreach ($service in $services) {
        Write-Info "Running migrations for $service..."
        docker-compose exec $service java -jar app.jar --spring.flyway.migrate
    }
    
    Write-Status "Database migrations completed"
}

# Main deployment function
function Main {
    Write-Host ""
    Write-Info "Starting deployment process..."
    
    # Check prerequisites
    Check-Prerequisites
    
    # Build services
    Build-Backend
    Build-Frontend
    
    # Deploy
    Deploy-DockerCompose
    
    # Run migrations
    Run-Migrations
    
    # Deploy to production if specified
    Deploy-Production
    
    Write-Host ""
    Write-Status "🎉 Deployment completed successfully!"
    Write-Host ""
    Write-Info "Application URLs:"
    Write-Host "  Frontend: http://localhost:3000"
    Write-Host "  API Gateway: http://localhost:8080"
    Write-Host "  Swagger UI: http://localhost:8080/swagger-ui.html"
    Write-Host ""
    Write-Info "To view logs: docker-compose logs -f"
    Write-Info "To stop services: docker-compose down"
}

# Run main function
Main
