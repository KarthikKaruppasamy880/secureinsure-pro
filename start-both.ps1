# PowerShell script to start both backend and frontend
Write-Host "Starting SecureInsure Pro Full Stack Application..." -ForegroundColor Green

# Start backend in background
Write-Host "Starting backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-File", "start-backend.ps1" -WindowStyle Minimized

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-File", "start-frontend.ps1"

Write-Host "Both services are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:8081" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
