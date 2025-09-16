# SecureInsure Pro - Simple Environment Setup

Write-Host "Setting up SecureInsure Pro environment..." -ForegroundColor Cyan

# Create backend .env file
Write-Host "Creating backend environment file..." -ForegroundColor Yellow
$backendEnv = @"
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=SecureInsure-JWT-Secret-Key-2024
JWT_EXPIRATION=86400000
SPRING_PROFILES_ACTIVE=local
"@

$backendEnv | Out-File -FilePath ".env" -Encoding UTF8

# Create frontend .env file
Write-Host "Creating frontend environment file..." -ForegroundColor Yellow
$frontendEnv = @"
REACT_APP_API_BASE_URL=http://localhost:8080
VITE_VOICE_ENABLED=true
VITE_VOICE_DEBUG=false
REACT_APP_APP_NAME=SecureInsure Pro
"@

New-Item -ItemType Directory -Force -Path "frontend" | Out-Null
$frontendEnv | Out-File -FilePath "frontend/.env" -Encoding UTF8
$frontendEnv | Out-File -FilePath "frontend/.env.local" -Encoding UTF8

# Create database init script
Write-Host "Creating database initialization script..." -ForegroundColor Yellow
$dbInit = @"
CREATE DATABASE IF NOT EXISTS secureinsure_auth;
CREATE DATABASE IF NOT EXISTS secureinsure_policy;
CREATE DATABASE IF NOT EXISTS secureinsure_claims;
CREATE DATABASE IF NOT EXISTS secureinsure_notifications;
CREATE DATABASE IF NOT EXISTS secureinsure_admin;
CREATE DATABASE IF NOT EXISTS secureinsure_search;
"@

New-Item -ItemType Directory -Force -Path "backend" | Out-Null
$dbInit | Out-File -FilePath "backend/init-db.sql" -Encoding UTF8

Write-Host "Environment setup complete!" -ForegroundColor Green
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "  - .env (backend)" -ForegroundColor White
Write-Host "  - frontend/.env (frontend)" -ForegroundColor White
Write-Host "  - backend/init-db.sql (database)" -ForegroundColor White
