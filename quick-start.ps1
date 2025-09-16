# Start the database
Write-Host "Starting PostgreSQL..."
docker run -d --name secureinsure-postgres -e POSTGRES_DB=secureinsure_pro -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15-alpine

# Start Redis
Write-Host "Starting Redis..."
docker run -d --name secureinsure-redis -p 6379:6379 redis:7-alpine

# Start the backend services
Write-Host "Starting backend services..."
Set-Location -Path "$PSScriptRoot\backend"
& mvn clean package -DskipTests

# Start the gateway service
Write-Host "Starting gateway service..."
Start-Process -NoNewWindow -FilePath "mvn" -ArgumentList "spring-boot:run -pl gateway-service"

# Start the frontend
Write-Host "Starting frontend..."
Set-Location -Path "$PSScriptRoot\frontend"
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start"

Write-Host "All services have been started."
Write-Host "Frontend should be available at http://localhost:3000"
Write-Host "Backend API should be available at http://localhost:8080"
