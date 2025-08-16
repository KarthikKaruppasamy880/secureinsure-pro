# SecureInsure Pro API Testing Script
# Testing login for different user roles

Write-Host "=== SecureInsure Pro API Testing ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:8081"

# Function to make API calls with error handling
function Invoke-ApiCall {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{"Content-Type" = "application/json"},
        [string]$Body = $null
    )
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers -Body $Body
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers
        }
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
            ErrorDetails = $_.ErrorDetails.Message
        }
    }
}

# Test 1: Check if Auth Service is running
Write-Host "`n1. Testing Auth Service Health..." -ForegroundColor Yellow
$healthResult = Invoke-ApiCall -Url "$baseUrl/actuator/health"
if ($healthResult.Success) {
    Write-Host "✅ Auth Service is RUNNING" -ForegroundColor Green
    Write-Host "Response: $($healthResult.Data | ConvertTo-Json -Depth 3)"
} else {
    Write-Host "❌ Auth Service is NOT RUNNING" -ForegroundColor Red
    Write-Host "Error: $($healthResult.Error)"
    exit 1
}

# Test 2: Register test users for each role
Write-Host "`n2. Creating Test Users..." -ForegroundColor Yellow

$testUsers = @(
    @{
        Role = "UNDERWRITER"
        User = @{
            username = "underwriter1"
            email = "underwriter@secureinsure.com"
            password = "SecurePass123!"
            firstName = "John"
            lastName = "Underwriter"
            phoneNumber = "+1234567890"
            userType = "UNDERWRITER"
        }
    },
    @{
        Role = "ADMIN"
        User = @{
            username = "admin1"
            email = "admin@secureinsure.com"
            password = "AdminPass123!"
            firstName = "Jane"
            lastName = "Admin"
            phoneNumber = "+1234567891"
            userType = "ADMIN"
        }
    },
    @{
        Role = "CUSTOMER"
        User = @{
            username = "customer1"
            email = "customer@secureinsure.com"
            password = "CustomerPass123!"
            firstName = "Bob"
            lastName = "Customer"
            phoneNumber = "+1234567892"
            userType = "CUSTOMER"
        }
    },
    @{
        Role = "ADJUSTER"
        User = @{
            username = "adjuster1"
            email = "adjuster@secureinsure.com"
            password = "AdjusterPass123!"
            firstName = "Alice"
            lastName = "Adjuster"
            phoneNumber = "+1234567893"
            userType = "ADJUSTER"
        }
    }
)

foreach ($testUser in $testUsers) {
    Write-Host "`nRegistering $($testUser.Role) user..." -ForegroundColor Cyan
    
    $registerBody = $testUser.User | ConvertTo-Json
    $registerResult = Invoke-ApiCall -Url "$baseUrl/api/v1/auth/register" -Method "POST" -Body $registerBody
    
    if ($registerResult.Success) {
        Write-Host "✅ $($testUser.Role) user registered successfully" -ForegroundColor Green
        Write-Host "User ID: $($registerResult.Data.id)"
        Write-Host "Username: $($registerResult.Data.username)"
        Write-Host "User Type: $($registerResult.Data.userType)"
    } else {
        Write-Host "⚠️ $($testUser.Role) user registration failed" -ForegroundColor Yellow
        Write-Host "Error: $($registerResult.Error)"
        Write-Host "Details: $($registerResult.ErrorDetails)"
    }
}

# Test 3: Login with each user role
Write-Host "`n3. Testing Login for Each Role..." -ForegroundColor Yellow

foreach ($testUser in $testUsers) {
    Write-Host "`nTesting login for $($testUser.Role)..." -ForegroundColor Cyan
    
    $loginRequest = @{
        username = $testUser.User.username
        password = $testUser.User.password
        rememberMe = $false
    } | ConvertTo-Json
    
    $loginResult = Invoke-ApiCall -Url "$baseUrl/api/v1/auth/login" -Method "POST" -Body $loginRequest
    
    if ($loginResult.Success) {
        Write-Host "✅ $($testUser.Role) login SUCCESSFUL" -ForegroundColor Green
        Write-Host "Access Token: $($loginResult.Data.accessToken)"
        Write-Host "Refresh Token: $($loginResult.Data.refreshToken)"
        Write-Host "User ID: $($loginResult.Data.userId)"
        Write-Host "Username: $($loginResult.Data.username)"
        Write-Host "Roles: $($loginResult.Data.roles -join ', ')"
        Write-Host "Permissions: $($loginResult.Data.permissions -join ', ')"
    } else {
        Write-Host "❌ $($testUser.Role) login FAILED" -ForegroundColor Red
        Write-Host "Status Code: $($loginResult.StatusCode)"
        Write-Host "Error: $($loginResult.Error)"
        Write-Host "Details: $($loginResult.ErrorDetails)"
    }
}

Write-Host "`n=== API Testing Complete ===" -ForegroundColor Cyan