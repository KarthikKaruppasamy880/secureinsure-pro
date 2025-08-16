# SecureInsure Pro Local Startup Script (PowerShell)
# This script starts the application locally to bypass Docker SSL issues

Write-Host "🚀 Starting SecureInsure Pro Application Locally" -ForegroundColor Green
Write-Host "=================================================="

Write-Host "🔧 Starting infrastructure services with Docker..." -ForegroundColor Yellow
# Start only infrastructure services
docker-compose up -d postgres redis elasticsearch

Write-Host "⏳ Waiting for infrastructure to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "🏗️ Starting backend services locally..." -ForegroundColor Yellow

# Navigate to backend directory
Set-Location backend

# Start services in separate terminal windows
Write-Host "Starting Gateway Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd gateway-service; mvn spring-boot:run -Dspring.profiles.active=local"

Start-Sleep -Seconds 5

Write-Host "Starting Auth Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd auth-service; mvn spring-boot:run -Dspring.profiles.active=local"

Start-Sleep -Seconds 5

Write-Host "Starting Policy Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd policy-service; mvn spring-boot:run -Dspring.profiles.active=local"

Start-Sleep -Seconds 5

Write-Host "Starting Claims Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd claims-service; mvn spring-boot:run -Dspring.profiles.active=local"

Start-Sleep -Seconds 5

Write-Host "Starting Notification Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd notification-service; mvn spring-boot:run -Dspring.profiles.active=local"

Start-Sleep -Seconds 5

Write-Host "Starting Admin Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin-service; mvn spring-boot:run -Dspring.profiles.active=local"

Start-Sleep -Seconds 5

Write-Host "Starting Search Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd search-service; mvn spring-boot:run -Dspring.profiles.active=local"

# Go back to root directory
Set-Location ..

Start-Sleep -Seconds 10

Write-Host "🌐 Starting Frontend..." -ForegroundColor Yellow
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Set-Location ..

Write-Host "✅ Application should be available at:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   API Gateway: http://localhost:8080"
Write-Host "   Individual services: 8081-8086"

Write-Host "All services are starting in separate windows. Check each window for status."
Write-Host "Close service windows to stop individual services"