# SecureInsure Pro - Complete Functional Specifications

## Application Overview

SecureInsure Pro is a comprehensive insurance application management system with full-stack functionality including authentication, case management, voice assistance, TX1 import, ExamOne integration, and advanced search capabilities.

## Screen-by-Screen Functional Specifications

### 1. Dashboard Screen
**URL:** `/dashboard`
**Purpose:** Central hub for case management and system overview

**Features:**
- Case list with status indicators
- Quick action buttons (Create Case, Import TX1, Search)
- Voice assistant integration
- Real-time notifications
- User role-based access control

**API Endpoints:**
- `GET /api/v1/cases` - Fetch user's cases
- `POST /api/v1/cases` - Create new case
- `GET /search?q={query}` - Search cases/policies

**Voice Commands:**
- "Create new case"
- "Search for [query]"
- "Show my cases"
- "Import TX1 file"

### 2. Login Screen
**URL:** `/login`
**Purpose:** User authentication and access control

**Features:**
- Username/password authentication
- Biometric authentication (stubbed)
- Remember me functionality
- Password reset capability
- Role-based redirects

**API Endpoints:**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/validate` - Token validation

**Login Credentials:**
| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| admin | admin123 | ADMIN | Full system access |
| user | user123 | USER | Standard user access |
| agent | agent123 | AGENT | Agent-level access |

### 3. Create Case Screen
**URL:** `/cases/create`
**Purpose:** Create new insurance cases with template selection

**Features:**
- Template selection (with Dev Fallback)
- Case type selection
- Initial case details
- Dev Template Bypass (DEV_TEMPLATE_BYPASS=true)

**API Endpoints:**
- `POST /api/v1/auth/cases` - Create case
- `GET /api/v1/templates` - Fetch available templates

**Dev Fallback:**
When no published templates exist, automatically seeds "Default Term Life v0" template and proceeds with case creation.

### 4. Application Details Screen
**URL:** `/cases/{caseId}/application`
**Purpose:** Comprehensive case data entry and management

**Sections:**
1. **Case Setup** - Basic case information
2. **Insured Information** - Primary insured details
3. **Beneficiaries** - Beneficiary information
4. **Medical Information** - Health and medical data
5. **Financial Information** - Income and financial details
6. **Additional Information** - Supplementary data

**Features:**
- Per-section editing with PATCH updates
- Real-time validation
- Auto-save functionality
- Field-level error handling
- Voice navigation between sections

**API Endpoints:**
- `GET /api/v1/cases/{caseId}` - Fetch case details
- `PATCH /api/v1/cases/{caseId}/application/{section}` - Update section
- `POST /api/v1/cases/{caseId}/application` - Create application

**Voice Navigation:**
- "Go to insured section"
- "Navigate to beneficiaries"
- "Save current section"
- "Validate form"

### 5. TX1 Import Screen
**URL:** `/import/tx1`
**Purpose:** Import TX1 XML data and create cases

**Features:**
- XML file upload
- Data validation and mapping
- Case creation from imported data
- Audit trail maintenance
- Error handling and reporting

**API Endpoints:**
- `POST /api/v1/auth/tx1/import` - Import TX1 XML
- `GET /api/v1/tx1/status/{importId}` - Check import status

**TX1 Field Mapping:**
```json
{
  "caseId": "Generated from timestamp",
  "insuredName": "Mapped from TX1 <InsuredName>",
  "policyType": "Mapped from TX1 <PolicyType>",
  "premium": "Mapped from TX1 <Premium>",
  "rawXml": "Stored in audit table"
}
```

### 6. ExamOne Results Screen
**URL:** `/examone/results/{caseId}`
**Purpose:** Display lab results and medical data

**Features:**
- Comprehensive lab results display
- Filtering and sorting capabilities
- Export functionality
- Status indicators
- Integration with Insured section

**API Endpoints:**
- `POST /api/v1/auth/examone/lab-request` - Submit lab request
- `GET /api/v1/auth/examone/results?caseId={id}` - Fetch results

**Sample Results:**
```json
{
  "caseId": "CASE-123",
  "results": [
    {
      "test": "Blood Pressure",
      "value": "120/80",
      "status": "normal",
      "date": "2024-09-02"
    },
    {
      "test": "Cholesterol",
      "value": "180",
      "status": "normal",
      "date": "2024-09-02"
    }
  ]
}
```

### 7. Search Screen
**URL:** `/search`
**Purpose:** Advanced search across cases, policies, and data

**Features:**
- Multi-field search
- Filter by status, type, date
- Real-time search suggestions
- Export search results
- Save search queries

**API Endpoints:**
- `GET /search?q={query}` - Search endpoint
- `GET /api/v1/search/advanced` - Advanced search

### 8. Chatbot Screen
**URL:** `/chatbot`
**Purpose:** AI-powered assistance and case management

**Features:**
- Natural language processing
- Case-specific assistance
- Policy information retrieval
- Voice interaction
- Session management

**API Endpoints:**
- `POST /api/v1/auth/chatbot/session/start` - Start session
- `POST /api/v1/auth/chatbot/message` - Send message
- `GET /api/v1/auth/chatbot/history` - Session history

## Voice Assistant Integration

### WebSocket Connection
**Endpoint:** `/ws` (HTTP fallback implemented)
**Purpose:** Real-time voice command processing

**Commands:**
- Navigation: "Go to [section]"
- Search: "Search for [query]"
- Actions: "Save case", "Create new case"
- Information: "Show case details", "What's my status"

**Fallback Behavior:**
When WebSocket is unavailable, gracefully degrades to HTTP polling with user notification.

## API Request/Response Samples

### Authentication
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "demo-token-1756832039495",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@secureinsure.com",
    "role": "ADMIN",
    "permissions": ["read", "write", "delete", "admin"]
  },
  "message": "Login successful"
}
```

### Case Creation
```http
POST /api/v1/auth/cases
Content-Type: application/json

{
  "templateId": "term-life-v1",
  "caseType": "life_insurance"
}

Response:
{
  "caseId": "CASE-1756832039495",
  "status": "created",
  "message": "Case created successfully",
  "template": "Default Term Life v0 (Dev Fallback)",
  "timestamp": 1756832039495
}
```

### Section Update
```http
PATCH /api/v1/cases/CASE-123/application/insured
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "ssn": "123-45-6789"
}

Response:
{
  "caseId": "CASE-123",
  "section": "insured",
  "status": "updated",
  "message": "Section updated successfully",
  "timestamp": 1756832039495
}
```

### TX1 Import
```http
POST /api/v1/auth/tx1/import
Content-Type: application/xml

<?xml version="1.0"?>
<TX1Data>
  <InsuredName>John Doe</InsuredName>
  <PolicyType>Term Life</PolicyType>
  <Premium>500.00</Premium>
</TX1Data>

Response:
{
  "caseId": "CASE-1756832039495",
  "status": "imported",
  "message": "TX1 data imported successfully",
  "timestamp": 1756832039495
}
```

### Search
```http
GET /search?q=John Doe

Response:
{
  "query": "John Doe",
  "results": [
    {
      "id": "CASE-001",
      "type": "case",
      "title": "John Doe Life Insurance",
      "status": "active"
    }
  ],
  "total": 1
}
```

## Field Mappings and Validation

### FormEngine Field Normalization
```typescript
interface NormalizedField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  required: boolean;
  validation: ValidationRules;
  options?: Option[];
  placeholder?: string;
  defaultValue?: any;
  section: string;
  order: number;
}
```

### Validation Rules
```typescript
interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string;
}
```

## Error Handling and Accessibility

### Error Boundaries
- React Error Boundaries for component-level error handling
- Graceful degradation for failed API calls
- User-friendly error messages
- Automatic retry mechanisms

### Accessibility Features
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

### Z-Index Management
- Dropdowns: z-index 1000
- Modals: z-index 1050
- Tooltips: z-index 1100
- Loading overlays: z-index 1200

## Performance and Monitoring

### Health Endpoints
- `GET /health` - Service health check
- `GET /ready` - Readiness probe
- `GET /version` - Version information

### Monitoring
- Application metrics via Spring Boot Actuator
- Performance monitoring
- Error tracking
- User analytics

## Security Features

### Authentication
- JWT token-based authentication
- Role-based access control (RBAC)
- Session management
- Password encryption

### CORS Configuration
- Development: `http://localhost:*`, `http://192.168.*:*`
- Production: Configurable via environment variables
- Credential support enabled

### Input Validation
- Server-side validation with Spring Boot Validation
- Client-side validation with React Hook Form
- SQL injection protection via JPA
- XSS protection via React

## Deployment and Environment

### Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws

# Feature Flags
VITE_VOICE_ENABLED=true
DEV_TEMPLATE_BYPASS=true
EXAMONE_MOCK=true

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://192.168.0.0/16

# Logging
LOG_LEVEL=info
VITE_DEBUG=true
```

### Docker Services
- **Frontend**: nginx:alpine on port 3000
- **Backend**: Spring Boot on port 8082 (mapped from 8081)
- **Database**: PostgreSQL on port 5432
- **Cache**: Redis on port 6379

## Testing and Quality Assurance

### Smoke Tests
1. Health endpoint accessibility
2. User authentication flow
3. Case creation and editing
4. TX1 import functionality
5. Search and chatbot features
6. Voice assistant integration

### Build Quality Gates
- Frontend: `npm run lint` → 0 warnings
- Frontend: `npm run build` → successful
- Backend: `mvn -DskipTests verify` → successful
- All health endpoints → 200 OK
- All API endpoints → functional

## Future Enhancements

### Planned Features
- Real WebSocket implementation for voice
- Advanced AI chatbot with natural language processing
- Real-time collaboration features
- Mobile application
- Advanced reporting and analytics
- Integration with external insurance APIs

### Scalability Considerations
- Microservices architecture ready
- Horizontal scaling support
- Database sharding capabilities
- CDN integration for static assets
- Load balancing support
