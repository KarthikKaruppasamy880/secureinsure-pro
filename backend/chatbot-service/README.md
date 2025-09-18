# Chatbot Service

AI-powered chatbot service for SecureInsure insurance platform that provides intelligent customer support through text and voice interactions.

## Features

- **Natural Language Processing**: Understands user intents and extracts entities
- **Voice Support**: Speech-to-text and text-to-speech capabilities
- **Policy Queries**: Integration with policy service for policy information
- **Claim Management**: Integration with claims service for claim status
- **Session Management**: Persistent chat sessions with context
- **Action Execution**: Executes specific actions based on user requests
- **Real-time Suggestions**: Provides contextual suggestions

## Architecture

### Core Components

1. **ChatbotService**: Main service orchestrating all chatbot operations
2. **NLPService**: Natural language processing for intent recognition
3. **PolicyQueryService**: Integration with policy service
4. **ClaimQueryService**: Integration with claims service
5. **VoiceProcessingService**: Voice input/output processing
6. **ChatbotController**: REST API endpoints

### Data Models

- **ChatSession**: Represents a chat session with user context
- **ChatMessage**: Individual messages in a conversation
- **ChatbotRequest/Response**: DTOs for API communication

## API Endpoints

### Session Management
- `POST /api/v1/chatbot/session/start` - Start new chat session
- `GET /api/v1/chatbot/session/{sessionId}/history` - Get chat history

### Message Processing
- `POST /api/v1/chatbot/message` - Send text message
- `POST /api/v1/chatbot/voice` - Process voice input
- `POST /api/v1/chatbot/action` - Execute chatbot action

### Query Services
- `POST /api/v1/chatbot/policy-query` - Query policy information
- `POST /api/v1/chatbot/claim-query` - Query claim information
- `POST /api/v1/chatbot/nlp` - Process natural language

### Utilities
- `POST /api/v1/chatbot/suggestions` - Get suggestions
- `GET /api/v1/chatbot/capabilities` - Get chatbot capabilities
- `POST /api/v1/chatbot/voice/start` - Start voice chat
- `POST /api/v1/chatbot/voice/end` - End voice chat

## Configuration

### Application Properties

```yaml
server:
  port: 8080

spring:
  application:
    name: chatbot-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/secureinsure_chatbot
    username: ${DB_USERNAME:secureinsure}
    password: ${DB_PASSWORD:secureinsure123}

services:
  policy-service:
    url: http://policy-service:8080
  claims-service:
    url: http://claims-service:8080
```

### Environment Variables

- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `VITE_API_BASE_URL`: Frontend API base URL

## Database Schema

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    context TEXT,
    is_active BOOLEAN DEFAULT true,
    voice_enabled BOOLEAN DEFAULT true,
    language VARCHAR(10) DEFAULT 'en-US',
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    session_id BIGINT REFERENCES chat_sessions(id),
    text TEXT NOT NULL,
    sender VARCHAR(10) NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    metadata TEXT,
    confidence DECIMAL(3,2),
    intent VARCHAR(50),
    entities TEXT,
    actions TEXT,
    is_voice_input BOOLEAN DEFAULT false,
    processing_time_ms BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Examples

### Starting a Chat Session

```typescript
const response = await chatbotService.startSession();
console.log('Session ID:', response.sessionId);
console.log('Welcome Message:', response.welcomeMessage);
```

### Sending a Message

```typescript
const response = await chatbotService.sendMessage(
  'Check my policy status',
  sessionId
);
console.log('Bot Response:', response.message);
console.log('Actions:', response.actions);
```

### Voice Input

```typescript
const audioBlob = await recordAudio();
const response = await chatbotService.processVoiceInput(
  audioBlob,
  sessionId
);
```

### Executing Actions

```typescript
const action = {
  type: 'policy_lookup',
  data: {},
  label: 'View Policies'
};
const response = await chatbotService.executeAction(action, sessionId);
```

## Integration with Other Services

### Policy Service Integration
- Queries user policies
- Retrieves policy details
- Checks payment due dates
- Updates policy information

### Claims Service Integration
- Retrieves claim status
- Provides claim history
- Initiates new claims
- Updates claim information

## Security

- JWT token authentication
- User session validation
- Input sanitization
- Rate limiting (recommended)

## Monitoring and Logging

- Health check endpoint: `/actuator/health`
- Metrics endpoint: `/actuator/metrics`
- Prometheus metrics: `/actuator/prometheus`
- Structured logging with SLF4J

## Development

### Prerequisites
- Java 17+
- Maven 3.6+
- PostgreSQL 12+
- Spring Boot 3.2+

### Running Locally

1. Start PostgreSQL database
2. Update application.yml with database credentials
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Testing

```bash
mvn test
```

## Deployment

### Docker

```dockerfile
FROM openjdk:17-jre-slim
COPY target/chatbot-service-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatbot-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chatbot-service
  template:
    metadata:
      labels:
        app: chatbot-service
    spec:
      containers:
      - name: chatbot-service
        image: chatbot-service:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
```

## Future Enhancements

- Machine learning model integration
- Multi-language support
- Advanced voice processing
- Sentiment analysis
- Conversation analytics
- Integration with external AI services (OpenAI, etc.)
- WebSocket support for real-time communication
- Advanced context management
- Conversation summarization
- Proactive notifications
