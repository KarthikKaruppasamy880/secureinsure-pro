# Start-All.ps1 - Comprehensive startup script for SecureInsure Pro

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to write colored output
function Write-Status {
    param($message, $status = "info")
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $statusText = switch ($status) {
        "success" { "[SUCCESS]" }
        "error"   { "[ERROR]" }
        "warn"    { "[WARNING]" }
        default   { "[INFO]" }
    }
    
    $color = switch ($status) {
        "success" { "Green" }
        "error"   { "Red" }
        "warn"    { "Yellow" }
        default    { "Cyan" }
    }
    
    Write-Host "$timestamp $statusText $message" -ForegroundColor $color
}

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    try {
        $null = Get-Command $command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Function to run a command and check its status
function Invoke-SafeCommand {
    param(
        [string]$command,
        [string]$errorMessage = "Command failed: $command"
    )
    
    try {
        Write-Status "Executing: $command"
        Invoke-Expression $command
        if ($LASTEXITCODE -ne 0) {
            throw $errorMessage
        }
        return $true
    } catch {
        Write-Status $errorMessage "error"
        Write-Status $_.Exception.Message "error"
        return $false
    }
}

# Main execution
Write-Host "`n=== SecureInsure Pro Startup Script ===" -ForegroundColor Green
Write-Host "This script will set up and start the application.`n" -ForegroundColor Cyan

# Check for required tools
$requiredTools = @("java", "mvn", "node", "npm")
$missingTools = @()

foreach ($tool in $requiredTools) {
    if (-not (Test-CommandExists $tool)) {
        $missingTools += $tool
    }
}

if ($missingTools.Count -gt 0) {
    Write-Status "The following required tools are missing: $($missingTools -join ', ')" "error"
    Write-Status "Please install them and try again." "error"
    exit 1
}

# Verify Java version
$javaVersion = (java -version 2>&1 | Select-String -Pattern 'version' | Select-Object -First 1).ToString()
if ($javaVersion -notmatch '17') {
    Write-Status "Java 17 is required. Found: $javaVersion" "error"
    exit 1
}

# Set paths
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

# Start Docker containers if Docker is available
$dockerAvailable = Test-CommandExists "docker"
if ($dockerAvailable) {
    Write-Status "Starting Docker containers..."
    
    # Stop and remove any existing containers
    try {
        docker stop $(docker ps -aq) 2>&1 | Out-Null
        docker rm $(docker ps -aq) 2>&1 | Out-Null
    } catch {
        Write-Status "No containers to clean up or error cleaning up: $_" "warn"
    }
    
    # Start PostgreSQL
    if (Invoke-SafeCommand "docker run -d --name secureinsure-postgres -e POSTGRES_DB=secureinsure_pro -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -v ${rootDir}\data\postgres:/var/lib/postgresql/data postgres:15-alpine" "Failed to start PostgreSQL") {
        Write-Status "PostgreSQL container started successfully" "success"
    }
    
    # Start Redis
    if (Invoke-SafeCommand "docker run -d --name secureinsure-redis -p 6379:6379 -v ${rootDir}\data\redis:/data redis:7-alpine" "Failed to start Redis") {
        Write-Status "Redis container started successfully" "success"
    }
    
    # Wait for databases to be ready
    Write-Status "Waiting for databases to initialize (15 seconds)..."
    Start-Sleep -Seconds 15
} else {
    Write-Status "Docker not found. Please ensure PostgreSQL and Redis are running manually." "warn"
}

# Build and start backend
Set-Location $backendDir
Write-Status "Building backend services..."
if (Invoke-SafeCommand "mvn clean install -DskipTests" "Backend build failed") {
    Write-Status "Backend built successfully" "success"
    
    # Start backend in a new window
    $backendProcess = Start-Process -PassThru -NoNewWindow -FilePath "mvn" -ArgumentList "spring-boot:run -pl gateway-service"
    Write-Status "Backend services starting in the background..."
    
    # Give backend some time to start
    Write-Status "Waiting for backend to initialize (30 seconds)..."
    Start-Sleep -Seconds 30
}

# Setup and start frontend
Set-Location $frontendDir
Write-Status "Installing frontend dependencies..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

if (Invoke-SafeCommand "npm install" "Frontend dependency installation failed") {
    Write-Status "Frontend dependencies installed successfully" "success"
    
    # Start frontend in a new window
    $frontendProcess = Start-Process -PassThru -NoNewWindow -FilePath "npm" -ArgumentList "start"
    Write-Status "Frontend starting in the background..." "success"
}

# Display completion message
Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "The application should now be starting up. Please check the following:"
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "- Backend API: http://localhost:8080" -ForegroundColor Cyan
Write-Host "- PostgreSQL: localhost:5432" -ForegroundColor Cyan
Write-Host "- Redis: localhost:6379" -ForegroundColor Cyan
Write-Host "`nIf you encounter any issues, please check the logs above for error messages.`n" -ForegroundColor Yellow

# Keep the window open
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
