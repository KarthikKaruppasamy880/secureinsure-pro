import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  RefreshCw,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  Car,
  Home,
  Heart,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  customerName: string;
  claimType: string;
  status: string;
  amount: number;
  filedDate: string;
  incidentDate: string;
  description: string;
  adjuster: string;
  lastUpdated: string;
  priority: string;
}

interface ClaimsListProps {
  onClaimSelect?: (claim: Claim) => void;
  onNewClaim?: () => void;
}

const ClaimsList: React.FC<ClaimsListProps> = ({ onClaimSelect, onNewClaim }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState<Claim | null>(null);

  const queryClient = useQueryClient();

  // Fetch claims
  const { data: claims, isLoading, error, refetch } = useQuery({
    queryKey: ['claims', searchTerm, statusFilter, typeFilter, priorityFilter, sortBy, sortOrder],
    queryFn: async () => {
      const response = await fetch('/api/claims', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch claims');
      return response.json();
    }
  });

  // Delete claim mutation
  const deleteClaimMutation = useMutation({
    mutationFn: async (claimId: string) => {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete claim');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success('Claim deleted successfully');
      setIsDeleteDialogOpen(false);
      setClaimToDelete(null);
    },
    onError: (error) => {
      toast.error('Failed to delete claim');
      console.error('Delete claim error:', error);
    }
  });

  const handleDeleteClaim = (claim: Claim) => {
    setClaimToDelete(claim);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteClaim = () => {
    if (claimToDelete) {
      deleteClaimMutation.mutate(claimToDelete.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      approved: { variant: 'default', className: 'bg-green-100 text-green-800' },
      denied: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      under_review: { variant: 'outline', className: 'bg-blue-100 text-blue-800' },
      closed: { variant: 'outline', className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      medium: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      low: { variant: 'outline', className: 'bg-green-100 text-green-800' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getClaimTypeIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      auto: <Car className="h-4 w-4" />,
      home: <Home className="h-4 w-4" />,
      life: <Heart className="h-4 w-4" />,
      health: <Heart className="h-4 w-4" />,
      business: <Building className="h-4 w-4" />
    };
    return iconMap[type.toLowerCase()] || <FileText className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      pending: <Clock className="h-4 w-4 text-yellow-600" />,
      approved: <CheckCircle className="h-4 w-4 text-green-600" />,
      denied: <AlertTriangle className="h-4 w-4 text-red-600" />,
      under_review: <Clock className="h-4 w-4 text-blue-600" />,
      closed: <CheckCircle className="h-4 w-4 text-gray-600" />
    };
    return iconMap[status] || <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const filteredClaims = claims?.filter((claim: Claim) => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claimType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesType = typeFilter === 'all' || claim.claimType === typeFilter;
    const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading claims...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load claims</p>
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
          <h2 className="text-2xl font-bold tracking-tight">Claims</h2>
          <p className="text-muted-foreground">
            Manage and process insurance claims
          </p>
        </div>
        <Button onClick={onNewClaim} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Claim
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="life">Life</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastUpdated">Last Updated</SelectItem>
                <SelectItem value="claimNumber">Claim Number</SelectItem>
                <SelectItem value="customerName">Customer Name</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="filedDate">Filed Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Claims List ({filteredClaims.length})</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Filed Date</TableHead>
                <TableHead>Adjuster</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim: Claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getClaimTypeIcon(claim.claimType)}
                      {claim.claimNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {claim.customerName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {claim.claimType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(claim.status)}
                      {getStatusBadge(claim.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(claim.priority)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      {claim.amount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(claim.filedDate), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>{claim.adjuster}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onClaimSelect?.(claim)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Claim</DialogTitle>
                          </DialogHeader>
                          <div className="p-4">
                            <p>Edit claim form will be implemented here</p>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Download claim documents
                          toast.info('Downloading claim documents...');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClaim(claim)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Claim</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this claim? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteClaim}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredClaims.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No claims found</p>
              <Button onClick={onNewClaim} className="mt-2">
                File your first claim
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete claim {claimToDelete?.claimNumber}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClaim}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClaimsList; 