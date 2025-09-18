# Setup and Run Script for SecureInsure Pro
# This script will set up and run the entire application

# Set error action preference
$ErrorActionPreference = "Stop"

function Write-Header {
    param($text)
    Write-Host "`n===========================================" -ForegroundColor Cyan
    Write-Host $text -ForegroundColor Cyan
    Write-Host "===========================================`n" -ForegroundColor Cyan
}

function Test-CommandExists {
    param($command)
    try {
        if (Get-Command $command -ErrorAction SilentlyContinue) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

# Check for required tools
Write-Header "Checking System Requirements"

# Check Node.js
if (-not (Test-CommandExists "node")) {
    Write-Host "Node.js is not installed. Please install Node.js v18 or later." -ForegroundColor Red
    exit 1
}

# Check npm
if (-not (Test-CommandExists "npm")) {
    Write-Host "npm is not installed. Please install npm v9 or later." -ForegroundColor Red
    exit 1
}

# Check Java
if (-not (Test-CommandExists "java")) {
    Write-Host "Java is not installed. Please install Java 17 or later." -ForegroundColor Red
    exit 1
}

# Check Maven
if (-not (Test-CommandExists "mvn")) {
    Write-Host "Maven is not installed. Please install Maven 3.8.4 or later." -ForegroundColor Red
    exit 1
}

# Check Docker
if (-not (Test-CommandExists "docker")) {
    Write-Host "Docker is not installed or not running. Please install and start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Get current directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$rootDir = $scriptPath
$frontendDir = Join-Path $rootDir "frontend"
$backendDir = Join-Path $rootDir "backend"

# Clean up any existing containers
Write-Header "Cleaning up existing containers"
try {
    docker stop $(docker ps -aq) 2>&1 | Out-Null
    docker rm $(docker ps -aq) 2>&1 | Out-Null
    docker network prune -f 2>&1 | Out-Null
} catch {
    Write-Host "No containers to clean up or error cleaning up: $_" -ForegroundColor Yellow
}

# Start PostgreSQL
Write-Header "Starting PostgreSQL"
docker run -d --name secureinsure-postgres \
    -e POSTGRES_DB=secureinsure_pro \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=password \
    -p 5432:5432 \
    -v ${rootDir}\data\postgres:/var/lib/postgresql/data \
    postgres:15-alpine

# Start Redis
Write-Header "Starting Redis"
docker run -d --name secureinsure-redis \
    -p 6379:6379 \
    -v ${rootDir}\data\redis:/data \
    redis:7-alpine

# Wait for databases to be ready
Write-Host "`nWaiting for databases to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Setup Frontend
Write-Header "Setting up Frontend"
Set-Location $frontendDir

# Clean and install dependencies
Write-Host "Installing frontend dependencies..."
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install

# Setup Backend
Write-Header "Setting up Backend"
Set-Location $backendDir

# Build the project
Write-Host "Building backend services..."
mvn clean install -DskipTests

# Start Backend Services
Write-Header "Starting Backend Services"
Start-Process -NoNewWindow -FilePath "mvn" -ArgumentList "spring-boot:run -pl gateway-service"

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Start Frontend
Write-Header "Starting Frontend"
Set-Location $frontendDir
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start"

# Open browser
Write-Header "Application Information"
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8080" -ForegroundColor Green
Write-Host "PostgreSQL: localhost:5432" -ForegroundColor Green
Write-Host "Redis: localhost:6379" -ForegroundColor Green
Write-Host "`nThe application is now starting up. This may take a few minutes..." -ForegroundColor Yellow

# Create a simple launcher for future use
$launcherContent = @"
@echo off
echo Starting SecureInsure Pro...

REM Start backend
start "Backend" cmd /k "cd /d $backendDir && mvn spring-boot:run -pl gateway-service"

REM Start frontend
start "Frontend" cmd /k "cd /d $frontendDir && npm start"

echo.
echo ==========================================
echo SecureInsure Pro is starting...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8080
echo ==========================================
"@

Set-Content -Path "$rootDir\start-app.bat" -Value $launcherContent

Write-Host "`nSetup complete! You can now use 'start-app.bat' to start the application in the future." -ForegroundColor Green
