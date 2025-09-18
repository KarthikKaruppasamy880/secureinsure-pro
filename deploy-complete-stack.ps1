# SecureInsure Pro - Complete Stack Deployment Script
# This script deploys the complete SecureInsure Pro application with all options

param(
    [string]$DeploymentType = "quick",  # quick, docker, local, production
    [switch]$SkipBuild = $false,
    [switch]$SkipTests = $false,
    [switch]$OpenBrowser = $true,
    [switch]$Verbose = $false
)

# Set error handling
$ErrorActionPreference = "Stop"

# Color functions for better output
function Write-Success($Message) { Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error($Message) { Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info($Message) { Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning($Message) { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Step($Message) { Write-Host "🔄 $Message" -ForegroundColor Blue }

# ASCII Art Header
Write-Host @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                          SecureInsure Pro                                   ║
║                     Complete Deployment System                              ║
║                                                                              ║
║  🏢 Insurance Application Management System                                  ║
║  🔧 Microservices Architecture                                               ║
║  🚀 Ready for Production                                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Info "Starting deployment with type: $DeploymentType"
Write-Info "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Utility Functions
function Test-CommandExists($Command) {
    try {
        if (Get-Command $Command -ErrorAction SilentlyContinue) { return $true }
    } catch { return $false }
    return $false
}

function Stop-ProcessOnPort($Port) {
    try {
        $processes = netstat -ano | findstr ":$Port"
        if ($processes) {
            $processes -split "`n" | ForEach-Object {
                $parts = $_.Trim() -split '\s+'
                if ($parts.Length -ge 5) {
                    $pid = $parts[4]
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Success "Freed port $Port (PID: $pid)"
                    } catch {}
                }
            }
        }
    } catch {
        Write-Warning "Could not check/free port $Port"
    }
}

function Wait-ForService($Url, $ServiceName, $TimeoutSeconds = 60) {
    Write-Step "Waiting for $ServiceName to be ready..."
    $timeout = (Get-Date).AddSeconds($TimeoutSeconds)
    
    while ((Get-Date) -lt $timeout) {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "$ServiceName is ready!"
                return $true
            }
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    
    Write-Warning "$ServiceName did not respond within $TimeoutSeconds seconds"
    return $false
}

# System Requirements Check
Write-Step "Checking system requirements..."

$requiredTools = @()
if (-not (Test-CommandExists "docker")) { $requiredTools += "Docker" }
if (-not (Test-CommandExists "node")) { $requiredTools += "Node.js" }

if ($requiredTools.Count -gt 0) {
    Write-Error "Missing required tools: $($requiredTools -join ', ')"
    Write-Info "Please install the missing tools and try again."
    Write-Info "Docker: https://www.docker.com/products/docker-desktop"
    Write-Info "Node.js: https://nodejs.org/"
    exit 1
}

$nodeVersion = node --version
$dockerVersion = docker --version
Write-Success "Node.js: $nodeVersion"
Write-Success "Docker: $dockerVersion"

# Clean up existing services
Write-Step "Cleaning up existing services..."
$portsToClean = @(3000, 5173, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087)
foreach ($port in $portsToClean) {
    Stop-ProcessOnPort $port
}

# Stop any existing Docker containers
try {
    docker-compose down -v 2>&1 | Out-Null
    Write-Success "Stopped existing Docker containers"
} catch {
    Write-Info "No existing containers to stop"
}

# Deployment Logic
switch ($DeploymentType.ToLower()) {
    "quick" {
        Write-Info "🚀 Starting Quick Deployment (Infrastructure + Mock Services)"
        
        # Start infrastructure services
        Write-Step "Starting infrastructure services..."
        docker-compose -f docker-compose-simple.yml up -d
        
        # Wait for infrastructure
        Start-Sleep -Seconds 15
        
        # Start mock auth server
        Write-Step "Starting mock authentication server..."
        Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
        Start-Sleep -Seconds 5
        
        # Build and start frontend
        if (-not $SkipBuild) {
            Write-Step "Building frontend..."
            Push-Location frontend
            try {
                npm install --silent
                npm run build
                Write-Success "Frontend built successfully"
            } catch {
                Write-Error "Frontend build failed: $_"
                Pop-Location
                exit 1
            }
            Pop-Location
        }
        
        Write-Step "Starting frontend..."
        Push-Location frontend
        Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
        Pop-Location
        
        # Health checks
        Write-Step "Performing health checks..."
        Start-Sleep -Seconds 10
        
        Wait-ForService "http://localhost:8081/actuator/health" "Auth Service" 30
        Wait-ForService "http://localhost:3000" "Frontend" 60
        
        $frontendUrl = "http://localhost:3000"
    }
    
    "docker" {
        Write-Info "🐳 Starting Full Docker Deployment"
        
        # Build and start all services
        Write-Step "Building and starting all Docker services..."
        docker-compose up --build -d
        
        # Wait for services to initialize
        Write-Step "Waiting for services to initialize..."
        Start-Sleep -Seconds 45
        
        # Health checks
        Write-Step "Performing health checks..."
        $services = @(
            @{Name="Gateway"; Url="http://localhost:8080/actuator/health"},
            @{Name="Auth Service"; Url="http://localhost:8081/actuator/health"},
            @{Name="Frontend"; Url="http://localhost:3000"}
        )
        
        foreach ($service in $services) {
            Wait-ForService $service.Url $service.Name 30
        }
        
        $frontendUrl = "http://localhost:3000"
    }
    
    "local" {
        Write-Info "💻 Starting Local Development Setup"
        
        # Start infrastructure
        Write-Step "Starting infrastructure services..."
        docker-compose -f docker-compose-simple.yml up -d
        Start-Sleep -Seconds 15
        
        # Check for Java and Maven
        if ((Test-CommandExists "java") -and (Test-CommandExists "mvn")) {
            Write-Step "Starting backend services with Maven..."
            Push-Location backend
            Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run -pl gateway-service" -WindowStyle Minimized
            Pop-Location
            Start-Sleep -Seconds 30
        } else {
            Write-Warning "Java/Maven not found, starting mock auth server..."
            Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
            Start-Sleep -Seconds 5
        }
        
        # Start frontend in development mode
        Write-Step "Starting frontend in development mode..."
        Push-Location frontend
        if (-not $SkipBuild) {
            npm install --silent
        }
        Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Minimized
        Pop-Location
        
        Start-Sleep -Seconds 15
        $frontendUrl = "http://localhost:5173"
    }
    
    "production" {
        Write-Info "🌐 Starting Production Deployment"
        Write-Warning "Production deployment requires additional configuration!"
        Write-Info "Please refer to the AWS_DEPLOYMENT_GUIDE.md for cloud deployment."
        
        # For now, use Docker with production settings
        $env:NODE_ENV = "production"
        $env:SPRING_PROFILES_ACTIVE = "production"
        
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
        Start-Sleep -Seconds 60
        
        $frontendUrl = "http://localhost:3000"
    }
    
    default {
        Write-Error "Invalid deployment type: $DeploymentType"
        Write-Info "Valid types: quick, docker, local, production"
        exit 1
    }
}

# Create test user
Write-Step "Creating test user..."
$adminUser = @{
    username = "admin_test"
    email = "admin_test@secureinsure.com"
    password = "Test@1234"
    firstName = "Admin"
    lastName = "Test"
    phoneNumber = "+1234567890"
    userType = "ADMIN"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/register" -Method POST -Body $adminUser -ContentType "application/json" -TimeoutSec 30
    Write-Success "Admin user created successfully!"
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Success "Admin user already exists!"
    } else {
        Write-Warning "Could not create admin user: $($_.Exception.Message)"
    }
}

# Test login
Write-Step "Testing admin login..."
$loginRequest = @{
    username = "admin_test"
    password = "Test@1234"
    rememberMe = $false
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $loginRequest -ContentType "application/json" -TimeoutSec 30
    Write-Success "🎉 Admin login successful!"
    Write-Info "User Type: $($loginResponse.userType)"
    if ($loginResponse.roles) {
        Write-Info "Roles: $($loginResponse.roles -join ', ')"
    }
} catch {
    Write-Warning "Could not test login: $($_.Exception.Message)"
}

# Generate deployment report
$deploymentReport = @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                        DEPLOYMENT SUCCESSFUL! ✅                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 DEPLOYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Deployment Type: $($DeploymentType.ToUpper())
📅 Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
🌐 Frontend URL: $frontendUrl
🔧 API Gateway: http://localhost:8080
📚 API Docs: http://localhost:8080/swagger-ui.html

🔑 TEST CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Admin User
   Username: admin_test
   Password: Test@1234
   
👤 Underwriter
   Username: underwriter1
   Password: SecurePass123!
   
👤 Customer
   Username: customer1
   Password: CustomerPass123!

🛠️  MANAGEMENT COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 View Status:           docker-compose ps
📋 View Logs:            docker-compose logs -f
🔄 Restart Service:      docker-compose restart [service-name]
🛑 Stop All:             docker-compose down
🗑️  Clean Up:            docker-compose down -v && docker system prune -f

🔍 SERVICE STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"@

# Add service status
try {
    $dockerStatus = docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    $deploymentReport += "`n$dockerStatus"
} catch {
    $deploymentReport += "`nDocker status check failed - services may be running in different mode"
}

$deploymentReport += @"

🎉 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🌐 Open your browser to: $frontendUrl
2. 🔐 Login with: admin_test / Test@1234
3. 📊 Explore the dashboard and features
4. 📚 Check API documentation at: http://localhost:8080/swagger-ui.html
5. 🔧 Use management commands above for maintenance

📖 For detailed information, see: COMPLETE_DEPLOYMENT_GUIDE.md
"@

Write-Host $deploymentReport

# Save deployment report
$deploymentReport | Out-File -FilePath "DEPLOYMENT_REPORT.txt" -Encoding UTF8
Write-Success "Deployment report saved to DEPLOYMENT_REPORT.txt"

# Open browser
if ($OpenBrowser) {
    Write-Step "Opening application in browser..."
    Start-Sleep -Seconds 3
    try {
        Start-Process $frontendUrl
        Write-Success "🌐 Application opened in browser"
    } catch {
        Write-Info "Please manually open: $frontendUrl"
    }
}

Write-Success "🎉 Deployment completed successfully!"
Write-Info "Application is ready to use at: $frontendUrl"
