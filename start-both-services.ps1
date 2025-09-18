# SecureInsure Pro - Start Both Services
Write-Host "Starting SecureInsure Pro Services..." -ForegroundColor Green

# Kill any existing processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Stopped existing Node processes" -ForegroundColor Green
} catch {
    Write-Host "No existing processes to stop" -ForegroundColor Cyan
}

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
Start-Sleep -Seconds 5

# Test Backend
try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 5
    Write-Host "✅ Backend running: $($backendHealth.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend failed to start" -ForegroundColor Red
}

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Set-Location "frontend"
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
Set-Location ".."
Start-Sleep -Seconds 20

# Test Frontend
try {
    $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Frontend running: Status $($frontendHealth.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend still starting or failed" -ForegroundColor Red
}

# Test API calls
Write-Host "`nTesting API calls..." -ForegroundColor Yellow

# Test Cases API
try {
    $casesResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/cases" -TimeoutSec 5
    Write-Host "✅ Cases API working: $($casesResponse.data.Count) cases" -ForegroundColor Green
} catch {
    Write-Host "❌ Cases API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Login API
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Login API working: User $($loginResponse.username)" -ForegroundColor Green
} catch {
    Write-Host "❌ Login API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Services Status:" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8081" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Login: admin / admin123" -ForegroundColor White

# Open browser
try {
    Start-Process "http://localhost:3000"
    Write-Host "✅ Browser opened" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Please manually open: http://localhost:3000" -ForegroundColor Yellow
}

Write-Host "`n✅ SecureInsure Pro is ready!" -ForegroundColor Green
