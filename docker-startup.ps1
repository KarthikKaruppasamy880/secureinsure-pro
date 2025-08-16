# SecureInsure Pro Docker Startup Script (PowerShell)
# This script builds and starts the complete application stack

Write-Host "🚀 Starting SecureInsure Pro Application Stack" -ForegroundColor Green
Write-Host "================================================"

# Clean up any existing containers and volumes
Write-Host "📦 Cleaning up existing containers and volumes..." -ForegroundColor Yellow
docker-compose down -v
docker system prune -f

Write-Host "🔧 Building and starting infrastructure services..." -ForegroundColor Yellow
# Start infrastructure services first
docker-compose up -d postgres redis elasticsearch

Write-Host "⏳ Waiting for infrastructure to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "🏗️ Building and starting all services..." -ForegroundColor Yellow
# Build and start all services
docker-compose up --build -d

Write-Host "📊 Checking service status..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
docker-compose ps

Write-Host "🔍 Monitoring logs for startup..." -ForegroundColor Yellow
Write-Host "You can monitor logs with: docker-compose logs -f"

Write-Host "✅ Application should be available at:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   API Gateway: http://localhost:8080"
Write-Host "   Swagger UI: http://localhost:8080/swagger-ui.html"

Write-Host "🔄 Use 'docker-compose logs -f [service-name]' to monitor specific services"
Write-Host "🛑 Use 'docker-compose down' to stop all services"