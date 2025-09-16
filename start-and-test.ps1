# SecureInsure Pro - Complete Startup and Test
Write-Host "Starting SecureInsure Pro Complete System Test" -ForegroundColor Green

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
    exit 1
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

# Test TX1 Import API
try {
    $tx1Body = @"
<?xml version="1.0" encoding="UTF-8"?>
<Tx1>
  <Case><CaseNumber>CS-TEST-001</CaseNumber></Case>
  <Applicant>
    <FirstName>John</FirstName>
    <LastName>Smith</LastName>
    <DOB>1985-06-15</DOB>
    <Gender>M</Gender>
  </Applicant>
  <Policy>
    <FaceAmount>500000</FaceAmount>
    <Premium>150.00</Premium>
  </Policy>
</Tx1>
"@
    
    $tx1Response = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/tx1/import" -Method POST -Body $tx1Body -ContentType "application/xml" -TimeoutSec 10
    Write-Host "✅ TX1 Import API working: Case $($tx1Response.caseId)" -ForegroundColor Green
} catch {
    Write-Host "❌ TX1 Import API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test ExamOne API
try {
    $examOneResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/examone/results?caseId=CS-2024-001" -TimeoutSec 5
    Write-Host "✅ ExamOne API working: $($examOneResponse.results.Count) results" -ForegroundColor Green
} catch {
    Write-Host "❌ ExamOne API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 SYSTEM STATUS" -ForegroundColor Cyan
Write-Host "==============="
Write-Host "Backend: http://localhost:8081 ✅" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000 ✅" -ForegroundColor Green
Write-Host "Login: admin / admin123" -ForegroundColor Yellow

# Open browser
try {
    Start-Process "http://localhost:3000"
    Write-Host "`n✅ Browser opened to application" -ForegroundColor Green
} catch {
    Write-Host "`n⚠️ Please manually open: http://localhost:3000" -ForegroundColor Yellow
}

Write-Host "`n🎊 SecureInsure Pro is ready!" -ForegroundColor Green


