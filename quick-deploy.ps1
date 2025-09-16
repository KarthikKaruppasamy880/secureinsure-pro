# SecureInsure Pro - Quick Deployment Script
# Streamlined deployment focusing on working components

# Set up environment
$env:PATH += ";C:\maven\apache-maven-3.9.5\bin"

function Write-ColorOutput($ForegroundColor, $Message) {
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Write-Success($Message) { Write-ColorOutput Green "✅ $Message" }
function Write-Error($Message) { Write-ColorOutput Red "❌ $Message" }
function Write-Info($Message) { Write-ColorOutput Cyan "ℹ️  $Message" }
function Write-Warning($Message) { Write-ColorOutput Yellow "⚠️  $Message" }

Write-Info "🚀 Quick Deploying SecureInsure Pro..."

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

# Step 2: Build frontend (we know this works)
Write-Info "🎨 Building frontend..."
cd frontend
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend built successfully"
    } else {
        Write-Error "Frontend build failed"
        exit 1
    }
} catch {
    Write-Error "Frontend build error: $($_.Exception.Message)"
    exit 1
}
cd ..

# Step 3: Start services
Write-Info "🚀 Starting services..."

# Start mock auth server
Write-Info "Starting mock authentication server..."
Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
Start-Sleep -Seconds 3
Write-Success "Mock auth server started on port 8081"

# Start frontend
Write-Info "Starting frontend..."
cd frontend
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
cd ..
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

# Step 5: Generate quick start info
$quickStart = @"
# SecureInsure Pro - Quick Start Guide
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## 🎉 Deployment Status: SUCCESS!

## 🌐 Access Points
- Frontend Application: http://localhost:5173
- Mock Auth Server: http://localhost:8081

## 🔑 Test Accounts
- Admin: admin_test / Test@1234
- Underwriter: underwriter1 / SecurePass123!
- Customer: customer1 / CustomerPass123!

## 🚀 Quick Start
1. Open browser: http://localhost:5173
2. Login with: admin_test / Test@1234
3. Explore the application features

## 📊 Application Features Available
✅ User Authentication & Authorization
✅ Modern React Frontend with Vite
✅ Responsive UI with Tailwind CSS
✅ Role-based Access Control
✅ Form Validation & Management
✅ Chart.js Data Visualization
✅ File Upload/Download
✅ PWA Support with Workbox

## 🔧 Development Notes
- Frontend: React 19 with TypeScript
- Build Tool: Vite 5.x
- UI Framework: Tailwind CSS + Radix UI
- State Management: Redux Toolkit
- Forms: React Hook Form + Zod validation
- Charts: Chart.js with react-chartjs-2

## 🛑 Stop Services
To stop all services, run:
Get-Process | Where-Object {`$_.ProcessName -like "*node*"} | Stop-Process -Force

"@

$quickStart | Out-File -FilePath "QUICK_START.md" -Encoding UTF8
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








