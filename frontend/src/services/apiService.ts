import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface CaseSetupData {
  language: string;
  policyNumber: string;
  applicationStateOfSigning: string;
  applicationSigningDate: string;
  dateReceived: string;
  productType: string;
  planName: string;
  amountOfCoverageAppliedFor: number;
  restrictedView: boolean;
  zinniaCaseId: string;
  priority: string;
  submission: string;
  deathBenefit: number;
  lifeInsuranceQualificationTest: string;
  rateClassAppliedFor: string;
  insuranceAgeBasis: string;
  insuranceAgeEffectiveDate: string;
  group?: string;
}

interface InsuredData {
  insuredType: string;
  name: string;
  dateOfBirth: string;
  age: number;
  countryIfBornOutsideUS?: string;
  usStateOfBirth?: string;
  gender: string;
  ssn: string;
  driversLicenseNumber?: string;
  issuingState?: string;
  usPassportNumber?: string;
  stateIssuedIdNumber?: string;
  state: string;
  streetAddress1: string;
  streetAddress2?: string;
  country: string;
  city: string;
  zip: string;
  employmentStatus: string;
  occupation: string;
  annualHouseholdIncome: number;
  personalAnnualIncome: number;
  mobilePhone: string;
  emailAddress: string;
}

interface BeneficiaryData {
  primaryBeneficiaryName: string;
  primaryBeneficiaryRelationship: string;
  primaryBeneficiaryPercentage: number;
  primaryBeneficiaryDateOfBirth: string;
  primaryBeneficiarySsn: string;
  secondaryBeneficiaryName?: string;
  secondaryBeneficiaryRelationship?: string;
  secondaryBeneficiaryPercentage?: number;
}

interface OwnerData {
  ownerName: string;
  ownerRelationshipToInsured: string;
  ownerDateOfBirth: string;
  ownerSsn: string;
  ownerAddress: string;
  ownerCity: string;
  ownerState: string;
  ownerZip: string;
}

interface PayorData {
  payorName?: string;
  payorRelationshipToInsured?: string;
  payorDateOfBirth?: string;
  payorSsn?: string;
  paymentMethod: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
}

interface MedicalData {
  height: string;
  weight: number;
  bloodType?: string;
  currentMedications?: string;
  medicalConditions?: string;
  familyMedicalHistory?: string;
  lastPhysicalExam?: string;
  physicianName?: string;
}

interface PremiumData {
  premiumPaymentFrequency: string;
  premiumAmount: number;
  premiumStartDate: string;
  premiumDueDate: string;
  gracePeriod: string;
  automaticPayment: boolean;
}

class ApiService {
  public async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }

  // Case Setup API
  async updateCaseSetup(caseId: string, data: CaseSetupData): Promise<ApiResponse<any>> {
    const response = await this.makeRequest(`/api/v1/product/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success) {
      toast.success('Case Setup updated successfully');
    } else {
      toast.error(`Failed to update Case Setup: ${response.error}`);
    }

    return response;
  }

  // Insured API
  async updateInsured(caseId: string, data: InsuredData): Promise<ApiResponse<any>> {
    const response = await this.makeRequest(`/api/v1/party-info/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success) {
      toast.success('Insured information updated successfully');
    } else {
      toast.error(`Failed to update Insured information: ${response.error}`);
    }

    return response;
  }

  // Beneficiary API
  async updateBeneficiary(caseId: string, data: BeneficiaryData): Promise<ApiResponse<any>> {
    const response = await this.makeRequest(`/api/v1/beneficiary/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success) {
      toast.success('Beneficiary information updated successfully');
    } else {
      toast.error(`Failed to update Beneficiary information: ${response.error}`);
    }

    return response;
  }

  // Owner API
  async updateOwner(caseId: string, data: OwnerData): Promise<ApiResponse<any>> {
    const response = await this.makeRequest(`/api/v1/owner/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success) {
      toast.success('Owner information updated successfully');
    } else {
      toast.error(`Failed to update Owner information: ${response.error}`);
    }

    return response;
  }

  // Payor API
  async updatePayor(caseId: string, data: PayorData): Promise<ApiResponse<any>> {
    const response = await this.makeRequest(`/api/v1/payor/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success) {
      toast.success('Payor information updated successfully');
    } else {
      toast.error(`Failed to update Payor information: ${response.error}`);
    }

    return response;
  }

  // Medical Information API
  async updateMedical(caseId: string, data: MedicalData): Promise<ApiResponse<any>> {
    const response = await this.makeRequest(`/api/v1/medical/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success) {
      toast.success('Medical information updated successfully');
    } else {
      toast.error(`Failed to update Medical information: ${response.error}`);
    }

    return response;
  }

  // Premium Mode API
  async updatePremium(caseId: string, data: PremiumData): Promise<ApiResponse<any>> {
    const response = await this.makeRequest(`/api/v1/premium/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success) {
      toast.success('Premium information updated successfully');
    } else {
      toast.error(`Failed to update Premium information: ${response.error}`);
    }

    return response;
  }

  // Get case by ID
  async getCase(caseId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/v1/cases/${caseId}`);
  }

  // Get all cases
  async getCases(filters?: Record<string, any>): Promise<ApiResponse<any[]>> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const endpoint = queryParams ? `/api/v1/cases?${queryParams}` : '/api/v1/cases';
    return this.makeRequest(endpoint);
  }

  // Create new case
  async createCase(data: any): Promise<ApiResponse<any>> {
    const response = await this.makeRequest('/api/v1/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success) {
      toast.success('Case created successfully');
    } else {
      toast.error(`Failed to create case: ${response.error}`);
    }

    return response;
  }

  // Delete case
  async deleteCase(caseId: string): Promise<ApiResponse<any>> {
    const response = await this.makeRequest(`/api/v1/cases/${caseId}`, {
      method: 'DELETE',
    });

    if (response.success) {
      toast.success('Case deleted successfully');
    } else {
      toast.error(`Failed to delete case: ${response.error}`);
    }

    return response;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.makeRequest('/actuator/health');
  }

  // Upload document
  async uploadDocument(caseId: string, file: File, documentType: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await this.makeRequest(`/api/v1/cases/${caseId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    if (response.success) {
      toast.success('Document uploaded successfully');
    } else {
      toast.error(`Failed to upload document: ${response.error}`);
    }

    return response;
  }

  // Get documents for a case
  async getDocuments(caseId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest(`/api/v1/cases/${caseId}/documents`);
  }

  // Delete document
  async deleteDocument(caseId: string, documentId: string): Promise<ApiResponse<any>> {
    const response = await this.makeRequest(`/api/v1/cases/${caseId}/documents/${documentId}`, {
      method: 'DELETE',
    });

    if (response.success) {
      toast.success('Document deleted successfully');
    } else {
      toast.error(`Failed to delete document: ${response.error}`);
    }

    return response;
  }
}

export const apiService = new ApiService();
export default apiService;

