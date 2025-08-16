import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  User, 
  Calendar,
  DollarSign,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Tx1Transaction {
  id: number;
  caseNumber: string;
  zinniaCaseId: string;
  policyNumber: string;
  applicationDate: string;
  productType: string;
  faceAmount: number;
  premiumMode: string;
  agentName: string;
  branch: string;
  insuredFirstName: string;
  insuredLastName: string;
  status: string;
  createdAt: string;
}

export default function Tx1Dashboard() {
  const [transactions, setTransactions] = useState<Tx1Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTx1Transactions();
  }, []);

  const fetchTx1Transactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/tx1-transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        toast.error('Failed to fetch TX1 transactions');
      }
    } catch (error) {
      console.error('Error fetching TX1 transactions:', error);
      toast.error('Error fetching TX1 transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseClick = (caseNumber: string) => {
    // Navigate to ApplicationDetails with the case number
    window.location.href = `/application-details?case=${caseNumber}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.insuredFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.insuredLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.zinniaCaseId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading TX1 transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TX1 Transactions Dashboard</h1>
          <p className="text-gray-600">Monitor and manage TX1 transactions from external systems</p>
        </div>
        
        <Button onClick={() => window.location.href = '/application-details'}>
          <Plus className="h-4 w-4 mr-2" />
          New Application
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by case number, insured name, or Zinnia case ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <Button variant="outline" onClick={fetchTx1Transactions}>
                <Filter className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="grid gap-4">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No transactions match your filters' 
                  : 'No TX1 transactions found'}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-blue-600 cursor-pointer hover:underline"
                          onClick={() => handleCaseClick(transaction.caseNumber)}>
                        {transaction.caseNumber}
                      </h3>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{transaction.insuredFirstName} {transaction.insuredLastName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{transaction.zinniaCaseId}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(transaction.applicationDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <span className="font-medium">Product:</span> {transaction.productType}
                      </div>
                      <div>
                        <span className="font-medium">Face Amount:</span> ${transaction.faceAmount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Premium Mode:</span> {transaction.premiumMode}
                      </div>
                      <div>
                        <span className="font-medium">Agent:</span> {transaction.agentName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCaseClick(transaction.caseNumber)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {transactions.filter(t => t.status.toLowerCase() === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.status.toLowerCase() === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.status.toLowerCase() === 'failed').length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
