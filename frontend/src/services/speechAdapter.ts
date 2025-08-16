/**
 * Speech Adapter for Voice Recognition and Processing
 * Provides interface for different speech recognition implementations
 */

export interface CustomSpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: Date;
}

export interface SpeechAdapterConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface VoiceCommand {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  originalText: string;
}

export abstract class SpeechAdapter {
  protected config: SpeechAdapterConfig;
  protected isListening: boolean = false;
  protected onResult?: (result: CustomSpeechRecognitionResult) => void;
  protected onError?: (error: string) => void;
  protected onEnd?: () => void;
  protected onStart?: () => void;

  constructor(config: SpeechAdapterConfig = {}) {
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1,
      ...config
    };
  }

  abstract startListening(): Promise<void>;
  abstract stopListening(): void;
  abstract isSupported(): boolean;

  setOnResult(callback: (result: CustomSpeechRecognitionResult) => void) {
    this.onResult = callback;
  }

  setOnError(callback: (error: string) => void) {
    this.onError = callback;
  }

  setOnEnd(callback: () => void) {
    this.onEnd = callback;
  }

  setOnStart(callback: () => void) {
    this.onStart = callback;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

/**
 * Web Speech API Implementation
 */
export class WebSpeechAdapter extends SpeechAdapter {
  private recognition: SpeechRecognition | null = null;
  private shouldRestart: boolean = false;

  constructor(config: SpeechAdapterConfig = {}) {
    super(config);
    this.initializeRecognition();
  }

  private initializeRecognition() {
    if (!this.isSupported()) {
      console.warn('Web Speech API not supported');
      return;
    }

    // Get the SpeechRecognition constructor (webkit prefix for Chrome/Safari)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    this.recognition = new SpeechRecognition();
    if (this.recognition) {
      this.recognition.lang = this.config.language || 'en-US';
      this.recognition.continuous = this.config.continuous || true;
      this.recognition.interimResults = this.config.interimResults || true;
      this.recognition.maxAlternatives = this.config.maxAlternatives || 1;
    }

    if (this.recognition) {
      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('Speech recognition started');
        if (this.onStart) this.onStart();
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        const isFinal = !!finalTranscript;
        const confidence = event.results[event.results.length - 1]?.[0]?.confidence || 0.5;

        if (this.onResult) {
          this.onResult({
            transcript: transcript.trim(),
            confidence,
            isFinal,
            timestamp: new Date()
          } as CustomSpeechRecognitionResult);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = 'Speech recognition error occurred';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during speech recognition.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was aborted.';
            break;
          case 'language-not-supported':
            errorMessage = 'Language not supported for speech recognition.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        if (this.onError) this.onError(errorMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Speech recognition ended');
        
        if (this.onEnd) this.onEnd();
        
        // Auto-restart if configured and not manually stopped
        if (this.shouldRestart && this.config.continuous) {
          setTimeout(() => {
            if (this.shouldRestart) {
              this.startListening();
            }
          }, 100);
        }
      };
    }
  }

  isSupported(): boolean {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not initialized');
    }

    if (this.isListening) {
      console.warn('Speech recognition already running');
      return;
    }

    try {
      this.shouldRestart = true;
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      throw new Error('Failed to start speech recognition');
    }
  }

  stopListening(): void {
    this.shouldRestart = false;
    
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
}

/**
 * Mock Speech Adapter for testing/fallback
 */
export class MockSpeechAdapter extends SpeechAdapter {
  private mockTimeout: NodeJS.Timeout | null = null;

  isSupported(): boolean {
    return true; // Always supported for testing
  }

  async startListening(): Promise<void> {
    this.isListening = true;
    if (this.onStart) this.onStart();

    // Simulate speech recognition with mock data
    this.mockTimeout = setTimeout(() => {
      if (this.onResult) {
        this.onResult({
          transcript: 'show open cases from last week',
          confidence: 0.95,
          isFinal: true,
          timestamp: new Date()
        } as CustomSpeechRecognitionResult);
      }
      
      if (this.onEnd) this.onEnd();
      this.isListening = false;
    }, 3000);
  }

  stopListening(): void {
    if (this.mockTimeout) {
      clearTimeout(this.mockTimeout);
      this.mockTimeout = null;
    }
    
    this.isListening = false;
    if (this.onEnd) this.onEnd();
  }
}

/**
 * Speech Adapter Factory
 */
export class SpeechAdapterFactory {
  static create(type: 'web' | 'mock' = 'web', config?: SpeechAdapterConfig): SpeechAdapter {
    switch (type) {
      case 'web':
        return new WebSpeechAdapter(config);
      case 'mock':
        return new MockSpeechAdapter(config);
      default:
        throw new Error(`Unknown speech adapter type: ${type}`);
    }
  }

  static createDefault(config?: SpeechAdapterConfig): SpeechAdapter {
    // Use WebSpeechAdapter if supported, otherwise fall back to mock
    const webAdapter = new WebSpeechAdapter(config);
    return webAdapter.isSupported() ? webAdapter : new MockSpeechAdapter(config);
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;

  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;

  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}
