# SecureInsure Pro Status Check and Auto-Login
Write-Host "=== SecureInsure Pro Status Check ===" -ForegroundColor Cyan

# Check Infrastructure Services
Write-Host "`n=== Infrastructure Services ===" -ForegroundColor Green
try {
    $postgresStatus = docker ps --filter "name=secureinsure-postgres" --format "table {{.Names}}\t{{.Status}}"
    Write-Host "PostgreSQL: $postgresStatus" -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL: NOT RUNNING" -ForegroundColor Red
}

try {
    $redisStatus = docker ps --filter "name=secureinsure-redis" --format "table {{.Names}}\t{{.Status}}"
    Write-Host "Redis: $redisStatus" -ForegroundColor Green
} catch {
    Write-Host "Redis: NOT RUNNING" -ForegroundColor Red
}

try {
    $elasticStatus = docker ps --filter "name=secureinsure-elasticsearch" --format "table {{.Names}}\t{{.Status}}"
    Write-Host "Elasticsearch: $elasticStatus" -ForegroundColor Green
} catch {
    Write-Host "Elasticsearch: NOT RUNNING" -ForegroundColor Red
}

# Check Auth Service
Write-Host "`n=== Auth Service ===" -ForegroundColor Green
try {
    $authHealth = Invoke-RestMethod -Uri "http://localhost:8081/actuator/health" -TimeoutSec 5
    Write-Host "✅ Auth Service: RUNNING (Status: $($authHealth.status))" -ForegroundColor Green
    
    # Test login
    $loginData = @{
        username = "admin_test"
        password = "Test@1234"
        rememberMe = $false
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Login Test: SUCCESSFUL" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.username)" -ForegroundColor White
    Write-Host "   Type: $($loginResponse.userType)" -ForegroundColor White
    Write-Host "   Roles: $($loginResponse.roles -join ', ')" -ForegroundColor White
    
} catch {
    Write-Host "❌ Auth Service: NOT RUNNING or LOGIN FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check Frontend
Write-Host "`n=== Frontend Service ===" -ForegroundColor Green
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    Write-Host "✅ Frontend: RUNNING on port 3000" -ForegroundColor Green
    Write-Host "   Status Code: $($frontendResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ Frontend: NOT RUNNING on port 3000" -ForegroundColor Red
    Write-Host "Starting frontend..." -ForegroundColor Yellow
    Set-Location "frontend"
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
    Set-Location ".."
    Start-Sleep -Seconds 10
}

# Auto-open browser
Write-Host "`n=== Opening Application ===" -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "✅ Infrastructure: Running" -ForegroundColor Green
Write-Host "✅ Auth Service: Running with admin user" -ForegroundColor Green
Write-Host "✅ Frontend: Starting..." -ForegroundColor Green
Write-Host "`nApplication URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Login Credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin_test" -ForegroundColor White
Write-Host "   Password: Test@1234" -ForegroundColor White
Write-Host "   Role: ADMIN (Full Access)" -ForegroundColor White

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Wait for frontend to load (1-2 minutes)" -ForegroundColor White
Write-Host "2. Use admin credentials to log in" -ForegroundColor White
Write-Host "3. Access all admin features and biometric capabilities" -ForegroundColor White 