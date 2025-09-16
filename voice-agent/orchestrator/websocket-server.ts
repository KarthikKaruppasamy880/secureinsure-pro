import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { JWKSClient } from 'jwks-rsa';

interface VoiceSession {
  userId: string;
  sessionId: string;
  startTime: number;
  lastActivity: number;
  consentGiven: boolean;
}

interface VoiceMessage {
  type: 'start' | 'stop' | 'tool' | 'audio';
  locale?: string;
  name?: string;
  args?: any;
  audio?: string;
}

export class VoiceWebSocketServer {
  private io: SocketIOServer;
  private sessions: Map<string, VoiceSession> = new Map();
  private jwksClient: JWKSClient;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      path: '/voice/session',
      cors: {
        origin: true,
        credentials: true
      }
    });

    this.jwksClient = new JWKSClient({
      jwksUri: process.env.JWT_JWKS_URL || 'http://localhost:8081/.well-known/jwks.json'
    });

    this.setupEventHandlers();
  }

  private async verifyJWT(token: string): Promise<any> {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string') {
        throw new Error('Invalid token format');
      }

      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const signingKey = key.getPublicKey();

      return jwt.verify(token, signingKey, {
        audience: process.env.ALLOWED_AUDIENCES?.split(','),
        issuer: process.env.JWT_ISSUER
      });
    } catch (error) {
      throw new Error('JWT verification failed');
    }
  }

  private setupEventHandlers() {
    this.io.on('connection', async (socket) => {
      try {
        // Verify JWT on connection
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          socket.emit('error', { code: 'UNAUTHORIZED', message: 'No token provided' });
          socket.disconnect();
          return;
        }

        const payload = await this.verifyJWT(token);
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create session
        const session: VoiceSession = {
          userId: payload.sub,
          sessionId,
          startTime: Date.now(),
          lastActivity: Date.now(),
          consentGiven: false
        };

        this.sessions.set(sessionId, session);

        socket.emit('system:ready', { sessionId });
        console.log(`[voice] Session started for user ${payload.sub}`);

        // Handle voice messages
        socket.on('voice:message', async (message: VoiceMessage) => {
          try {
            session.lastActivity = Date.now();

            switch (message.type) {
              case 'start':
                socket.emit('stt_partial', { text: 'Voice session started' });
                break;

              case 'stop':
                socket.emit('stt_partial', { text: 'Voice session stopped' });
                break;

              case 'tool':
                if (!session.consentGiven) {
                  socket.emit('consent:required', { 
                    message: 'Consent required for data access',
                    sessionId 
                  });
                  return;
                }

                const result = await this.handleToolCall(message.name!, message.args, session);
                socket.emit('tool_result', {
                  name: message.name,
                  ok: true,
                  data: result
                });
                break;

              case 'audio':
                // Handle audio data for STT
                const transcript = await this.processAudio(message.audio!, session);
                socket.emit('stt_partial', { text: transcript });
                break;
            }
          } catch (error: any) {
            socket.emit('error', { 
              code: 'PROCESSING_ERROR', 
              message: error.message 
            });
          }
        });

        // Handle consent
        socket.on('consent:given', (data) => {
          session.consentGiven = true;
          socket.emit('consent:accepted', { sessionId });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
          this.sessions.delete(sessionId);
          console.log(`[voice] Session ended for user ${payload.sub}`);
        });

        // Session timeout
        setTimeout(() => {
          if (this.sessions.has(sessionId)) {
            socket.emit('session:timeout');
            socket.disconnect();
            this.sessions.delete(sessionId);
          }
        }, (parseInt(process.env.SESSION_TTL_SECONDS || '600') * 1000));

      } catch (error: any) {
        socket.emit('error', { 
          code: 'AUTH_ERROR', 
          message: error.message 
        });
        socket.disconnect();
      }
    });
  }

  private async handleToolCall(toolName: string, args: any, session: VoiceSession): Promise<any> {
    const baseUrl = process.env.API_BASE_POLICY || 'http://localhost:8081/api/v1';
    
    switch (toolName) {
      case 'get_policies':
        const policiesResponse = await fetch(`${baseUrl}/cases`, {
          headers: {
            'Authorization': `Bearer ${session.userId}`,
            'X-User-Id': session.userId,
            'X-Trace-Id': session.sessionId
          }
        });
        return await policiesResponse.json();

      case 'get_case_details':
        const caseResponse = await fetch(`${baseUrl}/cases/${args.case_id}/application`, {
          headers: {
            'Authorization': `Bearer ${session.userId}`,
            'X-User-Id': session.userId,
            'X-Trace-Id': session.sessionId
          }
        });
        return await caseResponse.json();

      case 'get_vendor_results':
        const vendorResponse = await fetch(`${baseUrl}/examone/results?caseId=${args.case_id}`, {
          headers: {
            'Authorization': `Bearer ${session.userId}`,
            'X-User-Id': session.userId,
            'X-Trace-Id': session.sessionId
          }
        });
        return await vendorResponse.json();

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async processAudio(audioData: string, session: VoiceSession): Promise<string> {
    // Mock STT processing - replace with real STT service
    return "Mock transcript from audio data";
  }
}

