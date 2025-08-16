import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Party {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  occupation: string;
  employer: string;
  annualIncome: number;
  netWorth: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleAssignment {
  id: string;
  partyId: string;
  caseId: string;
  role: PartyRole;
  isPrimary: boolean;
  percentage?: number; // For beneficiaries
  startDate: string;
  endDate?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type PartyRole = 
  | 'INSURED'
  | 'OWNER'
  | 'PAYOR'
  | 'BENEFICIARY_PRIMARY'
  | 'BENEFICIARY_CONTINGENT'
  | 'AGENT'
  | 'BROKER'
  | 'ATTORNEY'
  | 'TRUSTEE'
  | 'GUARDIAN';

export interface CreatePartyRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  occupation: string;
  employer: string;
  annualIncome: number;
  netWorth: number;
}

export interface UpdatePartyRequest extends Partial<CreatePartyRequest> {
  id: string;
}

export interface CreateRoleAssignmentRequest {
  partyId: string;
  caseId: string;
  role: PartyRole;
  isPrimary: boolean;
  percentage?: number;
  startDate: string;
  endDate?: string;
  metadata?: Record<string, any>;
}

export interface UpdateRoleAssignmentRequest extends Partial<CreateRoleAssignmentRequest> {
  id: string;
}

export interface PartySearchFilters {
  firstName?: string;
  lastName?: string;
  email?: string;
  ssn?: string;
  role?: PartyRole;
  caseId?: string;
  isActive?: boolean;
}

export interface PartyWithRoles extends Party {
  roles: RoleAssignment[];
}

export interface CasePartySummary {
  caseId: string;
  parties: {
    [role in PartyRole]?: PartyWithRoles[];
  };
  totalParties: number;
  primaryParties: number;
  contingentParties: number;
}

export const partyService = {
  // Party Management
  async createParty(partyData: CreatePartyRequest): Promise<Party> {
    try {
      const response = await api.post('/parties', partyData);
      return response.data;
    } catch (error) {
      console.error('Error creating party:', error);
      throw error;
    }
  },

  async getPartyById(partyId: string): Promise<Party> {
    try {
      const response = await api.get(`/parties/${partyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching party:', error);
      throw error;
    }
  },

  async updateParty(partyData: UpdatePartyRequest): Promise<Party> {
    try {
      const response = await api.put(`/parties/${partyData.id}`, partyData);
      return response.data;
    } catch (error) {
      console.error('Error updating party:', error);
      throw error;
    }
  },

  async deleteParty(partyId: string): Promise<void> {
    try {
      await api.delete(`/parties/${partyId}`);
    } catch (error) {
      console.error('Error deleting party:', error);
      throw error;
    }
  },

  async searchParties(filters: PartySearchFilters, page = 0, size = 20): Promise<{
    content: Party[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await api.get(`/parties/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching parties:', error);
      throw error;
    }
  },

  async getPartiesByCase(caseId: string): Promise<CasePartySummary> {
    try {
      const response = await api.get(`/cases/${caseId}/parties`);
      return response.data;
    } catch (error) {
      console.error('Error fetching case parties:', error);
      throw error;
    }
  },

  // Role Management
  async assignRole(roleData: CreateRoleAssignmentRequest): Promise<RoleAssignment> {
    try {
      const response = await api.post('/cases/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  },

  async updateRoleAssignment(roleData: UpdateRoleAssignmentRequest): Promise<RoleAssignment> {
    try {
      const response = await api.put(`/cases/roles/${roleData.id}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role assignment:', error);
      throw error;
    }
  },

  async removeRole(roleId: string): Promise<void> {
    try {
      await api.delete(`/cases/roles/${roleId}`);
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  },

  async getRoleAssignments(caseId: string): Promise<RoleAssignment[]> {
    try {
      const response = await api.get(`/cases/${caseId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role assignments:', error);
      throw error;
    }
  },

  async getPartyRoles(partyId: string): Promise<RoleAssignment[]> {
    try {
      const response = await api.get(`/parties/${partyId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching party roles:', error);
      throw error;
    }
  },

  // Quick Actions
  async useInsuredAsPayor(caseId: string, insuredPartyId: string): Promise<RoleAssignment> {
    try {
      const response = await api.post(`/cases/${caseId}/roles/quick-actions`, {
        action: 'USE_INSURED_AS_PAYOR',
        partyId: insuredPartyId
      });
      return response.data;
    } catch (error) {
      console.error('Error using insured as payor:', error);
      throw error;
    }
  },

  async useInsuredAsOwner(caseId: string, insuredPartyId: string): Promise<RoleAssignment> {
    try {
      const response = await api.post(`/cases/${caseId}/roles/quick-actions`, {
        action: 'USE_INSURED_AS_OWNER',
        partyId: insuredPartyId
      });
      return response.data;
    } catch (error) {
      console.error('Error using insured as owner:', error);
      throw error;
    }
  },

  async duplicateParty(partyId: string, newData: Partial<CreatePartyRequest>): Promise<Party> {
    try {
      const response = await api.post(`/parties/${partyId}/duplicate`, newData);
      return response.data;
    } catch (error) {
      console.error('Error duplicating party:', error);
      throw error;
    }
  },

  // Validation
  async validateBeneficiaryAllocation(caseId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const response = await api.get(`/cases/${caseId}/roles/validate-beneficiaries`);
      return response.data;
    } catch (error) {
      console.error('Error validating beneficiary allocation:', error);
      throw error;
    }
  },

  async validatePartyRoles(caseId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const response = await api.get(`/cases/${caseId}/roles/validate`);
      return response.data;
    } catch (error) {
      console.error('Error validating party roles:', error);
      throw error;
    }
  },

  // Bulk Operations
  async bulkAssignRoles(assignments: CreateRoleAssignmentRequest[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; message: string }>;
  }> {
    try {
      const response = await api.post('/cases/roles/bulk', assignments);
      return response.data;
    } catch (error) {
      console.error('Error bulk assigning roles:', error);
      throw error;
    }
  },

  async bulkUpdateParties(updates: UpdatePartyRequest[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; message: string }>;
  }> {
    try {
      const response = await api.put('/parties/bulk', updates);
      return response.data;
    } catch (error) {
      console.error('Error bulk updating parties:', error);
      throw error;
    }
  },

  // Analytics
  async getPartyAnalytics(caseId: string): Promise<{
    totalParties: number;
    rolesDistribution: Record<PartyRole, number>;
    averageAge: number;
    genderDistribution: Record<string, number>;
    occupationDistribution: Record<string, number>;
    riskProfiles: Record<string, number>;
  }> {
    try {
      const response = await api.get(`/cases/${caseId}/parties/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching party analytics:', error);
      throw error;
    }
  },

  // Export
  async exportParties(filters: PartySearchFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/parties/export?${params.toString()}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting parties:', error);
      throw error;
    }
  },

  // Mock data for development
  getMockParties(): Party[] {
    return [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        dateOfBirth: '1985-06-15',
        ssn: '123-45-6789',
        email: 'john.doe@email.com',
        phone: '555-123-4567',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        occupation: 'Software Engineer',
        employer: 'Tech Corp',
        annualIncome: 120000,
        netWorth: 500000,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
        dateOfBirth: '1990-03-22',
        ssn: '987-65-4321',
        email: 'jane.smith@email.com',
        phone: '555-987-6543',
        address: {
          street: '456 Oak Ave',
          city: 'Somewhere',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        occupation: 'Marketing Manager',
        employer: 'Marketing Inc',
        annualIncome: 95000,
        netWorth: 300000,
        isActive: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ];
  },

  getMockRoleAssignments(caseId: string): RoleAssignment[] {
    return [
      {
        id: '1',
        partyId: '1',
        caseId,
        role: 'INSURED',
        isPrimary: true,
        startDate: '2024-01-01T00:00:00Z',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        partyId: '1',
        caseId,
        role: 'OWNER',
        isPrimary: true,
        startDate: '2024-01-01T00:00:00Z',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        partyId: '2',
        caseId,
        role: 'BENEFICIARY_PRIMARY',
        isPrimary: true,
        percentage: 100,
        startDate: '2024-01-01T00:00:00Z',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }
}; 