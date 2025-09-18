import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Download, FileText, Calendar, Clock } from 'lucide-react';

interface ExamOneResult {
  testName: string;
  status: string;
  collectedAt: string;
  completedAt: string;
  highlights: string[];
  notes: string;
  physician: string;
  labLocation: string;
}

interface ExamOneData {
  success: boolean;
  caseId: string;
  results: ExamOneResult[];
  lastUpdated: string;
}

export default function ExamOneResultsScreen() {
  const { caseId } = useParams<{ caseId: string }>();
  const [data, setData] = useState<ExamOneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/v1/examone/results?caseId=${caseId}`);
        setData(response.data);
      } catch (err: any) {
        console.error('Failed to load ExamOne results:', err);
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
    fetchResults();
    }
  }, [caseId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Link to={`/cases/${caseId}`} className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">ExamOne Results</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading lab results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Link to={`/cases/${caseId}`} className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">ExamOne Results</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 text-red-800">
            <FileText className="h-5 w-5" />
            <h3 className="font-medium">Error Loading Results</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Link to={`/cases/${caseId}`} className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">ExamOne Results</h1>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
          <p className="text-gray-600">Lab results have not been received yet.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'FAILED': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Link to={`/cases/${caseId}`} className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div>
            <h1 className="text-2xl font-bold">ExamOne Lab Results</h1>
            <p className="text-gray-600">Case: {data.caseId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mb-6 text-sm text-gray-600 flex items-center space-x-2">
        <Clock className="h-4 w-4" />
        <span>Last updated: {formatDate(data.lastUpdated)}</span>
          </div>
          
      {/* Results */}
      <div className="space-y-6" data-testid="examone-table">
        {data.results.map((result, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{result.testName}</CardTitle>
                {getStatusBadge(result.status)}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Collected: {formatDate(result.collectedAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Completed: {formatDate(result.completedAt)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Highlights */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Key Findings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.highlights.map((highlight, highlightIndex) => (
                    <div 
                      key={highlightIndex}
                      className="bg-green-50 border border-green-200 rounded-lg p-3"
                    >
                      <span className="text-green-800 text-sm font-medium">{highlight}</span>
                    </div>
                  ))}
          </div>
        </div>

              {/* Notes */}
              {result.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Medical Notes</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-700 text-sm">{result.notes}</p>
                  </div>
        </div>
      )}

              {/* Provider Info */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Physician:</span>
                    <span className="ml-2 text-gray-700">{result.physician}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Lab Location:</span>
                    <span className="ml-2 text-gray-700">{result.labLocation}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <Button onClick={() => window.print()} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Print Results
        </Button>
        <Link to={`/cases/${caseId}`}>
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Case
          </Button>
        </Link>
      </div>
    </div>
  );
}