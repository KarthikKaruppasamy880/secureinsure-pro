import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Fingerprint,
  Eye,
  Mic,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Lock,
  Unlock,
  Settings,
  Play,
  Stop,
  RefreshCw
} from 'lucide-react';
import { biometricService, BiometricStatus } from '../../services/biometricService';
import { toast } from 'sonner';

const BiometricDemo: React.FC = () => {
  const [biometricStatus, setBiometricStatus] = useState<Record<string, BiometricStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testingMethod, setTestingMethod] = useState<string | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  useEffect(() => {
    loadBiometricStatus();
  }, []);

  const loadBiometricStatus = async () => {
    try {
      setIsLoading(true);
      const status = await biometricService.checkAvailability();
      setBiometricStatus(status);
    } catch (error) {
      console.error('Error loading biometric status:', error);
      toast.error('Failed to load biometric status');
    } finally {
      setIsLoading(false);
    }
  };

  const testBiometricMethod = async (method: string) => {
    if (testingMethod) return; // Prevent multiple tests

    setTestingMethod(method);
    setTestProgress(0);
    setTestResults(prev => ({ ...prev, [method]: null }));

    try {
      // Simulate test progress
      const progressInterval = setInterval(() => {
        setTestProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Perform authentication test
      const result = await biometricService.authenticateUser(method);
      
      clearInterval(progressInterval);
      setTestProgress(100);

      setTestResults(prev => ({
        ...prev,
        [method]: result
      }));

      if (result.success) {
        toast.success(`${method.charAt(0).toUpperCase() + method.slice(1)} test successful!`);
      } else {
        toast.error(`${method.charAt(0).toUpperCase() + method.slice(1)} test failed: ${result.error}`);
      }

    } catch (error) {
      console.error(`Error testing ${method}:`, error);
      toast.error(`Failed to test ${method}`);
      setTestResults(prev => ({
        ...prev,
        [method]: { success: false, error: error instanceof Error ? error.message : 'Test failed' }
      }));
    } finally {
      setTimeout(() => {
        setTestingMethod(null);
        setTestProgress(0);
      }, 2000);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return <Fingerprint className="w-6 h-6" />;
      case 'face':
        return <Eye className="w-6 h-6" />;
      case 'voice':
        return <Mic className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getMethodTitle = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return 'Fingerprint';
      case 'face':
        return 'Face Recognition';
      case 'voice':
        return 'Voice Recognition';
      default:
        return 'Biometric';
    }
  };

  const getStatusColor = (status: BiometricStatus) => {
    if (status.isAvailable) return 'bg-green-100 text-green-800';
    if (status.isSupported) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: BiometricStatus) => {
    if (status.isAvailable) return 'Active';
    if (status.isSupported) return 'Available';
    return 'Not Supported';
  };

  const getStatusIcon = (status: BiometricStatus) => {
    if (status.isAvailable) return <CheckCircle className="w-4 h-4" />;
    if (status.isSupported) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const renderMethodCard = (method: string, status: BiometricStatus) => {
    const isTesting = testingMethod === method;
    const testResult = testResults[method];

    return (
      <Card key={method} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${
                status.isAvailable ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
              }`}>
                {getMethodIcon(method)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {getMethodTitle(method)}
                </h3>
                <p className="text-sm text-gray-600">
                  {status.isAvailable ? 'Ready for authentication' : 'Not available'}
                </p>
              </div>
            </div>
            
            <Badge className={getStatusColor(status)}>
              {getStatusIcon(status)}
              <span className="ml-1">{getStatusText(status)}</span>
            </Badge>
          </div>

          {status.isAvailable && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Confidence Level</span>
                <span className="font-medium">
                  {Math.round((status.confidence || 0) * 100)}%
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => testBiometricMethod(method)}
                  disabled={isTesting}
                  className="flex-1"
                  variant="outline"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Test
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/profile#biometric'}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>

              {isTesting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Test Progress</span>
                    <span>{testProgress}%</span>
                  </div>
                  <Progress value={testProgress} className="h-2" />
                </div>
              )}

              {testResult && !isTesting && (
                <div className={`p-3 rounded-lg ${
                  testResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.success ? 'Test Passed' : 'Test Failed'}
                    </span>
                  </div>
                  {testResult.error && (
                    <p className="text-xs text-red-600 mt-1">{testResult.error}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!status.isAvailable && status.isSupported && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-3">
                {getMethodTitle(method)} is supported but not enrolled
              </p>
              <Button
                onClick={() => window.location.href = '/profile#biometric'}
                className="w-full"
                variant="outline"
              >
                <Fingerprint className="w-4 h-4 mr-2" />
                Enroll Now
              </Button>
            </div>
          )}

          {!status.isSupported && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                {getMethodTitle(method)} is not supported on this device
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Biometric Authentication Demo</h2>
          <p className="text-gray-600">Test and manage your biometric authentication methods</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={loadBiometricStatus}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={() => window.location.href = '/profile#biometric'}
            variant="default"
          >
            <Settings className="w-4 h-4 mr-2" />
            Full Settings
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Methods</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(biometricStatus).filter(m => m.isAvailable).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Supported</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(biometricStatus).filter(m => m.isSupported).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Test</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(biometricStatus).filter(m => m.isAvailable).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Security Level</p>
                <p className="text-2xl font-bold text-gray-900">High</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Biometric Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(biometricStatus).map(([method, status]) =>
          renderMethodCard(method, status)
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.location.href = '/profile#biometric'}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Fingerprint className="w-6 h-6" />
              <span>Manage Biometrics</span>
            </Button>
            
            <Button
              onClick={() => window.location.href = '/profile#security'}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Shield className="w-6 h-6" />
              <span>Security Settings</span>
            </Button>
            
            <Button
              onClick={() => window.location.href = '/profile#preferences'}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Settings className="w-6 h-6" />
              <span>Preferences</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BiometricDemo;
