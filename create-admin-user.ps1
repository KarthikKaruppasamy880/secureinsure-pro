# Create Admin User for SecureInsure Pro
Write-Host "=== SecureInsure Pro Admin User Creation ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:8081"

# Check Auth Service Health
Write-Host "`nChecking Auth Service at $baseUrl..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -TimeoutSec 10
    Write-Host "✅ Auth Service is RUNNING!" -ForegroundColor Green
    Write-Host "Status: $($healthResponse.status)"
} catch {
    Write-Host "❌ Auth Service is NOT RUNNING" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "`nFALLBACK INSTRUCTIONS:" -ForegroundColor Yellow
    Write-Host "1. Start auth service: cd backend\auth-service && mvn spring-boot:run -Dspring.profiles.active=local"
    Write-Host "2. Wait 2-3 minutes for startup"
    Write-Host "3. Verify: netstat -an | findstr :8081"
    
    # Show raw API calls for when service is ready
    Write-Host "`n=== RAW API CALLS (Use when auth service is ready) ===" -ForegroundColor Magenta
    
    Write-Host "`n1. CREATE ADMIN USER:"
    Write-Host @"
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_test",
    "email": "admin_test@secureinsure.com", 
    "password": "Test@1234",
    "firstName": "Admin",
    "lastName": "Test",
    "phoneNumber": "+1234567890",
    "userType": "ADMIN"
  }'
"@

    Write-Host "`n2. LOGIN WITH ADMIN USER:"
    Write-Host @"
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_test",
    "password": "Test@1234",
    "rememberMe": false
  }'
"@
    exit 1
}

# Create Admin User
Write-Host "`n=== Creating Admin User ===" -ForegroundColor Cyan

$adminUser = @{
    username = "admin_test"
    email = "admin_test@secureinsure.com"
    password = "Test@1234"
    firstName = "Admin"
    lastName = "Test"
    phoneNumber = "+1234567890"
    userType = "ADMIN"
} | ConvertTo-Json

Write-Host "Registration Request Body:"
Write-Host $adminUser

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method POST -Body $adminUser -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "`n✅ ADMIN USER CREATED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.id)"
    Write-Host "Username: $($registerResponse.username)"
    Write-Host "Email: $($registerResponse.email)"
    Write-Host "User Type: $($registerResponse.userType)"
    
} catch {
    Write-Host "`n⚠️ User creation response:" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "✅ User already exists - proceeding to login test" -ForegroundColor Green
    }
}

# Test Login
Write-Host "`n=== Testing Admin Login ===" -ForegroundColor Cyan

$loginRequest = @{
    username = "admin_test"
    password = "Test@1234"
    rememberMe = $false
} | ConvertTo-Json

Write-Host "Login Request Body:"
Write-Host $loginRequest

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method POST -Body $loginRequest -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "`n🎉 ADMIN LOGIN SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.accessToken.Substring(0, 50))..."
    Write-Host "User ID: $($loginResponse.userId)"
    Write-Host "Username: $($loginResponse.username)"
    Write-Host "User Type: $($loginResponse.userType)"
    Write-Host "Roles: $($loginResponse.roles -join ', ')"
    
    Write-Host "`n✅ ADMIN USER READY!" -ForegroundColor Green
    Write-Host "Use these credentials in the frontend:"
    Write-Host "Username: admin_test"
    Write-Host "Password: Test@1234"
    
} catch {
    Write-Host "`n❌ LOGIN FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}

Write-Host "`n=== Admin User Setup Complete ===" -ForegroundColor Cyan