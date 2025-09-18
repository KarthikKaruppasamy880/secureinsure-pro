import axios from 'axios';

const VOICE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/voice-api';

const voiceApi = axios.create({
  baseURL: VOICE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface VoiceCommand {
  command: string;
  timestamp: Date;
  confidence: number;
}

export interface VoiceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface TTSRequest {
  text: string;
  language?: string;
  speed?: number;
  voice?: string;
}

export const voiceService = {
  // Start voice recognition
  async startListening(): Promise<VoiceResponse> {
    try {
      const response = await voiceApi.post('/voice/start-listening');
      return response.data;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      throw error;
    }
  },

  // Stop voice recognition
  async stopListening(): Promise<VoiceResponse> {
    try {
      const response = await voiceApi.post('/voice/stop-listening');
      return response.data;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      throw error;
    }
  },

  // Process voice command for policy queries
  async processPolicyCommand(command: string): Promise<VoiceResponse> {
    try {
      const response = await voiceApi.post('/voice/policy-command', { command });
      return response.data;
    } catch (error) {
      console.error('Error processing policy command:', error);
      throw error;
    }
  },

  // Process voice command for claims
  async processClaimCommand(command: string): Promise<VoiceResponse> {
    try {
      const response = await voiceApi.post('/voice/claim-command', { command });
      return response.data;
    } catch (error) {
      console.error('Error processing claim command:', error);
      throw error;
    }
  },

  // Process general navigation command
  async processNavigationCommand(command: string): Promise<VoiceResponse> {
    try {
      const response = await voiceApi.post('/voice/navigation', { command });
      return response.data;
    } catch (error) {
      console.error('Error processing navigation command:', error);
      throw error;
    }
  },

  // Text-to-Speech
  async textToSpeech(request: TTSRequest): Promise<Blob> {
    try {
      const response = await voiceApi.post('/voice/tts', request, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      throw error;
    }
  },

  // Check if voice recognition is available
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await voiceApi.get('/voice/status');
      return response.data.available;
    } catch (error) {
      console.error('Error checking voice availability:', error);
      return false;
    }
  },

  // Web Speech API fallback
  startWebSpeechRecognition(onResult: (text: string) => void, onError?: (error: any) => void): any | null {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech Recognition not supported');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        onResult(lastResult[0].transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    recognition.start();
    return recognition;
  },

  // Speak text using Web Speech API
  speakText(text: string, options?: { rate?: number; pitch?: number; volume?: number }): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (options) {
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;
      }

      speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech Synthesis not supported');
    }
  }
};

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}