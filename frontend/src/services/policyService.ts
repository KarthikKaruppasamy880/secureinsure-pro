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

export interface Policy {
  id: string;
  policyNumber: string;
  customerName: string;
  customerId: string;
  policyType: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled' | 'pending';
  premium: number;
  startDate: string;
  endDate: string;
  coverage: string;
  coverageAmount: number;
  agent: string;
  agentId: string;
  lastUpdated: string;
  createdAt: string;
  documents?: PolicyDocument[];
  endorsements?: Endorsement[];
  payments?: Payment[];
}

export interface PolicyDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Endorsement {
  id: string;
  type: string;
  description: string;
  effectiveDate: string;
  premiumChange: number;
  status: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  method: string;
  transactionId?: string;
}

export interface CreatePolicyRequest {
  customerId: string;
  policyType: string;
  startDate: string;
  endDate: string;
  coverageAmount: number;
  premium: number;
  agentId: string;
  coverageDetails: Record<string, any>;
}

export interface UpdatePolicyRequest {
  policyNumber?: string;
  status?: string;
  premium?: number;
  endDate?: string;
  coverageAmount?: number;
  coverageDetails?: Record<string, any>;
}

export interface PolicyFilters {
  status?: string;
  policyType?: string;
  agentId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  minPremium?: number;
  maxPremium?: number;
}

export const policyService = {
  // Get all policies with optional filters
  async getPolicies(filters?: PolicyFilters, page = 0, size = 20): Promise<{
    content: Policy[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await api.get(`/policies?${params.toString()}`);
    return response.data;
  },

  // Get policy by ID
  async getPolicyById(policyId: string): Promise<Policy> {
    const response = await api.get(`/policies/${policyId}`);
    return response.data;
  },

  // Get policy by policy number
  async getPolicyByNumber(policyNumber: string): Promise<Policy> {
    const response = await api.get(`/policies/number/${policyNumber}`);
    return response.data;
  },

  // Create new policy
  async createPolicy(policyData: CreatePolicyRequest): Promise<Policy> {
    const response = await api.post('/policies', policyData);
    return response.data;
  },

  // Update policy
  async updatePolicy(policyId: string, policyData: UpdatePolicyRequest): Promise<Policy> {
    const response = await api.put(`/policies/${policyId}`, policyData);
    return response.data;
  },

  // Delete policy
  async deletePolicy(policyId: string): Promise<void> {
    await api.delete(`/policies/${policyId}`);
  },

  // Cancel policy
  async cancelPolicy(policyId: string, reason: string): Promise<Policy> {
    const response = await api.post(`/policies/${policyId}/cancel`, { reason });
    return response.data;
  },

  // Renew policy
  async renewPolicy(policyId: string, renewalData: {
    newEndDate: string;
    newPremium?: number;
    newCoverageAmount?: number;
  }): Promise<Policy> {
    const response = await api.post(`/policies/${policyId}/renew`, renewalData);
    return response.data;
  },

  // Add endorsement to policy
  async addEndorsement(policyId: string, endorsementData: {
    type: string;
    description: string;
    effectiveDate: string;
    premiumChange: number;
    coverageChanges?: Record<string, any>;
  }): Promise<Endorsement> {
    const response = await api.post(`/policies/${policyId}/endorsements`, endorsementData);
    return response.data;
  },

  // Get policy endorsements
  async getPolicyEndorsements(policyId: string): Promise<Endorsement[]> {
    const response = await api.get(`/policies/${policyId}/endorsements`);
    return response.data;
  },

  // Get policy payments
  async getPolicyPayments(policyId: string): Promise<Payment[]> {
    const response = await api.get(`/policies/${policyId}/payments`);
    return response.data;
  },

  // Record payment
  async recordPayment(policyId: string, paymentData: {
    amount: number;
    method: string;
    transactionId?: string;
    paidDate?: string;
  }): Promise<Payment> {
    const response = await api.post(`/policies/${policyId}/payments`, paymentData);
    return response.data;
  },

  // Get policy documents
  async getPolicyDocuments(policyId: string): Promise<PolicyDocument[]> {
    const response = await api.get(`/policies/${policyId}/documents`);
    return response.data;
  },

  // Upload policy document
  async uploadPolicyDocument(policyId: string, file: File, metadata?: {
    name?: string;
    type?: string;
    description?: string;
  }): Promise<PolicyDocument> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await api.post(`/policies/${policyId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Calculate premium
  async calculatePremium(calculationData: {
    policyType: string;
    coverageAmount: number;
    customerId: string;
    startDate: string;
    endDate: string;
    coverageDetails?: Record<string, any>;
  }): Promise<{
    premium: number;
    breakdown: Record<string, number>;
    factors: Record<string, any>;
  }> {
    const response = await api.post('/policies/calculate-premium', calculationData);
    return response.data;
  },

  // Get policy statistics
  async getPolicyStatistics(): Promise<{
    totalPolicies: number;
    activePolicies: number;
    totalPremium: number;
    averagePremium: number;
    policiesByType: Record<string, number>;
    policiesByStatus: Record<string, number>;
  }> {
    const response = await api.get('/policies/statistics');
    return response.data;
  },

  // Export policies to Excel
  async exportPolicies(filters?: PolicyFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/policies/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Bulk import policies
  async importPolicies(file: File): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/policies/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 