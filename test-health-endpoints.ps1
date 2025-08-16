# Test Health Endpoints for PHASE 0
Write-Host "=== Testing Health Endpoints ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"
$endpoints = @("/health", "/ready", "/version")

Write-Host "Testing backend health endpoints at: $baseUrl" -ForegroundColor Yellow
Write-Host ""

foreach ($endpoint in $endpoints) {
    $url = "$baseUrl$endpoint"
    Write-Host "Testing: $endpoint" -ForegroundColor Green
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
        Write-Host "✅ Status: $($response.status)" -ForegroundColor Green
        Write-Host "   Service: $($response.service)" -ForegroundColor White
        Write-Host "   Version: $($response.version)" -ForegroundColor White
        Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor White
        
        if ($endpoint -eq "/health" -and $response.memory) {
            Write-Host "   Memory Used: $([math]::Round($response.memory.used / 1MB, 2)) MB" -ForegroundColor White
        }
        
        if ($endpoint -eq "/ready" -and $response.checks) {
            Write-Host "   Readiness Checks:" -ForegroundColor White
            foreach ($check in $response.checks.PSObject.Properties) {
                Write-Host "     $($check.Name): $($check.Value)" -ForegroundColor White
            }
        }
        
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "=== Health Check Summary ===" -ForegroundColor Cyan
Write-Host "If all endpoints show ✅, the backend is healthy and ready for PHASE 0 testing." -ForegroundColor Green
Write-Host "If any show ❌, check that the backend service is running." -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Start the frontend: cd frontend && npm start" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Check the Health Check component on the dashboard" -ForegroundColor White
