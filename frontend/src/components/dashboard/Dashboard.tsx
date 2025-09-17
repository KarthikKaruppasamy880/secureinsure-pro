import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText, 
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Volume2,
  Mic,
  MicOff,
  X
} from 'lucide-react';
import { VoiceSearch } from '../voice/VoiceSearch';
import { toast } from 'react-hot-toast';

interface Case {
  id: string;
  caseNumber: string;
  insuredName: string;
  status: 'active' | 'pending' | 'approved' | 'rejected';
  policyType: string;
  coverageAmount: string;
  applicationDate: string;
  agent: string;
  zinniaCaseId: string;
}

interface DashboardFilters {
  status: string;
  agent: string;
  policyType: string;
  dateRange: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFilters>({
    status: '',
    agent: '',
    policyType: '',
    dateRange: ''
  });
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  // Mock data for cases
  const mockCases: Case[] = [
    {
      id: '1',
      caseNumber: 'APP-2024-001',
      insuredName: 'John Smith',
      status: 'active',
      policyType: 'Term Life',
      coverageAmount: '$500,000',
      applicationDate: '2024-01-15',
      agent: 'Sarah Johnson',
      zinniaCaseId: 'ZC-001-2024'
    },
    {
      id: '2',
      caseNumber: 'APP-2024-002',
      insuredName: 'Jane Doe',
      status: 'pending',
      policyType: 'Whole Life',
      coverageAmount: '$250,000',
      applicationDate: '2024-01-20',
      agent: 'Mike Wilson',
      zinniaCaseId: 'ZC-002-2024'
    },
    {
      id: '3',
      caseNumber: 'APP-2024-003',
      insuredName: 'Robert Johnson',
      status: 'approved',
      policyType: 'Universal Life',
      coverageAmount: '$1,000,000',
      applicationDate: '2024-01-18',
      agent: 'Sarah Johnson',
      zinniaCaseId: 'ZC-003-2024'
    }
  ];

  useEffect(() => {
    setCases(mockCases);
    setFilteredCases(mockCases);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dashboardFilters, cases]);

  const applyFilters = () => {
    let filtered = [...cases];

    if (dashboardFilters.status) {
      filtered = filtered.filter(c => c.status === dashboardFilters.status);
    }
    if (dashboardFilters.agent) {
      filtered = filtered.filter(c => c.agent === dashboardFilters.agent);
    }
    if (dashboardFilters.policyType) {
      filtered = filtered.filter(c => c.policyType === dashboardFilters.policyType);
    }

    setFilteredCases(filtered);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredCases(cases);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = cases.filter(case_ => 
      case_.caseNumber.toLowerCase().includes(query) ||
      case_.insuredName.toLowerCase().includes(query) ||
      case_.zinniaCaseId.toLowerCase().includes(query) ||
      case_.agent.toLowerCase().includes(query)
    );

    setFilteredCases(filtered);
    toast.success(`Found ${filtered.length} cases matching "${searchQuery}"`);
  };

  const handleFilterChange = (filterType: keyof DashboardFilters, value: string) => {
    setDashboardFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setDashboardFilters({
      status: '',
      agent: '',
      policyType: '',
      dateRange: ''
    });
    setSearchQuery('');
    setFilteredCases(cases);
    toast.success('All filters cleared');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Dashboard refreshed successfully');
    }, 1000);
  };

  // Voice Search Functions
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        setSearchQuery(transcript);
        handleVoiceSearch(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice recognition error. Please try again.');
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognition);
    }
  }, []);

  const toggleVoiceSearch = () => {
    if (!recognition) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setVoiceTranscript('');
    } else {
      recognition.start();
      setIsListening(true);
      setVoiceTranscript('');
      toast.success('Voice search activated. Speak now.');
    }
  };

  const handleVoiceSearch = (transcript: string) => {
    // Process voice commands for specific search patterns
    const lowerTranscript = transcript.toLowerCase();
    
    // Search by case number pattern
    if (lowerTranscript.includes('case') || lowerTranscript.includes('app')) {
      const caseMatch = transcript.match(/APP-\d{4}-\d{3}/i);
      if (caseMatch) {
        setSearchQuery(caseMatch[0]);
        handleSearch();
        return;
      }
    }
    
    // Search by insured name
    if (lowerTranscript.includes('name') || lowerTranscript.includes('insured')) {
      const nameMatch = transcript.match(/(?:name|insured)\s+([a-zA-Z\s]+)/i);
      if (nameMatch) {
        setSearchQuery(nameMatch[1].trim());
        handleSearch();
        return;
      }
    }
    
    // Search by agent
    if (lowerTranscript.includes('agent')) {
      const agentMatch = transcript.match(/agent\s+([a-zA-Z\s]+)/i);
      if (agentMatch) {
        setSearchQuery(agentMatch[1].trim());
        handleSearch();
        return;
      }
    }
    
    // Search by policy type
    if (lowerTranscript.includes('policy') || lowerTranscript.includes('type')) {
      const policyMatch = transcript.match(/(?:policy|type)\s+([a-zA-Z\s]+)/i);
      if (policyMatch) {
        setSearchQuery(policyMatch[1].trim());
        handleSearch();
        return;
      }
    }
    
    // Search by status
    if (lowerTranscript.includes('status')) {
      const statusMatch = transcript.match(/status\s+([a-zA-Z\s]+)/i);
      if (statusMatch) {
        const status = statusMatch[1].trim().toLowerCase();
        if (['active', 'pending', 'approved', 'rejected'].includes(status)) {
          handleFilterChange('status', status);
          toast.success(`Filtered by status: ${status}`);
          return;
        }
      }
    }
    
    // General search
    setSearchQuery(transcript);
    handleSearch();
  };

  const handleCaseAction = (action: string, caseId: string) => {
    const case_ = cases.find(c => c.id === caseId);
    if (!case_) return;

    switch (action) {
      case 'view':
        toast.success(`Viewing case ${case_.caseNumber}`);
        navigate(`/application/${case_.id}`);
        break;
      case 'edit':
        toast.success(`Editing case ${case_.caseNumber}`);
        navigate(`/application/${case_.id}?mode=edit`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete case ${case_.caseNumber}?`)) {
          setCases(prev => prev.filter(c => c.id !== caseId));
          toast.success(`Case ${case_.caseNumber} deleted successfully`);
        }
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s what&apos;s happening with your insurance business.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="btn-secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Voice Search Widget */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="h-5 w-5 mr-2" />
            Voice Search & AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VoiceSearch
            onSearch={(filters) => {
              // Handle search filters from voice or manual input
              console.log('Search filters:', filters);
              
              // Apply filters based on search results
              if (filters.caseStatus) {
                handleFilterChange('status', filters.caseStatus);
              }
              if (filters.insured) {
                setSearchQuery(filters.insured);
                handleSearch();
              }
              if (filters.policyNumber) {
                setSearchQuery(filters.policyNumber);
                handleSearch();
              }
              if (filters.zinniaCaseId) {
                setSearchQuery(filters.zinniaCaseId);
                handleSearch();
              }
            }}
            onClearFilters={() => {
              clearFilters();
            }}
            onVoiceCommand={handleVoiceSearch}
            className="w-full"
          />
          {voiceTranscript && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  <Mic className="h-4 w-4 inline mr-2" />
                  Voice Command: &quot;{voiceTranscript}&quot;
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVoiceTranscript('')}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active-cases">Active Cases</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Activity */}
            <Card className="lg:col-span-2 card-premium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCases.slice(0, 3).map((case_) => (
                    <div key={case_.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p 
                            className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline"
                            onClick={() => handleCaseAction('view', case_.id)}
                          >
                            {case_.caseNumber}
                          </p>
                          <p className="text-sm text-gray-600">{case_.insuredName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(case_.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCaseAction('view', case_.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-4">
              <StatCard
                title="Total Cases"
                value={cases.length.toString()}
                change="+12% from last month"
                icon={<FileText className="h-4 w-4" />}
                color="blue"
              />
              <StatCard
                title="Active Cases"
                value={cases.filter(c => c.status === 'active').length.toString()}
                change="+5% from last month"
                icon={<Users className="h-4 w-4" />}
                color="green"
              />
              <StatCard
                title="Total Coverage"
                value="$1,750,000"
                change="+8% from last month"
                icon={<DollarSign className="h-4 w-4" />}
                color="purple"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="active-cases" className="space-y-4">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Active Cases Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search cases by number, name, or Zinnia Case ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSearch} className="btn-primary">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={toggleVoiceSearch} 
                    className={`btn-secondary ${isListening ? 'bg-red-100 border-red-300' : ''}`}
                  >
                    {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                    {isListening ? 'Stop' : 'Voice Search'}
                  </Button>
                  <Button variant="outline" onClick={clearFilters} className="btn-secondary">
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>

              {/* Voice Search Status */}
              {isListening && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-blue-600 animate-pulse" />
                    <span className="text-blue-800 font-medium">Listening... Speak now</span>
                    {voiceTranscript && (
                      <span className="text-blue-600 ml-2">&quot;{voiceTranscript}&quot;</span>
                    )}
                  </div>
                </div>
              )}

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <select
                    id="status-filter"
                    value={dashboardFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="agent-filter">Agent</Label>
                  <select
                    id="agent-filter"
                    value={dashboardFilters.agent}
                    onChange={(e) => handleFilterChange('agent', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Agents</option>
                    <option value="Sarah Johnson">Sarah Johnson</option>
                    <option value="Mike Wilson">Mike Wilson</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="policy-filter">Policy Type</Label>
                  <select
                    id="policy-filter"
                    value={dashboardFilters.policyType}
                    onChange={(e) => handleFilterChange('policyType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="Term Life">Term Life</option>
                    <option value="Whole Life">Whole Life</option>
                    <option value="Universal Life">Universal Life</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="date-filter">Date Range</Label>
                  <select
                    id="date-filter"
                    value={dashboardFilters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                </div>
              </div>

              {/* Cases Table */}
              <div className="overflow-x-auto">
                <table className="w-full table-premium">
                  <thead className="table-header-premium">
                    <tr>
                      <th className="p-3 text-left">Case Number</th>
                      <th className="p-3 text-left">Insured Name</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Policy Type</th>
                      <th className="p-3 text-left">Coverage</th>
                      <th className="p-3 text-left">Agent</th>
                      <th className="p-3 text-left">Zinnia Case ID</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((case_) => (
                      <tr key={case_.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">
                          <span 
                            className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
                            onClick={() => handleCaseAction('view', case_.id)}
                          >
                            {case_.caseNumber}
                          </span>
                        </td>
                        <td className="p-3">{case_.insuredName}</td>
                        <td className="p-3">{getStatusBadge(case_.status)}</td>
                        <td className="p-3">{case_.policyType}</td>
                        <td className="p-3">{case_.coverageAmount}</td>
                        <td className="p-3">{case_.agent}</td>
                        <td className="p-3 font-mono text-sm">{case_.zinniaCaseId}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCaseAction('view', case_.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCaseAction('edit', case_.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCaseAction('delete', case_.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCases.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No cases found matching your criteria</p>
                  <Button onClick={clearFilters} className="mt-2 btn-secondary">
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analytics content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Reports content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, change, icon, color = 'blue' }) => (
  <Card className="stat-card hover-premium">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white/90">
        {title}
      </CardTitle>
      <div className="p-2 rounded-full bg-white/20 text-white">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
      {change && (
        <p className="text-xs text-white/80">
          {change}
        </p>
      )}
    </CardContent>
  </Card>
); 