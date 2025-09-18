# SecureInsure Pro - Simple Startup Script
# One-click startup for the complete application

Write-Host @"
🏢 SecureInsure Pro - Insurance Management System
🚀 Starting application... Please wait.
"@ -ForegroundColor Green

# Clean up any existing processes
Write-Host "🔧 Cleaning up existing processes..." -ForegroundColor Yellow
$ports = @(3000, 5173, 8080, 8081)
foreach ($port in $ports) {
    $processes = netstat -ano | findstr ":$port"
    if ($processes) {
        $processes -split "`n" | ForEach-Object {
            $parts = $_.Trim() -split '\s+'
            if ($parts.Length -ge 5) {
                Stop-Process -Id $parts[4] -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# Start infrastructure
Write-Host "🗄️  Starting database and cache..." -ForegroundColor Yellow
docker-compose -f docker-compose-simple.yml up -d

# Wait for infrastructure
Write-Host "⏳ Waiting for infrastructure to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Start mock auth server
Write-Host "🔐 Starting authentication service..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
Start-Sleep -Seconds 5

# Install frontend dependencies and start
Write-Host "🎨 Starting frontend application..." -ForegroundColor Yellow
Push-Location frontend
npm install --silent
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
Pop-Location

# Wait for services
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Health checks
Write-Host "🔍 Checking service health..." -ForegroundColor Yellow
try {
    $authCheck = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Auth service is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Auth service health check failed" -ForegroundColor Yellow
}

try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✅ Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend may still be starting..." -ForegroundColor Yellow
}

# Create admin user
Write-Host "👤 Creating admin user..." -ForegroundColor Yellow
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
    Write-Host "✅ Admin user created!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "✅ Admin user already exists!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not create admin user" -ForegroundColor Yellow
    }
}

# Success message
Write-Host @"

🎉 SecureInsure Pro is now running!

🌐 Application: http://localhost:3000
🔧 API Gateway: http://localhost:8080
📚 API Docs: http://localhost:8080/swagger-ui.html

🔑 Login Credentials:
   Username: admin_test
   Password: Test@1234

🛠️  Management Commands:
   Stop all: docker-compose down
   View logs: docker-compose logs -f
   Restart: ./start-secureinsure.ps1

"@ -ForegroundColor Cyan

# Open browser
Start-Sleep -Seconds 2
try {
    Start-Process "http://localhost:3000"
    Write-Host "🌐 Opening application in browser..." -ForegroundColor Green
} catch {
    Write-Host "Please manually open: http://localhost:3000" -ForegroundColor Yellow
}

Write-Host "✅ Startup complete! Enjoy using SecureInsure Pro!" -ForegroundColor Green
