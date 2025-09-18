# Start the database service
Write-Host "Starting PostgreSQL..."
docker run -d --name secureinsure-postgres -e POSTGRES_DB=secureinsure_pro -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15-alpine

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..."
Start-Sleep -Seconds 10

# Start Redis
Write-Host "Starting Redis..."
docker run -d --name secureinsure-redis -p 6379:6379 redis:7-alpine

# Start the backend services
Write-Host "Starting backend services..."
Set-Location -Path "$PSScriptRoot\backend"

# Build and start the services one by one
$services = @("auth-service", "admin-service", "policy-service", "claims-service", "notification-service", "search-service", "gateway-service")

foreach ($service in $services) {
    Write-Host "Building $service..."
    & mvn clean package -pl $service -am -DskipTests
    
    Write-Host "Starting $service..."
    & docker-compose up -d $service
    
    # Wait a bit between services
    Start-Sleep -Seconds 5
}

# Start the frontend
Write-Host "Starting frontend..."
Set-Location -Path "$PSScriptRoot\frontend"
& npm install
& npm start

Write-Host "All services have been started."
Write-Host "Frontend should be available at http://localhost:3000"
Write-Host "Backend API should be available at http://localhost:8080"
