# Comprehensive Startup Script for SecureInsure Pro
Write-Host "🚀 Starting SecureInsure Pro - All Services" -ForegroundColor Green

# Kill any existing Node processes
Write-Host "🔄 Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start Backend
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; node mock-auth-server.js" -WindowStyle Hidden
Start-Sleep -Seconds 3

# Test Backend
Write-Host "🧪 Testing Backend..." -ForegroundColor Cyan
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8082/health" -TimeoutSec 5
    Write-Host "✅ Backend is running: $($backendResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend failed to start: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Start Frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd '$PWD\frontend'; npm run dev -- --port 5173 --host" -WindowStyle Hidden
Start-Sleep -Seconds 10

# Test Frontend
Write-Host "🧪 Testing Frontend..." -ForegroundColor Cyan
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 10
    Write-Host "✅ Frontend is running: Status $($frontendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend failed to start: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Retrying frontend startup..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD\frontend'; npm run dev -- --port 5173 --host" -WindowStyle Hidden
    Start-Sleep -Seconds 10
}

# Final Status Check
Write-Host "📊 Final Status Check..." -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8082" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "WebSocket: ws://localhost:8082/ws" -ForegroundColor White

Write-Host "🎉 All services started successfully!" -ForegroundColor Green
Write-Host "Press any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ All services stopped." -ForegroundColor Green
