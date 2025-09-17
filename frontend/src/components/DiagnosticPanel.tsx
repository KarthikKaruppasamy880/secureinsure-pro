import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function DiagnosticPanel() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  const [casesData, setCasesData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Test health endpoint
        const health = await api.get('/health');
        setBackendStatus(`✅ Backend: ${health.status}`);
        
        // Test cases endpoint
        const cases = await api.get('/api/v1/cases');
        setCasesData(cases.data);
        console.log('Cases response:', cases.data);
      } catch (err: any) {
        setError(`❌ Error: ${err.message}`);
        setBackendStatus('❌ Backend: Error');
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold mb-2">🔧 Diagnostic Panel</h3>
      
      <div className="text-sm space-y-1">
        <div>{backendStatus}</div>
        
        {error && <div className="text-red-600">{error}</div>}
        
        {casesData && (
          <div>
            <div>📊 Cases Response Type: {Array.isArray(casesData) ? 'Array' : 'Object'}</div>
            {Array.isArray(casesData) ? (
              <div>📋 Cases Count: {casesData.length}</div>
            ) : (
              <div>
                <div>📋 Has data property: {casesData.data ? 'Yes' : 'No'}</div>
                {casesData.data && <div>📋 Data Count: {Array.isArray(casesData.data) ? casesData.data.length : 'Not array'}</div>}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-2 pt-2 border-t">
          <div>🌐 Current URL: {window.location.pathname}</div>
          <div>⚛️ React Router: {window.location.hash || 'Browser mode'}</div>
        </div>
      </div>
    </div>
  );
}


