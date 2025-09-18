import { toast } from 'react-hot-toast';

export interface VoiceMessage {
  type: 'stt_partial' | 'stt_final' | 'nlu_intent' | 'tool_result' | 'tts_response' | 'error';
  text?: string;
  intent?: string;
  data?: any;
  timestamp: number;
}

export interface VoiceIntent {
  name: string;
  confidence: number;
  entities: Record<string, any>;
  originalText: string;
}

export interface VoiceWebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class VoiceWebSocketService {
  private ws: WebSocket | null = null;
  private config: VoiceWebSocketConfig;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private _isConnected: boolean = false;
  private messageQueue: VoiceMessage[] = [];
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  private deriveWebSocketUrl(): string {
    // If VITE_WS_URL is set, use it
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    
    // Otherwise derive from VITE_API_BASE_URL
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (apiUrl) {
      return apiUrl.replace(/^http/i, 'ws') + '/ws';
    }
    
    return '';
  }

  constructor(config: VoiceWebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5, // Stop after 5 attempts
      heartbeatInterval: 30000,
      ...config
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Derive WebSocket URL from config or environment
      const wsUrl = this.config.url || this.deriveWebSocketUrl();
      
      if (!wsUrl || wsUrl.trim() === '') {
        console.log('Voice service running in local mode (no WebSocket)');
        resolve();
        return;
      }
      try {
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('Voice WebSocket connected');
          this._isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.emit('connected', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: VoiceMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('Voice WebSocket disconnected:', event.code, event.reason);
          this._isConnected = false;
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('Voice WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this._isConnected = false;
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('Max reconnection attempts reached');
      toast.error('Voice connection failed. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${this.config.reconnectInterval}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this._isConnected) {
        this.sendMessage({
          type: 'heartbeat',
          timestamp: Date.now()
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  sendMessage(message: Partial<VoiceMessage>): void {
    const fullMessage: VoiceMessage = {
      type: message.type || 'unknown',
      text: message.text,
      intent: message.intent,
      data: message.data,
      timestamp: Date.now()
    };

    if (this._isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(fullMessage));
      } catch (error) {
        console.error('Failed to send message:', error);
        this.messageQueue.push(fullMessage);
      }
    } else {
      this.messageQueue.push(fullMessage);
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this._isConnected && this.ws) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('Failed to flush queued message:', error);
          this.messageQueue.unshift(message); // Put it back
          break;
        }
      }
    }
  }

  private handleMessage(message: VoiceMessage): void {
    console.log('Received voice message:', message);
    
    switch (message.type) {
      case 'stt_partial':
        this.emit('stt_partial', { text: message.text, timestamp: message.timestamp });
        break;
        
      case 'stt_final':
        this.emit('stt_final', { text: message.text, timestamp: message.timestamp });
        break;
        
      case 'nlu_intent':
        this.emit('nlu_intent', { 
          intent: message.intent, 
          data: message.data, 
          timestamp: message.timestamp 
        });
        break;
        
      case 'tool_result':
        this.emit('tool_result', { 
          data: message.data, 
          timestamp: message.timestamp 
        });
        break;
        
      case 'tts_response':
        this.emit('tts_response', { 
          text: message.text, 
          timestamp: message.timestamp 
        });
        break;
        
      case 'error':
        console.error('Voice service error:', message.data);
        this.emit('error', message.data);
        toast.error(`Voice service error: ${message.data?.message || 'Unknown error'}`);
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  // Voice-specific methods
  sendVoiceCommand(command: string): void {
    this.sendMessage({
      type: 'voice_command',
      text: command
    });
  }

  // Local fallback processing when WebSocket is not available
  processLocalVoiceCommand(command: string): VoiceMessage {
    console.log('Processing voice command locally:', command);
    
    // Simple local intent recognition
    const commandLower = command.toLowerCase();
    let intent = 'unknown';
    let data: any = {};
    
    if (commandLower.includes('search') || commandLower.includes('find') || commandLower.includes('show')) {
      intent = 'search_cases';
      
      // Extract basic filters
      if (commandLower.includes('active')) data.filters = { caseStatus: 'active' };
      else if (commandLower.includes('pending')) data.filters = { caseStatus: 'pending' };
      else if (commandLower.includes('approved')) data.filters = { caseStatus: 'approved' };
      else if (commandLower.includes('rejected')) data.filters = { caseStatus: 'rejected' };
      else if (commandLower.includes('urgent') || commandLower.includes('high priority')) data.filters = { priority: 'urgent' };
      else if (commandLower.includes('high')) data.filters = { priority: 'high' };
      else if (commandLower.includes('medium')) data.filters = { priority: 'medium' };
      else if (commandLower.includes('low')) data.filters = { priority: 'low' };
      
      // Extract case ID or policy number
      const caseMatch = command.match(/(?:case|policy)\s+([A-Z0-9-]+)/i);
      if (caseMatch) {
        if (caseMatch[1].includes('ZC')) {
          data.filters = { ...data.filters, zinniaCaseId: caseMatch[1] };
        } else if (caseMatch[1].includes('POL')) {
          data.filters = { ...data.filters, policyNumber: caseMatch[1] };
        } else {
          data.filters = { ...data.filters, caseId: caseMatch[1] };
        }
      }
      
      // Extract insured name
      const nameMatch = command.match(/(?:insured|customer|person)\s+(?:named?|is|called?)\s+([a-zA-Z\s]+)/i);
      if (nameMatch) {
        data.filters = { ...data.filters, insured: nameMatch[1].trim() };
      }
    } else if (commandLower.includes('open') || commandLower.includes('show case')) {
      intent = 'open_case';
      const caseMatch = command.match(/(?:case|policy)\s+([A-Z0-9-]+)/i);
      if (caseMatch) {
        data.caseId = caseMatch[1];
      }
    } else if (commandLower.includes('clear') || commandLower.includes('reset')) {
      intent = 'clear_filters';
    } else if (commandLower.includes('help')) {
      intent = 'help';
    }
    
    return {
      type: 'nlu_intent',
      intent,
      data,
      timestamp: Date.now()
    };
  }

  sendSTTResult(text: string, isFinal: boolean = false): void {
    this.sendMessage({
      type: isFinal ? 'stt_final' : 'stt_partial',
      text: text
    });
  }

  requestTTSResponse(text: string): void {
    this.sendMessage({
      type: 'tts_request',
      text: text
    });
  }

  // Event listener methods
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this._isConnected;
  }

  getConnectionStatus(): string {
    if (this._isConnected) return 'connected';
    if (this.reconnectTimer) return 'reconnecting';
    return 'disconnected';
  }

  // Rate limiting (5 RPS as specified in Phase 4)
  private messageCount = 0;
  private lastMessageTime = 0;
  private readonly RATE_LIMIT = 5; // messages per second

  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastMessageTime >= 1000) {
      this.messageCount = 0;
      this.lastMessageTime = now;
    }
    
    if (this.messageCount >= this.RATE_LIMIT) {
      console.warn('Rate limit exceeded for voice messages');
      toast.warning('Voice commands too frequent. Please wait a moment.');
      return false;
    }
    
    this.messageCount++;
    return true;
  }

  // Enhanced send method with rate limiting
  sendMessageWithRateLimit(message: Partial<VoiceMessage>): boolean {
    if (!this.checkRateLimit()) {
      return false;
    }
    
    this.sendMessage(message);
    return true;
  }
}

// Export singleton instance - only create if WebSocket URL is configured
const wsUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_WEBSOCKET_URL;
export const voiceWebSocketService = wsUrl ? new VoiceWebSocketService({
  url: wsUrl
}) : new VoiceWebSocketService({ url: '' }); // Empty URL prevents connection attempts
