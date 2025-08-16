import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare,
  Bot,
  User,
  Loader2,
  X,
  Minimize2,
  Maximize2,
  Settings,
  HelpCircle
} from 'lucide-react';
import { chatbotService, ChatMessage, ChatAction, ChatbotResponse } from '../../services/chatbotService';
import { voiceService } from '../../services/voiceService';

interface AssistantPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onMinimize: () => void;
  className?: string;
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({
  isOpen,
  onToggle,
  onMinimize,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.9,
    pitch: 1.1,
    volume: 1.0,
    language: 'en-US'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat session
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['chatbot-session'],
    queryFn: chatbotService.startSession,
    retry: 1,
    enabled: isOpen
  });

  // Handle text-to-speech
  const handleSpeakResponse = useCallback((text: string) => {
    setIsSpeaking(true);
    voiceService.speakText(text, voiceSettings);
    
    // Reset speaking state after estimated duration
    const estimatedDuration = text.length * 100; // rough estimation
    setTimeout(() => setIsSpeaking(false), estimatedDuration);
  }, [voiceSettings]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ text, isVoice = false }: { text: string; isVoice?: boolean }) =>
      chatbotService.sendMessage(text, sessionId, isVoice),
    onSuccess: (response: ChatbotResponse) => {
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          confidence: response.confidence,
          actions: response.actions,
          entities: response.entities
        }
      };
      setMessages(prev => [...prev, botMessage]);

      // Speak response if voice enabled
      if (voiceEnabled && response.needsVoiceResponse) {
        handleSpeakResponse(response.message);
      }

      // Show quick actions if available
      if (response.actions && response.actions.length > 0) {
        toast.success(`Available actions: ${response.actions.map(a => a.label).join(', ')}`);
      }
    },
    onError: (error) => {
      toast.error('Failed to send message. Please try again.');
      console.error('Chatbot error:', error);
    }
  });

  // Voice processing mutation
  const voiceProcessMutation = useMutation({
    mutationFn: (audioBlob: Blob) => chatbotService.processVoiceInput(audioBlob, sessionId),
    onSuccess: (response: ChatbotResponse) => {
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        type: 'voice',
        metadata: {
          confidence: response.confidence,
          actions: response.actions
        }
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (voiceEnabled) {
        handleSpeakResponse(response.message);
      }
    },
    onError: (error) => {
      toast.error('Failed to process voice input.');
      console.error('Voice processing error:', error);
    }
  });

  // Initialize session
  useEffect(() => {
    if (sessionData && isOpen) {
      setSessionId(sessionData.sessionId);
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: sessionData.welcomeMessage || 'Hello! I\'m your SecureInsure AI assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);

      if (voiceEnabled) {
        handleSpeakResponse(welcomeMessage.text);
      }
    }
  }, [sessionData, isOpen, voiceEnabled, handleSpeakResponse]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate({ text: inputText });
    setInputText('');
    
    // Focus back to input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const recognition = voiceService.startWebSpeechRecognition(
      (transcript) => {
        const userMessage: ChatMessage = {
          id: `user_voice_${Date.now()}`,
          text: transcript,
          sender: 'user',
          timestamp: new Date(),
          type: 'voice',
          metadata: { voiceInput: true }
        };
        setMessages(prev => [...prev, userMessage]);
        sendMessageMutation.mutate({ text: transcript, isVoice: true });
        setIsListening(false);
      },
      (error) => {
        toast.error('Voice recognition error. Please try again.');
        setIsListening(false);
      }
    );

    if (recognition) {
      recognitionRef.current = recognition;
      setIsListening(true);
      toast.success('Listening... Speak now!');
    } else {
      toast.error('Voice recognition not supported in this browser.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Handle quick actions
  const handleQuickAction = (action: ChatAction) => {
    toast.success(`Executing: ${action.label}`);
    // Here you would implement the actual action execution
    console.log('Executing action:', action);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle voice
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled && isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle minimize
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize();
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMinimize}
                  className="h-6 w-6 p-0"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceInput}
                className={`flex-1 ${isListening ? 'bg-red-100 border-red-300' : ''}`}
              >
                <Mic className={`h-4 w-4 mr-2 ${isListening ? 'text-red-600' : ''}`} />
                {isListening ? 'Listening...' : 'Voice Input'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="h-8 w-8 p-0"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-96 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Assistant
              {sessionLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="h-6 w-6 p-0"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Voice Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs">Rate:</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-xs w-8">{voiceSettings.rate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs">Pitch:</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-xs w-8">{voiceSettings.pitch}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs">Volume:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-xs w-8">{voiceSettings.volume}</span>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="h-64 overflow-y-auto mb-4 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === 'user' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.metadata?.confidence && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(message.metadata.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                  <p>{message.text}</p>
                  
                  {/* Quick Actions */}
                  {message.metadata?.actions && message.sender === 'bot' && (
                    <div className="mt-2 space-y-1">
                      {message.metadata.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action)}
                          className="h-6 text-xs"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || sendMessageMutation.isPending}
                size="sm"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Voice Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleVoiceInput}
                className={`flex-1 ${isListening ? 'bg-red-100 border-red-300' : ''}`}
                disabled={voiceProcessMutation.isPending}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2 text-red-600" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Input
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={toggleVoice}
                className={`h-9 w-9 p-0 ${voiceEnabled ? 'bg-green-100 border-green-300' : ''}`}
              >
                {voiceEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-600" />
                ) : (
                  <VolumeX className="h-4 w-4 text-red-600" />
                )}
              </Button>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                {isListening && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Listening...
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Speaking...
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                <span>Try: "Check my policy" or "File a claim"</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantPanel; 