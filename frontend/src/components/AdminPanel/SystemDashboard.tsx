import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Server,
  Cpu,
  HardDrive,
  Network,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  services: {
    total: number;
    running: number;
    stopped: number;
    failed: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    online: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SystemDashboardProps {
  onRefresh?: () => void;
}

const SystemDashboard: React.FC<SystemDashboardProps> = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch system metrics
  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async (): Promise<SystemMetrics> => {
      const response = await api.get('/api/admin/metrics');
      const data = response.data;
      return data as SystemMetrics;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch system alerts
  const { data: alerts } = useQuery({
    queryKey: ['system-alerts'],
    queryFn: async (): Promise<SystemAlert[]> => {
      const response = await api.get('/api/admin/alerts');
      const data = response.data;
      return data as SystemAlert[];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
    onRefresh?.();
  };

  const getAlertIcon = (type: string) => {
    const iconMap = {
      error: <AlertCircle className="h-4 w-4 text-red-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      info: <Info className="h-4 w-4 text-blue-600" />,
      success: <CheckCircle className="h-4 w-4 text-green-600" />
    };
    return iconMap[type as keyof typeof iconMap] || <Info className="h-4 w-4" />;
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      critical: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      high: { variant: 'destructive', className: 'bg-orange-100 text-orange-800' },
      medium: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      low: { variant: 'outline', className: 'bg-green-100 text-green-800' }
    };

    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low;
    
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load system metrics</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor system performance and health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {format(lastRefresh, 'HH:mm:ss')}
          </span>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cpu.usage.toFixed(1)}%</div>
            <Progress value={metrics?.cpu.usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.cpu.cores} cores • {metrics?.cpu.temperature}°C
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.memory.usage.toFixed(1)}%</div>
            <Progress value={metrics?.memory.usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(metrics?.memory.used || 0)} / {formatBytes(metrics?.memory.total || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.disk.usage.toFixed(1)}%</div>
            <Progress value={metrics?.disk.usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(metrics?.disk.used || 0)} / {formatBytes(metrics?.disk.total || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUptime(metrics?.performance.uptime || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Response: {metrics?.performance.responseTime}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Users</span>
                    <span className="font-semibold">{metrics?.users.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Users</span>
                    <span className="font-semibold text-green-600">{metrics?.users.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Online Now</span>
                    <span className="font-semibold text-blue-600">{metrics?.users.online}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Bytes In</span>
                    <span className="font-semibold">{formatBytes(metrics?.network.bytesIn || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bytes Out</span>
                    <span className="font-semibold">{formatBytes(metrics?.network.bytesOut || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Packets In</span>
                    <span className="font-semibold">{metrics?.network.packetsIn?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Packets Out</span>
                    <span className="font-semibold">{metrics?.network.packetsOut?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics?.performance.responseTime}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics?.performance.throughput}/s
                  </div>
                  <div className="text-sm text-muted-foreground">Throughput</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {metrics?.performance.errorRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Service Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics?.services.running}
                  </div>
                  <div className="text-sm text-muted-foreground">Running</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {metrics?.services.stopped}
                  </div>
                  <div className="text-sm text-muted-foreground">Stopped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {metrics?.services.failed}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {metrics?.services.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{alert.title}</span>
                          {getSeverityBadge(alert.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">No active alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemDashboard; 