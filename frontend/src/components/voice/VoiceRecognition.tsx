import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VoiceRecognitionProps {
  onVoiceInput: (text: string) => void;
  onError: (error: string) => void;
}

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  onVoiceInput,
  onError
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        toast.success('Voice recognition started');
      };

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
        setInterimTranscript(interimTranscript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        onError(`Voice recognition error: ${event.error}`);
        toast.error(`Voice recognition error: ${event.error}`);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (interimTranscript) {
          setTranscript(prev => prev + interimTranscript);
          setInterimTranscript('');
        }
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
      onError('Speech recognition is not supported in this browser');
    }
  }, [onError]);

  const startListening = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        onError('Failed to start voice recognition');
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  const processVoiceInput = () => {
    const fullText = transcript + interimTranscript;
    if (fullText.trim()) {
      onVoiceInput(fullText.trim());
      clearTranscript();
      toast.success('Voice input processed');
    } else {
      toast.error('No voice input to process');
    }
  };

  const handleVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Enhanced NLU processing for voice commands
    const intent = analyzeIntent(lowerText);
    const entities = extractEntities(lowerText);
    
    console.log('Voice Command Analysis:', { text, intent, entities });
    
    // Process based on intent
    switch (intent) {
      case 'navigation':
        if (entities.direction === 'next' || entities.direction === 'forward') {
          toast.success('Navigating to next section');
          // Here you would implement navigation logic
        } else if (entities.direction === 'previous' || entities.direction === 'back') {
          toast.success('Navigating to previous section');
          // Here you would implement navigation logic
        }
        break;
        
      case 'form_action':
        if (entities.action === 'save' || entities.action === 'submit') {
          toast.success('Saving form data');
          // Here you would implement save logic
        } else if (entities.action === 'clear' || entities.action === 'reset') {
          clearTranscript();
          toast.success('Transcript cleared');
        }
        break;
        
      case 'policy_query':
        toast.success(`Processing policy query: ${entities.query}`);
        // Here you would implement policy lookup
        break;
        
      case 'claim_action':
        toast.success(`Processing claim action: ${entities.action}`);
        // Here you would implement claim processing
        break;
        
      case 'help':
        toast.success('Opening help section');
        // Here you would implement help navigation
        break;
        
      default:
        // Process as regular input
        onVoiceInput(text);
        break;
    }
  };

  const analyzeIntent = (text: string): string => {
    // Enhanced intent recognition
    if (text.includes('next') || text.includes('continue') || text.includes('forward')) {
      return 'navigation';
    } else if (text.includes('previous') || text.includes('back') || text.includes('return')) {
      return 'navigation';
    } else if (text.includes('save') || text.includes('submit') || text.includes('store')) {
      return 'form_action';
    } else if (text.includes('clear') || text.includes('reset') || text.includes('delete')) {
      return 'form_action';
    } else if (text.includes('policy') || text.includes('coverage') || text.includes('insurance')) {
      return 'policy_query';
    } else if (text.includes('claim') || text.includes('file') || text.includes('report')) {
      return 'claim_action';
    } else if (text.includes('help') || text.includes('support') || text.includes('assist')) {
      return 'help';
    }
    return 'unknown';
  };

  const extractEntities = (text: string): any => {
    const entities: any = {};
    
    // Extract direction
    if (text.includes('next') || text.includes('forward')) {
      entities.direction = 'next';
    } else if (text.includes('previous') || text.includes('back')) {
      entities.direction = 'previous';
    }
    
    // Extract action
    if (text.includes('save') || text.includes('submit')) {
      entities.action = 'save';
    } else if (text.includes('clear') || text.includes('reset')) {
      entities.action = 'clear';
    } else if (text.includes('file') || text.includes('report')) {
      entities.action = 'file';
    }
    
    // Extract query type
    if (text.includes('policy')) {
      entities.query = 'policy';
    } else if (text.includes('claim')) {
      entities.query = 'claim';
    }
    
    return entities;
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Voice Recognition Not Supported
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your browser does not support speech recognition. Please use a modern browser like Chrome or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Recognition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status and Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={isListening ? 'default' : 'secondary'}>
                  {isListening ? (
                    <>
                      <div className="animate-pulse w-2 h-2 bg-white rounded-full mr-2"></div>
                      Listening
                    </>
                  ) : (
                    'Ready'
                  )}
                </Badge>
                {isListening && (
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-blue-500 animate-pulse"></div>
                    <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isListening ? (
                  <Button onClick={startListening}>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Listening
                  </Button>
                ) : (
                  <Button onClick={stopListening} variant="destructive">
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Listening
                  </Button>
                )}
                
                <Button onClick={clearTranscript} variant="outline" disabled={!transcript && !interimTranscript}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Transcript Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice Input</label>
              <div className="min-h-[100px] p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                {transcript && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Final:</span>
                    <p className="text-sm">{transcript}</p>
                  </div>
                )}
                {interimTranscript && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Interim:</span>
                    <p className="text-sm text-blue-600 dark:text-blue-400 italic">{interimTranscript}</p>
                  </div>
                )}
                {!transcript && !interimTranscript && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Start speaking to see your voice input here...
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={processVoiceInput} 
                disabled={!transcript && !interimTranscript}
                className="flex-1"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Process Input
              </Button>
              
              <Button 
                onClick={() => handleVoiceCommand(transcript + interimTranscript)}
                disabled={!transcript && !interimTranscript}
                variant="outline"
                className="flex-1"
              >
                Execute Command
              </Button>
            </div>

            {/* Voice Commands Help */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Voice Commands
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-200">
                <div>• "Next" or "Continue"</div>
                <div>• "Previous" or "Back"</div>
                <div>• "Save" or "Submit"</div>
                <div>• "Clear" or "Reset"</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceRecognition; 