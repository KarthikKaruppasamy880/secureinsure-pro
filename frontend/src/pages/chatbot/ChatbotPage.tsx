import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import { chatbotService, ChatMessage, ChatAction, ChatbotResponse } from '../../services/chatbotService';
import { voiceService } from '../../services/voiceService';



const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any | null>(null);

  // Initialize chat session
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['chatbot-session'],
    queryFn: chatbotService.startSession,
    retry: 1
  });

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


    },
    onError: (error) => {
      const errorMessage = chatbotService.handleError(error);
      toast.error(errorMessage);
      console.error('Chatbot error:', error);
    }
  });



  // Initialize session
  useEffect(() => {
    if (sessionData) {
      setSessionId(sessionData.sessionId);
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: sessionData.welcomeMessage || 'Hello! I\'m your SecureInsure AI assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);

      // Save session to storage
      chatbotService.saveSessionToStorage(sessionData.sessionId, 'current-user');
    }
  }, [sessionData, voiceEnabled]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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



  // Handle action buttons
  const handleAction = async (action: ChatAction) => {
    try {
      const response = await chatbotService.executeAction(action, sessionId);
      const botMessage: ChatMessage = {
        id: `bot_action_${Date.now()}`,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        type: 'action',
        metadata: { actions: response.actions }
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast.error('Failed to execute action.');
    }
  };

  // Quick actions
  const quickActions = [
    { label: 'Check my policies', action: () => sendMessageMutation.mutate({ text: 'Show me my active policies' }) },
    { label: 'Claim status', action: () => sendMessageMutation.mutate({ text: 'What is the status of my recent claims?' }) },
    { label: 'Payment due', action: () => sendMessageMutation.mutate({ text: 'When is my next payment due?' }) },
    { label: 'Help', action: () => sendMessageMutation.mutate({ text: 'What can you help me with?' }) }
  ];

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Initializing AI Assistant...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Voice-enabled insurance chatbot
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={voiceEnabled ? 'border-green-500' : 'border-gray-300'}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Voice {voiceEnabled ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="flex-1 h-[calc(100vh-300px)]">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Chat</span>
            </span>
            {sessionId && (
              <Badge variant="outline" className="text-xs">
                Session: {sessionId.slice(-8)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot className="h-4 w-4 mt-1 text-blue-500" />
                    )}
                    {message.sender === 'user' && (
                      <User className="h-4 w-4 mt-1 text-white" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.text}</p>
                      {message.metadata?.actions && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.metadata.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(action)}
                              className="text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                        {message.type === 'voice' && (
                          <span className="ml-2">🎤</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="border-t p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={item.action}
                  className="text-xs"
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message or use voice..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sendMessageMutation.isPending}
                className="flex-1"
              />
              <Button
                onClick={handleVoiceInput}
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                disabled={sendMessageMutation.isPending}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotPage; 