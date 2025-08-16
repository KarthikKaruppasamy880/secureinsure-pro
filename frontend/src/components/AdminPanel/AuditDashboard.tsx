import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAccessControl } from '../../hooks/useAccessControl';
import { auditService, type AuditLog, type RoleChangeAudit, type UnderwritingAudit } from '../../services/auditService';

import toast from 'react-hot-toast';

// Icons
import { 
  Filter, 
  Download, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  User,
  FileText
} from 'lucide-react';

const AuditDashboard: React.FC = () => {
  const accessControl = useAccessControl();

  const [activeTab, setActiveTab] = useState('access-logs');
  
  // States for different audit logs
  const [accessLogs, setAccessLogs] = useState<AuditLog[]>([]);
  const [roleChangeLogs, setRoleChangeLogs] = useState<RoleChangeAudit[]>([]);
  const [underwritingLogs, setUnderwritingLogs] = useState<UnderwritingAudit[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  
  // Pagination states
  const [totalElements, setTotalElements] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has admin access
  const canViewAuditLogs = accessControl.hasPermission('VIEW_AUDIT_LOGS');

  const loadMockData = useCallback(() => {
    // Load mock audit logs
    setAccessLogs(auditService.getMockAuditLogs());
    
    // Mock role change logs
    setRoleChangeLogs([
      {
        id: '1',
        adminUserId: 'admin1',
        adminUsername: 'admin.user',
        targetUserId: 'user1',
        targetUsername: 'john.doe',
        action: 'ASSIGN_ROLE',
        roleName: 'AGENT',
        newRoles: ['AGENT'],
        reason: 'New agent onboarding',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        adminUserId: 'admin1',
        adminUsername: 'admin.user',
        targetUserId: 'user2',
        targetUsername: 'jane.smith',
        action: 'REMOVE_ROLE',
        roleName: 'CASE_MANAGER',
        previousRoles: ['CASE_MANAGER'],
        reason: 'Role change request',
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Mock underwriting logs
    setUnderwritingLogs([
      {
        id: '1',
        underwriterId: 'underwriter1',
        underwriterUsername: 'sarah.wilson',
        action: 'ASSESS_RISK',
        caseId: 'CASE-001',
        details: 'Risk assessment completed for John Smith',
        riskScore: 75,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        underwriterId: 'underwriter2',
        underwriterUsername: 'mike.johnson',
        action: 'SET_PREMIUM_RATES',
        details: 'Premium rate updated for Term Life policy',
        premiumRate: 1.02,
        timestamp: new Date().toISOString()
      }
    ]);
    
    setTotalElements(accessLogs.length + roleChangeLogs.length + underwritingLogs.length);
  }, [accessLogs.length, roleChangeLogs.length, underwritingLogs.length]);

  useEffect(() => {
    if (canViewAuditLogs) {
      loadMockData();
    }
  }, [canViewAuditLogs, loadMockData]);

  const handleExportLogs = async () => {
    if (!accessControl.hasPermission('VIEW_AUDIT_LOGS')) {
      toast.error('You do not have permission to export audit logs');
      return;
    }

    setIsLoading(true);
    try {
      const filters = {
        startDate: getDateFromRange(dateRange),
        endDate: new Date().toISOString(),
        resourceType: resourceTypeFilter !== 'all' ? resourceTypeFilter : undefined,
        accessGranted: statusFilter !== 'all' ? statusFilter === 'granted' : undefined
      };

      const blob = await auditService.exportAuditLogs(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Failed to export audit logs');
      console.error('Error exporting audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateFromRange = (range: string): string => {
    const now = new Date();
    switch (range) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const getStatusIcon = (accessGranted: boolean) => {
    if (accessGranted) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusBadge = (accessGranted: boolean) => {
    return (
      <Badge variant={accessGranted ? 'default' : 'destructive'}>
        {accessGranted ? 'Granted' : 'Denied'}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const actionConfig: Record<string, { color: string; label: string }> = {
      'ACCESS_ATTEMPT': { color: 'bg-blue-100 text-blue-800', label: 'Access' },
      'API_ACCESS': { color: 'bg-green-100 text-green-800', label: 'API' },
      'API_ACCESS_DENIED': { color: 'bg-red-100 text-red-800', label: 'API Denied' },
      'API_ERROR': { color: 'bg-orange-100 text-orange-800', label: 'API Error' },
      'ASSIGN_ROLE': { color: 'bg-purple-100 text-purple-800', label: 'Role Assign' },
      'REMOVE_ROLE': { color: 'bg-red-100 text-red-800', label: 'Role Remove' },
      'ASSESS_RISK': { color: 'bg-yellow-100 text-yellow-800', label: 'Risk Assess' },
      'SET_PREMIUM_RATES': { color: 'bg-green-100 text-green-800', label: 'Premium Rate' }
    };

    const config = actionConfig[action] || { color: 'bg-gray-100 text-gray-800', label: action };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getResourceTypeIcon = (resourceType: string) => {
    const iconConfig: Record<string, React.ReactNode> = {
      'route': <FileText className="w-4 h-4" />,
      'component': <Eye className="w-4 h-4" />,
      'api': <FileText className="w-4 h-4" />,
      'feature': <Shield className="w-4 h-4" />
    };

    return iconConfig[resourceType] || <FileText className="w-4 h-4" />;
  };

  // Access control check
  if (!canViewAuditLogs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You do not have permission to view audit logs.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Required permission: VIEW_AUDIT_LOGS
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const filteredAccessLogs = accessLogs.filter(log => {
    const matchesSearch = 
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'granted' && log.accessGranted) ||
      (statusFilter === 'denied' && !log.accessGranted);
    
    const matchesResourceType = resourceTypeFilter === 'all' || log.resourceType === resourceTypeFilter;
    
    return matchesSearch && matchesStatus && matchesResourceType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Audit Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor system access, role changes, and underwriting actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {accessControl.getUserRoleInfo().displayName}
          </Badge>
          <Button
            onClick={handleExportLogs}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="granted">Granted</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Type
              </label>
              <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="route">Routes</SelectItem>
                  <SelectItem value="component">Components</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="feature">Features</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="access-logs">Access Logs</TabsTrigger>
          <TabsTrigger value="role-changes">Role Changes</TabsTrigger>
          <TabsTrigger value="underwriting">Underwriting</TabsTrigger>
        </TabsList>

        {/* Access Logs Tab */}
        <TabsContent value="access-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Logs</CardTitle>
              <CardDescription>
                System access attempts and API calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAccessLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.accessGranted)}
                        <div>
                          <p className="font-medium">{log.username}</p>
                          <p className="text-sm text-gray-500">
                            {log.userRoles.join(', ')} • {log.ipAddress}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(log.accessGranted)}
                        {getActionBadge(log.action)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getResourceTypeIcon(log.resourceType)}
                        <span className="text-sm font-mono">{log.resource}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    {log.reason && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-600">
                        <strong>Reason:</strong> {log.reason}
                      </div>
                    )}
                  </div>
                ))}
                
                {filteredAccessLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No access logs found matching the current filters.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Changes Tab */}
        <TabsContent value="role-changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Changes</CardTitle>
              <CardDescription>
                User role assignments and removals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roleChangeLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          {log.adminUsername} → {log.targetUsername}
                        </p>
                        <p className="text-sm text-gray-500">
                          {log.action.replace('_', ' ')} • {log.roleName}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>Admin:</strong> {log.adminUsername}</p>
                      <p><strong>Target:</strong> {log.targetUsername}</p>
                      {log.previousRoles && (
                        <p><strong>Previous:</strong> {log.previousRoles.join(', ')}</p>
                      )}
                      {log.newRoles && (
                        <p><strong>New:</strong> {log.newRoles.join(', ')}</p>
                      )}
                    </div>
                    
                    {log.reason && (
                      <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                        <strong>Reason:</strong> {log.reason}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500 mt-2">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Underwriting Tab */}
        <TabsContent value="underwriting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Underwriting Actions</CardTitle>
              <CardDescription>
                Risk assessments, premium rate changes, and rule overrides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {underwritingLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{log.underwriterUsername}</p>
                        <p className="text-sm text-gray-500">
                          {log.action.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>Details:</strong> {log.details}</p>
                      {log.caseId && <p><strong>Case:</strong> {log.caseId}</p>}
                      {log.policyId && <p><strong>Policy:</strong> {log.policyId}</p>}
                      {log.riskScore && <p><strong>Risk Score:</strong> {log.riskScore}</p>}
                      {log.premiumRate && <p><strong>Premium Rate:</strong> {log.premiumRate}%</p>}
                      {log.overrideReason && <p><strong>Override Reason:</strong> {log.overrideReason}</p>}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElements}</div>
            <p className="text-xs text-muted-foreground">
              All audit entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Denied</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accessLogs.filter(log => !log.accessGranted).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unauthorized attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role Changes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleChangeLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              User role updates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Underwriting Actions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underwritingLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Risk assessments & rates
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditDashboard; 