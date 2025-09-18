import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Mic, MicOff, Search, X, Volume2, Shield, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { voiceWebSocketService } from '../../services/voiceWebSocketService';
import { toast } from 'react-hot-toast';
import { assertSecureContext, getSecureContextMessage, requestMicrophonePermission } from '../../utils/secureContext';

interface VoiceSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  onVoiceCommand?: (transcript: string) => void;
  className?: string;
}

interface SearchFilters {
  insured?: string;
  policyNumber?: string;
  zinniaCaseId?: string;
  caseStatus?: string;
  caseId?: string;
  appDate?: string;
  priority?: string;
  faceAmount?: string;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ 
  onSearch, 
  onClearFilters, 
  onVoiceCommand,
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // STT readiness detection
    const hasSpeech = typeof (window as any).SpeechRecognition !== 'undefined' || typeof (window as any).webkitSpeechRecognition !== 'undefined';
    const hasMedia = !!navigator.mediaDevices?.getUserMedia;
    if (!hasSpeech) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }
    if (!hasMedia) {
      toast.error('Microphone access not supported in this browser.');
      return;
    }

    // Keyboard shortcut for voice search (Ctrl/Cmd + Shift + V)
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        if (!isListening) {
          startListening();
        } else {
          stopListening();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Initialize WebSocket connection only if WS URL is configured
    const wsUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_WEBSOCKET_URL;
    // Disable WebSocket to prevent conflicts with SocketContext
    console.log('Voice WebSocket disabled to prevent conflicts with SocketContext');
    setIsLocalMode(true);
    setIsConnected(false);
    
    if (false) { // Disabled WebSocket connection
      const initWebSocket = async () => {
        try {
          await voiceWebSocketService.connect();
          setIsConnected(true);
          
          // Set up event listeners
          voiceWebSocketService.on('connected', () => {
            setIsConnected(true);
            toast.success('Voice agent connected');
          });
          
          voiceWebSocketService.on('disconnected', () => {
            setIsConnected(false);
            toast.warning('Voice agent disconnected');
          });
          
          voiceWebSocketService.on('stt_partial', (data) => {
            setTranscript(data.text || '');
          });
          
          voiceWebSocketService.on('stt_final', (data) => {
            setTranscript(data.text || '');
            processVoiceCommand(data.text || '');
          });
          
          voiceWebSocketService.on('nlu_intent', (data) => {
            if (import.meta.env.DEV) {
               
              console.debug('[VOICE]', { transcript, intent: data.intent, entities: data.data });
            }
            // Handle different intents
            handleIntent(data.intent, data.data);
          });
          
          voiceWebSocketService.on('tool_result', (data) => {
            if (import.meta.env.DEV) {
               
              console.debug('[VOICE tool]', data);
            }
            // Handle tool results (API responses)
            handleToolResult(data);
          });
          
          voiceWebSocketService.on('tts_response', (data) => {
            // Handle text-to-speech response
            if (data.text) {
              speakResponse(data.text);
            }
          });
          
          voiceWebSocketService.on('error', (error) => {
            console.error('Voice service error:', error);
            toast.error('Voice service error occurred');
          });
          
        } catch (error) {
          console.error('Failed to connect to voice service:', error);
          if (import.meta.env.DEV) {
            console.log('Voice service will work in local mode without WebSocket');
          }
          setIsLocalMode(true);
          setIsConnected(false);
        }
      };

      initWebSocket();
    }

    return () => {
      voiceWebSocketService.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening]);

  // Local fallback processing when WebSocket is not available
  const processLocalVoiceCommand = (command: string) => {
    if (isLocalMode) {
      const localResult = voiceWebSocketService.processLocalVoiceCommand(command);
      if (localResult.intent !== 'unknown') {
        handleIntent(localResult.intent, localResult.data);
      }
    }
  };

  const handleConsent = (consent: boolean) => {
    setHasConsent(consent);
    setShowConsentDialog(false);
    
    if (consent) {
      toast.success('Voice consent granted. You can now use voice commands.');
    } else {
      toast.info('Voice features disabled. You can enable them later in settings.');
    }
  };

  const startListening = async () => {
    if (!hasConsent) {
      setShowConsentDialog(true);
      return;
    }

    // In local mode, we're always "connected"
    if (!isConnected && import.meta.env.VITE_WS_URL?.trim()) {
      toast.error('Voice service not connected. Please try again.');
      return;
    }

    try {
      // Check secure context and request mic permission
      if (!assertSecureContext()) {
        toast.error(getSecureContextMessage());
        return;
      }
      
      await requestMicrophonePermission();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Microphone permission denied.');
      }
      return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('Listening...');
        
        // Send start listening message to WebSocket
        voiceWebSocketService.sendMessageWithRateLimit({
          type: 'stt_start'
        });
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update local transcript
        setTranscript(interimTranscript || finalTranscript);
        
        // Send to WebSocket service
        if (interimTranscript) {
          voiceWebSocketService.sendMessageWithRateLimit({
            type: 'stt_partial',
            text: redactPII(interimTranscript)
          });
        }
        
        if (finalTranscript) {
          setSearchQuery(finalTranscript);
          
          // Call the voice command handler if provided
          if (onVoiceCommand) {
            onVoiceCommand(finalTranscript);
          }
          
          // Send final transcript to WebSocket
          voiceWebSocketService.sendMessageWithRateLimit({
            type: 'stt_final',
            text: redactPII(finalTranscript)
          });
          
          processVoiceCommand(finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('Error occurred. Please try again.');
        
        // Send error to WebSocket
        voiceWebSocketService.sendMessageWithRateLimit({
          type: 'error',
          data: { error: event.error }
        });
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        
        // Send end listening message to WebSocket
        voiceWebSocketService.sendMessageWithRateLimit({
          type: 'stt_end'
        });
      };
      
      // Retry start up to 2 times on failure
      const tryStart = async (attempt = 1) => {
        try {
          recognitionRef.current.start();
        } catch (e) {
          if (attempt < 2) {
            setTimeout(() => tryStart(attempt + 1), 300);
          } else {
            toast.error('Failed to start speech recognition.');
          }
        }
      };
      tryStart();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const redactPII = (text: string): string => {
    // Redact PII as specified in Phase 4 requirements
    return text
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // SSN pattern
      .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[DOB]') // Date of birth
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]') // Phone number
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]'); // Email
  };

  const handleIntent = (intent: string, data: any) => {
    console.log('Processing intent:', intent, data);
    
    switch (intent) {
      case 'search_cases':
        if (data.filters) {
          setActiveFilters(data.filters);
          onSearch(data.filters);
          toast.success(`Searching for cases with filters: ${JSON.stringify(data.filters)}`);
        }
        break;
        
      case 'open_case':
        if (data.caseId) {
          // Navigate to case details
          const caseId = data.caseId;
          toast.success(`Opening case: ${caseId}`);
          // Emit navigation event for parent component to handle
          if (onVoiceCommand) {
            onVoiceCommand(`navigate_to_case:${caseId}`);
          }
        }
        break;
        
      case 'filter_by_status':
        if (data.status) {
          const filters = { caseStatus: data.status };
          setActiveFilters(filters);
          onSearch(filters);
          toast.success(`Filtering cases by status: ${data.status}`);
        }
        break;
        
      case 'filter_by_priority':
        if (data.priority) {
          const filters = { priority: data.priority };
          setActiveFilters(filters);
          onSearch(filters);
          toast.success(`Filtering cases by priority: ${data.priority}`);
        }
        break;
        
      case 'filter_by_date':
        if (data.dateRange) {
          const filters = { appDate: data.dateRange };
          setActiveFilters(filters);
          onSearch(filters);
          toast.success(`Filtering cases by date range: ${data.dateRange}`);
        }
        break;
        
      case 'clear_filters':
        setActiveFilters({});
        onClearFilters();
        toast.success('All filters cleared');
        break;
        
      default:
        console.log('Unknown intent:', intent);
        toast.info(`Voice command not recognized: ${intent}`);
    }
  };

  const handleToolResult = (data: any) => {
    if (data.type === 'search_result') {
      // Handle search results from backend
      if (data.filters) {
        setActiveFilters(data.filters);
        onSearch(data.filters);
      }
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = (command: string) => {
    setIsProcessing(true);
    const commandLower = command.toLowerCase();
    const filters: SearchFilters = {};

    // Enhanced voice command processing for dashboard
    if (commandLower.includes('show active') || commandLower.includes('active cases')) {
      filters.caseStatus = 'active';
    } else if (commandLower.includes('show pending') || commandLower.includes('pending cases')) {
      filters.caseStatus = 'pending';
    } else if (commandLower.includes('show approved') || commandLower.includes('approved cases')) {
      filters.caseStatus = 'approved';
    } else if (commandLower.includes('show rejected') || commandLower.includes('rejected cases')) {
      filters.caseStatus = 'rejected';
    }

    // Parse voice command for filters
    if (commandLower.includes('insured') || commandLower.includes('customer') || commandLower.includes('person')) {
      // Extract insured name
      const insuredMatch = command.match(/(?:insured|customer|person)\s+(?:named?|is|called?)\s+([a-zA-Z\s]+)/i);
      if (insuredMatch) {
        filters.insured = insuredMatch[1].trim();
      }
    }

    if (commandLower.includes('policy') || commandLower.includes('policy number')) {
      const policyMatch = command.match(/(?:policy\s+number\s+)?([A-Z0-9-]+)/i);
      if (policyMatch) {
        filters.policyNumber = policyMatch[1];
      }
    }

    if (commandLower.includes('zinnia') || commandLower.includes('case id')) {
      const zinniaMatch = command.match(/(?:zinnia\s+)?case\s+id\s+([A-Z0-9-]+)/i);
      if (zinniaMatch) {
        filters.zinniaCaseId = zinniaMatch[1];
      }
    }

    if (commandLower.includes('status') || commandLower.includes('case status')) {
      const statusMatch = command.match(/(?:status|case status)\s+(active|pending|approved|rejected)/i);
      if (statusMatch) {
        filters.caseStatus = statusMatch[1].toLowerCase();
      }
    }

    // Enhanced priority filtering
    if (commandLower.includes('priority') || commandLower.includes('urgent') || commandLower.includes('high priority')) {
      if (commandLower.includes('urgent') || commandLower.includes('high priority')) {
        filters.priority = 'urgent';
      } else if (commandLower.includes('high')) {
        filters.priority = 'high';
      } else if (commandLower.includes('medium')) {
        filters.priority = 'medium';
      } else if (commandLower.includes('low')) {
        filters.priority = 'low';
      }
    }

    // Date range filtering
    if (commandLower.includes('last week') || commandLower.includes('past week')) {
      filters.appDate = 'last_week';
    } else if (commandLower.includes('last month') || commandLower.includes('past month')) {
      filters.appDate = 'last_month';
    } else if (commandLower.includes('today') || commandLower.includes('this week')) {
      filters.appDate = 'this_week';
    } else if (commandLower.includes('yesterday')) {
      filters.appDate = 'yesterday';
    }

    // Face amount filtering
    if (commandLower.includes('face amount') || commandLower.includes('coverage')) {
      const amountMatch = command.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|thousand|m|million|b|billion)?/i);
      if (amountMatch) {
        let amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        if (commandLower.includes('k') || commandLower.includes('thousand')) {
          amount *= 1000;
        } else if (commandLower.includes('m') || commandLower.includes('million')) {
          amount *= 1000000;
        } else if (commandLower.includes('b') || commandLower.includes('billion')) {
          amount *= 1000000000;
        }
        filters.faceAmount = amount.toString();
      }
    }

    // Help command
    if (commandLower.includes('help') || commandLower.includes('what can you do')) {
      showVoiceHelp();
      setIsProcessing(false);
      return;
    }

    if (commandLower.includes('clear') || commandLower.includes('clear all') || commandLower.includes('reset')) {
      setActiveFilters({});
      onClearFilters();
      setTranscript('');
      setSearchQuery('');
      setIsProcessing(false);
      return;
    }

    if (import.meta.env.DEV) {
       
      console.debug('[VOICE]', { transcript: command, intent: 'parsed', entities: filters });
    }

    // Update active filters
    setActiveFilters(filters);
    
    // Call search callback
    onSearch(filters);
    
    // If in local mode, also process with local intent recognition
    if (isLocalMode) {
      processLocalVoiceCommand(command);
    }
    
    setIsProcessing(false);
  };

  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      const filters: SearchFilters = {};
      
      // Try to auto-detect filter type
      if (searchQuery.match(/^[A-Z0-9-]+$/)) {
        // Looks like a policy number or case ID
        if (searchQuery.includes('ZC')) {
          filters.zinniaCaseId = searchQuery;
        } else if (searchQuery.includes('APP')) {
          filters.policyNumber = searchQuery;
        } else {
          filters.caseId = searchQuery;
        }
      } else {
        // Assume it's an insured name
        filters.insured = searchQuery;
      }
      
      setActiveFilters(filters);
      onSearch(filters);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setTranscript('');
    onClearFilters();
  };

  const removeFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onSearch(newFilters);
  };

  const showVoiceHelp = () => {
    const helpText = `
Voice Commands Available:

🔍 Search & Filter:
• "Show active cases" - Filter by active status
• "Show pending cases" - Filter by pending status  
• "Show approved cases" - Filter by approved status
• "Show rejected cases" - Filter by rejected status
• "Show high priority cases" - Filter by priority
• "Show cases from last week" - Filter by date range

👤 Case Lookup:
• "Find case CS-2024-001" - Search by case ID
• "Find policy POL-001" - Search by policy number
• "Find insured John Doe" - Search by insured name
• "Find Zinnia case ZC-001" - Search by Zinnia case ID

💰 Coverage & Amounts:
• "Show cases with $500k coverage" - Filter by face amount
• "Show million dollar policies" - Filter by coverage amount

🔄 Management:
• "Clear all filters" - Reset all search filters
• "Help" - Show this help message

💡 Tips:
• Speak clearly and naturally
• Use specific case IDs or policy numbers
• Combine filters: "Show urgent cases from last week"
    `;
    
    toast.success('Voice help displayed in console');
    console.log(helpText);
    
    // Also show a more user-friendly toast
    toast.info('Voice commands help available. Check console for full list.', {
      duration: 4000,
      icon: '🎤'
    });
  };

  // Consent Dialog
  if (showConsentDialog) {
    return (
      <Card className={`space-y-4 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Voice Assistant Consent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Privacy & Security Notice</h4>
                <p className="text-sm text-blue-800 mt-1">
                  The voice assistant processes your voice commands to help you search and manage insurance cases. 
                  All PII (SSN, DOB, phone, email) is automatically redacted for security.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={() => handleConsent(true)}
              className="btn-primary flex-1"
            >
              <Mic className="h-4 w-4 mr-2" />
              Enable Voice Assistant
            </Button>
            <Button
              onClick={() => handleConsent(false)}
              variant="outline"
              className="flex-1"
            >
              Disable Voice Features
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
             {/* Connection Status */}
       <div className="flex items-center justify-between">
         <div className="flex items-center space-x-2">
           <div className={`w-2 h-2 rounded-full ${
             isLocalMode ? 'bg-yellow-500' : 
             isConnected ? 'bg-green-500' : 'bg-red-500'
           }`}></div>
           <span id="voice-status" className="text-sm text-gray-600">
             Voice Agent: {
               isLocalMode ? 'Local Mode' :
               isConnected ? 'Connected' : 'Disconnected'
             }
           </span>
         </div>
        
        {!hasConsent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConsentDialog(true)}
            className="text-blue-600"
          >
            <Shield className="h-4 w-4 mr-1" />
            Enable Voice
          </Button>
        )}
      </div>

      {/* Voice Search Controls */}
      <div className="flex items-center space-x-3">
                 <Button
           onClick={isListening ? stopListening : startListening}
           className={`btn-primary ${isListening ? 'animate-pulse' : ''}`}
           disabled={isProcessing || !hasConsent || (!isConnected && !isLocalMode)}
           aria-label={isListening ? 'Stop voice listening' : 'Start voice search'}
           aria-describedby="voice-status"
           title={`${isListening ? 'Stop' : 'Start'} voice search (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Shift+V)`}
         >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Voice Search
            </>
          )}
        </Button>
                 <Button
           variant="outline"
           onClick={async () => {
             try {
               if (!assertSecureContext()) {
                 toast.error(getSecureContextMessage());
                 return;
               }
               
               await requestMicrophonePermission();
               toast.success('Microphone is working.');
             } catch (e) {
               if (e instanceof Error) {
                 toast.error(e.message);
               } else {
                 toast.error('Microphone test failed.');
               }
             }
           }}
         >
           Test mic
         </Button>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Or type your search query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
            className="pl-10"
          />
        </div>
        
        <Button onClick={handleManualSearch} className="btn-secondary">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Voice Transcript Display */}
      {transcript && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                <strong>Voice Command:</strong> "{transcript}"
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTranscript('')}
              className="h-6 w-6 p-0 text-blue-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span>{key}: {value}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(key as keyof SearchFilters)}
                  className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Voice Command Examples */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Voice Command Examples:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
          <div>• "Show active cases"</div>
          <div>• "Search for John Smith"</div>
          <div>• "Find policy APP-2024-001"</div>
          <div>• "Show pending applications"</div>
          <div>• "Clear all filters"</div>
          <div>• "Find Zinnia case ZC-001-2024"</div>
        </div>
      </div>
    </div>
  );
};
