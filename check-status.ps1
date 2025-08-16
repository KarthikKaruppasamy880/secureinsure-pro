# Quick Status Check for SecureInsure Pro

Write-Host "=== SecureInsure Pro Status Check ===" -ForegroundColor Cyan

Write-Host "`nChecking Infrastructure..." -ForegroundColor Yellow
try {
    Write-Host "Infrastructure Status:" -ForegroundColor Green
    docker ps --filter "name=secureinsure"
} catch {
    Write-Host "Docker services check failed" -ForegroundColor Red
}

Write-Host "`nChecking Application Services..." -ForegroundColor Yellow

# Check frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5
    Write-Host "✅ Frontend (Port 3000): RUNNING" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend (Port 3000): NOT RESPONDING" -ForegroundColor Red
}

# Check gateway
try {
    $gatewayResponse = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Gateway (Port 8080): RUNNING" -ForegroundColor Green
} catch {
    Write-Host "❌ Gateway (Port 8080): NOT RESPONDING" -ForegroundColor Red
}

# Check auth service
try {
    $authResponse = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Auth Service (Port 8081): RUNNING" -ForegroundColor Green
} catch {
    Write-Host "❌ Auth Service (Port 8081): NOT RESPONDING" -ForegroundColor Red
}

Write-Host "`n=== ACTION REQUIRED ===" -ForegroundColor Yellow
Write-Host "🌐 OPEN YOUR BROWSER AND GO TO: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "If the page doesn't load, the services may still be starting up."
Write-Host "Services typically take 1-2 minutes to fully start."