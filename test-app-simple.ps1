# SecureInsure Pro - Simple Application Test
Write-Host "Testing SecureInsure Pro Application" -ForegroundColor Cyan
Write-Host "====================================="

# Test Backend Health
Write-Host "`nTesting Backend Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 5
    Write-Host "SUCCESS: Backend Health OK" -ForegroundColor Green
    Write-Host "Status: $($healthResponse.status)" -ForegroundColor White
} catch {
    Write-Host "FAILED: Backend Health" -ForegroundColor Red
}

# Test Frontend
Write-Host "`nTesting Frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "SUCCESS: Frontend Running" -ForegroundColor Green
    }
} catch {
    Write-Host "FAILED: Frontend" -ForegroundColor Red
}

# Test Cases API
Write-Host "`nTesting Cases API..." -ForegroundColor Yellow
try {
    $casesResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/cases" -TimeoutSec 5
    Write-Host "SUCCESS: Cases API OK" -ForegroundColor Green
    Write-Host "Cases found: $($casesResponse.data.Count)" -ForegroundColor White
} catch {
    Write-Host "FAILED: Cases API" -ForegroundColor Red
}

# Test Login
Write-Host "`nTesting Login..." -ForegroundColor Yellow
$loginRequest = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $loginRequest -ContentType "application/json" -TimeoutSec 10
    Write-Host "SUCCESS: Login works!" -ForegroundColor Green
    Write-Host "User: $($loginResponse.username)" -ForegroundColor White
    Write-Host "Roles: $($loginResponse.roles -join ', ')" -ForegroundColor White
} catch {
    Write-Host "FAILED: Login" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`nAPPLICATION STATUS" -ForegroundColor Cyan
Write-Host "=================="
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend: http://localhost:8081" -ForegroundColor Green
Write-Host "Login: admin / admin123" -ForegroundColor Yellow

# Open browser
Write-Host "`nOpening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`nSecureInsure Pro is ready!" -ForegroundColor Green
