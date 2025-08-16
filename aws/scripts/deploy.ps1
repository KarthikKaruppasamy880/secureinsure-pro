# SecureInsure Pro - AWS Deployment Script (PowerShell)
# This script deploys the application to AWS ECS

param(
    [string]$AWSRegion = "us-east-1",
    [string]$AWSAccountId = "",
    [string]$ECRRepositoryUrl = ""
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Configuration
$ClusterName = "secureinsure-cluster"
$ServiceFrontend = "secureinsure-frontend"
$ServiceAPI = "secureinsure-api"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    try {
        $null = Get-Command aws -ErrorAction Stop
    }
    catch {
        Write-Error "AWS CLI is not installed. Please install it first."
        exit 1
    }
    
    # Check if Docker is installed
    try {
        $null = Get-Command docker -ErrorAction Stop
    }
    catch {
        Write-Error "Docker is not installed. Please install it first."
        exit 1
    }
    
    # Check if Docker Compose is installed
    try {
        $null = Get-Command docker-compose -ErrorAction Stop
    }
    catch {
        Write-Error "Docker Compose is not installed. Please install it first."
        exit 1
    }
    
    # Check AWS credentials
    try {
        $null = aws sts get-caller-identity 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "AWS credentials not configured"
        }
    }
    catch {
        Write-Error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    }
    
    # Get AWS account ID if not provided
    if ([string]::IsNullOrEmpty($AWSAccountId)) {
        $AWSAccountId = (aws sts get-caller-identity --query Account --output text 2>$null).Trim()
        Write-Status "Using AWS Account ID: $AWSAccountId"
    }
    
    Write-Success "Prerequisites check completed"
}

# Function to build Docker images
function Build-Images {
    Write-Status "Building Docker images..."
    
    # Build frontend
    Write-Status "Building frontend image..."
    docker build -t secureinsure-frontend:latest ./frontend
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build frontend image"
        exit 1
    }
    
    # Build backend services
    Write-Status "Building backend service images..."
    docker build -t secureinsure-gateway:latest -f ./backend/gateway-service/Dockerfile ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build gateway service image"
        exit 1
    }
    
    docker build -t secureinsure-auth:latest -f ./backend/auth-service/Dockerfile ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build auth service image"
        exit 1
    }
    
    docker build -t secureinsure-policy:latest -f ./backend/policy-service/Dockerfile ./backend
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build policy service image"
        exit 1
    }
    
    Write-Success "Docker images built successfully"
}

# Function to create ECR repositories
function New-ECRRepositories {
    Write-Status "Creating ECR repositories..."
    
    # Create repositories if they don't exist
    $repositories = @("secureinsure-frontend", "secureinsure-gateway", "secureinsure-auth", "secureinsure-policy")
    
    foreach ($repo in $repositories) {
        try {
            aws ecr describe-repositories --repository-names $repo --region $AWSRegion 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Status "Creating repository: $repo"
                aws ecr create-repository --repository-name $repo --region $AWSRegion
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Created repository: $repo"
                }
            }
            else {
                Write-Status "Repository $repo already exists"
            }
        }
        catch {
            Write-Warning "Failed to create repository $repo : $_"
        }
    }
    
    Write-Success "ECR repositories created/verified"
}

# Function to push images to ECR
function Push-ImagesToECR {
    Write-Status "Pushing images to ECR..."
    
    # Login to ECR
    $ecrLogin = aws ecr get-login-password --region $AWSRegion | docker login --username AWS --password-stdin "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to login to ECR"
        exit 1
    }
    
    # Tag and push frontend
    docker tag secureinsure-frontend:latest "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/secureinsure-frontend:latest"
    docker push "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/secureinsure-frontend:latest"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push frontend image"
        exit 1
    }
    
    # Tag and push backend services
    docker tag secureinsure-gateway:latest "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/secureinsure-gateway:latest"
    docker push "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/secureinsure-gateway:latest"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push gateway service image"
        exit 1
    }
    
    docker tag secureinsure-auth:latest "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/secureinsure-auth:latest"
    docker push "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/secureinsure-auth:latest"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push auth service image"
        exit 1
    }
    
    docker tag secureinsure-policy:latest "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/secureinsure-policy:latest"
    docker push "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/secureinsure-policy:latest"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push policy service image"
        exit 1
    }
    
    Write-Success "Images pushed to ECR successfully"
}

# Function to update ECS services
function Update-ECSServices {
    Write-Status "Updating ECS services..."
    
    # Update frontend service
    try {
        $null = aws ecs describe-services --cluster $ClusterName --services $ServiceFrontend --region $AWSRegion 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Updating frontend service..."
            aws ecs update-service --cluster $ClusterName --service $ServiceFrontend --force-new-deployment --region $AWSRegion
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Frontend service updated"
            }
        }
        else {
            Write-Warning "Frontend service not found. Please create it first using Terraform."
        }
    }
    catch {
        Write-Warning "Failed to update frontend service: $_"
    }
    
    # Update API service
    try {
        $null = aws ecs describe-services --cluster $ClusterName --services $ServiceAPI --region $AWSRegion 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Updating API service..."
            aws ecs update-service --cluster $ClusterName --service $ServiceAPI --force-new-deployment --region $AWSRegion
            if ($LASTEXITCODE -eq 0) {
                Write-Success "API service updated"
            }
        }
        else {
            Write-Warning "API service not found. Please create it first using Terraform."
        }
    }
    catch {
        Write-Warning "Failed to update API service: $_"
    }
    
    Write-Success "ECS services updated successfully"
}

# Function to wait for deployment
function Wait-Deployment {
    Write-Status "Waiting for deployment to complete..."
    
    # Wait for frontend service
    try {
        $null = aws ecs describe-services --cluster $ClusterName --services $ServiceFrontend --region $AWSRegion 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Waiting for frontend service to stabilize..."
            aws ecs wait services-stable --cluster $ClusterName --services $ServiceFrontend --region $AWSRegion
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Frontend service stabilized"
            }
        }
    }
    catch {
        Write-Warning "Failed to wait for frontend service: $_"
    }
    
    # Wait for API service
    try {
        $null = aws ecs describe-services --cluster $ClusterName --services $ServiceAPI --region $AWSRegion 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Waiting for API service to stabilize..."
            aws ecs wait services-stable --cluster $ClusterName --services $ServiceAPI --region $AWSRegion
            if ($LASTEXITCODE -eq 0) {
                Write-Success "API service stabilized"
            }
        }
    }
    catch {
        Write-Warning "Failed to wait for API service: $_"
    }
    
    Write-Success "Deployment completed successfully"
}

# Function to display deployment information
function Show-DeploymentInfo {
    Write-Status "Deployment completed successfully!"
    Write-Host ""
    Write-Host "🌐 Application Information:" -ForegroundColor $White
    Write-Host "   - Frontend Service: $ServiceFrontend" -ForegroundColor $White
    Write-Host "   - API Service: $ServiceAPI" -ForegroundColor $White
    Write-Host "   - Cluster: $ClusterName" -ForegroundColor $White
    Write-Host "   - Region: $AWSRegion" -ForegroundColor $White
    Write-Host ""
    Write-Host "📊 Check service status:" -ForegroundColor $White
    Write-Host "   aws ecs describe-services --cluster $ClusterName --services $ServiceFrontend $ServiceAPI --region $AWSRegion" -ForegroundColor $White
    Write-Host ""
    Write-Host "📝 View logs:" -ForegroundColor $White
    Write-Host "   aws logs describe-log-groups --log-group-name-prefix /ecs/secureinsure --region $AWSRegion" -ForegroundColor $White
    Write-Host ""
    Write-Host "🔍 Monitor deployment:" -ForegroundColor $White
    Write-Host "   aws ecs describe-services --cluster $ClusterName --services $ServiceFrontend $ServiceAPI --region $AWSRegion --query 'services[*].{Service:serviceName,Status:status,RunningCount:runningCount,DesiredCount:desiredCount}'" -ForegroundColor $White
}

# Main deployment function
function Main {
    Write-Host "🚀 SecureInsure Pro - AWS Deployment (PowerShell)" -ForegroundColor $Green
    Write-Host "==================================================" -ForegroundColor $Green
    Write-Host ""
    
    # Check prerequisites
    Test-Prerequisites
    
    # Build images
    Build-Images
    
    # Create ECR repositories
    New-ECRRepositories
    
    # Push images to ECR
    Push-ImagesToECR
    
    # Update ECS services
    Update-ECSServices
    
    # Wait for deployment
    Wait-Deployment
    
    # Display information
    Show-DeploymentInfo
}

# Run main function
try {
    Main
}
catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
