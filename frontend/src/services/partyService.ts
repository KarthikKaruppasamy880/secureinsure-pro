import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

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
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
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
    const response = await api.post('/parties', partyData);
    return response.data;
  },

  async getPartyById(partyId: string): Promise<Party> {
    const response = await api.get(`/parties/${partyId}`);
    return response.data;
  },

  async updateParty(partyData: UpdatePartyRequest): Promise<Party> {
    const response = await api.put(`/parties/${partyData.id}`, partyData);
    return response.data;
  },

  async deleteParty(partyId: string): Promise<void> {
    await api.delete(`/parties/${partyId}`);
  },

  async searchParties(filters: PartySearchFilters, page = 0, size = 20): Promise<{
    content: Party[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
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
  },

  async getPartiesByCase(caseId: string): Promise<CasePartySummary> {
    const response = await api.get(`/cases/${caseId}/parties`);
    return response.data;
  },

  // Role Management
  async assignRole(roleData: CreateRoleAssignmentRequest): Promise<RoleAssignment> {
    const response = await api.post('/cases/roles', roleData);
    return response.data;
  },

  async updateRoleAssignment(roleData: UpdateRoleAssignmentRequest): Promise<RoleAssignment> {
    const response = await api.put(`/cases/roles/${roleData.id}`, roleData);
    return response.data;
  },

  async removeRole(roleId: string): Promise<void> {
    await api.delete(`/cases/roles/${roleId}`);
  },

  async getRoleAssignments(caseId: string): Promise<RoleAssignment[]> {
    const response = await api.get(`/cases/${caseId}/roles`);
    return response.data;
  },

  async getPartyRoles(partyId: string): Promise<RoleAssignment[]> {
    const response = await api.get(`/parties/${partyId}/roles`);
    return response.data;
  },

  // Quick Actions
  async useInsuredAsPayor(caseId: string, insuredPartyId: string): Promise<RoleAssignment> {
    const response = await api.post(`/cases/${caseId}/roles/quick-actions`, {
      action: 'USE_INSURED_AS_PAYOR',
      partyId: insuredPartyId
    });
    return response.data;
  },

  async useInsuredAsOwner(caseId: string, insuredPartyId: string): Promise<RoleAssignment> {
    const response = await api.post(`/cases/${caseId}/roles/quick-actions`, {
      action: 'USE_INSURED_AS_OWNER',
      partyId: insuredPartyId
    });
    return response.data;
  },

  async duplicateParty(partyId: string, newData: Partial<CreatePartyRequest>): Promise<Party> {
    const response = await api.post(`/parties/${partyId}/duplicate`, newData);
    return response.data;
  },

  // Validation
  async validateBeneficiaryAllocation(caseId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await api.get(`/cases/${caseId}/roles/validate-beneficiaries`);
    return response.data;
  },

  async validatePartyRoles(caseId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await api.get(`/cases/${caseId}/roles/validate`);
    return response.data;
  },

  // Bulk Operations
  async bulkAssignRoles(assignments: CreateRoleAssignmentRequest[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; message: string }>;
  }> {
    const response = await api.post('/cases/roles/bulk', assignments);
    return response.data;
  },

  async bulkUpdateParties(updates: UpdatePartyRequest[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; message: string }>;
  }> {
    const response = await api.put('/parties/bulk', updates);
    return response.data;
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
    const response = await api.get(`/cases/${caseId}/parties/analytics`);
    return response.data;
  },

  // Export
  async exportParties(filters: PartySearchFilters): Promise<Blob> {
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