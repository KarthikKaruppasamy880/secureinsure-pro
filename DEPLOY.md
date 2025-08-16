# SecureInsure Pro Deployment Guide

## Overview
This guide covers the complete deployment process for the SecureInsure Pro application, including both frontend and backend services.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Build Processes](#build-processes)
4. [Local Development](#local-development)
5. [Docker Deployment](#docker-deployment)
6. [Production Deployment](#production-deployment)
7. [Monitoring & Health Checks](#monitoring--health-checks)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **Java**: 17 or higher (OpenJDK or Oracle JDK)
- **Maven**: 3.8.0 or higher
- **Docker**: 20.10.0 or higher
- **Docker Compose**: 2.0.0 or higher
- **PostgreSQL**: 15.0 or higher
- **Redis**: 7.0 or higher
- **Elasticsearch**: 8.11.0 or higher

### Development Tools
- **Git**: Latest version
- **IDE**: VS Code, IntelliJ IDEA, or Eclipse
- **Postman** or **Insomnia** for API testing

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd secureinsure-pro
```

### 2. Environment Configuration

#### Frontend Environment
1. Copy the example environment file:
   ```bash
   cp docs/env-examples/frontend-env-example.txt frontend/.env.local
   ```

2. Edit `frontend/.env.local` and set your actual values:
   ```bash
   # API Configuration
   REACT_APP_API_BASE_URL=http://localhost:8080
   REACT_APP_WS_URL=ws://localhost:8084
   
   # Voice Services
   REACT_APP_VOICE_PROVIDER=azure
   REACT_APP_AZURE_SPEECH_KEY=your_actual_key
   
   # Notification Services
   REACT_APP_SENDGRID_API_KEY=your_actual_key
   REACT_APP_TWILIO_ACCOUNT_SID=your_actual_sid
   ```

#### Backend Environment
1. Copy the example environment file:
   ```bash
   cp docs/env-examples/backend-env-example.txt backend/.env.local
   ```

2. Edit `backend/.env.local` and set your actual values:
   ```bash
   # Database Configuration
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/secureinsure
   SPRING_DATASOURCE_USERNAME=secureinsure
   SPRING_DATASOURCE_PASSWORD=secureinsure123
   
   # JWT Configuration
   JWT_SECRET=your_actual_jwt_secret
   
   # External APIs
   SENDGRID_API_KEY=your_actual_key
   TWILIO_ACCOUNT_SID=your_actual_sid
   ```

### 3. Database Setup
```bash
# Start PostgreSQL (if using Docker)
docker run -d \
  --name postgres-secureinsure \
  -e POSTGRES_DB=secureinsure \
  -e POSTGRES_USER=secureinsure \
  -e POSTGRES_PASSWORD=secureinsure123 \
  -p 5432:5432 \
  postgres:15-alpine

# Initialize database schema
psql -h localhost -U secureinsure -d secureinsure -f backend/init-db.sql
```

## Build Processes

### Frontend Build

#### Development Build
```bash
cd frontend
npm install
npm start
```

#### Production Build
```bash
cd frontend
npm install
npm run build
```

**Expected Output:**
- Build artifacts in `frontend/build/` directory
- Static assets (HTML, CSS, JS) ready for deployment
- No build errors or warnings

#### Build Verification
```bash
# Check for build errors
npm run build

# Verify build output
ls -la build/
# Should contain: static/, asset-manifest.json, favicon.ico, index.html, etc.

# Test production build locally
npx serve -s build
```

### Backend Build

#### Maven Build
```bash
cd backend
mvn clean install
```

**Expected Output:**
- Compiled Java classes in `target/` directories
- JAR files for each service
- No compilation errors

#### Individual Service Builds
```bash
# Build specific service
cd backend/gateway-service
mvn clean package

# Build all services
cd backend
mvn clean install -DskipTests
```

#### Build Verification
```bash
# Check Maven build status
mvn verify

# Verify JAR files
ls -la */target/*.jar

# Check for compilation errors
mvn compile
```

## Local Development

### Frontend Development Server
```bash
cd frontend
npm start
```
- **URL**: http://localhost:3000
- **Features**: Hot reload, development tools, error overlay

### Backend Development Servers
```bash
# Start individual services
cd backend/gateway-service
mvn spring-boot:run

cd backend/auth-service
mvn spring-boot:run

# Or start all services using Docker Compose
docker-compose -f docker-compose.yml up -d
```

### Service URLs (Local Development)
- **Gateway Service**: http://localhost:8080
- **Auth Service**: http://localhost:8081
- **Policy Service**: http://localhost:8082
- **Claims Service**: http://localhost:8083
- **Notification Service**: http://localhost:8084
- **Admin Service**: http://localhost:8085
- **Search Service**: http://localhost:8086

## Docker Deployment

### Quick Start
```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Individual Service Deployment
```bash
# Build specific service
docker build -t secureinsure-gateway ./backend/gateway-service

# Run service
docker run -d \
  --name gateway-service \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=docker \
  secureinsure-gateway
```

### Production Docker Compose
```bash
# Use production configuration
docker-compose -f docker-compose.yml --env-file .env.production up -d
```

## Production Deployment

### 1. Environment Preparation
```bash
# Create production environment file
cp docs/env-examples/backend-env-example.txt .env.production

# Edit production values
nano .env.production
```

### 2. Build Production Artifacts
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
mvn clean package -DskipTests -Pprod
```

### 3. Deploy to Production
```bash
# Use deployment script
./scripts/deploy-production.sh

# Or manual deployment
docker-compose -f docker-compose.yml --env-file .env.production up -d
```

### 4. Health Checks
```bash
# Check service health
curl http://localhost:8080/actuator/health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health

# Check application version
curl http://localhost:8080/actuator/info
```

## Monitoring & Health Checks

### Health Endpoints
- **Liveness**: `/actuator/health/liveness`
- **Readiness**: `/actuator/health/readiness`
- **Health**: `/actuator/health`
- **Info**: `/actuator/info`
- **Metrics**: `/actuator/metrics`
- **Prometheus**: `/actuator/prometheus`

### Monitoring Stack
```bash
# Start monitoring services
docker-compose -f docker-compose.yml up -d prometheus grafana kibana

# Access monitoring dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
# Kibana: http://localhost:5601
```

### Log Aggregation
```bash
# View service logs
docker-compose logs -f gateway-service
docker-compose logs -f auth-service

# Centralized logging (if configured)
docker-compose logs -f loki
```

## Troubleshooting

### Common Issues

#### Frontend Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+

# Clear build cache
npm run build -- --reset-cache
```

#### Backend Build Failures
```bash
# Clear Maven cache
mvn clean
rm -rf ~/.m2/repository

# Check Java version
java -version  # Should be 17+

# Verify Maven installation
mvn --version
```

#### Docker Issues
```bash
# Check Docker status
docker info
docker-compose --version

# Clear Docker cache
docker system prune -a

# Check port conflicts
netstat -tulpn | grep :8080
```

#### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -h localhost -U secureinsure -d secureinsure -c "SELECT 1;"

# Check service status
docker-compose ps postgres

# View database logs
docker-compose logs postgres
```

### Performance Optimization

#### Frontend
- Enable production builds
- Use code splitting
- Implement lazy loading
- Optimize bundle size

#### Backend
- Configure connection pools
- Enable caching
- Use appropriate JVM flags
- Monitor memory usage

### Security Considerations
- Use strong JWT secrets
- Enable HTTPS in production
- Implement rate limiting
- Regular security updates
- Audit logging enabled

## Support

For additional support:
- Check the project documentation
- Review error logs
- Consult the troubleshooting section
- Contact the development team

---

**Last Updated**: August 2025
**Version**: 1.0.0 