# 🚀 SecureInsure Pro - Complete Application Setup & Troubleshooting Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Backend Services Setup](#backend-services-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [ExamOne Integration](#examone-integration)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Debugging Tools](#debugging-tools)
9. [Production Deployment](#production-deployment)

---

## 🚀 Quick Start

### Prerequisites
- **Java 17+** (for backend services)
- **Node.js 18+** (for frontend)
- **PostgreSQL 15+** (for database)
- **Redis 7+** (for caching)
- **Maven 3.8+** (for backend builds)

### One-Command Setup (Development)
```bash
# Clone and setup
git clone <your-repo>
cd secureinsure-pro

# Start all services with Docker Compose
docker-compose up -d

# Or run individually (see detailed sections below)
```

---

## 🔧 Backend Services Setup

### Service Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │ Policy Service  │    │ Claims Service  │
│   Port: 8081    │    │   Port: 8082    │    │   Port: 8083    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Port: 5432    │
                    └─────────────────┘
```

### 1. Auth Service (Port 8081)
```bash
cd backend/auth-service

# Install dependencies
mvn clean install

# Run with environment variables
export DB_HOST=localhost
export DB_USERNAME=postgres
export DB_PASSWORD=password
export JWT_SECRET=your-super-secret-jwt-key-here

# Start service
mvn spring-boot:run

# Verify it's running
curl http://localhost:8081/api/v1/auth/health
```

### 2. Policy Service (Port 8082) - **Main API for ExamOne**
```bash
cd backend/policy-service

# Install dependencies
mvn clean install

# Run with environment variables
export DB_HOST=localhost
export DB_USERNAME=postgres
export DB_PASSWORD=password
export REDIS_HOST=localhost
export JWT_SECRET=your-super-secret-jwt-key-here
export EXAMONE_API_BASE_URL=https://api.examone.com
export EXAMONE_API_USERNAME=your_examone_username
export EXAMONE_API_PASSWORD=your_examone_password
export EXAMONE_API_KEY=your_examone_api_key

# Start service
mvn spring-boot:run

# Verify it's running
curl http://localhost:8082/api/v1/policies/health
```

### 3. Claims Service (Port 8083)
```bash
cd backend/claims-service

# Install dependencies
mvn clean install

# Run with environment variables
export DB_HOST=localhost
export DB_USERNAME=postgres
export DB_PASSWORD=password

# Start service
mvn spring-boot:run

# Verify it's running
curl http://localhost:8083/api/v1/claims/health
```

---

## 🎨 Frontend Setup

### Development Server
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will be available at http://localhost:3000
```

### Build for Production
```bash
cd frontend

# Build the application
npm run build

# Preview production build
npm run preview
```

---

## 🗄️ Database Setup

### PostgreSQL Configuration
```sql
-- Create databases
CREATE DATABASE secureinsure;
CREATE DATABASE secureinsure_policy;
CREATE DATABASE secureinsure_claims;

-- Create user (if not exists)
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE secureinsure TO postgres;
GRANT ALL PRIVILEGES ON DATABASE secureinsure_policy TO postgres;
GRANT ALL PRIVILEGES ON DATABASE secureinsure_claims TO postgres;
```

### Environment Variables
Create `.env` files in each service:

**backend/auth-service/.env**
```env
DB_HOST=localhost
DB_USERNAME=postgres
DB_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key-here
```

**backend/policy-service/.env**
```env
DB_HOST=localhost
DB_USERNAME=postgres
DB_PASSWORD=password
REDIS_HOST=localhost
JWT_SECRET=your-super-secret-jwt-key-here
EXAMONE_API_BASE_URL=https://api.examone.com
EXAMONE_API_USERNAME=your_examone_username
EXAMONE_API_PASSWORD=your_examone_password
EXAMONE_API_KEY=your_examone_api_key
```

---

## 🔌 API Endpoints Reference

### Auth Service (Port 8081)
```bash
# Authentication
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/validate
GET  /api/v1/auth/health

# ExamOne Integration (Stub)
POST /api/v1/examone/lab-request
GET  /api/v1/examone/results

# Case Management
POST /api/v1/cases
GET  /api/v1/cases
PATCH /api/v1/cases/{caseId}/application/{section}
```

### Policy Service (Port 8082) - **Main API**
```bash
# Policy Management
GET    /api/v1/policies
POST   /api/v1/policies
GET    /api/v1/policies/{id}
PUT    /api/v1/policies/{id}
DELETE /api/v1/policies/{id}

# ExamOne Integration (Real)
POST   /api/v1/examone/lab-request
GET    /api/v1/examone/results
GET    /api/v1/examone/status

# Party Management
GET    /api/v1/parties
POST   /api/v1/parties
GET    /api/v1/parties/{id}
PUT    /api/v1/parties/{id}
DELETE /api/v1/parties/{id}

# Case Management
GET    /api/v1/cases
POST   /api/v1/cases
GET    /api/v1/cases/{id}
PUT    /api/v1/cases/{id}
PATCH  /api/v1/cases/{id}/application/{section}
```

### Claims Service (Port 8083)
```bash
# Claims Management
GET    /api/v1/claims
POST   /api/v1/claims
GET    /api/v1/claims/{id}
PUT    /api/v1/claims/{id}
DELETE /api/v1/claims/{id}
```

---

## 🧪 ExamOne Integration

### Current Implementation Status
- **Frontend**: Calls `http://localhost:8082/api/v1/examone/lab-request`
- **Backend**: Policy Service handles ExamOne integration
- **Configuration**: Environment variables for ExamOne API credentials

### ExamOne API Configuration
```yaml
# In policy-service application.yml
examone:
  api:
    base-url: https://api.examone.com
    username: ${EXAMONE_API_USERNAME}
    password: ${EXAMONE_API_PASSWORD}
    api-key: ${EXAMONE_API_KEY}
    timeout: 30000
```

### Testing ExamOne Integration
```bash
# Test lab request
curl -X POST http://localhost:8082/api/v1/examone/lab-request \
  -H "Content-Type: application/json" \
  -d '{"caseId": "test-case-123"}'

# Test results retrieval
curl "http://localhost:8082/api/v1/examone/results?caseId=test-case-123"
```

### Frontend ExamOne Components
- **ExamOneOrder.tsx**: Lab order placement
- **ExamOneResultsPage.tsx**: Results display
- **LabOrderPopup.tsx**: Popup for lab orders

---

## 🐛 Common Issues & Solutions

### 1. "No cases found" - Empty Dashboard
**Problem**: Dashboard shows empty state
**Solution**:
```bash
# Check if backend services are running
curl http://localhost:8081/api/v1/auth/health
curl http://localhost:8082/api/v1/policies/health
curl http://localhost:8083/api/v1/claims/health

# Check database connection
psql -h localhost -U postgres -d secureinsure_policy -c "SELECT COUNT(*) FROM policies;"

# Create test data
curl -X POST http://localhost:8082/api/v1/cases \
  -H "Content-Type: application/json" \
  -d '{"templateId": "default", "customerName": "Test Customer"}'
```

### 2. Frontend API Connection Issues
**Problem**: Frontend can't connect to backend
**Solution**:
```bash
# Check frontend API configuration
cat frontend/src/lib/api.ts

# Verify API base URL
export VITE_API_BASE_URL=http://localhost:8082

# Check CORS configuration in backend
# Add to application.yml:
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3000"
      allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
      allowed-headers: "*"
```

### 3. Database Connection Issues
**Problem**: Services can't connect to database
**Solution**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database exists
psql -h localhost -U postgres -l

# Test connection
psql -h localhost -U postgres -d secureinsure_policy -c "SELECT 1;"

# Check environment variables
echo $DB_HOST
echo $DB_USERNAME
echo $DB_PASSWORD
```

### 4. ExamOne API Issues
**Problem**: ExamOne integration not working
**Solution**:
```bash
# Check ExamOne credentials
echo $EXAMONE_API_USERNAME
echo $EXAMONE_API_PASSWORD
echo $EXAMONE_API_KEY

# Test ExamOne API directly
curl -X POST https://api.examone.com/lab-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EXAMONE_API_KEY" \
  -d '{"caseId": "test"}'

# Check policy service logs
tail -f backend/policy-service/logs/application.log
```

### 5. Port Conflicts
**Problem**: Services can't start due to port conflicts
**Solution**:
```bash
# Check which ports are in use
netstat -tulpn | grep :8081
netstat -tulpn | grep :8082
netstat -tulpn | grep :8083

# Kill processes using ports
sudo lsof -ti:8081 | xargs kill -9
sudo lsof -ti:8082 | xargs kill -9
sudo lsof -ti:8083 | xargs kill -9
```

---

## 🔍 Debugging Tools

### 1. Backend Logging
```bash
# Enable debug logging
export LOGGING_LEVEL_COM_SECUREINSURE=DEBUG
export LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=DEBUG

# View logs in real-time
tail -f backend/policy-service/logs/application.log
tail -f backend/auth-service/logs/application.log
```

### 2. Frontend Debugging
```bash
# Enable React DevTools
# Install browser extension

# Check network requests
# Open browser DevTools → Network tab

# Check console errors
# Open browser DevTools → Console tab
```

### 3. Database Debugging
```sql
-- Check table structure
\d policies
\d cases
\d parties

-- Check data
SELECT COUNT(*) FROM policies;
SELECT COUNT(*) FROM cases;
SELECT COUNT(*) FROM parties;

-- Check recent records
SELECT * FROM policies ORDER BY created_at DESC LIMIT 5;
```

### 4. API Testing
```bash
# Test all endpoints
./test-api.sh

# Or manually test each endpoint
curl -X GET http://localhost:8082/api/v1/policies
curl -X POST http://localhost:8082/api/v1/examone/lab-request \
  -H "Content-Type: application/json" \
  -d '{"caseId": "test-case"}'
```

---

## 🚀 Production Deployment

### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: secureinsure
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  auth-service:
    build: ./backend/auth-service
    ports:
      - "8081:8081"
    environment:
      - DB_HOST=postgres
      - DB_USERNAME=postgres
      - DB_PASSWORD=password

  policy-service:
    build: ./backend/policy-service
    ports:
      - "8082:8082"
    environment:
      - DB_HOST=postgres
      - DB_USERNAME=postgres
      - DB_PASSWORD=password
      - REDIS_HOST=redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:8082

volumes:
  postgres_data:
```

### Start All Services
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f policy-service
```

---

## 📞 Support & Troubleshooting

### Quick Health Check
```bash
# Run this script to check all services
#!/bin/bash
echo "🔍 Checking SecureInsure Pro Services..."

echo "📊 Database Status:"
psql -h localhost -U postgres -d secureinsure_policy -c "SELECT 1;" 2>/dev/null && echo "✅ Database: OK" || echo "❌ Database: FAILED"

echo "🔐 Auth Service:"
curl -s http://localhost:8081/api/v1/auth/health >/dev/null && echo "✅ Auth Service: OK" || echo "❌ Auth Service: FAILED"

echo "📋 Policy Service:"
curl -s http://localhost:8082/api/v1/policies/health >/dev/null && echo "✅ Policy Service: OK" || echo "❌ Policy Service: FAILED"

echo "💰 Claims Service:"
curl -s http://localhost:8083/api/v1/claims/health >/dev/null && echo "✅ Claims Service: OK" || echo "❌ Claims Service: FAILED"

echo "🎨 Frontend:"
curl -s http://localhost:3000 >/dev/null && echo "✅ Frontend: OK" || echo "❌ Frontend: FAILED"

echo "🧪 ExamOne Integration:"
curl -s -X POST http://localhost:8082/api/v1/examone/lab-request \
  -H "Content-Type: application/json" \
  -d '{"caseId":"test"}' >/dev/null && echo "✅ ExamOne: OK" || echo "❌ ExamOne: FAILED"
```

### Common Error Messages
- **"No cases found"**: Backend services not running or database empty
- **"Connection refused"**: Service not started or wrong port
- **"Authentication failed"**: Wrong credentials or JWT secret mismatch
- **"Database connection failed"**: PostgreSQL not running or wrong credentials

---

## 🎯 Next Steps

1. **Start Backend Services**: Follow the backend setup section
2. **Start Frontend**: Follow the frontend setup section
3. **Test ExamOne Integration**: Use the testing commands
4. **Create Test Data**: Use the API endpoints to create sample data
5. **Monitor Logs**: Use the debugging tools to monitor system health

---

**Need Help?** Check the logs, verify all services are running, and ensure database connectivity. The most common issue is services not running or wrong configuration.
