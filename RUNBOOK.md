# SecureInsure Pro - Operational Runbook

## Table of Contents
1. [Application Overview](#application-overview)
2. [Architecture](#architecture)
3. [Logging Configuration](#logging-configuration)
4. [Monitoring & Health Checks](#monitoring--health-checks)
5. [Error Handling & Troubleshooting](#error-handling--troubleshooting)
6. [Performance Monitoring](#performance-monitoring)
7. [Security Monitoring](#security-monitoring)
8. [Deployment Procedures](#deployment-procedures)
9. [Backup & Recovery](#backup--recovery)
10. [Emergency Procedures](#emergency-procedures)

## Application Overview

SecureInsure Pro is a comprehensive insurance management platform featuring:
- Dynamic form system with Excel-based configuration
- AI-powered voice and text assistance
- Biometric authentication (Face, Fingerprint, WebAuthn)
- Multi-channel notifications (Email, SMS)
- Role-based access control
- Real-time validation and API integration

## Architecture

### Frontend (React + TypeScript)
- **Port**: 3000 (development), 80/443 (production)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context API
- **Build Tool**: Vite

### Backend (Spring Boot)
- **Port**: 8080 (gateway), 8081-8084 (services)
- **Framework**: Spring Boot 3.x
- **Java Version**: 17+
- **Database**: H2 (dev), PostgreSQL (prod)
- **Authentication**: JWT + Biometric

### Key Services
- **Gateway Service**: API routing and logging
- **Auth Service**: Authentication and authorization
- **Policy Service**: Insurance policy management
- **Claims Service**: Claims processing
- **Admin Service**: Administrative functions

## Logging Configuration

### Frontend Logging
```typescript
// Client-side logging to localStorage
const logToStorage = (level: string, message: string, data?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
  logs.push(logEntry);
  
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  
  localStorage.setItem('app_logs', JSON.stringify(logs));
};

// Usage
logToStorage('INFO', 'User logged in', { userId: '123' });
logToStorage('ERROR', 'API call failed', { endpoint: '/api/users', error: 'Network error' });
```

### Backend Logging
```yaml
# application.yml
logging:
  level:
    root: INFO
    com.secureinsure: DEBUG
    org.springframework.security: DEBUG
  
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  
  file:
    name: logs/secureinsure-pro.log
    max-size: 100MB
    max-history: 30
  
  logback:
    rollingpolicy:
      max-file-size: 100MB
      max-history: 30
      total-size-cap: 3GB
```

### Log Categories
- **Authentication**: Login attempts, biometric verification, session management
- **API Calls**: Request/response logging, performance metrics
- **User Actions**: Form submissions, data changes, navigation
- **System Events**: Service startup, health checks, configuration changes
- **Security Events**: Access violations, suspicious activities
- **Notifications**: Email/SMS delivery status, provider responses

## Monitoring & Health Checks

### Health Check Endpoints
```bash
# Gateway Service
GET /api/v1/health
GET /api/v1/logs/health

# Individual Services
GET /actuator/health
GET /actuator/info
GET /actuator/metrics
```

### Health Check Response Format
```json
{
  "status": "UP",
  "timestamp": "2024-01-15T10:00:00Z",
  "components": {
    "database": {
      "status": "UP",
      "details": {
        "responseTime": "15ms"
      }
    },
    "disk": {
      "status": "UP",
      "details": {
        "free": "2.5GB",
        "total": "10GB"
      }
    }
  }
}
```

### Monitoring Dashboard
- **URL**: `/monitoring` (Admin only)
- **Metrics**: Response times, error rates, user activity
- **Alerts**: Service down, high error rates, performance degradation
- **Logs**: Real-time log viewing and filtering

## Error Handling & Troubleshooting

### Common Frontend Errors

#### 1. Network Errors
```typescript
// Error: Failed to fetch
// Cause: Backend service unavailable or network issues
// Solution: Check backend health, network connectivity

const handleNetworkError = async (error: any) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    // Retry with exponential backoff
    await retryWithBackoff(apiCall, 3);
  }
};
```

#### 2. Authentication Errors
```typescript
// Error: 401 Unauthorized
// Cause: Expired or invalid JWT token
// Solution: Redirect to login, refresh token

const handleAuthError = (error: any) => {
  if (error.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};
```

#### 3. Validation Errors
```typescript
// Error: Form validation failed
// Cause: Invalid input data
// Solution: Display field-specific error messages

const displayValidationErrors = (errors: ValidationError[]) => {
  errors.forEach(error => {
    const field = document.getElementById(error.field);
    if (field) {
      field.classList.add('border-red-500');
      showErrorMessage(field, error.message);
    }
  });
};
```

### Common Backend Errors

#### 1. Database Connection Issues
```bash
# Error: Connection refused
# Cause: Database service down or network issues
# Solution: Check database service, restart if needed

# Check database status
sudo systemctl status postgresql

# Restart database
sudo systemctl restart postgresql

# Check connection
psql -h localhost -U secureinsure -d secureinsure_pro
```

#### 2. Memory Issues
```bash
# Error: OutOfMemoryError
# Cause: Insufficient heap memory
# Solution: Increase JVM heap size

# Update JVM options
export JAVA_OPTS="-Xmx2g -Xms1g"

# Restart service
sudo systemctl restart secureinsure-gateway
```

#### 3. Port Conflicts
```bash
# Error: Address already in use
# Cause: Another service using the port
# Solution: Find and stop conflicting service

# Find process using port
netstat -tulpn | grep :8080

# Kill process
sudo kill -9 <PID>
```

### Error Recovery Procedures

#### 1. Service Restart
```bash
# Restart specific service
sudo systemctl restart secureinsure-gateway

# Restart all services
sudo systemctl restart secureinsure-*

# Check service status
sudo systemctl status secureinsure-*
```

#### 2. Database Recovery
```bash
# Backup database
pg_dump -h localhost -U secureinsure secureinsure_pro > backup.sql

# Restore database
psql -h localhost -U secureinsure secureinsure_pro < backup.sql

# Check database integrity
psql -h localhost -U secureinsure -c "SELECT pg_check_visible('secureinsure_pro');"
```

#### 3. Log Analysis
```bash
# Search for errors in logs
grep -i "error\|exception\|failed" logs/secureinsure-pro.log

# Monitor logs in real-time
tail -f logs/secureinsure-pro.log | grep -i "error"

# Analyze log patterns
awk '/ERROR/ {print $1, $2, $NF}' logs/secureinsure-pro.log | sort | uniq -c
```

## Performance Monitoring

### Key Metrics
- **Response Time**: API endpoint response times
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Memory Usage**: JVM heap and system memory
- **CPU Usage**: System and application CPU utilization
- **Database Performance**: Query execution times, connection pool status

### Performance Thresholds
```yaml
# Performance alerts
alerts:
  response_time:
    warning: 1000ms
    critical: 3000ms
  
  error_rate:
    warning: 5%
    critical: 10%
  
  memory_usage:
    warning: 80%
    critical: 90%
  
  cpu_usage:
    warning: 70%
    critical: 85%
```

### Performance Optimization
```bash
# JVM tuning
export JAVA_OPTS="
  -Xmx4g -Xms2g
  -XX:+UseG1GC
  -XX:MaxGCPauseMillis=200
  -XX:+UseStringDeduplication
"

# Database optimization
# Update postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

## Security Monitoring

### Security Events
- **Failed Login Attempts**: Monitor for brute force attacks
- **Unauthorized Access**: Track access violations
- **Biometric Failures**: Monitor authentication failures
- **Data Access Patterns**: Unusual data access behavior
- **API Abuse**: Rate limiting violations

### Security Alerts
```yaml
# Security alert configuration
security_alerts:
  failed_logins:
    threshold: 5
    time_window: 5m
    action: "lock_account"
  
  unauthorized_access:
    threshold: 3
    time_window: 1h
    action: "alert_admin"
  
  data_breach:
    threshold: 1
    time_window: 1m
    action: "emergency_response"
```

### Security Procedures
```bash
# Lock compromised account
curl -X POST "http://localhost:8080/api/v1/admin/users/lock" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "compromised_user_id", "reason": "Security violation"}'

# Review security logs
grep -i "security\|unauthorized\|failed" logs/secureinsure-pro.log

# Check for suspicious IPs
awk '/FAILED_LOGIN/ {print $NF}' logs/secureinsure-pro.log | sort | uniq -c
```

## Deployment Procedures

### Development Deployment
```bash
# Frontend
cd frontend
npm install
npm run build
npm start

# Backend
cd backend
mvn clean install
mvn spring-boot:run
```

### Production Deployment
```bash
# Build production artifacts
cd frontend && npm run build
cd backend && mvn clean package -Pprod

# Deploy to production server
scp frontend/dist/* user@prod-server:/var/www/secureinsure/
scp backend/*/target/*.jar user@prod-server:/opt/secureinsure/

# Restart services
ssh user@prod-server "sudo systemctl restart secureinsure-*"
```

### Docker Deployment
```bash
# Build Docker images
docker build -t secureinsure-frontend:latest frontend/
docker build -t secureinsure-backend:latest backend/

# Run with Docker Compose
docker-compose up -d

# Check deployment status
docker-compose ps
docker-compose logs -f
```

### Blue-Green Deployment
```bash
# Deploy new version to green environment
./deploy.sh --environment=green --version=2.0.0

# Run health checks
./health-check.sh --environment=green

# Switch traffic to green
./switch-traffic.sh --from=blue --to=green

# Monitor for issues
./monitor.sh --environment=green --duration=10m

# Rollback if needed
./rollback.sh --to=blue
```

## Backup & Recovery

### Database Backup
```bash
# Daily backup
#!/bin/bash
BACKUP_DIR="/backup/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="secureinsure_pro"

# Create backup
pg_dump -h localhost -U secureinsure $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Verify backup
gunzip -c $BACKUP_DIR/backup_$DATE.sql.gz | head -n 5
```

### File System Backup
```bash
# Backup configuration files
tar -czf /backup/config/config_$DATE.tar.gz \
  /etc/secureinsure/ \
  /opt/secureinsure/config/

# Backup logs
tar -czf /backup/logs/logs_$DATE.tar.gz \
  /var/log/secureinsure/ \
  /opt/secureinsure/logs/
```

### Recovery Procedures
```bash
# Database recovery
psql -h localhost -U secureinsure -d secureinsure_pro < backup_20240115_100000.sql

# Configuration recovery
tar -xzf config_20240115_100000.tar.gz -C /

# Service restart after recovery
sudo systemctl restart secureinsure-*
```

## Emergency Procedures

### Service Outage Response
```bash
# 1. Assess impact
./assess-impact.sh

# 2. Notify stakeholders
./notify-stakeholders.sh --severity=high --message="Service outage detected"

# 3. Implement emergency response
./emergency-response.sh --action=degraded_mode

# 4. Restore service
./restore-service.sh

# 5. Post-mortem analysis
./post-mortem.sh --incident=service_outage_$(date +%Y%m%d)
```

### Data Breach Response
```bash
# 1. Isolate affected systems
./isolate-systems.sh --systems=compromised_services

# 2. Assess data exposure
./assess-exposure.sh --breach_type=suspected

# 3. Notify authorities
./notify-authorities.sh --breach_details=exposure_assessment

# 4. Implement containment
./contain-breach.sh --containment_plan=emergency

# 5. Begin recovery
./recover-systems.sh --recovery_plan=post_breach
```

### Disaster Recovery
```bash
# 1. Activate disaster recovery site
./activate-dr-site.sh --site=secondary_datacenter

# 2. Restore from backup
./restore-from-backup.sh --backup=latest_verified

# 3. Verify system integrity
./verify-integrity.sh --systems=all

# 4. Resume operations
./resume-operations.sh --mode=degraded

# 5. Return to primary site
./return-to-primary.sh --when=stable
```

## Maintenance Procedures

### Regular Maintenance
```bash
# Weekly maintenance
./weekly-maintenance.sh

# Monthly maintenance
./monthly-maintenance.sh

# Quarterly maintenance
./quarterly-maintenance.sh
```

### Maintenance Tasks
- **Log Rotation**: Compress and archive old logs
- **Database Maintenance**: Vacuum, analyze, reindex
- **Security Updates**: Apply patches and updates
- **Performance Tuning**: Optimize configurations
- **Backup Verification**: Test backup and recovery procedures

### Maintenance Windows
- **Scheduled**: Every Sunday 2:00-4:00 AM UTC
- **Emergency**: As needed with stakeholder notification
- **Duration**: Typically 2 hours, extendable if needed
- **Communication**: 24 hours advance notice for scheduled maintenance

## Support & Escalation

### Support Levels
1. **Level 1**: Basic troubleshooting and user support
2. **Level 2**: Technical issues and system administration
3. **Level 3**: Complex technical problems and development
4. **Level 4**: Vendor support and external resources

### Escalation Matrix
```
Issue Type          | Response Time | Escalation Path
--------------------|---------------|------------------
Service Down        | 15 minutes    | L1 → L2 → L3 → L4
Performance Issue   | 1 hour        | L1 → L2 → L3
User Access Issue   | 2 hours       | L1 → L2
Feature Request     | 24 hours      | L1 → L2 → L3
Bug Report          | 4 hours       | L1 → L2 → L3
```

### Contact Information
- **Emergency Hotline**: +1-800-SECURE-INS
- **Support Email**: support@secureinsure.com
- **On-Call Engineer**: pager@secureinsure.com
- **Management Escalation**: management@secureinsure.com

---

**Document Version**: 1.0
**Last Updated**: January 15, 2024
**Next Review**: February 15, 2024
**Maintained By**: DevOps Team
