import React, { useState, useEffect, useRef } from 'react';

interface VoiceAgentProps {
  wsUrl: string;
  jwtProvider: () => string | null;
  onIntent?: (intent: any) => void;
  className?: string;
}

export function VoiceAgent({ wsUrl, jwtProvider, onIntent, className }: VoiceAgentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [wsUrl]);

  const connectWebSocket = () => {
    try {
      const token = jwtProvider();
      if (!token) {
        setError('No JWT token available');
        return;
      }

      const ws = new WebSocket(`${wsUrl}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('[VoiceAgent] Connected to voice service');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleVoiceMessage(data);
        } catch (err) {
          console.error('[VoiceAgent] Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        setError('WebSocket connection error');
        console.error('[VoiceAgent] WebSocket error:', error);
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('[VoiceAgent] Disconnected from voice service');
      };
    } catch (err) {
      setError('Failed to connect to voice service');
      console.error('[VoiceAgent] Connection error:', err);
    }
  };

  const handleVoiceMessage = (data: any) => {
    switch (data.type) {
      case 'stt_partial':
        setTranscript(data.text);
        break;
      case 'nlu_intent':
        if (onIntent) {
          onIntent(data);
        }
        break;
      case 'tts_chunk':
        // Handle TTS audio playback
        if (data.audio_base64) {
          playAudio(data.audio_base64);
        }
        break;
      case 'error':
        setError(data.message);
        break;
    }
  };

  const playAudio = (audioBase64: string) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      audio.play();
    } catch (err) {
      console.error('[VoiceAgent] Audio playback error:', err);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert audio to base64 and send
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            wsRef.current?.send(JSON.stringify({
              type: 'audio_chunk',
              audio_base64: base64
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(100); // Send audio chunks every 100ms
      setIsListening(true);
    } catch (err) {
      setError('Microphone access denied');
      console.error('[VoiceAgent] Microphone error:', err);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsListening(false);
  };

  const sendCommand = (command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'voice_command',
        command: command
      }));
    }
  };

  return (
    <div className={`voice-agent ${className || ''}`}>
      <div className="voice-agent-panel">
        <div className="voice-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢' : '🔴'}
          </div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {error && (
          <div className="voice-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="voice-controls">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isConnected}
            className={`voice-button ${isListening ? 'listening' : ''}`}
          >
            {isListening ? '🛑 Stop' : '🎤 Start'}
          </button>
        </div>

        {transcript && (
          <div className="voice-transcript">
            <strong>Transcript:</strong> {transcript}
          </div>
        )}

        <div className="voice-commands">
          <button onClick={() => sendCommand('list my cases')} disabled={!isConnected}>
            List Cases
          </button>
          <button onClick={() => sendCommand('show dashboard')} disabled={!isConnected}>
            Show Dashboard
          </button>
        </div>
      </div>

      <style jsx>{`
        .voice-agent {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .voice-agent-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          min-width: 300px;
        }

        .voice-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .voice-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 8px;
          margin-bottom: 12px;
          color: #dc2626;
          font-size: 14px;
        }

        .voice-controls {
          margin-bottom: 12px;
        }

        .voice-button {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .voice-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .voice-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .voice-button.listening {
          background: #dc2626;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .voice-transcript {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .voice-commands {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .voice-commands button {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .voice-commands button:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .voice-commands button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default VoiceAgent;