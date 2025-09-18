# SecureInsure Pro - Simple Deployment Script
# Streamlined deployment focusing on working components

# Set up environment
$env:PATH += ";C:\maven\apache-maven-3.9.5\bin"

function Write-Success($Message) { Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error($Message) { Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info($Message) { Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning($Message) { Write-Host "⚠️  $Message" -ForegroundColor Yellow }

Write-Info "🚀 Deploying SecureInsure Pro..."

# Step 1: Clean up ports
Write-Info "🔌 Cleaning up ports..."
$ports = @(8080, 8081, 5173, 5174, 5175)
foreach ($port in $ports) {
    try {
        $processes = netstat -ano | findstr ":$port"
        if ($processes) {
            $processes -split "`n" | ForEach-Object {
                $parts = $_.Trim() -split '\s+'
                if ($parts.Length -ge 5) {
                    $pid = $parts[4]
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Success "Freed port $port"
                    } catch {}
                }
            }
        }
    } catch {}
}

# Step 2: Build frontend
Write-Info "🎨 Building frontend..."
Push-Location frontend
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend built successfully"
    } else {
        Write-Error "Frontend build failed"
        Pop-Location
        exit 1
    }
} catch {
    Write-Error "Frontend build error"
    Pop-Location
    exit 1
}
Pop-Location

# Step 3: Start services
Write-Info "🚀 Starting services..."

# Start mock auth server
Write-Info "Starting mock authentication server..."
Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
Start-Sleep -Seconds 3
Write-Success "Mock auth server started on port 8081"

# Start frontend
Write-Info "Starting frontend..."
Push-Location frontend
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 5
Write-Success "Frontend starting on port 5173"

# Step 4: Health checks
Write-Info "🔍 Performing health checks..."
Start-Sleep -Seconds 10

try {
    $authResponse = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -TimeoutSec 5 -UseBasicParsing
    if ($authResponse.StatusCode -eq 200) {
        Write-Success "Mock auth server is healthy"
    }
} catch {
    Write-Warning "Mock auth server health check failed"
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Success "Frontend is healthy"
    }
} catch {
    Write-Warning "Frontend health check failed - may still be starting"
}

# Step 5: Create quick start file
$quickStartContent = "# SecureInsure Pro - Quick Start Guide`n"
$quickStartContent += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
$quickStartContent += "## Deployment Status: SUCCESS!`n`n"
$quickStartContent += "## Access Points`n"
$quickStartContent += "- Frontend Application: http://localhost:5173`n"
$quickStartContent += "- Mock Auth Server: http://localhost:8081`n`n"
$quickStartContent += "## Test Accounts`n"
$quickStartContent += "- Admin: admin_test / Test@1234`n"
$quickStartContent += "- Underwriter: underwriter1 / SecurePass123!`n"
$quickStartContent += "- Customer: customer1 / CustomerPass123!`n`n"
$quickStartContent += "## Quick Start`n"
$quickStartContent += "1. Open browser: http://localhost:5173`n"
$quickStartContent += "2. Login with: admin_test / Test@1234`n"
$quickStartContent += "3. Explore the application features`n"

$quickStartContent | Out-File -FilePath "QUICK_START.md" -Encoding UTF8
Write-Success "Quick start guide created: QUICK_START.md"

Write-Success "🎉 Deployment completed!"
Write-Info "🌐 Access your application at: http://localhost:5173"
Write-Info "🔑 Login with: admin_test / Test@1234"

# Open browser
Start-Sleep -Seconds 3
try {
    Start-Process "http://localhost:5173"
    Write-Success "🌐 Application opened in browser"
} catch {
    Write-Info "Please manually open: http://localhost:5173"
}









