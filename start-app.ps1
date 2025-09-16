# start-app.ps1
param(
  [string]$FrontPort = "3000",
  [string]$ApiPort    = "8082",     # change to 8081 if that's your backend
  [int]$Retries       = 40,
  [int]$SleepSeconds  = 3
)

$ErrorActionPreference = "Stop"

function Wait-On {
  param([string]$Url, [string]$Name)
  Write-Host "Waiting for $Name at $Url ..."
  for ($i=1; $i -le $Retries; $i++) {
    try {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) {
        Write-Host "SUCCESS: $Name is responding ($($r.StatusCode))."
        return $true
      }
    } catch { Start-Sleep -Seconds $SleepSeconds }
  }
  Write-Host "ERROR: $Name did not come up in time."
  return $false
}

function Show-PortOwner {
  param([string]$Port)
  try {
    $p = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($p) { Write-Host "INFO: Port $Port in use by PID(s): " ($p | Select-Object -Expand OwningProcess -Unique) }
  } catch {}
}

Write-Host "`n=== 0) Basic checks ==="
Show-PortOwner $FrontPort
Show-PortOwner $ApiPort

Write-Host "`n=== 1) Prefer docker-compose if present ==="
$compose = (Test-Path "./docker-compose.yml") -or (Test-Path "./docker-compose.yaml")
if ($compose) {
  Write-Host "DOCKER: docker-compose detected. Rebuilding and starting..."
  docker compose down --remove-orphans | Out-Null
  docker compose build --no-cache | Out-Null
  docker compose up -d
} else {
  Write-Host "LOCAL: No docker-compose found; starting local dev servers."
  if (Test-Path "./backend") {
    Push-Location ./backend
    if (Test-Path "./mvnw") {
      Write-Host "STARTING: Spring Boot (backend) ..."
      Start-Process -NoNewWindow -PassThru -FilePath "cmd.exe" -ArgumentList '/c', '.\mvnw spring-boot:run' | Out-Null
    } elseif (Test-Path "package.json") {
      Write-Host "STARTING: Node backend ..."
      npm ci
      Start-Process -NoNewWindow -PassThru -FilePath "cmd.exe" -ArgumentList '/c', 'npm run start' | Out-Null
    }
    Pop-Location
  }
  if (Test-Path "./frontend") {
    Push-Location ./frontend
    if (Test-Path "package.json") {
      Write-Host "STARTING: Vite (frontend) ..."
      if (Test-Path ".\.env.local" -eq $false) {
        'VITE_API_BASE_URL=http://localhost:' + $ApiPort | Out-File -Encoding utf8 .\.env.local
      }
      npm ci
      Start-Process -NoNewWindow -PassThru -FilePath "cmd.exe" -ArgumentList '/c', 'npm run dev' | Out-Null
    }
    Pop-Location
  }
}

Write-Host "`n=== 2) Health checks ==="
$apiOk    = Wait-On ("http://localhost:$ApiPort/actuator/health") "Backend /health"
$frontOk  = Wait-On ("http://localhost:$FrontPort") "Frontend"

if (-not $apiOk) {
  Write-Warning "Backend didn't pass /health. Tail logs:"
  if ($compose) { docker compose logs --tail=200 backend }
  else { Write-Host "Check your backend console window or logs (target port $ApiPort)." }
  exit 1
}

# Optional: CORS test
try {
  $r = Invoke-WebRequest -Uri ("http://localhost:$ApiPort/actuator/info") -UseBasicParsing -TimeoutSec 5
  Write-Host "INFO: /actuator/info => $($r.StatusCode)"
} catch { Write-Host "INFO: /actuator/info unavailable (ok if not enabled)." }

if (-not $frontOk) {
  Write-Warning "Frontend isn't responding on :$FrontPort."
  Write-Host "If you see the Nginx welcome page, rebuild your frontend image or run Vite (port 5173)."
  exit 1
}

Write-Host "`n=== 3) Open browser ==="
Start-Process ("http://localhost:$FrontPort")

Write-Host "`nSUCCESS: App should be up. If login fails, run:"
Write-Host "  docker compose logs -f backend   # or check backend console"
Write-Host "  docker compose logs -f web       # your nginx/frontend container"