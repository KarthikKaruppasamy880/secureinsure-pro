import axios from 'axios';
import { voiceService } from './voiceService';

const BACKEND_API_BASE_URL = '/api/v1';

const chatbotApi = axios.create({
  baseURL: BACKEND_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
chatbotApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'voice' | 'action';
  metadata?: {
    voiceInput?: boolean;
    confidence?: number;
    actions?: ChatAction[];
    entities?: any[];
  };
}

export interface ChatAction {
  type: 'policy_lookup' | 'claim_status' | 'payment_due' | 'navigation' | 'help';
  data: any;
  label: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: any;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotResponse {
  message: string;
  actions?: ChatAction[];
  entities?: any[];
  intent?: string;
  confidence?: number;
  suggestions?: string[];
  needsVoiceResponse?: boolean;
}

export const chatbotService = {
  // Send message to chatbot
  async sendMessage(text: string, sessionId?: string, isVoice: boolean = false): Promise<ChatbotResponse> {
    try {
      const response = await chatbotApi.post('/chatbot/message', {
        text,
        sessionId,
        isVoice,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  },

  // Start new chat session
  async startSession(): Promise<{ sessionId: string; welcomeMessage: string }> {
    try {
      const response = await chatbotApi.post('/chatbot/session/start');
      return response.data;
    } catch (error) {
      console.error('Error starting chat session:', error);
      throw error;
    }
  },

  // Get chat history
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await chatbotApi.get(`/chatbot/session/${sessionId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },

  // Process voice input
  async processVoiceInput(audioBlob: Blob, sessionId?: string): Promise<ChatbotResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-input.wav');
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }

      const response = await chatbotApi.post('/chatbot/voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error processing voice input:', error);
      throw error;
    }
  },

  // Query policy information
  async queryPolicy(query: string): Promise<ChatbotResponse> {
    try {
      const response = await chatbotApi.post('/chatbot/policy-query', { query });
      return response.data;
    } catch (error) {
      console.error('Error querying policy:', error);
      throw error;
    }
  },

  // Query claim information
  async queryClaim(query: string): Promise<ChatbotResponse> {
    try {
      const response = await chatbotApi.post('/chatbot/claim-query', { query });
      return response.data;
    } catch (error) {
      console.error('Error querying claim:', error);
      throw error;
    }
  },

  // Execute action from chatbot
  async executeAction(action: ChatAction, sessionId: string): Promise<ChatbotResponse> {
    try {
      const response = await chatbotApi.post('/chatbot/action', {
        action,
        sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error executing action:', error);
      throw error;
    }
  },

  // Get suggestions based on user input
  async getSuggestions(partialText: string): Promise<string[]> {
    try {
      const response = await chatbotApi.post('/chatbot/suggestions', { text: partialText });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  },

  // Voice-enabled chat methods
  async startVoiceChat(sessionId?: string): Promise<{ sessionId: string; message: string }> {
    try {
      // First, start the voice recognition
      await voiceService.startListening();
      
      const response = await chatbotApi.post('/chatbot/voice/start', { sessionId });
      return response.data;
    } catch (error) {
      console.error('Error starting voice chat:', error);
      throw error;
    }
  },

  async endVoiceChat(sessionId: string): Promise<void> {
    try {
      await voiceService.stopListening();
      await chatbotApi.post('/chatbot/voice/end', { sessionId });
    } catch (error) {
      console.error('Error ending voice chat:', error);
      throw error;
    }
  },

  // Process natural language queries
  async processNaturalLanguage(text: string): Promise<{
    intent: string;
    entities: any[];
    confidence: number;
    response: string;
  }> {
    try {
      const response = await chatbotApi.post('/chatbot/nlp', { text });
      return response.data;
    } catch (error) {
      console.error('Error processing natural language:', error);
      throw error;
    }
  },

  // Get chatbot capabilities
  async getCapabilities(): Promise<{
    features: string[];
    languages: string[];
    intents: string[];
  }> {
    try {
      const response = await chatbotApi.get('/chatbot/capabilities');
      return response.data;
    } catch (error) {
      console.error('Error getting capabilities:', error);
      return {
        features: ['text', 'voice', 'policy_queries', 'claim_queries'],
        languages: ['en'],
        intents: ['greeting', 'policy_inquiry', 'claim_status', 'payment_info', 'help']
      };
    }
  },

  // Text-to-speech for bot responses
  async speakResponse(text: string): Promise<void> {
    try {
      voiceService.speakText(text, { rate: 0.9, pitch: 1.1 });
    } catch (error) {
      console.error('Error speaking response:', error);
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
      }
    }
  },

  // Utility function to format responses
  formatMessage(response: ChatbotResponse): ChatMessage {
    return {
      id: `bot_${Date.now()}`,
      text: response.message,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        confidence: response.confidence,
        actions: response.actions,
        entities: response.entities
      }
    };
  },

  // Quick action templates
  getQuickActions(): ChatAction[] {
    return [
      {
        type: 'policy_lookup',
        data: {},
        label: 'Check my policies'
      },
      {
        type: 'claim_status',
        data: {},
        label: 'View claim status'
      },
      {
        type: 'payment_due',
        data: {},
        label: 'Check payment due'
      },
      {
        type: 'help',
        data: {},
        label: 'Help & Support'
      }
    ];
  }
};