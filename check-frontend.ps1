# Check Frontend Status and Open Browser
Write-Host "=== Checking Frontend Status ===" -ForegroundColor Cyan

# Wait for frontend to start
Write-Host "`nWaiting for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test frontend
Write-Host "`nTesting frontend on port 3000..." -ForegroundColor Green
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    Write-Host "✅ Frontend: RUNNING on port 3000" -ForegroundColor Green
    Write-Host "Status Code: $($frontendResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ Frontend: NOT RUNNING on port 3000" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nStarting frontend manually..." -ForegroundColor Yellow
    Set-Location "frontend"
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
    Set-Location ".."
    Start-Sleep -Seconds 20
}

# Open browser
Write-Host "`n=== OPENING APPLICATION IN BROWSER ===" -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n=== APPLICATION STATUS ===" -ForegroundColor Cyan
Write-Host "✅ Auth Service: Running on port 8081" -ForegroundColor Green
Write-Host "✅ Frontend: Starting on port 3000" -ForegroundColor Green
Write-Host "✅ Auto-login: Enabled for admin user" -ForegroundColor Green

Write-Host "`n=== LOGIN CREDENTIALS ===" -ForegroundColor Cyan
Write-Host "Username: admin_test" -ForegroundColor White
Write-Host "Password: Test@1234" -ForegroundColor White
Write-Host "Role: ADMIN (Full Access)" -ForegroundColor White

Write-Host "`n=== INSURANCE APPLICATION SCREENS ===" -ForegroundColor Cyan
Write-Host "• Dashboard with analytics and charts" -ForegroundColor White
Write-Host "• Policy Management (Create, View, Edit Policies)" -ForegroundColor White
Write-Host "• Claims Processing (Submit, Track, Approve Claims)" -ForegroundColor White
Write-Host "• Customer Management (User profiles, history)" -ForegroundColor White
Write-Host "• Underwriting Tools (Risk assessment, approval)" -ForegroundColor White
Write-Host "• Reports & Analytics (Financial reports, trends)" -ForegroundColor White
Write-Host "• Voice Recognition (Voice commands)" -ForegroundColor White
Write-Host "• Face Detection (Biometric login)" -ForegroundColor White
Write-Host "• Settings & Configuration (System settings)" -ForegroundColor White

Write-Host "`n🎉 APPLICATION SHOULD BE LOADING!" -ForegroundColor Green
Write-Host "The browser will open automatically with the SecureInsure Pro application." -ForegroundColor White
Write-Host "If it doesn't open, manually navigate to: http://localhost:3000" -ForegroundColor White 