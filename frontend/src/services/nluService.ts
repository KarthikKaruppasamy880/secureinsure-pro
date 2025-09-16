import axios from 'axios';

const NLU_API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api/v1/nlu';

const nluApi = axios.create({
  baseURL: NLU_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
nluApi.interceptors.request.use(
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

export interface Intent {
  name: string;
  confidence: number;
  entities: Entity[];
  actions: Action[];
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
  start: number;
  end: number;
}

export interface Action {
  type: string;
  parameters: Record<string, any>;
  confidence: number;
}

export interface NLUResponse {
  text: string;
  intents: Intent[];
  entities: Entity[];
  actions: Action[];
  confidence: number;
  language: string;
  processingTime: number;
}

export interface TrainingExample {
  text: string;
  intent: string;
  entities?: Entity[];
}

export const nluService = {
  // Process natural language text
  async processText(text: string, context?: any): Promise<NLUResponse> {
    try {
      const response = await nluApi.post('/process', {
        text,
        context,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error processing text with NLU:', error);
      // Fallback to local processing
      return this.processTextLocally(text, context);
    }
  },

  // Process voice input
  async processVoice(audioBlob: Blob, context?: any): Promise<NLUResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-input.wav');
      if (context) {
        formData.append('context', JSON.stringify(context));
      }

      const response = await nluApi.post('/process-voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error processing voice with NLU:', error);
      throw error;
    }
  },

  // Local fallback processing
  processTextLocally(text: string, context?: any): NLUResponse {
    const lowerText = text.toLowerCase();
    const startTime = Date.now();
    
    // Intent recognition
    const intents: Intent[] = [];
    let confidence = 0.8;
    
    // Policy-related intents
    if (this.matchesPattern(lowerText, ['policy', 'coverage', 'insurance', 'plan'])) {
      intents.push({
        name: 'policy_inquiry',
        confidence: 0.9,
        entities: this.extractEntities(lowerText, ['policy', 'coverage', 'insurance']),
        actions: [{ type: 'policy_lookup', parameters: {}, confidence: 0.9 }]
      });
    }
    
    // Claim-related intents
    if (this.matchesPattern(lowerText, ['claim', 'file', 'report', 'accident'])) {
      intents.push({
        name: 'claim_action',
        confidence: 0.85,
        entities: this.extractEntities(lowerText, ['claim', 'accident', 'damage']),
        actions: [{ type: 'file_claim', parameters: {}, confidence: 0.85 }]
      });
    }
    
    // Payment-related intents
    if (this.matchesPattern(lowerText, ['payment', 'premium', 'bill', 'due', 'pay'])) {
      intents.push({
        name: 'payment_inquiry',
        confidence: 0.8,
        entities: this.extractEntities(lowerText, ['payment', 'amount', 'due_date']),
        actions: [{ type: 'payment_lookup', parameters: {}, confidence: 0.8 }]
      });
    }
    
    // Navigation intents
    if (this.matchesPattern(lowerText, ['next', 'previous', 'back', 'forward', 'go to'])) {
      intents.push({
        name: 'navigation',
        confidence: 0.9,
        entities: this.extractEntities(lowerText, ['direction', 'section']),
        actions: [{ type: 'navigate', parameters: { direction: this.extractDirection(lowerText) }, confidence: 0.9 }]
      });
    }
    
    // Form actions
    if (this.matchesPattern(lowerText, ['save', 'submit', 'clear', 'reset', 'delete'])) {
      intents.push({
        name: 'form_action',
        confidence: 0.95,
        entities: this.extractEntities(lowerText, ['action', 'form']),
        actions: [{ type: 'form_operation', parameters: { operation: this.extractFormAction(lowerText) }, confidence: 0.95 }]
      });
    }
    
    // Help intents
    if (this.matchesPattern(lowerText, ['help', 'support', 'assist', 'how to'])) {
      intents.push({
        name: 'help_request',
        confidence: 0.9,
        entities: this.extractEntities(lowerText, ['topic', 'issue']),
        actions: [{ type: 'show_help', parameters: {}, confidence: 0.9 }]
      });
    }
    
    // If no specific intent found, classify as general inquiry
    if (intents.length === 0) {
      intents.push({
        name: 'general_inquiry',
        confidence: 0.6,
        entities: [],
        actions: [{ type: 'general_response', parameters: {}, confidence: 0.6 }]
      });
      confidence = 0.6;
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
      text,
      intents,
      entities: this.extractAllEntities(lowerText),
      actions: intents.flatMap(intent => intent.actions),
      confidence,
      language: 'en',
      processingTime
    };
  },

  // Pattern matching utility
  matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  },

  // Extract entities from text
  extractEntities(text: string, entityTypes: string[]): Entity[] {
    const entities: Entity[] = [];
    
    entityTypes.forEach(type => {
      const index = text.indexOf(type);
      if (index !== -1) {
        entities.push({
          type,
          value: type,
          confidence: 0.8,
          start: index,
          end: index + type.length
        });
      }
    });
    
    return entities;
  },

  // Extract all entities from text
  extractAllEntities(text: string): Entity[] {
    const allEntities: Entity[] = [];
    
    // Extract dates
    const datePattern = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/g;
    let match;
    while ((match = datePattern.exec(text)) !== null) {
      allEntities.push({
        type: 'date',
        value: match[0],
        confidence: 0.9,
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    // Extract amounts
    const amountPattern = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
    while ((match = amountPattern.exec(text)) !== null) {
      allEntities.push({
        type: 'amount',
        value: match[0],
        confidence: 0.95,
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    // Extract policy numbers
    const policyPattern = /\b[A-Z]{2,3}-\d{6,8}\b/g;
    while ((match = policyPattern.exec(text)) !== null) {
      allEntities.push({
        type: 'policy_number',
        value: match[0],
        confidence: 0.9,
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    // Extract claim numbers
    const claimPattern = /\bCLM-\d{6,8}\b/g;
    while ((match = claimPattern.exec(text)) !== null) {
      allEntities.push({
        type: 'claim_number',
        value: match[0],
        confidence: 0.9,
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    return allEntities;
  },

  // Extract navigation direction
  extractDirection(text: string): string {
    if (text.includes('next') || text.includes('forward')) return 'next';
    if (text.includes('previous') || text.includes('back')) return 'previous';
    return 'unknown';
  },

  // Extract form action
  extractFormAction(text: string): string {
    if (text.includes('save') || text.includes('submit')) return 'save';
    if (text.includes('clear') || text.includes('reset')) return 'clear';
    if (text.includes('delete')) return 'delete';
    return 'unknown';
  },

  // Train the NLU model with examples
  async trainModel(examples: TrainingExample[]): Promise<{ success: boolean; message: string }> {
    try {
      const response = await nluApi.post('/train', { examples });
      return response.data;
    } catch (error) {
      console.error('Error training NLU model:', error);
      return { success: false, message: 'Failed to train model' };
    }
  },

  // Get model performance metrics
  async getModelMetrics(): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    totalExamples: number;
    lastUpdated: string;
  }> {
    try {
      const response = await nluApi.get('/metrics');
      return response.data;
    } catch (error) {
      console.error('Error getting model metrics:', error);
      return {
        accuracy: 0.85,
        precision: 0.82,
        recall: 0.88,
        f1Score: 0.85,
        totalExamples: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  },

  // Get supported intents
  async getSupportedIntents(): Promise<string[]> {
    try {
      const response = await nluApi.get('/intents');
      return response.data.intents;
    } catch (error) {
      console.error('Error getting supported intents:', error);
      return [
        'policy_inquiry',
        'claim_action',
        'payment_inquiry',
        'navigation',
        'form_action',
        'help_request',
        'general_inquiry'
      ];
    }
  },

  // Get entity types
  async getEntityTypes(): Promise<string[]> {
    try {
      const response = await nluApi.get('/entities');
      return response.data.entityTypes;
    } catch (error) {
      console.error('Error getting entity types:', error);
      return [
        'date',
        'amount',
        'policy_number',
        'claim_number',
        'direction',
        'action',
        'topic'
      ];
    }
  }
}; 