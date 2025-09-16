# SecureInsure Pro - Environment Setup Script
# Sets up all necessary environment files and configurations

Write-Host "🔧 Setting up SecureInsure Pro environment..." -ForegroundColor Cyan

# Create backend environment file
Write-Host "📝 Creating backend environment configuration..." -ForegroundColor Yellow
$backendEnv = @"
# SecureInsure Pro Backend Configuration
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=SecureInsure-JWT-Secret-Key-2024-Very-Long-And-Secure-For-Production-Use
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# External API Configuration
EXAMONE_API_BASE_URL=https://api.examone.com
EXAMONE_API_USERNAME=demo_user
EXAMONE_API_PASSWORD=demo_password
EXAMONE_API_KEY=demo_api_key

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application Configuration
SPRING_PROFILES_ACTIVE=local
SERVER_PORT=8080

# Logging Configuration
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_SECUREINSURE=DEBUG

# Security Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=*

# File Upload Configuration
FILE_UPLOAD_MAX_SIZE=10MB
FILE_UPLOAD_TEMP_DIR=./temp/uploads

# Monitoring Configuration
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics,prometheus
MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=always
"@

$backendEnv | Out-File -FilePath ".env" -Encoding UTF8
$backendEnv | Out-File -FilePath "backend/.env" -Encoding UTF8

# Create frontend environment file
Write-Host "📝 Creating frontend environment configuration..." -ForegroundColor Yellow
$frontendEnv = @"
# SecureInsure Pro Frontend Configuration
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_API_VERSION=v1
REACT_APP_EXAMONE_API_URL=http://localhost:8082/api/v1/examone

# Feature Flags
VITE_VOICE_ENABLED=true
VITE_VOICE_DEBUG=false
VITE_BIOMETRIC_ENABLED=true
VITE_CHAT_ENABLED=true

# UI Configuration
REACT_APP_APP_NAME=SecureInsure Pro
REACT_APP_VERSION=1.0.0
REACT_APP_THEME=default

# Development Configuration
VITE_DEV_TOOLS=true
VITE_SOURCE_MAPS=true

# WebSocket Configuration (if using real-time features)
REACT_APP_WS_URL=ws://localhost:8080/ws

# Analytics (disabled for demo)
REACT_APP_ANALYTICS_ENABLED=false
REACT_APP_ANALYTICS_ID=

# External Services
REACT_APP_MAPS_API_KEY=your-maps-api-key
REACT_APP_PAYMENT_GATEWAY_URL=https://api.stripe.com

# Security
REACT_APP_SESSION_TIMEOUT=1800000
REACT_APP_IDLE_TIMEOUT=300000

# Performance
REACT_APP_LAZY_LOADING=true
REACT_APP_CACHE_ENABLED=true
"@

$frontendEnv | Out-File -FilePath "frontend/.env" -Encoding UTF8
$frontendEnv | Out-File -FilePath "frontend/.env.local" -Encoding UTF8

# Create Docker environment file
Write-Host "Creating Docker environment configuration..." -ForegroundColor Yellow
$dockerEnv = @"
# Docker Environment Configuration
COMPOSE_PROJECT_NAME=secureinsure-pro

# Database Configuration
POSTGRES_DB=secureinsure_pro
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Application Configuration
SPRING_PROFILES_ACTIVE=docker
NODE_ENV=production

# External API Configuration
EXAMONE_API_BASE_URL=https://api.examone.com
EXAMONE_API_USERNAME=demo_user
EXAMONE_API_PASSWORD=demo_password
EXAMONE_API_KEY=demo_api_key

# JWT Configuration
JWT_SECRET=SecureInsure-Docker-JWT-Secret-2024
JWT_EXPIRATION=86400000

# Network Configuration
GATEWAY_HOST=gateway-service
GATEWAY_PORT=8080

# Elasticsearch Configuration (if enabled)
ELASTICSEARCH_HOST=elasticsearch
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
"@

$dockerEnv | Out-File -FilePath ".env.docker" -Encoding UTF8

# Create production environment template
Write-Host "📝 Creating production environment template..." -ForegroundColor Yellow
$prodEnv = @"
# SecureInsure Pro Production Environment Template
# IMPORTANT: Update all values before deploying to production!

# Database Configuration (Use managed database service)
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=secureinsure_prod
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD

# Redis Configuration (Use managed Redis service)
REDIS_HOST=your-production-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_THIS_SECURE_PASSWORD

# JWT Configuration (Use strong, unique secrets)
JWT_SECRET=CHANGE_THIS_TO_A_VERY_LONG_SECURE_RANDOM_STRING_FOR_PRODUCTION
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=86400000

# External API Configuration
EXAMONE_API_BASE_URL=https://api.examone.com
EXAMONE_API_USERNAME=your-production-username
EXAMONE_API_PASSWORD=your-production-password
EXAMONE_API_KEY=your-production-api-key

# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@yourdomain.com

# Application Configuration
SPRING_PROFILES_ACTIVE=production
SERVER_PORT=8080
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com

# Security Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com
ALLOWED_HOSTS=yourdomain.com

# SSL/TLS Configuration
SSL_ENABLED=true
SSL_KEYSTORE_PATH=/etc/ssl/private/keystore.jks
SSL_KEYSTORE_PASSWORD=CHANGE_THIS_KEYSTORE_PASSWORD

# Monitoring and Logging
LOG_LEVEL=INFO
SENTRY_DSN=your-sentry-dsn
MONITORING_ENABLED=true

# File Storage (Use cloud storage in production)
FILE_STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket
AWS_REGION=us-east-1

# Performance Configuration
DATABASE_POOL_SIZE=20
REDIS_POOL_SIZE=10
CACHE_TTL=3600

# Feature Flags
VOICE_ENABLED=true
BIOMETRIC_ENABLED=true
CHAT_ENABLED=true
ANALYTICS_ENABLED=true
"@

$prodEnv | Out-File -FilePath ".env.production.template" -Encoding UTF8

# Create application configuration files
Write-Host "Creating application configuration files..." -ForegroundColor Yellow

# Create a comprehensive application.yml template
$appYml = @"
# SecureInsure Pro - Application Configuration
server:
  port: `${SERVER_PORT:8080}
  servlet:
    context-path: /api/v1

spring:
  application:
    name: secureinsure-pro
  
  datasource:
    url: jdbc:postgresql://`${DB_HOST:localhost}:`${DB_PORT:5432}/`${POSTGRES_DB:secureinsure_pro}
    username: `${DB_USERNAME:postgres}
    password: `${DB_PASSWORD:password}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: `${DATABASE_POOL_SIZE:10}
      minimum-idle: 5
      idle-timeout: 300000
      max-lifetime: 1800000
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        jdbc:
          time_zone: UTC
  
  redis:
    host: `${REDIS_HOST:localhost}
    port: `${REDIS_PORT:6379}
    password: `${REDIS_PASSWORD:}
    timeout: 2000ms
    jedis:
      pool:
        max-active: `${REDIS_POOL_SIZE:8}
        max-idle: 8
        min-idle: 0
  
  servlet:
    multipart:
      max-file-size: `${FILE_UPLOAD_MAX_SIZE:10MB}
      max-request-size: `${FILE_UPLOAD_MAX_SIZE:10MB}

# JWT Configuration
jwt:
  secret: `${JWT_SECRET:default-secret}
  expiration: `${JWT_EXPIRATION:86400000}
  refresh-expiration: `${JWT_REFRESH_EXPIRATION:604800000}

# CORS Configuration
cors:
  allowed-origins: `${CORS_ALLOWED_ORIGINS:http://localhost:3000}
  allowed-methods: `${CORS_ALLOWED_METHODS:GET,POST,PUT,DELETE,OPTIONS}
  allowed-headers: `${CORS_ALLOWED_HEADERS:*}

# External APIs
examone:
  api:
    base-url: `${EXAMONE_API_BASE_URL:https://api.examone.com}
    username: `${EXAMONE_API_USERNAME:}
    password: `${EXAMONE_API_PASSWORD:}
    api-key: `${EXAMONE_API_KEY:}

# Email Configuration
mail:
  smtp:
    host: `${SMTP_HOST:localhost}
    port: `${SMTP_PORT:587}
    username: `${SMTP_USERNAME:}
    password: `${SMTP_PASSWORD:}
    from: `${SMTP_FROM_EMAIL:noreply@secureinsure.com}

# Logging Configuration
logging:
  level:
    root: `${LOG_LEVEL:INFO}
    com.secureinsure: `${LOGGING_LEVEL_COM_SECUREINSURE:DEBUG}
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# Management Endpoints
management:
  endpoints:
    web:
      exposure:
        include: `${MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE:health,info,metrics}
  endpoint:
    health:
      show-details: `${MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS:when-authorized}

# Application Features
features:
  voice:
    enabled: `${VOICE_ENABLED:true}
  biometric:
    enabled: `${BIOMETRIC_ENABLED:true}
  chat:
    enabled: `${CHAT_ENABLED:true}
  analytics:
    enabled: `${ANALYTICS_ENABLED:false}
"@

$appYml | Out-File -FilePath "backend/src/main/resources/application.yml" -Encoding UTF8

# Create database initialization script
Write-Host "Creating database initialization script..." -ForegroundColor Yellow
$initDbSql = @"
-- SecureInsure Pro Database Initialization Script
-- This script creates all required databases and users

-- Create databases for each microservice
CREATE DATABASE IF NOT EXISTS secureinsure_auth;
CREATE DATABASE IF NOT EXISTS secureinsure_policy;
CREATE DATABASE IF NOT EXISTS secureinsure_claims;
CREATE DATABASE IF NOT EXISTS secureinsure_notifications;
CREATE DATABASE IF NOT EXISTS secureinsure_admin;
CREATE DATABASE IF NOT EXISTS secureinsure_search;
CREATE DATABASE IF NOT EXISTS secureinsure_chatbot;

-- Create application user (optional, for production)
-- CREATE USER IF NOT EXISTS 'secureinsure'@'%' IDENTIFIED BY 'secure_password';
-- GRANT ALL PRIVILEGES ON secureinsure_*.* TO 'secureinsure'@'%';
-- FLUSH PRIVILEGES;

-- Initialize basic data
\c secureinsure_auth;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    user_type VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT REFERENCES users(id),
    role_id BIGINT REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('ADMIN', 'Administrator role with full access'),
    ('UNDERWRITER', 'Underwriter role for policy review'),
    ('USER', 'Standard user role'),
    ('CUSTOMER', 'Customer role for policy holders')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: Test@1234)
INSERT INTO users (username, email, password, first_name, last_name, phone_number, user_type) VALUES 
    ('admin_test', 'admin_test@secureinsure.com', '$2a$10$8K1p/a0dURdvs8aUQUXdaOCf/r2h5rQUGHoQ5Ks3wGx8qJ9rL0nFW', 'Admin', 'Test', '+1234567890', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.username = 'admin_test' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

COMMIT;
"@

$initDbSql | Out-File -FilePath "backend/init-db.sql" -Encoding UTF8

# Create quick reference file
Write-Host "Creating quick reference guide..." -ForegroundColor Yellow
$quickRef = @"
# SecureInsure Pro - Quick Reference

## 🚀 Getting Started
1. Run setup: ./setup-environment.ps1
2. Start app: ./start-secureinsure.ps1
3. Open browser: http://localhost:3000
4. Login: admin_test / Test@1234

## 📂 Environment Files Created
- .env (Backend configuration)
- frontend/.env (Frontend configuration)
- .env.docker (Docker configuration)
- .env.production.template (Production template)

## 🔧 Configuration Files
- backend/src/main/resources/application.yml
- backend/init-db.sql
- docker-compose.yml (main)
- docker-compose-simple.yml (infrastructure only)

## 🌐 Service URLs
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Auth Service: http://localhost:8081
- API Documentation: http://localhost:8080/swagger-ui.html

## 🔑 Default Credentials
- Admin: admin_test / Test@1234
- Underwriter: underwriter1 / SecurePass123!
- Customer: customer1 / CustomerPass123!

## 🛠️ Management Commands
- Start all: ./start-secureinsure.ps1
- Full deployment: ./deploy-complete-stack.ps1
- Docker only: docker-compose up -d
- Stop all: docker-compose down
- Clean restart: docker-compose down -v && ./start-secureinsure.ps1

## 📊 Health Checks
- Auth Service: http://localhost:8081/actuator/health
- Gateway: http://localhost:8080/actuator/health
- Database: docker exec -it secureinsure-postgres psql -U postgres -c "SELECT version();"

## 🔍 Troubleshooting
1. Check logs: docker-compose logs -f
2. Verify ports: netstat -ano | findstr ":8080"
3. Clean Docker: docker system prune -f
4. Restart services: ./start-secureinsure.ps1

## 📚 Documentation
- Complete Guide: COMPLETE_DEPLOYMENT_GUIDE.md
- API Docs: http://localhost:8080/swagger-ui.html
- AWS Deployment: AWS_DEPLOYMENT_GUIDE.md

Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

$quickRef | Out-File -FilePath "QUICK_REFERENCE.md" -Encoding UTF8

Write-Host @"
✅ Environment setup complete!

📂 Files created:
   - .env (backend configuration)
   - frontend/.env (frontend configuration)
   - .env.docker (Docker configuration)
   - .env.production.template (production template)
   - backend/init-db.sql (database initialization)
   - QUICK_REFERENCE.md (quick reference guide)

🚀 Next steps:
   1. Review and customize environment files
   2. Run: ./start-secureinsure.ps1
   3. Open: http://localhost:3000
   4. Login: admin_test / Test@1234

📚 See QUICK_REFERENCE.md for all commands and URLs
"@ -ForegroundColor Green
