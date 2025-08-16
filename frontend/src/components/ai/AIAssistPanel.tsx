import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mic, MicOff, Send, Bot, Navigation } from 'lucide-react';
import { navigateToDeeplink } from '../../routes/deeplinks';

interface AIAssistPanelProps {
  caseId: string;
  applicationData: Record<string, any>;
}

interface ParsedIntent {
  intent: 'open_section' | 'get_value' | 'navigate_field';
  section?: string;
  field?: string;
  query?: string;
}

export const AIAssistPanel: React.FC<AIAssistPanelProps> = ({ caseId, applicationData }) => {
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const parseQuery = (userQuery: string): ParsedIntent => {
    const queryLower = userQuery.toLowerCase();
    
    // Check for insured-related queries
    if (queryLower.includes('insured') || queryLower.includes('customer') || queryLower.includes('person')) {
      if (queryLower.includes('email') || queryLower.includes('mail')) {
        return { intent: 'navigate_field', section: 'insured', field: 'Email Address' };
      }
      if (queryLower.includes('phone') || queryLower.includes('mobile') || queryLower.includes('call')) {
        return { intent: 'navigate_field', section: 'insured', field: 'Mobile Phone' };
      }
      if (queryLower.includes('address') || queryLower.includes('where') || queryLower.includes('live')) {
        return { intent: 'navigate_field', section: 'insured', field: 'Address Information' };
      }
      if (queryLower.includes('birth') || queryLower.includes('dob') || queryLower.includes('age')) {
        return { intent: 'navigate_field', section: 'insured', field: 'Date of Birth' };
      }
      if (queryLower.includes('ssn') || queryLower.includes('social security')) {
        return { intent: 'navigate_field', section: 'insured', field: 'SSN' };
      }
      return { intent: 'open_section', section: 'insured' };
    }
    
    // Check for other sections
    if (queryLower.includes('case setup') || queryLower.includes('case')) {
      return { intent: 'open_section', section: 'caseSetup' };
    }
    if (queryLower.includes('beneficiary') || queryLower.includes('beneficiaries')) {
      return { intent: 'open_section', section: 'beneficiary' };
    }
    if (queryLower.includes('owner')) {
      return { intent: 'open_section', section: 'owner' };
    }
    if (queryLower.includes('payor') || queryLower.includes('payment')) {
      return { intent: 'open_section', section: 'payor' };
    }
    if (queryLower.includes('medical') || queryLower.includes('health')) {
      return { intent: 'open_section', section: 'medical' };
    }
    if (queryLower.includes('premium') || queryLower.includes('payment')) {
      return { intent: 'open_section', section: 'premium' };
    }
    
    return { intent: 'get_value', query: userQuery };
  };

  const getFieldValue = (fieldName: string): string => {
    const value = applicationData[fieldName];
    if (value === undefined || value === null || value === '') {
      return 'Not provided yet';
    }
    return String(value);
  };

  const handleQuery = async (userQuery: string) => {
    setIsProcessing(true);
    setQuery(userQuery);
    
    const parsedIntent = parseQuery(userQuery);
    let responseText = '';
    
    try {
      switch (parsedIntent.intent) {
        case 'navigate_field':
          if (parsedIntent.section && parsedIntent.field) {
            const value = getFieldValue(parsedIntent.field);
            responseText = `The ${parsedIntent.field} is: ${value}. Navigating to ${parsedIntent.section} section...`;
            
            // Navigate to the specific field
            const deeplinkKey = `${parsedIntent.section}.${parsedIntent.field.toLowerCase().replace(/\s+/g, '')}`;
            navigateToDeeplink(caseId, deeplinkKey);
          }
          break;
          
        case 'open_section':
          if (parsedIntent.section) {
            responseText = `Opening ${parsedIntent.section} section...`;
            navigateToDeeplink(caseId, parsedIntent.section);
          }
          break;
          
        case 'get_value':
          // Try to find a matching field
          const matchingField = Object.keys(applicationData).find(field => 
            field.toLowerCase().includes(userQuery.toLowerCase()) ||
            userQuery.toLowerCase().includes(field.toLowerCase())
          );
          
          if (matchingField) {
            const value = getFieldValue(matchingField);
            responseText = `The ${matchingField} is: ${value}`;
          } else {
            responseText = `I couldn't find information about "${userQuery}". Try asking about specific fields like "insured email" or "case setup".`;
          }
          break;
      }
    } catch (error) {
      responseText = 'Sorry, I encountered an error processing your request.';
      console.error('AI Assist error:', error);
    }
    
    setResponse(responseText);
    setIsProcessing(false);
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          handleQuery(transcript);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.start();
      } else {
        alert('Speech recognition is not supported in this browser.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleQuery(query.trim());
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Query Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about insured details, navigate to sections..."
              className="flex-1"
              disabled={isProcessing}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              disabled={isProcessing}
              className={isListening ? 'bg-red-100 border-red-300' : ''}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button type="submit" disabled={!query.trim() || isProcessing}>
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Response */}
          {response && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-blue-900">{response}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuery("Show insured email")}
                className="text-left justify-start"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Insured Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuery("Show insured address")}
                className="text-left justify-start"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Insured Address
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuery("Open case setup")}
                className="text-left justify-start"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Case Setup
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuery("Show beneficiary info")}
                className="text-left justify-start"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Beneficiary
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">Try asking:</p>
            <ul className="space-y-1">
              <li>• "What's the insured email?"</li>
              <li>• "Show me the case setup"</li>
              <li>• "Navigate to beneficiary section"</li>
              <li>• "What's the insured address?"</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
