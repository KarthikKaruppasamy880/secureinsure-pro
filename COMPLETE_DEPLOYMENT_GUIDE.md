# 🚀 SecureInsure Pro - Complete Deployment Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Quick Start (Recommended)](#quick-start-recommended)
3. [Docker Deployment](#docker-deployment)
4. [Local Development Setup](#local-development-setup)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)
7. [API Documentation](#api-documentation)

## 🎯 System Requirements

### Required Software
- **Docker Desktop**: Latest version (for containerized deployment)
- **Node.js**: v18 or later (for frontend)
- **Git**: Latest version
- **PowerShell**: 5.1 or later (Windows) or PowerShell Core (Cross-platform)

### Optional (for local development)
- **Java**: 17 or later
- **Maven**: 3.8.4 or later
- **PostgreSQL**: 15 or later
- **Redis**: 7 or later

## 🚀 Quick Start (Recommended)

### Option 1: One-Click Docker Deployment
```powershell
# Run the complete deployment script
powershell -ExecutionPolicy Bypass -File ./deploy-complete-stack.ps1
```

### Option 2: Infrastructure + Mock Services
```powershell
# Start infrastructure and mock services (fastest startup)
powershell -ExecutionPolicy Bypass -File ./deploy-simple.ps1
```

### Option 3: Full Microservices Stack
```powershell
# Full microservices deployment with Docker
powershell -ExecutionPolicy Bypass -File ./docker-startup.ps1
```

## 🐳 Docker Deployment

### Infrastructure Only (Fastest)
```powershell
# Start databases and infrastructure
docker-compose -f docker-compose-simple.yml up -d

# Start mock auth service
node mock-auth-server.js &

# Start frontend
cd frontend && npm start
```

### Full Stack Deployment
```powershell
# Complete microservices stack
docker-compose up --build -d

# Monitor logs
docker-compose logs -f
```

### Custom Configuration
```powershell
# Use environment-specific compose file
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

## 💻 Local Development Setup

### 1. Clone and Setup
```bash
git clone <repository-url>
cd secureinsure-pro
```

### 2. Environment Configuration
```powershell
# Copy environment templates
copy backend.env.example .env
copy frontend/env.example frontend/.env.local
```

### 3. Database Setup
```powershell
# Start PostgreSQL
docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15

# Initialize databases
docker exec -i postgres psql -U postgres < backend/init-db.sql
```

### 4. Start Services
```powershell
# Terminal 1: Start infrastructure
docker-compose -f docker-compose-simple.yml up -d

# Terminal 2: Start backend services (if using Java/Maven)
cd backend && mvn spring-boot:run -pl gateway-service

# Terminal 3: Start frontend
cd frontend && npm start
```

## 🌐 Production Deployment

### AWS Deployment
```powershell
# Deploy to AWS ECS
powershell -ExecutionPolicy Bypass -File ./aws/scripts/deploy.ps1
```

### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml secureinsure
```

### Kubernetes
```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n secureinsure
```

## 🔧 Configuration

### Environment Variables

#### Backend Services
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400000

# External APIs
EXAMONE_API_BASE_URL=https://api.examone.com
EXAMONE_API_USERNAME=your-username
EXAMONE_API_PASSWORD=your-password
```

#### Frontend
```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_EXAMONE_API_URL=http://localhost:8082/api/v1/examone
VITE_VOICE_ENABLED=true
VITE_VOICE_DEBUG=false
```

## 📊 Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React Application |
| Gateway | 8080 | API Gateway |
| Auth Service | 8081 | Authentication |
| Policy Service | 8082 | Policy Management |
| Claims Service | 8083 | Claims Processing |
| Notification Service | 8084 | Notifications |
| Admin Service | 8085 | Administration |
| Search Service | 8086 | Search & Analytics |
| Chatbot Service | 8087 | AI Chatbot |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |
| Elasticsearch | 9200 | Search Engine |
| Nginx | 80/443 | Reverse Proxy |

## 🔍 Health Checks

### Service Health Endpoints
```bash
# Gateway Service
curl http://localhost:8080/actuator/health

# Auth Service
curl http://localhost:8081/actuator/health

# Policy Service
curl http://localhost:8082/actuator/health

# Frontend
curl http://localhost:3000
```

### Database Connectivity
```bash
# PostgreSQL
docker exec -it secureinsure-postgres psql -U postgres -c "SELECT version();"

# Redis
docker exec -it secureinsure-redis redis-cli ping
```

## 🧪 Testing

### API Testing
```bash
# Test authentication
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_test","password":"Test@1234"}'

# Test policy creation
curl -X GET http://localhost:8082/api/v1/policies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### End-to-End Testing
```powershell
# Run complete application test
powershell -ExecutionPolicy Bypass -File ./complete-application-test.ps1
```

## 🐛 Troubleshooting

### Common Issues

#### Port Conflicts
```powershell
# Find processes using ports
netstat -ano | findstr ":8080"

# Kill process by PID
taskkill /PID <PID> /F
```

#### Docker Issues
```bash
# Clean up containers
docker system prune -f

# Rebuild images
docker-compose build --no-cache

# View logs
docker-compose logs -f [service-name]
```

#### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Frontend Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Log Locations
- **Docker Logs**: `docker-compose logs -f [service]`
- **Application Logs**: `/app/logs/` (inside containers)
- **Frontend Logs**: Browser Developer Console

## 📚 API Documentation

### Swagger UI
- **Gateway**: http://localhost:8080/swagger-ui.html
- **Auth Service**: http://localhost:8081/swagger-ui.html
- **Policy Service**: http://localhost:8082/swagger-ui.html

### Test Accounts

#### Admin User
- **Username**: admin_test
- **Password**: Test@1234
- **Roles**: ADMIN, USER

#### Underwriter
- **Username**: underwriter1
- **Password**: SecurePass123!
- **Roles**: UNDERWRITER, USER

#### Customer
- **Username**: customer1
- **Password**: CustomerPass123!
- **Roles**: USER

## 🔐 Security Considerations

### Development Environment
- Default passwords are used (change in production)
- JWT secrets are hardcoded (use environment variables in production)
- HTTPS is not enabled (enable for production)

### Production Checklist
- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Set up monitoring and alerting

## 📞 Support

### Quick Commands Reference
```powershell
# Start everything
./deploy-complete-stack.ps1

# Stop everything
docker-compose down

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Restart service
docker-compose restart [service-name]
```

### Getting Help
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check port availability
4. Review this troubleshooting guide
5. Check GitHub issues/documentation

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Version**: 1.0.0
**Status**: Production Ready ✅
