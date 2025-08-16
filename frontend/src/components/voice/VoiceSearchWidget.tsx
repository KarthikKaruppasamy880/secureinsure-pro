import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Mic, MicOff, Search, X, Volume2, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { voiceSearchService } from '../../services/voiceSearchService';

export interface VoiceSearchResult {
  originalText: string;
  searchQuery: string;
  filters: Record<string, any>;
  confidence: number;
  timestamp: Date;
}

interface VoiceSearchWidgetProps {
  onFiltersChange: (filters: Record<string, any>) => void;
  onSearchQuery: (query: string) => void;
  currentFilters?: Record<string, any>;
  className?: string;
}

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'error' | 'success';

export const VoiceSearchWidget: React.FC<VoiceSearchWidgetProps> = ({
  onFiltersChange,
  onSearchQuery,
  currentFilters = {},
  className = ''
}) => {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastResult, setLastResult] = useState<VoiceSearchResult | null>(null);
  const [showSampleCommands, setShowSampleCommands] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [confidenceLevel, setConfidenceLevel] = useState(0);

  useEffect(() => {
    // Check if voice recognition is supported
    setIsSupported(voiceSearchService.isSupported());
    
    // Setup voice search service callbacks
    voiceSearchService.setOnResult((result: VoiceSearchResult) => {
      setLastResult(result);
      setConfidenceLevel(result.confidence);
      setVoiceStatus('success');
      
      // Apply filters to dashboard
      onFiltersChange(result.filters);
      onSearchQuery(result.searchQuery);
      
      toast.success(`Voice command processed: "${result.originalText}"`);
      
      // Auto-reset after 3 seconds
      setTimeout(() => {
        setVoiceStatus('idle');
        setCurrentTranscript('');
      }, 3000);
    });

    voiceSearchService.setOnError((error: string) => {
      setVoiceStatus('error');
      toast.error(error);
      
      setTimeout(() => {
        setVoiceStatus('idle');
      }, 3000);
    });

    voiceSearchService.setOnStatusChange((status: string) => {
      switch (status) {
        case 'listening':
          setVoiceStatus('listening');
          break;
        case 'processing':
          setVoiceStatus('processing');
          break;
        case 'error':
          setVoiceStatus('error');
          break;
        case 'idle':
          setVoiceStatus('idle');
          break;
      }
    });

    // Cleanup on unmount
    return () => {
      voiceSearchService.stopListening();
    };
  }, [onFiltersChange, onSearchQuery]);

  const handleVoiceToggle = () => {
    if (voiceStatus === 'listening') {
      voiceSearchService.stopListening();
    } else {
      voiceSearchService.startListening();
    }
  };

  const getStatusColor = (status: VoiceStatus) => {
    switch (status) {
      case 'listening': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: VoiceStatus) => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'success': return 'Success!';
      case 'error': return 'Error occurred';
      default: return 'Click to start';
    }
  };

  const getStatusIcon = (status: VoiceStatus) => {
    switch (status) {
      case 'listening': return <Mic className="w-5 h-5 animate-pulse" />;
      case 'processing': return <Search className="w-5 h-5 animate-spin" />;
      case 'success': return <Volume2 className="w-5 h-5" />;
      case 'error': return <X className="w-5 h-5" />;
      default: return <Mic className="w-5 h-5" />;
    }
  };

  const sampleCommands = [
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

  if (!isSupported) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Voice search is not supported in your browser.
            </p>
            <p className="text-sm text-gray-500">
              Please use Chrome, Firefox, Safari, or Edge for voice search functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Search
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSampleCommands(!showSampleCommands)}
            className="text-gray-500 hover:text-gray-700"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Voice Control Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleVoiceToggle}
            disabled={voiceStatus === 'processing'}
            className={`w-20 h-20 rounded-full ${getStatusColor(voiceStatus)} hover:opacity-90 transition-all duration-200`}
          >
            {getStatusIcon(voiceStatus)}
          </Button>
        </div>

        {/* Status Display */}
        <div className="text-center">
          <Badge variant="secondary" className="text-sm">
            {getStatusText(voiceStatus)}
          </Badge>
          {confidenceLevel > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Confidence: {Math.round(confidenceLevel * 100)}%
            </div>
          )}
        </div>

        {/* Current Transcript */}
        {currentTranscript && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Heard:</strong> {currentTranscript}
            </p>
          </div>
        )}

        {/* Last Result */}
        {lastResult && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Processed:</strong> {lastResult.originalText}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Applied filters: {Object.keys(lastResult.filters).join(', ')}
            </p>
          </div>
        )}

        {/* Sample Commands */}
        {showSampleCommands && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-3">
              Try saying one of these:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {sampleCommands.map((command, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 bg-gray-100 p-2 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    onSearchQuery(command);
                    toast.success(`Executing: ${command}`);
                  }}
                >
                  "{command}"
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center">
          <p>Click the microphone button and speak your search query</p>
          <p>Examples: "Show case ZC-001-2024" or "Find insured John Smith"</p>
        </div>
      </CardContent>
    </Card>
  );
};
