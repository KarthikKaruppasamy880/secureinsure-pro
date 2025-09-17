import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { FileText, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface LabPiQPopupProps {
  caseId: string;
  insuredInfo?: any;
  policyInfo?: any;
  onOrderComplete?: (orderId: string) => void;
}

interface LabPiQOrder {
  orderId: string;
  caseId: string;
  status: string;
  submittedAt: string;
  insuredInfo: any;
  policyInfo: any;
  acordXml: string;
}

interface LabPiQResults {
  caseId: string;
  orderId: string;
  status: string;
  completedAt: string;
  summary: {
    overallScore: number;
    riskLevel: string;
    recommendations: string[];
  };
  observations: Array<{
    category: string;
    score: number;
    details: string;
  }>;
  scores: {
    medical: number;
    lifestyle: number;
    financial: number;
    overall: number;
  };
  flags: any[];
  rawData: {
    xmlResponse: string;
    jsonData: any;
  };
}

export const LabPiQPopup: React.FC<LabPiQPopupProps> = ({
  caseId,
  insuredInfo = {},
  policyInfo = {},
  onOrderComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [order, setOrder] = useState<LabPiQOrder | null>(null);
  const [results, setResults] = useState<LabPiQResults | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const handleOrderLabPiQ = async () => {
    try {
      setIsOrdering(true);
      
      const response = await api.post('/api/v1/vendor/examone/labpiq/order', {
        caseId,
        insuredInfo,
        policyInfo
      });

      if (response.data.success) {
        setOrder(response.data.data);
        toast.success('Lab PiQ order submitted successfully');
        onOrderComplete?.(response.data.data.orderId);
        
        // Auto-fetch results after a short delay
        setTimeout(() => {
          fetchResults();
        }, 2000);
      }
    } catch (error) {
      console.error('Error ordering Lab PiQ:', error);
      toast.error('Failed to submit Lab PiQ order');
    } finally {
      setIsOrdering(false);
    }
  };

  const fetchResults = async () => {
    try {
      setIsLoadingResults(true);
      
      const response = await api.get(`/api/v1/vendor/examone/labpiq/results?caseId=${caseId}`);
      
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching Lab PiQ results:', error);
      toast.error('Failed to fetch Lab PiQ results');
    } finally {
      setIsLoadingResults(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'submitted':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Order Lab PiQ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ExamOne Lab PiQ Order & Results</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="order" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="order">Order Details</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lab PiQ Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Case ID</label>
                    <p className="text-sm text-gray-600">{caseId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Insured Name</label>
                    <p className="text-sm text-gray-600">{insuredInfo.name || 'N/A'}</p>
                  </div>
                </div>

                {!order ? (
                  <Button 
                    onClick={handleOrderLabPiQ} 
                    disabled={isOrdering}
                    className="w-full"
                  >
                    {isOrdering ? 'Submitting Order...' : 'Submit Lab PiQ Order'}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium">Order Status: {order.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Order ID: {order.orderId}</p>
                      <p>Submitted: {new Date(order.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {!results ? (
              <Card>
                <CardContent className="p-6 text-center">
                  {isLoadingResults ? (
                    <div className="space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p>Loading results...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600">No results available yet</p>
                      <Button onClick={fetchResults} variant="outline">
                        Refresh Results
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Overall Score</p>
                        <p className="text-2xl font-bold">{results.summary.overallScore}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Risk Level</p>
                        <Badge className={getRiskLevelColor(results.summary.riskLevel)}>
                          {results.summary.riskLevel}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(results.status)}
                          <span className="text-sm">{results.status}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scores Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Scores Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(results.scores).map(([category, score]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{category}</span>
                          <span>{score}</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Observations Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Observations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.observations.map((obs, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{obs.category}</h4>
                            <Badge variant="outline">{obs.score}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{obs.details}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.summary.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Raw Data Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Raw Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="json" className="w-full">
                      <TabsList>
                        <TabsTrigger value="json">JSON</TabsTrigger>
                        <TabsTrigger value="xml">XML</TabsTrigger>
                      </TabsList>
                      <TabsContent value="json">
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(results.rawData.jsonData, null, 2)}
                        </pre>
                      </TabsContent>
                      <TabsContent value="xml">
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40">
                          {results.rawData.xmlResponse}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LabPiQPopup;
