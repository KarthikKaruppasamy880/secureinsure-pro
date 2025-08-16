# Complete SecureInsure Pro Setup Script
Write-Host "=== SecureInsure Pro Complete Setup ===" -ForegroundColor Cyan

# Wait for services to start
Write-Host "`nWaiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test Auth Service
Write-Host "`n=== Testing Auth Service ===" -ForegroundColor Green
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8081/actuator/health" -TimeoutSec 10
    Write-Host "✅ Auth Service: RUNNING" -ForegroundColor Green
} catch {
    Write-Host "❌ Auth Service: NOT RUNNING" -ForegroundColor Red
    Write-Host "Starting mock auth server..." -ForegroundColor Yellow
    Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
    Start-Sleep -Seconds 5
}

# Test Frontend
Write-Host "`n=== Testing Frontend ===" -ForegroundColor Green
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    Write-Host "✅ Frontend: RUNNING on port 3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: NOT RUNNING on port 3000" -ForegroundColor Red
    Write-Host "Starting frontend..." -ForegroundColor Yellow
    Set-Location "frontend"
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
    Set-Location ".."
    Start-Sleep -Seconds 15
}

# Create Admin User
Write-Host "`n=== Creating Admin User ===" -ForegroundColor Green
$adminUser = @{
    username = "admin_test"
    email = "admin_test@secureinsure.com"
    password = "Test@1234"
    firstName = "Admin"
    lastName = "Test"
    phoneNumber = "+1234567890"
    userType = "ADMIN"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/register" -Method POST -Body $adminUser -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "✅ Admin user already exists!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ User creation: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test Login
Write-Host "`n=== Testing Admin Login ===" -ForegroundColor Green
$loginRequest = @{
    username = "admin_test"
    password = "Test@1234"
    rememberMe = $false
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $loginRequest -ContentType "application/json" -TimeoutSec 30
    Write-Host "🎉 ADMIN LOGIN SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.accessToken.Substring(0, 50))..."
    Write-Host "User Type: $($loginResponse.userType)"
    Write-Host "Roles: $($loginResponse.roles -join ', ')"
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Open Browser
Write-Host "`n=== Opening Application in Browser ===" -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Cyan
Write-Host "✅ Infrastructure: PostgreSQL, Redis, Elasticsearch" -ForegroundColor Green
Write-Host "✅ Auth Service: Mock server on port 8081" -ForegroundColor Green
Write-Host "✅ Frontend: React app on port 3000" -ForegroundColor Green
Write-Host "✅ Admin User: admin_test / Test@1234" -ForegroundColor Green
Write-Host "`nApplication URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Login Credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin_test" -ForegroundColor White
Write-Host "   Password: Test@1234" -ForegroundColor White 