import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import PolicyList from '@/components/PolicyManagement/PolicyList';

interface PolicyStats {
  total: number;
  active: number;
  pending: number;
  expired: number;
  cancelled: number;
  totalPremium: number;
  averagePremium: number;
  topTypes: Array<{ type: string; count: number }>;
  recentActivity: Array<{ action: string; policy: string; timestamp: string }>;
}

const PolicyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

  // Mock data for demonstration
  const stats: PolicyStats = {
    total: 1247,
    active: 892,
    pending: 156,
    expired: 134,
    cancelled: 65,
    totalPremium: 2847500,
    averagePremium: 2285,
    topTypes: [
      { type: 'Auto', count: 456 },
      { type: 'Home', count: 234 },
      { type: 'Life', count: 189 },
      { type: 'Health', count: 156 },
      { type: 'Business', count: 212 }
    ],
    recentActivity: [
      { action: 'Created', policy: 'POL-2024-001', timestamp: '2 hours ago' },
      { action: 'Updated', policy: 'POL-2024-002', timestamp: '4 hours ago' },
      { action: 'Renewed', policy: 'POL-2024-003', timestamp: '6 hours ago' },
      { action: 'Cancelled', policy: 'POL-2024-004', timestamp: '1 day ago' }
    ]
  };

  const handleNewPolicy = () => {
    // Navigate to new policy form
    console.log('Navigate to new policy form');
  };

  const handlePolicySelect = (policy: any) => {
    setSelectedPolicy(policy);
    // Navigate to policy details
    console.log('Navigate to policy details:', policy);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Policy Management</h1>
          <p className="text-muted-foreground">
            Manage insurance policies, track performance, and handle customer requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleNewPolicy}>
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.active / stats.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Premium</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalPremium / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${stats.averagePremium.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Policy Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Policy Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.active}</span>
                      <Badge variant="outline" className={getStatusColor('active')}>
                        {((stats.active / stats.total) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.pending}</span>
                      <Badge variant="outline" className={getStatusColor('pending')}>
                        {((stats.pending / stats.total) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Expired</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.expired}</span>
                      <Badge variant="outline" className={getStatusColor('expired')}>
                        {((stats.expired / stats.total) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span>Cancelled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.cancelled}</span>
                      <Badge variant="outline" className={getStatusColor('cancelled')}>
                        {((stats.cancelled / stats.total) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Policy Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Policy Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>{type.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{type.count}</span>
                        <Badge variant="outline">
                          {((type.count / stats.total) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <PolicyList 
            onPolicySelect={handlePolicySelect}
            onNewPolicy={handleNewPolicy}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalPremium.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Premium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.averagePremium.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Premium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.topTypes.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Policy Types</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.policy}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PolicyManagement; 