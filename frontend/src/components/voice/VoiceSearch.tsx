import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Mic, MicOff, Search, X, Volume2 } from 'lucide-react';
import { Badge } from '../ui/badge';

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
  
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('Listening...');
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const finalTranscript = event.results[0][0].transcript;
        setTranscript(finalTranscript);
        setSearchQuery(finalTranscript);
        
        // Call the voice command handler if provided
        if (onVoiceCommand) {
          onVoiceCommand(finalTranscript);
        }
        
        processVoiceCommand(finalTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('Error occurred. Please try again.');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.start();
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

    if (commandLower.includes('clear') || commandLower.includes('clear all') || commandLower.includes('reset')) {
      setActiveFilters({});
      onClearFilters();
      setTranscript('');
      setSearchQuery('');
      setIsProcessing(false);
      return;
    }

    // Update active filters
    setActiveFilters(filters);
    
    // Call search callback
    onSearch(filters);
    
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Search Controls */}
      <div className="flex items-center space-x-3">
        <Button
          onClick={isListening ? stopListening : startListening}
          className={`btn-primary ${isListening ? 'animate-pulse' : ''}`}
          disabled={isProcessing}
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
