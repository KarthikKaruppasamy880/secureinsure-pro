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

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  customerId: string;
  customerName: string;
  claimType: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  amount: number;
  estimatedAmount: number;
  paidAmount: number;
  incidentDate: string;
  reportedDate: string;
  description: string;
  location: string;
  assignedTo: string;
  assignedToId: string;
  documents: ClaimDocument[];
  notes: ClaimNote[];
  timeline: ClaimTimeline[];
  fraudScore?: number;
  fraudIndicators?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClaimDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  verified: boolean;
  verificationDate?: string;
  verifiedBy?: string;
}

export interface ClaimNote {
  id: string;
  content: string;
  type: 'internal' | 'customer' | 'system';
  createdBy: string;
  createdAt: string;
  isPrivate: boolean;
}

export interface ClaimTimeline {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
  status: string;
  metadata?: Record<string, any>;
}

export interface CreateClaimRequest {
  policyId: string;
  claimType: string;
  incidentDate: string;
  description: string;
  location: string;
  estimatedAmount: number;
  documents?: File[];
}

export interface UpdateClaimRequest {
  status?: string;
  priority?: string;
  assignedToId?: string;
  amount?: number;
  description?: string;
  location?: string;
}

export interface ClaimFilters {
  status?: string;
  claimType?: string;
  priority?: string;
  assignedToId?: string;
  customerId?: string;
  policyId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  fraudScore?: number;
}

export const claimsService = {
  // Get all claims with optional filters
  async getClaims(filters?: ClaimFilters, page = 0, size = 20): Promise<{
    content: Claim[];
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

    const response = await api.get(`/claims?${params.toString()}`);
    return response.data;
  },

  // Get claim by ID
  async getClaimById(claimId: string): Promise<Claim> {
    const response = await api.get(`/claims/${claimId}`);
    return response.data;
  },

  // Get claim by claim number
  async getClaimByNumber(claimNumber: string): Promise<Claim> {
    const response = await api.get(`/claims/number/${claimNumber}`);
    return response.data;
  },

  // Create new claim
  async createClaim(claimData: CreateClaimRequest): Promise<Claim> {
    const formData = new FormData();
    formData.append('claimData', JSON.stringify({
      policyId: claimData.policyId,
      claimType: claimData.claimType,
      incidentDate: claimData.incidentDate,
      description: claimData.description,
      location: claimData.location,
      estimatedAmount: claimData.estimatedAmount,
    }));

    if (claimData.documents) {
      claimData.documents.forEach((file, index) => {
        formData.append(`documents`, file);
      });
    }

    const response = await api.post('/claims', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update claim
  async updateClaim(claimId: string, claimData: UpdateClaimRequest): Promise<Claim> {
    const response = await api.put(`/claims/${claimId}`, claimData);
    return response.data;
  },

  // Delete claim
  async deleteClaim(claimId: string): Promise<void> {
    await api.delete(`/claims/${claimId}`);
  },

  // Assign claim to adjuster
  async assignClaim(claimId: string, adjusterId: string): Promise<Claim> {
    const response = await api.post(`/claims/${claimId}/assign`, { adjusterId });
    return response.data;
  },

  // Update claim status
  async updateClaimStatus(claimId: string, status: string, reason?: string): Promise<Claim> {
    const response = await api.post(`/claims/${claimId}/status`, { status, reason });
    return response.data;
  },

  // Approve claim
  async approveClaim(claimId: string, approvalData: {
    approvedAmount: number;
    notes?: string;
    paymentMethod?: string;
  }): Promise<Claim> {
    const response = await api.post(`/claims/${claimId}/approve`, approvalData);
    return response.data;
  },

  // Reject claim
  async rejectClaim(claimId: string, rejectionData: {
    reason: string;
    notes?: string;
  }): Promise<Claim> {
    const response = await api.post(`/claims/${claimId}/reject`, rejectionData);
    return response.data;
  },

  // Process payment
  async processPayment(claimId: string, paymentData: {
    amount: number;
    method: string;
    transactionId?: string;
    notes?: string;
  }): Promise<Claim> {
    const response = await api.post(`/claims/${claimId}/payment`, paymentData);
    return response.data;
  },

  // Upload claim document
  async uploadClaimDocument(claimId: string, file: File, metadata?: {
    name?: string;
    type?: string;
    description?: string;
  }): Promise<ClaimDocument> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await api.post(`/claims/${claimId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get claim documents
  async getClaimDocuments(claimId: string): Promise<ClaimDocument[]> {
    const response = await api.get(`/claims/${claimId}/documents`);
    return response.data;
  },

  // Verify claim document
  async verifyClaimDocument(claimId: string, documentId: string, verificationData: {
    verified: boolean;
    notes?: string;
  }): Promise<ClaimDocument> {
    const response = await api.post(`/claims/${claimId}/documents/${documentId}/verify`, verificationData);
    return response.data;
  },

  // Add claim note
  async addClaimNote(claimId: string, noteData: {
    content: string;
    type: 'internal' | 'customer' | 'system';
    isPrivate?: boolean;
  }): Promise<ClaimNote> {
    const response = await api.post(`/claims/${claimId}/notes`, noteData);
    return response.data;
  },

  // Get claim notes
  async getClaimNotes(claimId: string): Promise<ClaimNote[]> {
    const response = await api.get(`/claims/${claimId}/notes`);
    return response.data;
  },

  // Get claim timeline
  async getClaimTimeline(claimId: string): Promise<ClaimTimeline[]> {
    const response = await api.get(`/claims/${claimId}/timeline`);
    return response.data;
  },

  // Run fraud detection
  async runFraudDetection(claimId: string): Promise<{
    fraudScore: number;
    indicators: string[];
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    const response = await api.post(`/claims/${claimId}/fraud-detection`);
    return response.data;
  },

  // Get fraud analysis
  async getFraudAnalysis(claimId: string): Promise<{
    fraudScore: number;
    indicators: string[];
    riskLevel: string;
    analysisDate: string;
    analyzedBy: string;
  }> {
    const response = await api.get(`/claims/${claimId}/fraud-analysis`);
    return response.data;
  },

  // Get claims statistics
  async getClaimsStatistics(): Promise<{
    totalClaims: number;
    openClaims: number;
    totalAmount: number;
    averageAmount: number;
    claimsByStatus: Record<string, number>;
    claimsByType: Record<string, number>;
    claimsByPriority: Record<string, number>;
    averageProcessingTime: number;
  }> {
    const response = await api.get('/claims/statistics');
    return response.data;
  },

  // Export claims to Excel
  async exportClaims(filters?: ClaimFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/claims/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Bulk import claims
  async importClaims(file: File): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/claims/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get claims by policy
  async getClaimsByPolicy(policyId: string): Promise<Claim[]> {
    const response = await api.get(`/claims/policy/${policyId}`);
    return response.data;
  },

  // Get claims by customer
  async getClaimsByCustomer(customerId: string): Promise<Claim[]> {
    const response = await api.get(`/claims/customer/${customerId}`);
    return response.data;
  },
}; 