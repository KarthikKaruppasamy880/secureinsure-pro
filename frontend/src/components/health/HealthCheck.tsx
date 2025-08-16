import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HealthStatus {
  status: 'UP' | 'DOWN' | 'CHECKING';
  timestamp: string;
  service: string;
  version: string;
  uptime?: number;
  memory?: any;
  checks?: any;
  build?: any;
}

interface HealthCheckProps {
  className?: string;
}

const HealthCheck: React.FC<HealthCheckProps> = ({ className }) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [readyStatus, setReadyStatus] = useState<HealthStatus | null>(null);
  const [versionStatus, setVersionStatus] = useState<HealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      // Check health endpoint
      const healthResponse = await fetch('http://localhost:8080/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealthStatus(healthData);
      } else {
        const errorStatus: HealthStatus = { 
          status: 'DOWN', 
          timestamp: new Date().toISOString(), 
          service: 'gateway-service', 
          version: 'unknown' 
        };
        setHealthStatus(errorStatus);
      }

      // Check ready endpoint
      const readyResponse = await fetch('http://localhost:8080/ready');
      if (readyResponse.ok) {
        const readyData = await readyResponse.json();
        setReadyStatus(readyData);
      } else {
        const errorStatus: HealthStatus = { 
          status: 'DOWN', 
          timestamp: new Date().toISOString(), 
          service: 'gateway-service', 
          version: 'unknown' 
        };
        setReadyStatus(errorStatus);
      }

      // Check version endpoint
      const versionResponse = await fetch('http://localhost:8080/version');
      if (versionResponse.ok) {
        const versionData = await versionResponse.json();
        setVersionStatus(versionData);
      } else {
        const errorStatus: HealthStatus = { 
          status: 'DOWN', 
          timestamp: new Date().toISOString(), 
          service: 'gateway-service', 
          version: 'unknown' 
        };
        setVersionStatus(errorStatus);
      }

      toast.success('Health check completed');
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Health check failed');
      
      // Set all statuses to DOWN on error
      const errorStatus: HealthStatus = { 
        status: 'DOWN', 
        timestamp: new Date().toISOString(), 
        service: 'gateway-service', 
        version: 'unknown' 
      };
      setHealthStatus(errorStatus);
      setReadyStatus(errorStatus);
      setVersionStatus(errorStatus);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'DOWN':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UP':
        return <Badge variant="default" className="bg-green-100 text-green-800">UP</Badge>;
      case 'DOWN':
        return <Badge variant="destructive">DOWN</Badge>;
      default:
        return <Badge variant="secondary">CHECKING</Badge>;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Backend Health Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Service Status</span>
            <Button 
              onClick={checkHealth} 
              disabled={isChecking}
              size="sm"
              variant="outline"
            >
              {isChecking ? 'Checking...' : 'Refresh'}
            </Button>
          </div>

          {/* Health Endpoint */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">/health</span>
              {healthStatus && getStatusBadge(healthStatus.status)}
            </div>
            {healthStatus && (
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(healthStatus.status)}
                  <span>Service: {healthStatus.service}</span>
                </div>
                <div>Version: {healthStatus.version}</div>
                <div>Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}</div>
                {healthStatus.uptime && <div>Uptime: {Math.round(healthStatus.uptime / 1000)}s</div>}
              </div>
            )}
          </div>

          {/* Ready Endpoint */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">/ready</span>
              {readyStatus && getStatusBadge(readyStatus.status)}
            </div>
            {readyStatus && (
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(readyStatus.status)}
                  <span>Service: {readyStatus.service}</span>
                </div>
                <div>Version: {readyStatus.version}</div>
                <div>Timestamp: {new Date(readyStatus.timestamp).toLocaleString()}</div>
                {readyStatus.checks && (
                  <div className="mt-2">
                    <div className="font-medium">Readiness Checks:</div>
                    {Object.entries(readyStatus.checks).map(([key, value]) => (
                      <div key={key} className="text-xs ml-2">
                        {key}: {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Version Endpoint */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">/version</span>
              {versionStatus && getStatusBadge(versionStatus.status)}
            </div>
            {versionStatus && (
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(versionStatus.status)}
                  <span>Service: {versionStatus.service}</span>
                </div>
                <div>Version: {versionStatus.version}</div>
                <div>Timestamp: {new Date(versionStatus.timestamp).toLocaleString()}</div>
                {versionStatus.build && (
                  <div className="mt-2">
                    <div className="font-medium">Build Info:</div>
                    <div className="text-xs ml-2">Node: {versionStatus.build.nodeVersion}</div>
                    <div className="text-xs ml-2">Platform: {versionStatus.build.platform}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 text-center">
            Backend URL: http://localhost:8080
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthCheck;
