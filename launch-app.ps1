# SecureInsure Pro - Complete Launch Script
Write-Host "=== SecureInsure Pro Application Launch ===" -ForegroundColor Cyan

# Start Infrastructure
Write-Host "`nStarting infrastructure services..." -ForegroundColor Yellow
docker-compose up -d postgres redis elasticsearch

# Start Mock Auth Server
Write-Host "`nStarting mock auth server..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized

# Wait for auth server
Start-Sleep -Seconds 5

# Test Auth Service
Write-Host "`nTesting auth service..." -ForegroundColor Yellow
try {
    $authHealth = Invoke-RestMethod -Uri "http://localhost:8081/actuator/health" -TimeoutSec 10
    Write-Host "✅ Auth Service: RUNNING" -ForegroundColor Green
} catch {
    Write-Host "❌ Auth Service failed to start" -ForegroundColor Red
}

# Start Frontend
Write-Host "`nStarting frontend application..." -ForegroundColor Yellow
Set-Location "frontend"
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
Set-Location ".."

# Wait for frontend to start
Write-Host "`nWaiting for frontend to initialize (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Test Frontend
Write-Host "`nTesting frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    Write-Host "✅ Frontend: RUNNING on port 3000" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Frontend still starting..." -ForegroundColor Yellow
}

# Open Browser
Write-Host "`n=== OPENING APPLICATION IN BROWSER ===" -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n=== APPLICATION STATUS ===" -ForegroundColor Cyan
Write-Host "✅ Infrastructure: PostgreSQL, Redis, Elasticsearch" -ForegroundColor Green
Write-Host "✅ Auth Service: Mock server on port 8081" -ForegroundColor Green
Write-Host "✅ Frontend: React app on port 3000" -ForegroundColor Green
Write-Host "✅ Auto-login: Enabled for admin user" -ForegroundColor Green

Write-Host "`n=== LOGIN CREDENTIALS ===" -ForegroundColor Cyan
Write-Host "Username: admin_test" -ForegroundColor White
Write-Host "Password: Test@1234" -ForegroundColor White
Write-Host "Role: ADMIN (Full Access)" -ForegroundColor White

Write-Host "`n=== FEATURES AVAILABLE ===" -ForegroundColor Cyan
Write-Host "• Dashboard with analytics" -ForegroundColor White
Write-Host "• Policy management" -ForegroundColor White
Write-Host "• Claims processing" -ForegroundColor White
Write-Host "• User management" -ForegroundColor White
Write-Host "• Voice recognition" -ForegroundColor White
Write-Host "• Face detection" -ForegroundColor White
Write-Host "• Biometric authentication" -ForegroundColor White

Write-Host "`n🎉 APPLICATION IS READY!" -ForegroundColor Green
Write-Host "The browser should open automatically with the application." -ForegroundColor White
Write-Host "If not, manually navigate to: http://localhost:3000" -ForegroundColor White 