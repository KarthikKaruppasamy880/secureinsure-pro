import React, { useState } from 'react';
import { Button } from '../ui/button';

interface AIAssistPanelProps {
  caseId: string;
  applicationData: Record<string, any>;
}

export function AIAssistPanel({ caseId, applicationData }: AIAssistPanelProps) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    if (!message.trim()) return;
    
    try {
      // Mock AI response for now
      setResponse(`AI Assistant: I can help you with case ${caseId}. You asked: "${message}". This is a placeholder response.`);
    } catch (error) {
      setResponse('Error: Unable to process your request.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Ask questions about this application or get assistance with underwriting decisions.
      </div>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about this application..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} size="sm">
          Send
        </Button>
      </div>
      
      {response && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="text-sm text-gray-700">{response}</div>
        </div>
      )}
    </div>
  );
}