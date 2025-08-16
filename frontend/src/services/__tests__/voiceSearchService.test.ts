import { VoiceSearchService, DashboardFilter } from '../voiceSearchService';
import { SpeechAdapter } from '../speechAdapter';

// Mock SpeechAdapter
class MockSpeechAdapter extends SpeechAdapter {
  private mockIsSupported = true;

  constructor(supported = true) {
    super();
    this.mockIsSupported = supported;
  }

  isSupported(): boolean {
    return this.mockIsSupported;
  }

  async startListening(): Promise<void> {
    this.isListening = true;
    if (this.onStart) this.onStart();
    
    // Simulate speech recognition result
    setTimeout(() => {
      if (this.onResult) {
        this.onResult({
          transcript: 'show open cases from last week',
          confidence: 0.95,
          isFinal: true,
          timestamp: new Date()
        });
      }
    }, 100);
  }

  stopListening(): void {
    this.isListening = false;
    if (this.onEnd) this.onEnd();
  }
}

// Mock nluService
jest.mock('../nluService', () => ({
  nluService: {
    processText: jest.fn().mockResolvedValue({
      intents: [{ name: 'case_search', confidence: 0.9 }],
      entities: [
        { type: 'date', value: '2024-01-15', confidence: 0.8 },
        { type: 'status', value: 'open', confidence: 0.9 }
      ],
      confidence: 0.9
    })
  }
}));

describe('VoiceSearchService', () => {
  let voiceService: VoiceSearchService;
  let mockAdapter: MockSpeechAdapter;

  beforeEach(() => {
    mockAdapter = new MockSpeechAdapter();
    voiceService = new VoiceSearchService();
    // Replace the adapter with our mock
    (voiceService as any).speechAdapter = mockAdapter;
  });

  afterEach(() => {
    voiceService.stopListening();
    jest.clearAllMocks();
  });

  describe('Voice Recognition', () => {
    it('should start listening successfully', async () => {
      const onStatusChange = jest.fn();
      voiceService.setOnStatusChange(onStatusChange);

      await voiceService.startListening();

      expect(voiceService.getIsListening()).toBe(true);
      expect(onStatusChange).toHaveBeenCalledWith('listening');
    });

    it('should stop listening', () => {
      const onStatusChange = jest.fn();
      voiceService.setOnStatusChange(onStatusChange);

      voiceService.stopListening();

      expect(voiceService.getIsListening()).toBe(false);
    });

    it('should handle speech recognition results', async () => {
      const onResult = jest.fn();
      voiceService.setOnResult(onResult);

      await voiceService.startListening();
      
      // Wait for the mock result
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(onResult).toHaveBeenCalled();
      const result = onResult.mock.calls[0][0];
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('searchQuery');
      expect(result).toHaveProperty('originalText');
    });
  });

  describe('Voice Command Processing', () => {
    it('should parse status commands correctly', async () => {
      const { convertNLUToFilters } = voiceService as any;
      
      const mockNLUResponse = {
        intents: [{ name: 'case_search', confidence: 0.9 }],
        entities: [],
        confidence: 0.9
      };

      const result = convertNLUToFilters('show open cases', mockNLUResponse);

      expect(result.filters.caseStatus).toBe('Open');
      expect(result.suggestedActions).toContain('Show open cases');
    });

    it('should parse time range commands correctly', async () => {
      const { convertNLUToFilters } = voiceService as any;
      
      const mockNLUResponse = {
        intents: [{ name: 'case_search', confidence: 0.9 }],
        entities: [],
        confidence: 0.9
      };

      const result = convertNLUToFilters('show cases from last week', mockNLUResponse);

      expect(result.filters.timeRange).toBe('last_week');
      expect(result.filters.appDate).toBeDefined();
      expect(result.suggestedActions).toContain('Filter by last week');
    });

    it('should parse case ID commands correctly', async () => {
      const { convertNLUToFilters } = voiceService as any;
      
      const mockNLUResponse = {
        intents: [{ name: 'case_search', confidence: 0.9 }],
        entities: [],
        confidence: 0.9
      };

      const result = convertNLUToFilters('show case CS-2024-001', mockNLUResponse);

      expect(result.filters.caseId).toBe('CS-2024-001');
      expect(result.suggestedActions).toContain('Show specific case');
    });

    it('should parse insured name commands correctly', async () => {
      const { convertNLUToFilters } = voiceService as any;
      
      const mockNLUResponse = {
        intents: [{ name: 'customer_search', confidence: 0.9 }],
        entities: [],
        confidence: 0.9
      };

      const result = convertNLUToFilters('show cases for John Smith', mockNLUResponse);

      expect(result.filters.insured).toBe('John Smith');
      expect(result.suggestedActions).toContain('Filter by insured person');
    });

    it('should handle multiple filters in one command', async () => {
      const { convertNLUToFilters } = voiceService as any;
      
      const mockNLUResponse = {
        intents: [{ name: 'case_search', confidence: 0.9 }],
        entities: [
          { type: 'status', value: 'pending', confidence: 0.9 }
        ],
        confidence: 0.9
      };

      const result = convertNLUToFilters('show pending cases for John Smith from last month', mockNLUResponse);

      expect(result.filters.caseStatus).toBe('Pending');
      expect(result.filters.insured).toBe('John Smith');
      expect(result.filters.timeRange).toBe('last_month');
      expect(result.suggestedActions.length).toBeGreaterThan(2);
    });
  });

  describe('Date Range Processing', () => {
    it('should generate correct date ranges', () => {
      const { getDateRange } = voiceService as any;
      const now = new Date();

      const today = getDateRange('today');
      const lastWeek = getDateRange('last_week');
      const thisWeek = getDateRange('this_week');
      const lastMonth = getDateRange('last_month');
      const thisMonth = getDateRange('this_month');

      expect(new Date(today)).toBeInstanceOf(Date);
      expect(new Date(lastWeek)).toBeInstanceOf(Date);
      expect(new Date(thisWeek)).toBeInstanceOf(Date);
      expect(new Date(lastMonth)).toBeInstanceOf(Date);
      expect(new Date(thisMonth)).toBeInstanceOf(Date);

      // Verify that past dates are actually in the past
      expect(new Date(lastWeek).getTime()).toBeLessThan(now.getTime());
      expect(new Date(lastMonth).getTime()).toBeLessThan(now.getTime());
    });
  });

  describe('Search Query Generation', () => {
    it('should generate appropriate search queries', () => {
      const { generateSearchQuery } = voiceService as any;

      const filters: DashboardFilter = {
        caseId: 'CS-2024-001',
        caseStatus: 'Open',
        insured: 'John Smith'
      };

      const query = generateSearchQuery(filters, 'original text');

      expect(query).toContain('Case: CS-2024-001');
      expect(query).toContain('Status: Open');
      expect(query).toContain('Insured: John Smith');
    });

    it('should fallback to original text when no filters', () => {
      const { generateSearchQuery } = voiceService as any;

      const filters: DashboardFilter = {};
      const originalText = 'show me something';

      const query = generateSearchQuery(filters, originalText);

      expect(query).toBe(originalText);
    });
  });

  describe('Sample Commands', () => {
    it('should provide sample commands', () => {
      const samples = voiceService.getSampleCommands();

      expect(samples).toBeInstanceOf(Array);
      expect(samples.length).toBeGreaterThan(5);
      expect(samples.every(cmd => typeof cmd === 'string')).toBe(true);
      expect(samples.some(cmd => cmd.includes('open cases'))).toBe(true);
      expect(samples.some(cmd => cmd.includes('last week'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle speech recognition errors', async () => {
      const onError = jest.fn();
      voiceService.setOnError(onError);

      // Simulate error
      (voiceService as any).speechAdapter.setOnError = (callback: any) => {
        setTimeout(() => callback('Speech recognition failed'), 50);
      };

      await voiceService.startListening();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onError).toHaveBeenCalledWith('Speech recognition failed');
    });

    it('should handle unsupported speech recognition', () => {
      const unsupportedAdapter = new MockSpeechAdapter(false);
      const unsupportedService = new VoiceSearchService();
      (unsupportedService as any).speechAdapter = unsupportedAdapter;

      expect(unsupportedService.isSupported()).toBe(false);
    });
  });

  describe('Status Management', () => {
    it('should track listening status correctly', async () => {
      expect(voiceService.getIsListening()).toBe(false);

      await voiceService.startListening();
      expect(voiceService.getIsListening()).toBe(true);

      voiceService.stopListening();
      expect(voiceService.getIsListening()).toBe(false);
    });

    it('should track current transcript', async () => {
      const transcript = 'test transcript';
      
      // Simulate receiving transcript
      (voiceService as any).currentTranscript = transcript;
      
      expect(voiceService.getCurrentTranscript()).toBe(transcript);
    });
  });

  describe('Term Detection', () => {
    it('should detect status terms correctly', () => {
      const { containsTerms } = voiceService as any;

      expect(containsTerms('show open cases', ['open', 'active'])).toBe(true);
      expect(containsTerms('pending applications', ['pending'])).toBe(true);
      expect(containsTerms('closed cases', ['closed', 'completed'])).toBe(true);
      expect(containsTerms('random text', ['open', 'pending'])).toBe(false);
    });

    it('should detect time terms correctly', () => {
      const { containsTerms } = voiceService as any;

      expect(containsTerms('from last week', ['last week', 'past week'])).toBe(true);
      expect(containsTerms('this month cases', ['this month', 'current month'])).toBe(true);
      expect(containsTerms('yesterday data', ['yesterday'])).toBe(false);
    });
  });
});
