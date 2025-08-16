import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAccessControl } from '../../hooks/useAccessControl';

import { auditService } from '../../services/auditService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Icons
import { 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from 'lucide-react';

interface RiskAssessment {
  id: string;
  caseId: string;
  insuredName: string;
  riskScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'review';
  underwriter: string;
  createdAt: string;
  updatedAt: string;
}

interface PremiumRate {
  id: string;
  policyType: string;
  baseRate: number;
  riskMultiplier: number;
  finalRate: number;
  effectiveDate: string;
  underwriter: string;
}

interface UnderwritingRule {
  id: string;
  name: string;
  description: string;
  category: 'risk' | 'premium' | 'eligibility' | 'documentation';
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastModified: string;
}

const UnderwritingDashboard: React.FC = () => {
  const accessControl = useAccessControl();
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data states
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [premiumRates, setPremiumRates] = useState<PremiumRate[]>([]);
  const [underwritingRules, setUnderwritingRules] = useState<UnderwritingRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has underwriter access
  const canAccessUnderwriting = accessControl.canUnderwrite();

  useEffect(() => {
    if (canAccessUnderwriting) {
      loadMockData();
    }
  }, [canAccessUnderwriting]);

  const loadMockData = () => {
    // Mock risk assessments
    setRiskAssessments([
      {
        id: '1',
        caseId: 'CASE-001',
        insuredName: 'John Smith',
        riskScore: 75,
        status: 'pending',
        underwriter: 'Sarah Wilson',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        caseId: 'CASE-002',
        insuredName: 'Jane Doe',
        riskScore: 45,
        status: 'approved',
        underwriter: 'Mike Johnson',
        createdAt: '2024-01-14T09:00:00Z',
        updatedAt: '2024-01-14T11:00:00Z'
      },
      {
        id: '3',
        caseId: 'CASE-003',
        insuredName: 'Bob Wilson',
        riskScore: 90,
        status: 'rejected',
        underwriter: 'Sarah Wilson',
        createdAt: '2024-01-13T08:00:00Z',
        updatedAt: '2024-01-13T16:00:00Z'
      }
    ]);

    // Mock premium rates
    setPremiumRates([
      {
        id: '1',
        policyType: 'Term Life',
        baseRate: 0.85,
        riskMultiplier: 1.2,
        finalRate: 1.02,
        effectiveDate: '2024-01-01',
        underwriter: 'Sarah Wilson'
      },
      {
        id: '2',
        policyType: 'Whole Life',
        baseRate: 1.25,
        riskMultiplier: 1.1,
        finalRate: 1.38,
        effectiveDate: '2024-01-01',
        underwriter: 'Mike Johnson'
      }
    ]);

    // Mock underwriting rules
    setUnderwritingRules([
      {
        id: '1',
        name: 'High Risk Age Limit',
        description: 'Maximum age for high-risk applicants is 65',
        category: 'eligibility',
        isActive: true,
        priority: 'high',
        lastModified: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        name: 'Premium Rate Cap',
        description: 'Maximum premium rate cannot exceed 3x base rate',
        category: 'premium',
        isActive: true,
        priority: 'critical',
        lastModified: '2024-01-08T14:00:00Z'
      }
    ]);
  };

  const handleRiskAssessment = async (assessmentId: string, action: 'approve' | 'reject') => {
    if (!accessControl.canAssessRisk()) {
      toast.error('You do not have permission to assess risk');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setRiskAssessments(prev => prev.map(assessment => 
        assessment.id === assessmentId 
          ? { ...assessment, status: action === 'approve' ? 'approved' : 'rejected' }
          : assessment
      ));

      // Log underwriting action
      await auditService.logUnderwritingAction({
        underwriterId: state.user?.id?.toString() || 'unknown',
        underwriterUsername: state.user?.username || 'unknown',
        action: action === 'approve' ? 'APPROVE_COMPLEX_POLICY' : 'ASSESS_RISK',
        caseId: riskAssessments.find(a => a.id === assessmentId)?.caseId,
        details: `${action}ed risk assessment for case ${assessmentId}`
      });

      toast.success(`Risk assessment ${action}ed successfully`);
    } catch (error) {
      toast.error('Failed to update risk assessment');
      console.error('Error updating risk assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePremiumRateUpdate = async (rateId: string, newRate: number) => {
    if (!accessControl.canSetPremiumRates()) {
      toast.error('You do not have permission to set premium rates');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setPremiumRates(prev => prev.map(rate => 
        rate.id === rateId 
          ? { ...rate, finalRate: newRate, updatedAt: new Date().toISOString() }
          : rate
      ));

      // Log underwriting action
      await auditService.logUnderwritingAction({
        underwriterId: state.user?.id?.toString() || 'unknown',
        underwriterUsername: state.user?.username || 'unknown',
        action: 'SET_PREMIUM_RATES',
        details: `Updated premium rate for ${rateId} to ${newRate}`,
        premiumRate: newRate
      });

      toast.success('Premium rate updated successfully');
    } catch (error) {
      toast.error('Failed to update premium rate');
      console.error('Error updating premium rate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRuleOverride = async (ruleId: string, reason: string) => {
    if (!accessControl.canOverrideRules()) {
      toast.error('You do not have permission to override underwriting rules');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log underwriting action
      await auditService.logUnderwritingAction({
        underwriterId: state.user?.id?.toString() || 'unknown',
        underwriterUsername: state.user?.username || 'unknown',
        action: 'OVERRIDE_RULES',
        details: `Overrode rule ${ruleId}`,
        overrideReason: reason
      });

      toast.success('Rule override logged successfully');
    } catch (error) {
      toast.error('Failed to log rule override');
      console.error('Error logging rule override:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Access control check
  if (!canAccessUnderwriting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-yellow-600 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-4">
            This dashboard is restricted to underwriters only.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your role: {accessControl.getUserRoleInfo().displayName}
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      review: { color: 'bg-blue-100 text-blue-800', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-yellow-600';
    if (score <= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Underwriting Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage risk assessments, premium rates, and underwriting rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {accessControl.getUserRoleInfo().displayName}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {accessControl.getPermissionSummary().underwritingPermissions} Underwriting Permissions
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="premium-rates">Premium Rates</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {riskAssessments.filter(r => r.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {riskAssessments.filter(r => r.status === 'approved').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  This period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {underwritingRules.filter(r => r.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently enforced
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium Rates</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {premiumRates.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active rates
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest underwriting actions and decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskAssessments.slice(0, 3).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        assessment.status === 'approved' ? 'bg-green-500' :
                        assessment.status === 'rejected' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium">{assessment.insuredName}</p>
                        <p className="text-sm text-gray-500">Case {assessment.caseId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(assessment.status)}
                      <span className={`text-sm font-medium ${getRiskScoreColor(assessment.riskScore)}`}>
                        Risk: {assessment.riskScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risk-assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessments</CardTitle>
              <CardDescription>
                Review and manage pending risk assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAssessments.map((assessment) => (
                  <div key={assessment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{assessment.insuredName}</h3>
                        <p className="text-sm text-gray-500">Case {assessment.caseId}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(assessment.status)}
                        <span className={`text-sm font-medium ${getRiskScoreColor(assessment.riskScore)}`}>
                          Risk Score: {assessment.riskScore}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Underwriter: {assessment.underwriter}</p>
                      <p>Created: {new Date(assessment.createdAt).toLocaleDateString()}</p>
                    </div>

                    {assessment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleRiskAssessment(assessment.id, 'approve')}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRiskAssessment(assessment.id, 'reject')}
                          disabled={isLoading}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Premium Rates Tab */}
        <TabsContent value="premium-rates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Premium Rates</CardTitle>
              <CardDescription>
                Manage and update premium rate calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {premiumRates.map((rate) => (
                  <div key={rate.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{rate.policyType}</h3>
                        <p className="text-sm text-gray-500">Effective: {rate.effectiveDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {rate.finalRate.toFixed(2)}%
                        </p>
                        <p className="text-sm text-gray-500">
                          Base: {rate.baseRate.toFixed(2)}% × {rate.riskMultiplier}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Underwriter: {rate.underwriter}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handlePremiumRateUpdate(rate.id, rate.finalRate + 0.1)}
                        disabled={isLoading}
                      >
                        Increase Rate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePremiumRateUpdate(rate.id, rate.finalRate - 0.1)}
                        disabled={isLoading}
                      >
                        Decrease Rate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Underwriting Rules</CardTitle>
              <CardDescription>
                Manage underwriting rules and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {underwritingRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{rule.name}</h3>
                        <p className="text-sm text-gray-500">{rule.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {rule.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Category: {rule.category}</p>
                      <p>Last Modified: {new Date(rule.lastModified).toLocaleDateString()}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRuleOverride(rule.id, 'Business exception approved')}
                        disabled={isLoading}
                      >
                        Override Rule
                      </Button>
                      <Button
                        size="sm"
                        variant={rule.isActive ? 'destructive' : 'default'}
                        disabled={isLoading}
                      >
                        {rule.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
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

export default UnderwritingDashboard; 