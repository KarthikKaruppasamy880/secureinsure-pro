import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  Database
} from 'lucide-react';

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  const auditLogs = [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'admin@secureinsure.com',
      action: 'LOGIN',
      resource: 'Authentication',
      details: 'Successful login from 192.168.1.100',
      severity: 'info',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '2',
      timestamp: '2024-01-15T09:15:00Z',
      user: 'admin@secureinsure.com',
      action: 'CREATE_CASE',
      resource: 'Case Management',
      details: 'Created new case CS-2024-001 for Jane Doe',
      severity: 'info',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '3',
      timestamp: '2024-01-15T08:45:00Z',
      user: 'user@secureinsure.com',
      action: 'VIEW_POLICY',
      resource: 'Policy Management',
      details: 'Viewed policy details for POL-001-2024',
      severity: 'info',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
      id: '4',
      timestamp: '2024-01-15T08:30:00Z',
      user: 'admin@secureinsure.com',
      action: 'UPDATE_USER_ROLE',
      resource: 'User Management',
      details: 'Updated user role for user@secureinsure.com to UNDERWRITER',
      severity: 'warning',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '5',
      timestamp: '2024-01-15T08:00:00Z',
      user: 'system',
      action: 'BACKUP_COMPLETED',
      resource: 'System',
      details: 'Daily backup completed successfully',
      severity: 'success',
      ipAddress: '127.0.0.1',
      userAgent: 'System Process'
    },
    {
      id: '6',
      timestamp: '2024-01-15T07:30:00Z',
      user: 'unknown',
      action: 'FAILED_LOGIN',
      resource: 'Authentication',
      details: 'Failed login attempt for admin@secureinsure.com from 192.168.1.200',
      severity: 'error',
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Eye className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      'error': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      'warning': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      'success': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'info': { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800' }
    };

    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.info;

    return (
      <Badge variant={config.variant} className={config.className}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      'LOGIN': { className: 'bg-blue-100 text-blue-800' },
      'LOGOUT': { className: 'bg-gray-100 text-gray-800' },
      'CREATE_CASE': { className: 'bg-green-100 text-green-800' },
      'UPDATE_CASE': { className: 'bg-yellow-100 text-yellow-800' },
      'VIEW_POLICY': { className: 'bg-purple-100 text-purple-800' },
      'UPDATE_USER_ROLE': { className: 'bg-orange-100 text-orange-800' },
      'FAILED_LOGIN': { className: 'bg-red-100 text-red-800' },
      'BACKUP_COMPLETED': { className: 'bg-indigo-100 text-indigo-800' }
    };

    const config = actionConfig[action as keyof typeof actionConfig] || { className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge variant="outline" className={config.className}>
        {action.replace('_', ' ')}
      </Badge>
    );
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || log.severity === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const auditStats = {
    totalLogs: auditLogs.length,
    errorLogs: auditLogs.filter(log => log.severity === 'error').length,
    warningLogs: auditLogs.filter(log => log.severity === 'warning').length,
    successLogs: auditLogs.filter(log => log.severity === 'success').length,
    uniqueUsers: new Set(auditLogs.map(log => log.user)).size,
    lastActivity: auditLogs[0]?.timestamp
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <Shield className="h-3 w-3 mr-1" />
            Audit Active
          </Badge>
        </div>
      </div>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{auditStats.errorLogs}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{auditStats.warningLogs}</div>
            <p className="text-xs text-muted-foreground">
              Monitor closely
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{auditStats.successLogs}</div>
            <p className="text-xs text-muted-foreground">
              Normal operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Unique users today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Audit Log Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="filter">Severity Filter</Label>
              <select
                id="filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings Only</option>
                <option value="success">Success Only</option>
                <option value="info">Info Only</option>
              </select>
            </div>
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Audit Logs ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(log.severity)}
                    <span className="font-medium text-sm">{formatTimestamp(log.timestamp)}</span>
                    {getSeverityBadge(log.severity)}
                    {getActionBadge(log.action)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">User:</span> {log.user}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Resource:</span> {log.resource}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">IP Address:</span> {log.ipAddress}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">User Agent:</span> {log.userAgent.substring(0, 50)}...
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="font-medium text-gray-600">Details:</span>
                  <p className="text-sm text-gray-700 mt-1">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
