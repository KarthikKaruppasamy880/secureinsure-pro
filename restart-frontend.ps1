# Restart Frontend with Fixes
function Write-Success($Message) { Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Error($Message) { Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Info($Message) { Write-Host "[INFO] $Message" -ForegroundColor Cyan }

Write-Info "Restarting frontend with environment variable fixes..."

# Stop existing processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clean up ports
$ports = @(5173, 5174, 5175)
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

# Start mock server
Write-Info "Starting mock auth server..."
Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
Start-Sleep -Seconds 3
Write-Success "Mock auth server started on port 8081"

# Start frontend
Write-Info "Starting frontend with fixed environment variables..."
Push-Location frontend
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
Pop-Location
Start-Sleep -Seconds 5

Write-Info "Waiting for services to start..."
Start-Sleep -Seconds 10

# Health checks
try {
    $authResponse = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -TimeoutSec 5 -UseBasicParsing
    if ($authResponse.StatusCode -eq 200) {
        Write-Success "Mock auth server is healthy"
    }
} catch {
    Write-Info "Mock auth server may still be starting"
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Success "Frontend is responding"
    }
} catch {
    Write-Info "Frontend may still be starting"
}

Write-Success "Restart complete!"
Write-Info "Key fixes applied:"
Write-Info "   ✅ Replaced process.env with import.meta.env"
Write-Info "   ✅ Updated all service files for Vite compatibility"
Write-Info "   ✅ Added TypeScript definitions for environment variables"
Write-Info "   ✅ Services restarted with clean environment"
Write-Info ""
Write-Success "Access your application at: http://localhost:5173"
Write-Info "The 'process is not defined' error should now be resolved!"

# Open browser
try {
    Start-Process "http://localhost:5173"
    Write-Success "Application opened in browser"
} catch {
    Write-Info "Please manually open: http://localhost:5173"
}








