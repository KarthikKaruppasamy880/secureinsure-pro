import { SpeechAdapter, SpeechAdapterFactory, SpeechAdapterConfig } from './speechAdapter';

export interface VoiceSearchResult {
  originalText: string;
  searchQuery: string;
  filters: Record<string, any>;
  confidence: number;
  timestamp: Date;
}

export interface VoiceSearchOptions {
  language?: string;
  continuous?: boolean;
  timeout?: number;
}

export class VoiceSearchService {
  private speechAdapter: SpeechAdapter;
  private isListening: boolean = false;
  private currentTranscript: string = '';
  private onResult?: (result: VoiceSearchResult) => void;
  private onError?: (error: string) => void;
  private onStatusChange?: (status: string) => void;
  private timeoutId?: NodeJS.Timeout;

  constructor(options: VoiceSearchOptions = {}) {
    this.speechAdapter = SpeechAdapterFactory.createDefault({
      language: options.language || 'en-US',
      continuous: options.continuous !== false,
      interimResults: true,
      maxAlternatives: 1
    });

    this.setupSpeechAdapter();
  }

  private setupSpeechAdapter() {
    this.speechAdapter.setOnStart(() => {
      this.isListening = true;
      this.currentTranscript = '';
      if (this.onStatusChange) this.onStatusChange('listening');
    });

    this.speechAdapter.setOnResult((result: any) => {
      this.currentTranscript = result.transcript;
      
      if (this.onStatusChange) {
        this.onStatusChange(result.isFinal ? 'processing' : 'listening');
      }

      if (result.isFinal && result.transcript.trim()) {
        this.processVoiceCommand(result.transcript);
      }
    });

    this.speechAdapter.setOnError((error: string) => {
      this.isListening = false;
      if (this.onError) this.onError(error);
      if (this.onStatusChange) this.onStatusChange('error');
    });

    this.speechAdapter.setOnEnd(() => {
      this.isListening = false;
      if (this.onStatusChange) this.onStatusChange('idle');
    });
  }

  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log('Already listening');
      return;
    }

    try {
      await this.speechAdapter.startListening();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      throw new Error('Failed to start voice recognition');
    }
  }

  stopListening(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    
    this.speechAdapter.stopListening();
    this.isListening = false;
  }

  private processVoiceCommand(command: string): void {
    if (this.onStatusChange) this.onStatusChange('processing');

    try {
      const result = this.parseInsuranceCommand(command);
      
      if (this.onResult) {
        this.onResult(result);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      if (this.onError) this.onError('Failed to process voice command');
    }
  }

  private parseInsuranceCommand(command: string): VoiceSearchResult {
    const commandLower = command.toLowerCase().trim();
    const filters: Record<string, any> = {};
    let searchQuery = command;

    // Case ID patterns
    if (commandLower.includes('case') || commandLower.includes('zinnia')) {
      const caseMatch = command.match(/(?:case|zinnia)\s+(?:id\s+)?([A-Z0-9-]+)/i);
      if (caseMatch) {
        filters.caseId = caseMatch[1];
        filters.zinniaCaseId = caseMatch[1];
      }
    }

    // Insured/Person patterns
    if (commandLower.includes('insured') || commandLower.includes('person') || commandLower.includes('customer')) {
      const insuredMatch = command.match(/(?:insured|person|customer)\s+(?:named?|is|called?)\s+([a-zA-Z\s]+)/i);
      if (insuredMatch) {
        filters.insured = insuredMatch[1].trim();
        filters.insuredName = insuredMatch[1].trim();
      }
    }

    // Policy number patterns
    if (commandLower.includes('policy') || commandLower.includes('policy number')) {
      const policyMatch = command.match(/(?:policy\s+number\s+)?([A-Z0-9-]+)/i);
      if (policyMatch) {
        filters.policyNumber = policyMatch[1];
      }
    }

    // Status patterns
    if (commandLower.includes('active') || commandLower.includes('pending') || commandLower.includes('approved') || commandLower.includes('rejected')) {
      if (commandLower.includes('active')) {
        filters.status = 'active';
        filters.caseStatus = 'active';
      } else if (commandLower.includes('pending')) {
        filters.status = 'pending';
        filters.caseStatus = 'pending';
      } else if (commandLower.includes('approved')) {
        filters.status = 'approved';
        filters.caseStatus = 'approved';
      } else if (commandLower.includes('rejected')) {
        filters.status = 'rejected';
        filters.caseStatus = 'rejected';
      }
    }

    // Face Amount patterns
    if (commandLower.includes('face amount') || commandLower.includes('coverage') || commandLower.includes('amount')) {
      const amountMatch = command.match(/(?:face\s+amount|coverage|amount)\s+(?:for\s+case\s+)?([A-Z0-9-]+)/i);
      if (amountMatch) {
        filters.caseId = amountMatch[1];
        filters.searchType = 'faceAmount';
      }
    }

    // Premium patterns
    if (commandLower.includes('premium') || commandLower.includes('payment')) {
      if (commandLower.includes('premium information')) {
        filters.searchType = 'premium';
      } else {
        const premiumMatch = command.match(/(?:premium|payment)\s+(?:for\s+case\s+)?([A-Z0-9-]+)/i);
        if (premiumMatch) {
          filters.caseId = premiumMatch[1];
          filters.searchType = 'premium';
        }
      }
    }

    // Agent patterns
    if (commandLower.includes('agent')) {
      const agentMatch = command.match(/(?:agent|broker)\s+(?:named?|is|called?)\s+([a-zA-Z\s]+)/i);
      if (agentMatch) {
        filters.agent = agentMatch[1].trim();
        filters.agentName = agentMatch[1].trim();
      }
    }

    // Priority patterns
    if (commandLower.includes('priority') || commandLower.includes('high priority') || commandLower.includes('urgent')) {
      if (commandLower.includes('high') || commandLower.includes('urgent')) {
        filters.priority = 'high';
        filters.casePriority = 'high';
      } else if (commandLower.includes('low')) {
        filters.priority = 'low';
        filters.casePriority = 'low';
      } else if (commandLower.includes('medium')) {
        filters.priority = 'medium';
        filters.casePriority = 'medium';
      }
    }

    // Product type patterns
    if (commandLower.includes('product') || commandLower.includes('plan')) {
      const productMatch = command.match(/(?:product|plan)\s+(?:type\s+)?([a-zA-Z\s]+)/i);
      if (productMatch) {
        filters.productType = productMatch[1].trim();
      }
    }

    // Expiration patterns
    if (commandLower.includes('expiring') || commandLower.includes('expire') || commandLower.includes('expiration')) {
      if (commandLower.includes('this month')) {
        filters.expirationPeriod = 'thisMonth';
      } else if (commandLower.includes('next month')) {
        filters.expirationPeriod = 'nextMonth';
      } else if (commandLower.includes('this year')) {
        filters.expirationPeriod = 'thisYear';
      }
    }

    // List/Show patterns
    if (commandLower.includes('list') || commandLower.includes('show') || commandLower.includes('display')) {
      if (commandLower.includes('cases')) {
        filters.searchType = 'cases';
      } else if (commandLower.includes('policies')) {
        filters.searchType = 'policies';
      } else if (commandLower.includes('applications')) {
        filters.searchType = 'applications';
      }
    }

    // Find/Search patterns
    if (commandLower.includes('find') || commandLower.includes('search')) {
      filters.searchType = 'search';
    }

    // Generate search query based on filters
    if (Object.keys(filters).length > 0) {
      searchQuery = this.generateSearchQuery(filters);
    }

    return {
      originalText: command,
      searchQuery: searchQuery,
      filters: filters,
      confidence: 0.85, // Default confidence level
      timestamp: new Date()
    };
  }

  private generateSearchQuery(filters: Record<string, any>): string {
    const parts: string[] = [];

    if (filters.caseId) {
      parts.push(`Case ID: ${filters.caseId}`);
    }
    if (filters.insured) {
      parts.push(`Insured: ${filters.insured}`);
    }
    if (filters.policyNumber) {
      parts.push(`Policy: ${filters.policyNumber}`);
    }
    if (filters.status) {
      parts.push(`Status: ${filters.status}`);
    }
    if (filters.agent) {
      parts.push(`Agent: ${filters.agent}`);
    }
    if (filters.priority) {
      parts.push(`Priority: ${filters.priority}`);
    }
    if (filters.productType) {
      parts.push(`Product: ${filters.productType}`);
    }
    if (filters.searchType) {
      parts.push(`Type: ${filters.searchType}`);
    }

    return parts.length > 0 ? parts.join(', ') : 'Insurance data search';
  }

  // Setter methods for callbacks
  setOnResult(callback: (result: VoiceSearchResult) => void): void {
    this.onResult = callback;
  }

  setOnError(callback: (error: string) => void): void {
    this.onError = callback;
  }

  setOnStatusChange(callback: (status: string) => void): void {
    this.onStatusChange = callback;
  }

  // Utility methods
  isSupported(): boolean {
    return this.speechAdapter.isSupported();
  }

  getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  getListeningStatus(): boolean {
    return this.isListening;
  }

  // Sample commands for UI display
  getSampleCommands(): string[] {
    return [
      "Show case ZC-001-2024",
      "Find insured John Smith",
      "Show policy number ABC123",
      "Display premium information",
      "List active cases",
      "Show pending applications",
      "Find agent Sarah Johnson",
      "Display face amount for case XYZ",
      "Show cases with high priority",
      "Find policies expiring this month"
    ];
  }
}

// Export singleton instance
export const voiceSearchService = new VoiceSearchService();
