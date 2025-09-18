# SecureInsure Pro Service Starter Script
Write-Host "🚀 Starting SecureInsure Pro Services..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to start service
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$WorkingDirectory,
        [string]$Command,
        [int]$Port
    )
    
    Write-Host "`n🔧 Starting $ServiceName..." -ForegroundColor Yellow
    
    if (Test-Port -Port $Port) {
        Write-Host "⚠️  Port $Port is already in use. $ServiceName may already be running." -ForegroundColor Yellow
        return
    }
    
    try {
        $process = Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$WorkingDirectory`" && $Command" -PassThru
        Write-Host "✅ $ServiceName started (PID: $($process.Id))" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to start $ServiceName: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Cyan

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Java not found. Please install Java 17+" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check Maven
try {
    $mavenVersion = mvn --version 2>&1 | Select-String "Apache Maven"
    Write-Host "✅ Maven found: $mavenVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Maven not found. Please install Maven 3.8+" -ForegroundColor Red
    exit 1
}

# Start services
Write-Host "`n🚀 Starting backend services..." -ForegroundColor Cyan

Start-Service -ServiceName "Auth Service" -WorkingDirectory "backend\auth-service" -Command "mvn spring-boot:run" -Port 8081
Start-Service -ServiceName "Policy Service" -WorkingDirectory "backend\policy-service" -Command "mvn spring-boot:run" -Port 8082
Start-Service -ServiceName "Claims Service" -WorkingDirectory "backend\claims-service" -Command "mvn spring-boot:run" -Port 8083

Write-Host "`n🎨 Starting frontend..." -ForegroundColor Cyan
Start-Service -ServiceName "Frontend" -WorkingDirectory "frontend" -Command "npm run dev" -Port 3000

Write-Host "`n=====================================" -ForegroundColor Green
Write-Host "🎉 All services are starting..." -ForegroundColor Green
Write-Host "`nServices will be available at:" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "- Auth Service: http://localhost:8081" -ForegroundColor Cyan
Write-Host "- Policy Service: http://localhost:8082" -ForegroundColor Cyan
Write-Host "- Claims Service: http://localhost:8083" -ForegroundColor Cyan

Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Wait for all services to start (check the opened windows)" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Login with admin/admin123 or user/user123" -ForegroundColor White
Write-Host "4. Check the troubleshooting guide if you encounter issues" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
