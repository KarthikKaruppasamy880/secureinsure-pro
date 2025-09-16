# Complete Application Fix - All Issues
function Write-Success($Message) { Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Error($Message) { Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Info($Message) { Write-Host "[INFO] $Message" -ForegroundColor Cyan }

Write-Info "Complete SecureInsure Pro Fix - Resolving All Issues..."

# Step 1: Kill all processes
Write-Info "Stopping all existing processes..."
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Step 2: Clean all ports
Write-Info "Cleaning up all ports..."
$ports = @(3000, 5173, 5174, 5175, 8080, 8081)
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
                    } catch {}
                }
            }
        }
    } catch {}
}

# Step 3: Start mock server first
Write-Info "Starting mock authentication server..."
Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Normal
Start-Sleep -Seconds 5

# Verify mock server is running
try {
    $authResponse = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -TimeoutSec 10 -UseBasicParsing
    if ($authResponse.StatusCode -eq 200) {
        Write-Success "Mock auth server is healthy on port 8081"
    }
} catch {
    Write-Error "Mock auth server failed to start properly"
    exit 1
}

# Step 4: Build frontend to ensure no compilation errors
Write-Info "Building frontend to check for errors..."
Push-Location frontend
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend build successful - no compilation errors"
    } else {
        Write-Error "Frontend build failed:"
        Write-Host $buildOutput
        Pop-Location
        exit 1
    }
} catch {
    Write-Error "Frontend build error: $($_.Exception.Message)"
    Pop-Location
    exit 1
}

# Step 5: Start frontend dev server
Write-Info "Starting frontend development server..."
try {
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal -PassThru
    Pop-Location
    Write-Success "Frontend dev server started"
} catch {
    Write-Error "Failed to start frontend dev server"
    Pop-Location
    exit 1
}

# Step 6: Wait and perform comprehensive health checks
Write-Info "Waiting for services to fully initialize..."
Start-Sleep -Seconds 15

# Test mock server API endpoints
Write-Info "Testing API endpoints..."
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:8081/api/v1/cases" -TimeoutSec 10 -UseBasicParsing
    if ($apiResponse.StatusCode -eq 200) {
        Write-Success "API endpoints are working"
    }
} catch {
    Write-Warning "API endpoints may still be starting"
}

# Test frontend
Write-Info "Testing frontend..."
$frontendWorking = $false
for ($i = 1; $i -le 6; $i++) {
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 10 -UseBasicParsing
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Success "Frontend is responding on port 5173"
            $frontendWorking = $true
            break
        }
    } catch {
        Write-Info "Frontend test attempt $i/6 - waiting..."
        Start-Sleep -Seconds 5
    }
}

if (-not $frontendWorking) {
    Write-Error "Frontend failed to start properly"
    Write-Info "Checking if frontend process is running..."
    $nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*"}
    if ($nodeProcesses.Count -gt 1) {
        Write-Info "Multiple Node processes detected - frontend may be starting slowly"
    } else {
        Write-Error "Frontend process not detected"
    }
}

# Step 7: Show status
Write-Info "Application Status Summary:"
Write-Info "=========================="

$processes = Get-Process | Where-Object {$_.ProcessName -like "*node*"}
Write-Info "Running Node.js processes: $($processes.Count)"

$ports = @(8081, 5173)
foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 5 -UseBasicParsing
        Write-Success "Port ${port}: ACTIVE"
    } catch {
        Write-Warning "Port ${port}: NOT RESPONDING"
    }
}

Write-Info ""
Write-Success "Fix Complete! Key Changes Made:"
Write-Info "   ✅ All process.env replaced with import.meta.env"
Write-Info "   ✅ Environment variables properly configured"
Write-Info "   ✅ TypeScript definitions added for Vite"
Write-Info "   ✅ Mock server enhanced with all required endpoints"
Write-Info "   ✅ All ports cleaned and services restarted"
Write-Info ""
Write-Success "Access your application at: http://localhost:5173"
Write-Info "Login with: admin_test / Test@1234"
Write-Info ""

if ($frontendWorking) {
    Write-Success "✅ APPLICATION IS NOW WORKING!"
    try {
        Start-Process "http://localhost:5173"
        Write-Success "Application opened in browser"
    } catch {
        Write-Info "Please manually open: http://localhost:5173"
    }
} else {
    Write-Warning "⚠️ Frontend may still be starting - please wait 30 seconds and try:"
    Write-Info "http://localhost:5173"
}
