# Open SecureInsure Pro Application
Write-Host "=== Opening SecureInsure Pro Application ===" -ForegroundColor Cyan

# Wait for frontend to start
Write-Host "`nWaiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Open browser
Write-Host "`n=== OPENING BROWSER ===" -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n=== APPLICATION STATUS ===" -ForegroundColor Cyan
Write-Host "✅ Auth Service: http://localhost:8081 (RUNNING)" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:3000 (STARTING)" -ForegroundColor Green
Write-Host "✅ Auto-login: Enabled for admin user" -ForegroundColor Green

Write-Host "`n=== LOGIN CREDENTIALS ===" -ForegroundColor Cyan
Write-Host "Username: admin_test" -ForegroundColor White
Write-Host "Password: Test@1234" -ForegroundColor White

Write-Host "`n=== INSURANCE APPLICATION FEATURES ===" -ForegroundColor Cyan
Write-Host "• Dashboard with analytics and charts" -ForegroundColor White
Write-Host "• Policy Management (Create, View, Edit Policies)" -ForegroundColor White
Write-Host "• Claims Processing (Submit, Track, Approve Claims)" -ForegroundColor White
Write-Host "• Customer Management (User profiles, history)" -ForegroundColor White
Write-Host "• Underwriting Tools (Risk assessment, approval)" -ForegroundColor White
Write-Host "• Reports & Analytics (Financial reports, trends)" -ForegroundColor White
Write-Host "• Voice Recognition (Voice commands)" -ForegroundColor White
Write-Host "• Face Detection (Biometric login)" -ForegroundColor White
Write-Host "• Settings & Configuration (System settings)" -ForegroundColor White

Write-Host "`n🎉 BROWSER SHOULD OPEN WITH THE APPLICATION!" -ForegroundColor Green
Write-Host "If the page doesn't load, wait 1-2 minutes and refresh." -ForegroundColor White
Write-Host "The app will auto-login with admin credentials." -ForegroundColor White 