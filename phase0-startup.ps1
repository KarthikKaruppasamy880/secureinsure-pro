# SecureInsure Pro - PHASE 0 Startup Script
# This script starts the minimal services needed for PHASE 0 testing

Write-Host "SecureInsure Pro - PHASE 0 Startup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
# Start only essential infrastructure
docker-compose up -d postgres redis

Write-Host "Waiting for infrastructure to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "" -ForegroundColor White
Write-Host "PHASE 0 TESTING SETUP:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White

Write-Host "1. Start Backend (Gateway Service):" -ForegroundColor Green
Write-Host "   cd backend\gateway-service" -ForegroundColor White
Write-Host "   mvn spring-boot:run -Dspring.profiles.active=local" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "2. Start Frontend:" -ForegroundColor Green
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "3. Test Health Endpoints:" -ForegroundColor Green
Write-Host "   Backend Health: http://localhost:8080/health" -ForegroundColor White
Write-Host "   Backend Ready:  http://localhost:8080/ready" -ForegroundColor White
Write-Host "   Backend Version: http://localhost:8080/version" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "4. Expected URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "Infrastructure is ready. Start the services manually as shown above." -ForegroundColor Green
Write-Host "After starting both services, test the health endpoints to confirm they're working." -ForegroundColor Yellow
