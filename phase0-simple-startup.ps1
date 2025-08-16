# SecureInsure Pro - PHASE 0 Simple Startup (No Docker/Maven Required)
Write-Host "SecureInsure Pro - PHASE 0 Simple Startup" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

Write-Host "This script sets up PHASE 0 testing without Docker or Maven requirements." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is available
Write-Host "Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is available
Write-Host "Checking npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install Node.js with npm." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "PHASE 0 TESTING SETUP:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Install Test Backend Dependencies:" -ForegroundColor Green
Write-Host "   npm install express cors" -ForegroundColor White
Write-Host ""

Write-Host "2. Start Test Backend (Terminal 1):" -ForegroundColor Green
Write-Host "   node phase0-test-backend.js" -ForegroundColor White
Write-Host ""

Write-Host "3. Start Frontend (Terminal 2):" -ForegroundColor Green
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""

Write-Host "4. Test URLs:" -ForegroundColor Cyan
Write-Host "   Backend Health: http://localhost:8080/health" -ForegroundColor White
Write-Host "   Backend Ready:  http://localhost:8080/ready" -ForegroundColor White
Write-Host "   Backend Version: http://localhost:8080/version" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "5. Expected Results:" -ForegroundColor Cyan
Write-Host "   ✅ Backend responds with health status" -ForegroundColor White
Write-Host "   ✅ Frontend loads with health check component" -ForegroundColor White
Write-Host "   ✅ No console errors in browser" -ForegroundColor White
Write-Host ""

Write-Host "Starting setup..." -ForegroundColor Yellow

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install express cors

Write-Host ""
Write-Host "✅ Setup complete! Now start the services as shown above." -ForegroundColor Green
Write-Host "After both services are running, test the health endpoints and frontend." -ForegroundColor Yellow
