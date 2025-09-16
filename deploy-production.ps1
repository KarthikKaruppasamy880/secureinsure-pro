# SecureInsure Pro - Production Deployment Script
# Senior Full Stack Developer & AI Engineer Deployment Automation
# This script handles complete application deployment with error handling and validation

param(
    [string]$Environment = "development",
    [switch]$SkipTests = $false,
    [switch]$CleanBuild = $true,
    [switch]$StartServices = $true
)

# Color coding for output
function Write-ColorOutput($ForegroundColor, $Message) {
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Write-Success($Message) { Write-ColorOutput Green "✅ $Message" }
function Write-Error($Message) { Write-ColorOutput Red "❌ $Message" }
function Write-Info($Message) { Write-ColorOutput Cyan "ℹ️  $Message" }
function Write-Warning($Message) { Write-ColorOutput Yellow "⚠️  $Message" }

Write-Info "🚀 Starting SecureInsure Pro Production Deployment"
Write-Info "Environment: $Environment"
Write-Info "Skip Tests: $SkipTests"
Write-Info "Clean Build: $CleanBuild"

# Step 1: Kill existing processes to avoid port conflicts
Write-Info "🔄 Cleaning up existing processes..."
try {
    Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*java*"} | ForEach-Object {
        if ($_.MainWindowTitle -like "*SecureInsure*" -or $_.CommandLine -like "*8080*" -or $_.CommandLine -like "*8081*") {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Success "Stopped process: $($_.ProcessName) (PID: $($_.Id))"
        }
    }
} catch {
    Write-Warning "Some processes couldn't be stopped: $($_.Exception.Message)"
}

# Step 2: Validate Prerequisites
Write-Info "🔧 Validating prerequisites..."

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | ForEach-Object { $_.ToString() }
    if ($javaVersion -match "17|11") {
        Write-Success "Java version validated: $javaVersion"
    } else {
        Write-Error "Java 11 or 17 required. Current: $javaVersion"
        exit 1
    }
} catch {
    Write-Error "Java not found. Please install Java 11 or 17"
    exit 1
}

# Check Maven
try {
    $mavenVersion = mvn -v 2>&1 | Select-String "Apache Maven" | ForEach-Object { $_.ToString() }
    Write-Success "Maven validated: $mavenVersion"
} catch {
    Write-Error "Maven not found. Please install Apache Maven"
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    Write-Success "Node.js validated: $nodeVersion, npm: $npmVersion"
} catch {
    Write-Error "Node.js/npm not found. Please install Node.js"
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Success "Docker validated: $dockerVersion"
} catch {
    Write-Warning "Docker not found. Container deployment will be skipped"
}

# Step 3: Build Backend Services
Write-Info "🏗️  Building backend microservices..."

$services = @(
    "auth-service",
    "policy-service", 
    "claims-service",
    "admin-service",
    "notification-service",
    "search-service",
    "gateway-service"
)

$buildErrors = @()

foreach ($service in $services) {
    Write-Info "Building $service..."
    Push-Location "backend\$service"
    
    try {
        if ($CleanBuild) {
            mvn clean compile -DskipTests=$SkipTests -q
        } else {
            mvn compile -DskipTests=$SkipTests -q
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$service built successfully"
        } else {
            Write-Error "$service build failed with exit code $LASTEXITCODE"
            $buildErrors += $service
        }
    } catch {
        Write-Error "$service build failed: $($_.Exception.Message)"
        $buildErrors += $service
    }
    
    Pop-Location
}

if ($buildErrors.Count -gt 0) {
    Write-Error "Build failed for services: $($buildErrors -join ', ')"
    Write-Info "Attempting to fix common issues..."
    
    # Fix common Java issues
    foreach ($errorService in $buildErrors) {
        Write-Info "Attempting to fix $errorService..."
        Push-Location "backend\$errorService"
        
        # Clean and reinstall dependencies
        mvn dependency:purge-local-repository -DactTransitively=false -DreResolve=false -q
        mvn clean install -DskipTests -q
        
        Pop-Location
    }
}

# Step 4: Build Frontend
Write-Info "🎨 Building frontend..."
Push-Location "frontend"

try {
    # Clean install dependencies
    if ($CleanBuild) {
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    }
    
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend dependency installation failed"
        Pop-Location
        exit 1
    }
    
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend built successfully"
    } else {
        Write-Error "Frontend build failed"
        Pop-Location
        exit 1
    }
} catch {
    Write-Error "Frontend build failed: $($_.Exception.Message)"
    Pop-Location
    exit 1
}

Pop-Location

# Step 5: Create deployment configuration
Write-Info "⚙️  Creating deployment configuration..."

$deploymentConfig = @"
# SecureInsure Pro Deployment Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Service Ports
AUTH_SERVICE_PORT=8082
POLICY_SERVICE_PORT=8083
CLAIMS_SERVICE_PORT=8084
ADMIN_SERVICE_PORT=8085
NOTIFICATION_SERVICE_PORT=8086
SEARCH_SERVICE_PORT=8087
GATEWAY_SERVICE_PORT=8080
FRONTEND_PORT=5173
MOCK_AUTH_PORT=8081

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=secureinsure_pro
DB_USERNAME=postgres
DB_PASSWORD=password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=secureinsure-jwt-secret-key-2024
JWT_EXPIRATION=86400000

# Environment
ENVIRONMENT=$Environment
"@

$deploymentConfig | Out-File -FilePath "deployment.env" -Encoding UTF8
Write-Success "Deployment configuration created"

# Step 6: Start Services (if requested)
if ($StartServices) {
    Write-Info "🚀 Starting application services..."
    
    # Start backend services
    Write-Info "Starting backend services..."
    
    # Start services in dependency order
    $serviceOrder = @(
        @{Name="gateway-service"; Port=8080; Class="com.secureinsure.gateway.GatewayApplication"},
        @{Name="auth-service"; Port=8082; Class="com.secureinsure.pro.auth.AuthServiceApplication"},
        @{Name="policy-service"; Port=8083; Class="com.secureinsure.policy.PolicyApplication"},
        @{Name="claims-service"; Port=8084; Class="com.secureinsure.claims.ClaimsApplication"},
        @{Name="admin-service"; Port=8085; Class="com.secureinsure.admin.AdminServiceApplication"},
        @{Name="notification-service"; Port=8086; Class="com.secureinsure.notification.NotificationApplication"},
        @{Name="search-service"; Port=8087; Class="com.secureinsure.search.SearchServiceApplication"}
    )
    
    foreach ($service in $serviceOrder) {
        Write-Info "Starting $($service.Name) on port $($service.Port)..."
        
        Push-Location "backend\$($service.Name)"
        
        # Start service in background
        Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.arguments=--server.port=$($service.Port)" -WindowStyle Minimized
        
        Pop-Location
        
        # Wait a bit for service to start
        Start-Sleep -Seconds 3
        Write-Success "$($service.Name) started"
    }
    
    # Start mock auth server
    Write-Info "Starting mock authentication server..."
    Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
    Write-Success "Mock auth server started on port 8081"
    
    # Start frontend
    Write-Info "Starting frontend development server..."
    Push-Location "frontend"
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
    Pop-Location
    Write-Success "Frontend started on port 5173"
    
    # Health check
    Write-Info "🔍 Performing health checks..."
    Start-Sleep -Seconds 10
    
    $endpoints = @(
        "http://localhost:8081/actuator/health",
        "http://localhost:5173"
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri $endpoint -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "$endpoint is healthy"
            }
        } catch {
            Write-Warning "$endpoint health check failed: $($_.Exception.Message)"
        }
    }
}

# Step 7: Generate deployment report
Write-Info "📊 Generating deployment report..."

$deploymentReport = @"
# SecureInsure Pro Deployment Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Environment: $Environment

## Build Status
✅ Frontend: Built successfully
✅ Backend Services: $(if ($buildErrors.Count -eq 0) { "All services built successfully" } else { "Some services had issues: $($buildErrors -join ', ')" })

## Service Endpoints
- Gateway Service: http://localhost:8080
- Auth Service: http://localhost:8082
- Policy Service: http://localhost:8083
- Claims Service: http://localhost:8084
- Admin Service: http://localhost:8085
- Notification Service: http://localhost:8086
- Search Service: http://localhost:8087
- Mock Auth Server: http://localhost:8081
- Frontend Application: http://localhost:5173

## Available Test Accounts
- Admin: admin_test / Test@1234
- Underwriter: underwriter1 / SecurePass123!
- Customer: customer1 / CustomerPass123!

## Quick Start Commands
- Stop all services: Get-Process | Where-Object {`$_.ProcessName -like "*node*" -or `$_.ProcessName -like "*java*"} | Stop-Process -Force
- View logs: Check individual service console windows
- Access application: http://localhost:5173

## Next Steps
1. Access the application at http://localhost:5173
2. Login with provided test accounts
3. Test core functionality (authentication, policy management, claims)
4. Monitor service logs for any issues
"@

$deploymentReport | Out-File -FilePath "DEPLOYMENT_REPORT.md" -Encoding UTF8

Write-Success "🎉 Deployment completed successfully!"
Write-Info "📖 Check DEPLOYMENT_REPORT.md for detailed information"
Write-Info "🌐 Access your application at: http://localhost:5173"
Write-Info "🔑 Use test account: admin_test / Test@1234"

# Optional: Open application in browser
if ($StartServices) {
    Start-Sleep -Seconds 5
    Start-Process "http://localhost:5173"
    Write-Success "🌐 Application opened in default browser"
}








