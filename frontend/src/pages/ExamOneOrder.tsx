import { useState } from 'react';
import { Button } from '../components/ui/button';
import { useSearchParams } from 'react-router-dom';

export default function ExamOneOrder() {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('case') || '';
  const [orderStatus, setOrderStatus] = useState<'idle' | 'ordering' | 'ordered' | 'error'>('idle');
  const [requestId, setRequestId] = useState<string>('');

  const handleOrder = async () => {
    setOrderStatus('ordering');
    try {
      const response = await fetch('/api/examone/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseNumber: caseId })
      });
      const result = await response.json();
      setRequestId(result.requestId);
      setOrderStatus('ordered');
    } catch (error) {
      setOrderStatus('error');
    }
  };

  const viewResults = () => {
    window.open(`/examone/result?requestId=${requestId}`, '_blank', 'width=1200,height=800');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ExamOne Lab Order</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Case Information</h2>
          <p>Case ID: {caseId}</p>
        </div>

        {orderStatus === 'idle' && (
          <div className="text-center">
            <Button onClick={handleOrder} size="lg">
              Order Lab Tests
            </Button>
          </div>
        )}

        {orderStatus === 'ordering' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Placing order...</p>
          </div>
        )}

        {orderStatus === 'ordered' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Order Placed Successfully</h3>
              <p className="text-green-700">Request ID: {requestId}</p>
            </div>
            <div className="text-center">
              <Button onClick={viewResults} size="lg">
                View Results
              </Button>
            </div>
          </div>
        )}

        {orderStatus === 'error' && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800">Order Failed</h3>
            <p className="text-red-700">Please try again or contact support.</p>
            <Button onClick={() => setOrderStatus('idle')} className="mt-2">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
