# SecureInsure Pro - Final System Test
Write-Host "Testing SecureInsure Pro System" -ForegroundColor Cyan

# Test Backend
Write-Host "`nTesting Backend..." -ForegroundColor Yellow
try {
    $backend = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 5
    Write-Host "SUCCESS: Backend running ($($backend.status))" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Backend not responding" -ForegroundColor Red
}

# Test Frontend
Write-Host "`nTesting Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "SUCCESS: Frontend running (Status: $($frontend.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Frontend not responding" -ForegroundColor Red
}

# Test Cases API
Write-Host "`nTesting Cases API..." -ForegroundColor Yellow
try {
    $cases = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/cases" -TimeoutSec 5
    Write-Host "SUCCESS: Cases API working ($($cases.data.Count) cases)" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Cases API error" -ForegroundColor Red
}

# Test Login
Write-Host "`nTesting Login..." -ForegroundColor Yellow
try {
    $loginData = @{username="admin"; password="admin123"} | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 10
    Write-Host "SUCCESS: Login working (User: $($login.username))" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Login error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nSYSTEM STATUS" -ForegroundColor Cyan
Write-Host "============="
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8081" -ForegroundColor Green
Write-Host "Login:    admin / admin123" -ForegroundColor Yellow

Start-Process "http://localhost:3000"
Write-Host "`nSecureInsure Pro is ready!" -ForegroundColor Green
