# Direct API Testing for Mock Auth Server

Write-Host "=== Testing Mock Auth Server Directly ===" -ForegroundColor Cyan

# Test login with pre-loaded admin user
$loginData = @{
    username = "admin_test"
    password = "Test@1234"
    rememberMe = $false
} | ConvertTo-Json

Write-Host "`nTesting direct login API call..." -ForegroundColor Yellow
Write-Host "POST http://localhost:8081/api/v1/auth/login"
Write-Host "Body: $loginData"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    Write-Host "`n🎉 SUCCESS! Admin login works!" -ForegroundColor Green
    Write-Host "Access Token: $($response.accessToken.Substring(0, 50))..."
    Write-Host "User ID: $($response.userId)"
    Write-Host "Username: $($response.username)"
    Write-Host "User Type: $($response.userType)"
    Write-Host "Roles: $($response.roles -join ', ')"
    Write-Host "Permissions: $($response.permissions -join ', ')"
    
    Write-Host "`n✅ READY FOR FRONTEND LOGIN!" -ForegroundColor Green
    Write-Host "Use these credentials:"
    Write-Host "Username: admin_test"
    Write-Host "Password: Test@1234"
    
} catch {
    Write-Host "`n❌ Login failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    
    # Try with other pre-loaded users
    Write-Host "`nTrying other pre-loaded users..." -ForegroundColor Yellow
    
    $testUsers = @(
        @{username="underwriter1"; password="SecurePass123!"},
        @{username="customer1"; password="CustomerPass123!"}
    )
    
    foreach ($user in $testUsers) {
        $testLogin = @{
            username = $user.username
            password = $user.password
            rememberMe = $false
        } | ConvertTo-Json
        
        try {
            $testResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $testLogin -ContentType "application/json"
            Write-Host "✅ $($user.username) login works!" -ForegroundColor Green
            break
        } catch {
            Write-Host "❌ $($user.username) login failed" -ForegroundColor Red
        }
    }
}