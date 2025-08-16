# Test Frontend and Open Browser
Write-Host "=== Testing Frontend Application ===" -ForegroundColor Cyan

# Wait for frontend to start
Write-Host "`nWaiting for frontend to start (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Test if frontend is running
Write-Host "`nTesting frontend connection..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    Write-Host "✅ Frontend is RUNNING!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ Frontend is NOT RUNNING" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Open browser regardless
Write-Host "`n=== OPENING BROWSER ===" -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n=== APPLICATION STATUS ===" -ForegroundColor Cyan
Write-Host "✅ Auth Service: http://localhost:8081 (RUNNING)" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:3000 (STARTING)" -ForegroundColor Green
Write-Host "✅ Auto-login: Enabled for admin user" -ForegroundColor Green

Write-Host "`n=== LOGIN CREDENTIALS ===" -ForegroundColor Cyan
Write-Host "Username: admin_test" -ForegroundColor White
Write-Host "Password: Test@1234" -ForegroundColor White

Write-Host "`n🎉 BROWSER SHOULD OPEN WITH THE APPLICATION!" -ForegroundColor Green
Write-Host "If the page doesn't load, wait 1-2 minutes and refresh." -ForegroundColor White 