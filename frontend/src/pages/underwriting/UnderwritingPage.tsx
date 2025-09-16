import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  BarChart3,
  Target
} from 'lucide-react';

export default function UnderwritingPage() {
  const [premiumRate, setPremiumRate] = useState(0.025);
  const [faceAmount, setFaceAmount] = useState(500000);
  const [age, setAge] = useState(35);
  const [healthRating, setHealthRating] = useState('Standard');

  const calculatedPremium = faceAmount * premiumRate;

  const riskFactors = [
    { factor: 'Age', value: age, risk: age > 50 ? 'High' : age > 40 ? 'Medium' : 'Low' },
    { factor: 'Health Rating', value: healthRating, risk: healthRating === 'Preferred' ? 'Low' : healthRating === 'Standard' ? 'Medium' : 'High' },
    { factor: 'Face Amount', value: `$${faceAmount.toLocaleString()}`, risk: faceAmount > 1000000 ? 'High' : 'Medium' },
    { factor: 'Occupation', value: 'Office Worker', risk: 'Low' },
    { factor: 'Hobbies', value: 'None', risk: 'Low' }
  ];

  const getRiskBadge = (risk: string) => {
    const riskConfig = {
      'Low': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'Medium': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      'High': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };

    const config = riskConfig[risk as keyof typeof riskConfig] || riskConfig.Medium;

    return (
      <Badge variant={config.variant} className={config.className}>
        {risk} Risk
      </Badge>
    );
  };

  const pendingCases = [
    {
      id: 'UW-001',
      caseId: 'CS-2024-001',
      insuredName: 'Jane Doe',
      faceAmount: 500000,
      age: 35,
      healthRating: 'Standard',
      status: 'Under Review',
      submittedDate: '2024-01-15',
      priority: 'High'
    },
    {
      id: 'UW-002',
      caseId: 'CS-2024-002',
      insuredName: 'Michael Johnson',
      faceAmount: 250000,
      age: 28,
      healthRating: 'Preferred',
      status: 'Pending Medical',
      submittedDate: '2024-01-14',
      priority: 'Medium'
    },
    {
      id: 'UW-003',
      caseId: 'CS-2024-003',
      insuredName: 'Sarah Wilson',
      faceAmount: 1000000,
      age: 45,
      healthRating: 'Substandard',
      status: 'Requires Review',
      submittedDate: '2024-01-13',
      priority: 'High'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Under Review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Pending Medical':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'Requires Review':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'High': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      'Medium': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      'Low': { variant: 'outline' as const, className: 'bg-gray-100 text-gray-800' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.Medium;

    return (
      <Badge variant={config.variant} className={config.className}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Underwriting Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Risk Assessment Active
          </Badge>
        </div>
      </div>

      {/* Premium Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Premium Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="faceAmount">Face Amount</Label>
                <Input
                  id="faceAmount"
                  type="number"
                  value={faceAmount}
                  onChange={(e) => setFaceAmount(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="healthRating">Health Rating</Label>
                <select
                  id="healthRating"
                  value={healthRating}
                  onChange={(e) => setHealthRating(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Preferred">Preferred</option>
                  <option value="Standard">Standard</option>
                  <option value="Substandard">Substandard</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Calculated Premium</h4>
                <div className="text-3xl font-bold text-blue-600">
                  ${calculatedPremium.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Annual premium based on current factors
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Rate per $1,000</h4>
                <div className="text-2xl font-bold text-green-600">
                  ${(premiumRate * 1000).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{factor.factor}</span>
                  <p className="text-sm text-gray-500">{factor.value}</p>
                </div>
                {getRiskBadge(factor.risk)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pending Underwriting Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingCases.map((caseItem) => (
              <div key={caseItem.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(caseItem.status)}
                    <span className="font-medium">{caseItem.caseId}</span>
                    <span className="text-gray-500">- {caseItem.insuredName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(caseItem.priority)}
                    <Badge variant="outline">{caseItem.status}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Face Amount:</span> ${caseItem.faceAmount.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Age:</span> {caseItem.age}
                  </div>
                  <div>
                    <span className="font-medium">Health:</span> {caseItem.healthRating}
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span> {caseItem.submittedDate}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">Review</Button>
                  <Button size="sm" variant="outline">Approve</Button>
                  <Button size="sm" variant="outline">Request Info</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Underwriting Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cases This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              +3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 days</div>
            <p className="text-xs text-muted-foreground">
              -0.5 days from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
