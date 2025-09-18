# Voice Agent Module

Drop-in voice interface layer for SecureInsure Pro insurance portal.

## Features

- Real-time STT (Speech-to-Text) and TTS (Text-to-Speech)
- WebSocket-based voice session with JWT authentication
- Tool calls to existing APIs (policy-svc, vendor-svc, task-svc)
- Production-grade: validation, rate limits, PII redaction
- Consent gating and RBAC support

## Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Voice Agent**
   ```bash
   npm run start
   ```

4. **Mount Widget in Frontend**
   ```tsx
   import { VoiceAgent } from 'voice-agent/web-widget';
   
   <VoiceAgent
     wsUrl="/voice/session"
     jwtProvider={() => localStorage.getItem('id_token')}
     onIntent={(intent) => console.log('Intent:', intent)}
   />
   ```

## Configuration

See `.env.example` for all available configuration options.

## API Integration

The voice agent integrates with existing services:
- **Policy Service**: List policies, get case details
- **Vendor Service**: Lab results, MIB, Rx, APS
- **Task Service**: Create tasks, list assignments
- **Audit Service**: Log actions and consent

## Security

- JWT verification on every WebSocket message
- Consent gating for data access
- PII redaction in logs
- Rate limiting per user
- Scope-based authorization

## Development

```bash
npm run dev          # Start development server
npm run test         # Run tests
npm run build        # Build for production
npm run lint         # Lint code
```