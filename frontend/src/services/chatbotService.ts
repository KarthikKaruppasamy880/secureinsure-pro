import { api } from './api';

const base = '/api/v1/chatbot';

export const start = async () => (await api.post(`${base}/session/start`)).data;

export const message = async (id: string, text: string) =>
  (await api.post(`${base}/message`, { id, text })).data;

// Export as default object for compatibility
export const chatbotService = {
  start,
  message
};

// Types for compatibility
export interface ChatMessage {
  id: string;
  text: string;
  timestamp: number;
  isUser: boolean;
}

export interface ChatAction {
  type: string;
  target?: string;
  data?: any;
}

export interface ChatbotResponse {
  id: string;
  action: string;
  target?: string;
  found: boolean;
}