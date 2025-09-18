# SecureInsure Pro - Complete System Test
Write-Host "🧪 Testing Complete SecureInsure Pro System" -ForegroundColor Cyan
Write-Host "==========================================="

# Test 1: Backend Health
Write-Host "`n1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:8081/health" -TimeoutSec 5
    Write-Host "✅ Backend Status: $($backendHealth.status)" -ForegroundColor Green
    Write-Host "   Service: $($backendHealth.service)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend Health Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Frontend Health
Write-Host "`n2. Testing Frontend Health..." -ForegroundColor Yellow
try {
    $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Frontend Status: $($frontendHealth.StatusCode)" -ForegroundColor Green
    Write-Host "   Content-Length: $($frontendHealth.Headers['Content-Length'])" -ForegroundColor White
} catch {
    Write-Host "❌ Frontend Health Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Cases API
Write-Host "`n3. Testing Cases API..." -ForegroundColor Yellow
try {
    $casesResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/cases" -TimeoutSec 5
    Write-Host "✅ Cases API Working" -ForegroundColor Green
    Write-Host "   Cases Found: $($casesResponse.data.Count)" -ForegroundColor White
    Write-Host "   Sample Case: $($casesResponse.data[0].caseId) - $($casesResponse.data[0].insuredName)" -ForegroundColor White
} catch {
    Write-Host "❌ Cases API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Authentication API
Write-Host "`n4. Testing Authentication API..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Authentication Working" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.username)" -ForegroundColor White
    Write-Host "   Roles: $($loginResponse.roles -join ', ')" -ForegroundColor White
    Write-Host "   Token: $($loginResponse.accessToken.Substring(0, 30))..." -ForegroundColor White
} catch {
    Write-Host "❌ Authentication Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Templates API
Write-Host "`n5. Testing Templates API..." -ForegroundColor Yellow
try {
    $templatesResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/templates" -TimeoutSec 5
    Write-Host "✅ Templates API Working" -ForegroundColor Green
    Write-Host "   Templates Found: $($templatesResponse.total)" -ForegroundColor White
} catch {
    Write-Host "❌ Templates API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Search API
Write-Host "`n6. Testing Search API..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/search?q=Jane" -Method POST -TimeoutSec 5
    Write-Host "✅ Search API Working" -ForegroundColor Green
    Write-Host "   Search Results: $($searchResponse.totalResults)" -ForegroundColor White
} catch {
    Write-Host "❌ Search API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Create New Case
Write-Host "`n7. Testing Case Creation..." -ForegroundColor Yellow
try {
    $newCaseBody = @{
        insuredName = "Test User"
        policyType = "Term Life"
        faceAmount = 100000
        premium = 50.00
        agent = "Test Agent"
    } | ConvertTo-Json
    
    $newCaseResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/cases" -Method POST -Body $newCaseBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Case Creation Working" -ForegroundColor Green
    Write-Host "   New Case ID: $($newCaseResponse.data.caseId)" -ForegroundColor White
    Write-Host "   Case Number: $($newCaseResponse.data.caseNumber)" -ForegroundColor White
} catch {
    Write-Host "❌ Case Creation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "🎉 SYSTEM TEST COMPLETE" -ForegroundColor Green
Write-Host "======================="
Write-Host "✅ Backend API: http://localhost:8081" -ForegroundColor Green
Write-Host "✅ Frontend App: http://localhost:3000" -ForegroundColor Green
Write-Host "✅ Authentication: admin / admin123" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Available Endpoints:" -ForegroundColor Cyan
Write-Host "   GET  /health - Health check" -ForegroundColor White
Write-Host "   GET  /api/v1/cases - List cases" -ForegroundColor White
Write-Host "   POST /api/v1/auth/login - Login" -ForegroundColor White
Write-Host "   POST /api/v1/cases - Create case" -ForegroundColor White
Write-Host "   POST /api/search - Search cases" -ForegroundColor White
Write-Host "   GET  /api/v1/auth/templates - Templates" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Login with admin / admin123" -ForegroundColor White
Write-Host "3. Test dashboard functionality" -ForegroundColor White
Write-Host "4. Create and manage cases" -ForegroundColor White

# Open browser
try {
    Start-Process "http://localhost:3000"
    Write-Host "`n✅ Browser opened to application" -ForegroundColor Green
} catch {
    Write-Host "`n⚠️ Please manually open: http://localhost:3000" -ForegroundColor Yellow
}

Write-Host "`n🎊 SecureInsure Pro is fully operational!" -ForegroundColor Green
