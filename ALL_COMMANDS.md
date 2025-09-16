# 📋 SecureInsure Pro - All Commands Reference

## 🚀 QUICK START COMMANDS

### One-Click Startup (Recommended)
```powershell
# Simple startup (works without Docker)
powershell -ExecutionPolicy Bypass -File ./start-secureinsure.ps1
```

### Full Deployment Options
```powershell
# Complete deployment with Docker
powershell -ExecutionPolicy Bypass -File ./deploy-complete-stack.ps1

# Quick deployment (infrastructure + mock services)
powershell -ExecutionPolicy Bypass -File ./deploy-complete-stack.ps1 -DeploymentType quick

# Local development
powershell -ExecutionPolicy Bypass -File ./deploy-complete-stack.ps1 -DeploymentType local

# Full Docker stack
powershell -ExecutionPolicy Bypass -File ./deploy-complete-stack.ps1 -DeploymentType docker
```

---

## 🔧 SETUP COMMANDS

### Environment Setup
```powershell
# Setup all environment files
powershell -ExecutionPolicy Bypass -File ./setup-env-simple.ps1
```

### Manual Environment Creation
```powershell
# Create .env file
echo "DB_HOST=localhost
DB_PASSWORD=password
JWT_SECRET=SecureInsure-JWT-Secret-Key-2024" > .env

# Create frontend .env
mkdir frontend -ErrorAction SilentlyContinue
echo "REACT_APP_API_BASE_URL=http://localhost:8080
VITE_VOICE_ENABLED=true" > frontend/.env
```

---

## 🐳 DOCKER COMMANDS

### Full Stack Deployment
```powershell
# Start everything with Docker
docker-compose up --build -d

# Start infrastructure only
docker-compose -f docker-compose-simple.yml up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Clean restart
docker-compose down -v
docker system prune -f
docker-compose up --build -d
```

### Individual Service Management
```powershell
# Restart specific service
docker-compose restart frontend
docker-compose restart auth-service

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f gateway-service

# Scale services
docker-compose up -d --scale frontend=2
```

---

## 🌐 APPLICATION COMMANDS

### Frontend
```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Backend (if Java/Maven available)
```powershell
# Navigate to backend
cd backend

# Build all services
mvn clean install

# Start gateway service
mvn spring-boot:run -pl gateway-service

# Start specific service
mvn spring-boot:run -pl auth-service
mvn spring-boot:run -pl policy-service
```

### Mock Services
```powershell
# Start mock auth server
node mock-auth-server.js

# Start with specific port
node mock-auth-server.js --port 8081

# Background process
Start-Process -FilePath "node" -ArgumentList "mock-auth-server.js" -WindowStyle Minimized
```

---

## 🔍 MONITORING COMMANDS

### Health Checks
```powershell
# Check all services
curl http://localhost:3000                  # Frontend
curl http://localhost:8080/actuator/health  # Gateway
curl http://localhost:8081/actuator/health  # Auth Service

# Database health
docker exec -it secureinsure-postgres psql -U postgres -c "SELECT version();"

# Redis health
docker exec -it secureinsure-redis redis-cli ping
```

### Port Management
```powershell
# Check what's running on ports
netstat -ano | findstr ":3000"
netstat -ano | findstr ":8080"
netstat -ano | findstr ":8081"

# Kill process on specific port
$port = 8080
$processes = netstat -ano | findstr ":$port"
# Extract PID and kill: taskkill /PID <PID> /F
```

### Logs and Debugging
```powershell
# View Docker logs
docker-compose logs -f --tail=100

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f auth-service

# Container inspection
docker inspect secureinsure-frontend
docker exec -it secureinsure-postgres bash
```

---

## 🧪 TESTING COMMANDS

### API Testing
```powershell
# Test authentication
$body = '{"username":"admin_test","password":"Test@1234"}'
Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"

# Test health endpoints
Invoke-WebRequest -Uri "http://localhost:8081/actuator/health"
Invoke-WebRequest -Uri "http://localhost:3000"
```

### User Creation
```powershell
# Create admin user
$adminUser = @{
    username = "admin_test"
    email = "admin_test@secureinsure.com"
    password = "Test@1234"
    firstName = "Admin"
    lastName = "Test"
    userType = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/register" -Method POST -Body $adminUser -ContentType "application/json"
```

### End-to-End Testing
```powershell
# Run complete application test
powershell -ExecutionPolicy Bypass -File ./complete-application-test.ps1

# Manual testing checklist
# 1. Open http://localhost:3000
# 2. Login with admin_test / Test@1234
# 3. Navigate through dashboard
# 4. Test search functionality
# 5. Test voice search (if enabled)
# 6. Create/view policies
```

---

## 🛠️ MAINTENANCE COMMANDS

### Regular Maintenance
```powershell
# Update dependencies
cd frontend && npm update
cd backend && mvn versions:use-latest-versions

# Clean up Docker
docker system prune -f
docker volume prune -f
docker network prune -f

# Restart all services
./start-secureinsure.ps1
```

### Backup and Restore
```powershell
# Backup database
docker exec secureinsure-postgres pg_dump -U postgres secureinsure_pro > backup.sql

# Restore database
docker exec -i secureinsure-postgres psql -U postgres secureinsure_pro < backup.sql

# Backup volumes
docker run --rm -v secureinsure-pro_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

---

## 🔐 SECURITY COMMANDS

### SSL/TLS Setup
```powershell
# Generate self-signed certificate (development)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Configure nginx with SSL
# Edit nginx/nginx.conf and add SSL configuration
```

### Environment Security
```powershell
# Generate secure JWT secret
$secret = [System.Web.Security.Membership]::GeneratePassword(64, 0)
echo "JWT_SECRET=$secret" >> .env

# Update database passwords
# Edit .env file and update DB_PASSWORD
# Restart services after password change
```

---

## 📊 PERFORMANCE COMMANDS

### Resource Monitoring
```powershell
# Docker resource usage
docker stats

# Container resource limits
docker update --memory="1g" --cpus="1.5" secureinsure-frontend

# Database performance
docker exec secureinsure-postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### Optimization
```powershell
# Frontend build optimization
cd frontend
npm run build -- --analyze

# Database optimization
docker exec secureinsure-postgres psql -U postgres -c "VACUUM ANALYZE;"

# Redis memory usage
docker exec secureinsure-redis redis-cli info memory
```

---

## 🌐 DEPLOYMENT COMMANDS

### Local Deployment
```powershell
# Development mode
./deploy-complete-stack.ps1 -DeploymentType local

# Production mode
./deploy-complete-stack.ps1 -DeploymentType production
```

### Cloud Deployment
```powershell
# AWS deployment
./aws/scripts/deploy.ps1

# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml secureinsure

# Kubernetes
kubectl apply -f k8s/
kubectl get pods -n secureinsure
```

---

## 📋 TROUBLESHOOTING COMMANDS

### Common Fixes
```powershell
# Fix port conflicts
./deploy-complete-stack.ps1  # Automatically cleans ports

# Fix Docker issues
docker-compose down -v
docker system prune -f
docker-compose up --build -d

# Fix npm issues
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Fix database issues
docker-compose restart postgres
docker exec secureinsure-postgres psql -U postgres -c "SELECT version();"
```

### Emergency Recovery
```powershell
# Complete reset
docker-compose down -v
docker system prune -af
rm -rf frontend/node_modules
./setup-env-simple.ps1
./start-secureinsure.ps1

# Service-specific restart
docker-compose restart [service-name]
```

---

## 📞 SUPPORT COMMANDS

### Information Gathering
```powershell
# System information
docker version
node --version
npm --version

# Service status
docker-compose ps
netstat -ano | findstr ":3000\|:8080\|:8081"

# Log collection
docker-compose logs > all-logs.txt
```

### Quick Diagnostics
```powershell
# Run diagnostics
powershell -ExecutionPolicy Bypass -File ./diagnose-issues.ps1

# Health check all services
$services = @("http://localhost:3000", "http://localhost:8080/actuator/health", "http://localhost:8081/actuator/health")
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service -TimeoutSec 5
        Write-Host "✅ $service : OK"
    } catch {
        Write-Host "❌ $service : FAILED"
    }
}
```

---

## 🎯 MOST COMMONLY USED COMMANDS

### Daily Usage
```powershell
# Start application
./start-secureinsure.ps1

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart application
./start-secureinsure.ps1
```

### When Things Go Wrong
```powershell
# Complete restart
docker-compose down -v && ./start-secureinsure.ps1

# Clean Docker
docker system prune -f

# Fix frontend
cd frontend && rm -rf node_modules && npm install && npm start
```

---

**💡 Pro Tip**: Bookmark this file for quick reference to all SecureInsure Pro commands!
