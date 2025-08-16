import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Plus, 
  Search, 
  Filter, 
  UserPlus, 
  Users, 
  Shield, 
  DollarSign, 
  Heart,
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  partyService, 
  Party, 
  RoleAssignment, 
  PartyRole, 
  PartySearchFilters,
  CasePartySummary
} from '../../services/partyService';

interface PartyDirectoryProps {
  caseId?: string;
  onPartySelect?: (party: Party) => void;
  onRoleChange?: (role: RoleAssignment) => void;
  isAdmin?: boolean;
}

const ROLE_COLORS: Record<PartyRole, string> = {
  INSURED: 'bg-blue-100 text-blue-800',
  OWNER: 'bg-green-100 text-green-800',
  PAYOR: 'bg-purple-100 text-purple-800',
  BENEFICIARY_PRIMARY: 'bg-orange-100 text-orange-800',
  BENEFICIARY_CONTINGENT: 'bg-yellow-100 text-yellow-800',
  AGENT: 'bg-indigo-100 text-indigo-800',
  BROKER: 'bg-pink-100 text-pink-800',
  ATTORNEY: 'bg-red-100 text-red-800',
  TRUSTEE: 'bg-gray-100 text-gray-800',
  GUARDIAN: 'bg-teal-100 text-teal-800'
};

const ROLE_ICONS: Record<PartyRole, React.ReactNode> = {
  INSURED: <Shield className="h-4 w-4" />,
  OWNER: <Users className="h-4 w-4" />,
  PAYOR: <DollarSign className="h-4 w-4" />,
  BENEFICIARY_PRIMARY: <Heart className="h-4 w-4" />,
  BENEFICIARY_CONTINGENT: <Heart className="h-4 w-4" />,
  AGENT: <UserPlus className="h-4 w-4" />,
  BROKER: <UserPlus className="h-4 w-4" />,
  ATTORNEY: <Shield className="h-4 w-4" />,
  TRUSTEE: <Users className="h-4 w-4" />,
  GUARDIAN: <Shield className="h-4 w-4" />
};

export const PartyDirectory: React.FC<PartyDirectoryProps> = ({
  caseId,
  onPartySelect,
  onRoleChange,
  isAdmin = false
}) => {
  const [parties, setParties] = useState<Party[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [casePartySummary, setCasePartySummary] = useState<CasePartySummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<PartyRole | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedParties, setExpandedParties] = useState<Set<string>>(new Set());
  const [showAddParty, setShowAddParty] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);

  useEffect(() => {
    if (caseId) {
      loadCaseParties();
    } else {
      loadAllParties();
    }
  }, [caseId]);

  const loadCaseParties = async () => {
    if (!caseId) return;
    
    try {
      setIsLoading(true);
      const [partiesData, rolesData, summaryData] = await Promise.all([
        partyService.getPartiesByCase(caseId),
        partyService.getRoleAssignments(caseId),
        partyService.getPartyAnalytics(caseId)
      ]);
      
      setCasePartySummary(partiesData);
      setRoleAssignments(rolesData);
      
      // Extract unique parties from roles
      const uniqueParties = new Map<string, Party>();
      rolesData.forEach(role => {
        if (role.partyId && !uniqueParties.has(role.partyId)) {
          // In real app, you'd fetch party details here
          // For now, use mock data
          const mockParty = partyService.getMockParties().find(p => p.id === role.partyId);
          if (mockParty) {
            uniqueParties.set(role.partyId, mockParty);
          }
        }
      });
      
      setParties(Array.from(uniqueParties.values()));
    } catch (error) {
      console.error('Error loading case parties:', error);
      toast.error('Failed to load case parties');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllParties = async () => {
    try {
      setIsLoading(true);
      const mockParties = partyService.getMockParties();
      setParties(mockParties);
      
      if (caseId) {
        const mockRoles = partyService.getMockRoleAssignments(caseId);
        setRoleAssignments(mockRoles);
      }
    } catch (error) {
      console.error('Error loading parties:', error);
      toast.error('Failed to load parties');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParties = parties.filter(party => {
    const matchesSearch = party.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         party.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         party.ssn.includes(searchTerm);
    
    const matchesRole = !selectedRole || 
                       roleAssignments.some(role => 
                         role.partyId === party.id && role.role === selectedRole
                       );
    
    return matchesSearch && matchesRole;
  });

  const getPartyRoles = (partyId: string): RoleAssignment[] => {
    return roleAssignments.filter(role => role.partyId === partyId);
  };

  const getRoleDisplayName = (role: PartyRole): string => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const togglePartyExpansion = (partyId: string) => {
    const newExpanded = new Set(expandedParties);
    if (newExpanded.has(partyId)) {
      newExpanded.delete(partyId);
    } else {
      newExpanded.add(partyId);
    }
    setExpandedParties(newExpanded);
  };

  const handleQuickAction = async (action: string, partyId: string) => {
    if (!caseId) return;
    
    try {
      let result: RoleAssignment;
      
      switch (action) {
        case 'USE_INSURED_AS_PAYOR':
          result = await partyService.useInsuredAsPayor(caseId, partyId);
          break;
        case 'USE_INSURED_AS_OWNER':
          result = await partyService.useInsuredAsOwner(caseId, partyId);
          break;
        default:
          toast.error('Invalid action');
          return;
      }
      
      toast.success('Role assigned successfully');
      onRoleChange?.(result);
      loadCaseParties(); // Refresh data
    } catch (error) {
      console.error('Error performing quick action:', error);
      toast.error('Failed to perform action');
    }
  };

  const handleDuplicateParty = async (party: Party) => {
    try {
      const duplicatedParty = await partyService.duplicateParty(party.id, {
        firstName: `${party.firstName} (Copy)`,
        lastName: party.lastName,
        email: `${party.firstName.toLowerCase()}.copy@email.com`,
        ssn: '000-00-0000' // Would need to be unique in real app
      });
      
      toast.success('Party duplicated successfully');
      setParties(prev => [...prev, duplicatedParty]);
    } catch (error) {
      console.error('Error duplicating party:', error);
      toast.error('Failed to duplicate party');
    }
  };

  const handleDeleteParty = async (partyId: string) => {
    if (!confirm('Are you sure you want to delete this party?')) return;
    
    try {
      await partyService.deleteParty(partyId);
      toast.success('Party deleted successfully');
      setParties(prev => prev.filter(p => p.id !== partyId));
    } catch (error) {
      console.error('Error deleting party:', error);
      toast.error('Failed to delete party');
    }
  };

  const validateBeneficiaryAllocation = async () => {
    if (!caseId) return;
    
    try {
      const validation = await partyService.validateBeneficiaryAllocation(caseId);
      
      if (validation.isValid) {
        toast.success('Beneficiary allocation is valid');
      } else {
        toast.error(`Validation errors: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        toast.error(`Warnings: ${validation.warnings.join(', ')}`);
      }
    } catch (error) {
      console.error('Error validating beneficiary allocation:', error);
      toast.error('Failed to validate beneficiary allocation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Party Directory</h2>
          <p className="text-gray-600">
            {caseId ? `Case: ${caseId}` : 'All Parties'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {caseId && (
            <Button
              variant="outline"
              onClick={validateBeneficiaryAllocation}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Validate
            </Button>
          )}
          
          {isAdmin && (
            <Button
              onClick={() => setShowAddParty(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Party
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Parties</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or SSN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="role-filter">Filter by Role</Label>
              <select
                id="role-filter"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as PartyRole | '')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Roles</option>
                {Object.keys(ROLE_COLORS).map(role => (
                  <option key={role} value={role}>
                    {getRoleDisplayName(role as PartyRole)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Summary */}
      {caseId && casePartySummary && (
        <Card>
          <CardHeader>
            <CardTitle>Case Party Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {casePartySummary.totalParties}
                </div>
                <div className="text-sm text-blue-800">Total Parties</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {casePartySummary.primaryParties}
                </div>
                <div className="text-sm text-green-800">Primary Parties</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {casePartySummary.contingentParties}
                </div>
                <div className="text-sm text-orange-800">Contingent Parties</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(casePartySummary.parties).length}
                </div>
                <div className="text-sm text-purple-800">Role Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parties List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading parties...</p>
          </div>
        ) : filteredParties.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No parties found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedRole 
                  ? 'Try adjusting your search criteria'
                  : 'No parties have been added yet'
                }
              </p>
              {isAdmin && (
                <Button onClick={() => setShowAddParty(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Party
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredParties.map(party => {
            const partyRoles = getPartyRoles(party.id);
            const isExpanded = expandedParties.has(party.id);
            
            return (
              <Card key={party.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Party Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePartyExpansion(party.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {party.firstName[0]}{party.lastName[0]}
                            </span>
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {party.fullName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {party.email} • {party.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Role Badges */}
                        {partyRoles.slice(0, 3).map(role => (
                          <Badge
                            key={role.id}
                            className={`${ROLE_COLORS[role.role]} flex items-center gap-1`}
                          >
                            {ROLE_ICONS[role.role]}
                            {getRoleDisplayName(role.role)}
                          </Badge>
                        ))}
                        
                        {partyRoles.length > 3 && (
                          <Badge variant="secondary">
                            +{partyRoles.length - 3} more
                          </Badge>
                        )}
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPartySelect?.(party)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingParty(party)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicateParty(party)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteParty(party.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Party Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Party Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date of Birth:</span>
                              <span>{new Date(party.dateOfBirth).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">SSN:</span>
                              <span>{party.ssn}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Occupation:</span>
                              <span>{party.occupation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Employer:</span>
                              <span>{party.employer}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Annual Income:</span>
                              <span>${party.annualIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Net Worth:</span>
                              <span>${party.netWorth.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Role Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Role Details</h4>
                          <div className="space-y-2">
                            {partyRoles.map(role => (
                              <div key={role.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex items-center gap-2">
                                  <Badge className={ROLE_COLORS[role.role]}>
                                    {getRoleDisplayName(role.role)}
                                  </Badge>
                                  {role.percentage && (
                                    <span className="text-sm text-gray-600">
                                      {role.percentage}%
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  {role.isPrimary && (
                                    <Badge variant="outline" className="text-xs">
                                      Primary
                                    </Badge>
                                  )}
                                  
                                  {isAdmin && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onRoleChange?.(role)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Quick Actions */}
                          {caseId && isAdmin && (
                            <div className="mt-4">
                              <h5 className="font-medium text-gray-900 mb-2">Quick Actions</h5>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuickAction('USE_INSURED_AS_PAYOR', party.id)}
                                  disabled={partyRoles.some(r => r.role === 'PAYOR')}
                                >
                                  Use as Payor
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuickAction('USE_INSURED_AS_OWNER', party.id)}
                                  disabled={partyRoles.some(r => r.role === 'OWNER')}
                                >
                                  Use as Owner
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add/Edit Party Modal would go here */}
      {/* For now, just show a placeholder */}
      {showAddParty && (
        <Alert>
          <AlertDescription>
            Add Party functionality would be implemented here with a modal form.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 