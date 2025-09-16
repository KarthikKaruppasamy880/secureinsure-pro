# SecureInsure Pro - Runbook

## Prerequisites

- **Node.js**: 20.x
- **Java**: 17
- **Maven**: 3.9+
- **Docker**: Latest
- **Docker Compose**: Latest

## Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws

# Feature Flags
VITE_VOICE_ENABLED=true
DEV_TEMPLATE_BYPASS=true
EXAMONE_MOCK=true

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://192.168.0.0/16,http://10.0.0.0/8
```

## Quick Start Commands

### 1. Start All Services
```bash
docker-compose up -d postgres redis auth-service frontend
```

### 2. Verify Health
```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/ready
curl -i http://localhost:3000/version
```

### 3. Test Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Development Commands

### Backend (Spring Boot)
```bash
cd backend/auth-service
mvn clean package -DskipTests
mvn spring-boot:run
```

### Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```

### Build & Deploy
```bash
# Build all services
docker-compose build --no-cache

# Start production
docker-compose up -d
```

## API Endpoints

### Health & Status
- `GET /health` - Service health check
- `GET /ready` - Readiness probe
- `GET /version` - Version information

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/validate` - Token validation

### Case Management
- `POST /api/v1/auth/cases` - Create new case
- `PATCH /api/v1/auth/cases/{caseId}/application/{section}` - Update section

### Search & Chatbot
- `GET /search?q={query}` - Search cases/policies
- `POST /api/v1/auth/chatbot/session/start` - Start chatbot session

### TX1 Import
- `POST /api/v1/auth/tx1/import` - Import TX1 XML data

### ExamOne Integration
- `POST /api/v1/auth/examone/lab-request` - Submit lab request
- `GET /api/v1/auth/examone/results?caseId={id}` - Get lab results

### Voice Features
- `WebSocket /ws` - Voice assistant connection

## Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| user | user123 | USER |
| agent | agent123 | AGENT |

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGINS` environment variable
   - Verify nginx proxy configuration

2. **WebSocket Connection Failed**
   - Ensure `VITE_WS_URL` is set correctly
   - Check nginx WebSocket proxy configuration

3. **Health Endpoints 404**
   - Verify Spring Boot actuator is enabled
   - Check nginx proxy routes

4. **FormEngine Crashes**
   - Check for null/undefined field metadata
   - Verify template structure

5. **Case Creation Fails**
   - Enable `DEV_TEMPLATE_BYPASS=true`
   - Check template seeding

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f auth-service
docker-compose logs -f frontend
```

### Reset Everything
```bash
docker-compose down --volumes --remove-orphans
docker system prune -f
docker-compose up -d --build
```

## Performance

### Monitoring
- Health endpoints: `/health`, `/ready`, `/version`
- Application metrics: Available via Spring Boot Actuator

### Scaling
- Frontend: Stateless, can be scaled horizontally
- Backend: Stateless, can be scaled horizontally
- Database: PostgreSQL with connection pooling
- Cache: Redis for session management

## Security

- CORS configured for development and production
- JWT tokens for authentication
- Input validation on all endpoints
- SQL injection protection via JPA
- XSS protection via React

## Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure monitoring
- [ ] Run security scan
- [ ] Performance testing
- [ ] Backup strategy

### AWS Deployment
See `AWS_DEPLOYMENT_GUIDE.md` for detailed cloud deployment instructions.