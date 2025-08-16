# SecureInsure Pro Local Startup Script
# This script starts the application locally to bypass Docker SSL issues

Write-Host "Starting SecureInsure Pro Application Locally" -ForegroundColor Green
Write-Host "=============================================="

Write-Host "Starting infrastructure services with Docker..." -ForegroundColor Yellow
# Start only infrastructure services
docker-compose up -d postgres redis elasticsearch

Write-Host "Waiting for infrastructure to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "Application should be available at:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   API Gateway: http://localhost:8080"
Write-Host "   Individual services: 8081-8086"

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Open 7 separate PowerShell windows"
Write-Host "2. In each window, run one of these commands:"
Write-Host ""
Write-Host "Window 1 (Gateway):"
Write-Host "cd backend\gateway-service && mvn spring-boot:run -Dspring.profiles.active=local"
Write-Host ""
Write-Host "Window 2 (Auth):"
Write-Host "cd backend\auth-service && mvn spring-boot:run -Dspring.profiles.active=local"
Write-Host ""
Write-Host "Window 3 (Policy):"
Write-Host "cd backend\policy-service && mvn spring-boot:run -Dspring.profiles.active=local"
Write-Host ""
Write-Host "Window 4 (Claims):"
Write-Host "cd backend\claims-service && mvn spring-boot:run -Dspring.profiles.active=local"
Write-Host ""
Write-Host "Window 5 (Notification):"
Write-Host "cd backend\notification-service && mvn spring-boot:run -Dspring.profiles.active=local"
Write-Host ""
Write-Host "Window 6 (Admin):"
Write-Host "cd backend\admin-service && mvn spring-boot:run -Dspring.profiles.active=local"
Write-Host ""
Write-Host "Window 7 (Search):"
Write-Host "cd backend\search-service && mvn spring-boot:run -Dspring.profiles.active=local"
Write-Host ""
Write-Host "Window 8 (Frontend):"
Write-Host "cd frontend && npm start"
Write-Host ""
Write-Host "Infrastructure is ready. Start the services manually in separate windows."