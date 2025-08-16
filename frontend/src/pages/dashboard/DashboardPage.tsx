import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import HealthCheck from '../../components/health/HealthCheck';

interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  pendingClaims: number;
  totalRevenue: number;
  recentActivities: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

interface CaseData {
  id: string;
  caseId: string;
  insuredName: string;
  productType: string;
  status: string;
  faceAmount: number;
  premium: number;
  agent: string;
  createdAt: string;
  lastUpdated: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const DashboardPage: React.FC = () => {
  const { state } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPolicies: 0,
    activePolicies: 0,
    pendingClaims: 0,
    totalRevenue: 0,
    recentActivities: [],
  });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock case data - in real app this would come from API
  const [cases, setCases] = useState<CaseData[]>([
    {
      id: '1',
      caseId: 'CS-2024-001',
      insuredName: 'Jane Doe',
      productType: 'IUL',
      status: 'Under Review',
      faceAmount: 500000,
      premium: 150.00,
      agent: 'John Smith',
      createdAt: '2024-01-15T10:30:00Z',
      lastUpdated: '2024-01-15T14:20:00Z',
      priority: 'high'
    },
    {
      id: '2',
      caseId: 'CS-2024-002',
      insuredName: 'Michael Johnson',
      productType: 'Term Life',
      status: 'Pending Documents',
      faceAmount: 250000,
      premium: 75.00,
      agent: 'Sarah Wilson',
      createdAt: '2024-01-14T09:15:00Z',
      lastUpdated: '2024-01-15T11:45:00Z',
      priority: 'medium'
    },
    {
      id: '3',
      caseId: 'CS-2024-003',
      insuredName: 'Emily Davis',
      productType: 'Whole Life',
      status: 'Approved',
      faceAmount: 100000,
      premium: 45.00,
      agent: 'Robert Brown',
      createdAt: '2024-01-13T16:20:00Z',
      lastUpdated: '2024-01-15T08:30:00Z',
      priority: 'low'
    },
    {
      id: '4',
      caseId: 'CS-2024-004',
      insuredName: 'David Wilson',
      productType: 'IUL',
      status: 'Underwriting',
      faceAmount: 750000,
      premium: 225.00,
      agent: 'Lisa Anderson',
      createdAt: '2024-01-12T11:00:00Z',
      lastUpdated: '2024-01-15T13:15:00Z',
      priority: 'urgent'
    }
  ]);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setStats({
          totalPolicies: 1247,
          activePolicies: 1189,
          pendingClaims: 23,
          totalRevenue: 2847500,
          recentActivities: [
            {
              id: '1',
              type: 'policy',
              message: 'New policy created for John Doe',
              timestamp: '2024-01-15T10:30:00Z',
            },
            {
              id: '2',
              type: 'claim',
              message: 'Claim #12345 submitted',
              timestamp: '2024-01-15T09:15:00Z',
            },
            {
              id: '3',
              type: 'payment',
              message: 'Payment received for Policy #67890',
              timestamp: '2024-01-15T08:45:00Z',
            },
          ],
        });
      }, 1000);
    };

    loadDashboardData();
  }, []);

  // Filter and sort cases
  const filteredAndSortedCases = cases
    .filter(caseItem => {
      const matchesSearch = caseItem.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           caseItem.insuredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           caseItem.agent.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || caseItem.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof CaseData];
      let bValue: any = b[sortBy as keyof CaseData];
      
      if (sortBy === 'createdAt' || sortBy === 'lastUpdated') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'policy':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'claim':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
      'Under Review': { variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      'Pending Documents': { variant: 'outline', color: 'bg-blue-100 text-blue-800' },
      'Approved': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'Underwriting': { variant: 'secondary', color: 'bg-purple-100 text-purple-800' },
      'Rejected': { variant: 'destructive', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || { variant: 'outline', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { color: string; text: string }> = {
      'low': { color: 'bg-gray-100 text-gray-800', text: 'Low' },
      'medium': { color: 'bg-blue-100 text-blue-800', text: 'Medium' },
      'high': { color: 'bg-orange-100 text-orange-800', text: 'High' },
      'urgent': { color: 'bg-red-100 text-red-800', text: 'Urgent' }
    };
    
    const config = priorityConfig[priority] || { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const handleCaseAction = (action: string, caseId: string) => {
    switch (action) {
      case 'view':
        navigate(`/application/${caseId}`);
        break;
      case 'edit':
        navigate(`/application/${caseId}?edit=true`);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this case?')) {
          setCases(prev => prev.filter(c => c.id !== caseId));
        }
        break;
      default:
        break;
    }
  };

  const handleCreateCase = () => {
    navigate('/application');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {state.user?.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's what's happening with your insurance portfolio today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* PHASE 0: Health Check Component */}
      <HealthCheck />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Policies
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalPolicies.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Policies
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.activePolicies.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pending Claims
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.pendingClaims}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Cases</CardTitle>
            <Button onClick={handleCreateCase} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Create Case
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cases, insured names, or agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="Under Review">Under Review</option>
                <option value="Pending Documents">Pending Documents</option>
                <option value="Approved">Approved</option>
                <option value="Underwriting">Underwriting</option>
                <option value="Rejected">Rejected</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="lastUpdated-desc">Recently Updated</option>
                <option value="faceAmount-desc">Highest Face Amount</option>
                <option value="priority-desc">Priority (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Cases Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Case ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Insured</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Face Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Premium</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Agent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCases.map((caseItem) => (
                  <tr key={caseItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-blue-600 cursor-pointer hover:underline"
                            onClick={() => handleCaseAction('view', caseItem.id)}>
                        {caseItem.caseId}
                      </span>
                    </td>
                    <td className="py-3 px-4">{caseItem.insuredName}</td>
                    <td className="py-3 px-4">{caseItem.productType}</td>
                    <td className="py-3 px-4">{getStatusBadge(caseItem.status)}</td>
                    <td className="py-3 px-4">{formatCurrency(caseItem.faceAmount)}</td>
                    <td className="py-3 px-4">{formatCurrency(caseItem.premium)}</td>
                    <td className="py-3 px-4">{caseItem.agent}</td>
                    <td className="py-3 px-4">{getPriorityBadge(caseItem.priority)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(caseItem.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCaseAction('view', caseItem.id)}>
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCaseAction('edit', caseItem.id)}>
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit Case
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCaseAction('delete', caseItem.id)}
                            className="text-red-600"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete Case
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedCases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No cases found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-center h-16 text-lg"
              onClick={handleCreateCase}
            >
              <DocumentTextIcon className="h-6 w-6 mr-3" />
              Create Policy
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center h-16 text-lg"
              onClick={() => navigate('/claims')}
            >
              <ExclamationTriangleIcon className="h-6 w-6 mr-3" />
              Submit Claim
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center h-16 text-lg"
              onClick={() => navigate('/parties')}
            >
              <UserGroupIcon className="h-6 w-6 mr-3" />
              Manage Parties
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage; 