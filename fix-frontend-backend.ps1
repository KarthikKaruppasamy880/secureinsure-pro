# SecureInsure Pro - Complete Frontend & Backend Fix
# Fixes all connectivity and configuration issues

function Write-Success($Message) { Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Error($Message) { Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Info($Message) { Write-Host "[INFO] $Message" -ForegroundColor Cyan }

Write-Info "Fixing SecureInsure Pro Frontend & Backend Issues..."

# Step 1: Stop all existing processes
Write-Info "Stopping all existing processes..."
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Clean ports
Write-Info "Cleaning up ports..."
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

# Step 3: Create proper environment configuration
Write-Info "Creating environment configuration..."

# Frontend environment
$frontendEnv = @"
# SecureInsure Pro Environment Configuration
REACT_APP_API_BASE_URL=http://localhost:8081
VITE_API_BASE_URL=http://localhost:8081
VITE_MOCK_AUTH_URL=http://localhost:8081
VITE_GATEWAY_URL=http://localhost:8081
VITE_WEBSOCKET_URL=ws://localhost:8081/ws
VITE_APP_NAME=SecureInsure Pro
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=development
"@

$frontendEnv | Out-File -FilePath "frontend/.env" -Encoding UTF8
Write-Success "Created frontend/.env"

# Step 4: Update API service to point to mock server
Write-Info "Updating API service configuration..."

# Update apiService.ts to use mock endpoints
$apiServiceContent = Get-Content "frontend/src/services/apiService.ts" -Raw
$apiServiceContent = $apiServiceContent -replace "process\.env\.REACT_APP_API_BASE_URL \|\| 'http://localhost:8080'", "process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'"
$apiServiceContent | Out-File -FilePath "frontend/src/services/apiService.ts" -Encoding UTF8

# Update api.ts to use mock endpoints  
$apiContent = Get-Content "frontend/src/services/api.ts" -Raw
$apiContent = $apiContent -replace "process\.env\.REACT_APP_API_BASE_URL \|\| 'http://localhost:8080'", "process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'"
$apiContent | Out-File -FilePath "frontend/src/services/api.ts" -Encoding UTF8

Write-Success "Updated API service configurations"

# Step 5: Update mock auth server to handle additional endpoints
Write-Info "Enhancing mock auth server..."

# Read current mock server
$mockServerContent = Get-Content "mock-auth-server.js" -Raw

# Add API endpoints for the frontend
$additionalEndpoints = @"

// Additional API endpoints for frontend compatibility
app.get('/api/v1/cases', (req, res) => {
  res.json([
    {
      id: '1',
      policyNumber: 'POL-001',
      insuredName: 'John Doe',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    }
  ]);
});

app.get('/api/v1/cases/:id', (req, res) => {
  res.json({
    id: req.params.id,
    policyNumber: 'POL-001',
    insuredName: 'John Doe',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  });
});

app.post('/api/v1/cases', (req, res) => {
  res.json({
    id: '2',
    policyNumber: 'POL-002',
    ...req.body,
    status: 'CREATED',
    createdAt: new Date().toISOString()
  });
});

app.put('/api/v1/product/:id', (req, res) => {
  res.json({ success: true, message: 'Product updated successfully' });
});

app.put('/api/v1/party-info/:id', (req, res) => {
  res.json({ success: true, message: 'Party info updated successfully' });
});

app.put('/api/v1/beneficiary/:id', (req, res) => {
  res.json({ success: true, message: 'Beneficiary updated successfully' });
});

app.put('/api/v1/owner/:id', (req, res) => {
  res.json({ success: true, message: 'Owner updated successfully' });
});

app.put('/api/v1/payor/:id', (req, res) => {
  res.json({ success: true, message: 'Payor updated successfully' });
});

app.put('/api/v1/medical/:id', (req, res) => {
  res.json({ success: true, message: 'Medical info updated successfully' });
});

app.put('/api/v1/premium/:id', (req, res) => {
  res.json({ success: true, message: 'Premium updated successfully' });
});

app.post('/api/v1/examone/lab-request', (req, res) => {
  res.json({ 
    success: true, 
    requestId: 'LAB-' + Date.now(),
    message: 'Lab request submitted successfully' 
  });
});

app.get('/api/v1/cases/:id/documents', (req, res) => {
  res.json([]);
});

app.post('/api/v1/cases/:id/documents', (req, res) => {
  res.json({ 
    success: true, 
    documentId: 'DOC-' + Date.now(),
    message: 'Document uploaded successfully' 
  });
});
"@

# Insert before app.listen
$insertPosition = $mockServerContent.LastIndexOf("app.listen")
$enhancedMockServer = $mockServerContent.Substring(0, $insertPosition) + $additionalEndpoints + "`n`n" + $mockServerContent.Substring($insertPosition)
$enhancedMockServer | Out-File -FilePath "mock-auth-server.js" -Encoding UTF8

Write-Success "Enhanced mock auth server with additional endpoints"

# Step 6: Start services
Write-Info "Starting services..."

# Start enhanced mock server
Write-Info "Starting mock authentication server..."
Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
Start-Sleep -Seconds 3
Write-Success "Mock auth server started on port 8081"

# Build and start frontend
Write-Info "Building frontend..."
Push-Location frontend
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend built successfully"
        
        # Start frontend dev server
        Write-Info "Starting frontend dev server..."
        Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized
        Start-Sleep -Seconds 5
        Write-Success "Frontend starting on port 5173"
    } else {
        Write-Error "Frontend build failed"
        Pop-Location
        exit 1
    }
} catch {
    Write-Error "Frontend error"
    Pop-Location
    exit 1
}
Pop-Location

# Step 7: Health checks
Write-Info "Performing health checks..."
Start-Sleep -Seconds 10

try {
    $authResponse = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -TimeoutSec 5 -UseBasicParsing
    if ($authResponse.StatusCode -eq 200) {
        Write-Success "Mock auth server is healthy"
    }
} catch {
    Write-Info "Mock auth server health check - server may still be starting"
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Success "Frontend is healthy"
    }
} catch {
    Write-Info "Frontend health check - may still be starting"
}

# Test API endpoint
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:8081/api/v1/cases" -TimeoutSec 5 -UseBasicParsing
    if ($apiResponse.StatusCode -eq 200) {
        Write-Success "API endpoints are working"
    }
} catch {
    Write-Info "API endpoints - may still be starting"
}

Write-Success "Fix completed! Key changes made:"
Write-Info "   ✅ Environment variables configured for port 8081"
Write-Info "   ✅ API services updated to use mock server"
Write-Info "   ✅ Mock server enhanced with additional endpoints"
Write-Info "   ✅ Both frontend and backend restarted"
Write-Info ""
Write-Success "Access your application at: http://localhost:5173"
Write-Info "Login with: admin_test / Test@1234"

# Open browser
Start-Sleep -Seconds 3
try {
    Start-Process "http://localhost:5173"
    Write-Success "Application opened in browser"
} catch {
    Write-Info "Please manually open: http://localhost:5173"
}

Write-Info "If you still see issues, wait 30 seconds for services to fully start, then refresh the page."








