import { api } from '../lib/api';

export interface LabRequestData {
  caseId: string;
  caseNumber: string;
  zinniaCaseId: string;
  policyNumber?: string;
  insuredFirstName: string;
  insuredLastName: string;
  insuredDateOfBirth: string;
  insuredAge: number;
  insuredGender: string;
  insuredSsn: string;
  insuredEmail: string;
  insuredPhone: string;
  insuredAddress: string;
  insuredCity: string;
  insuredState: string;
  insuredZip: string;
  labType: string;
  urgency: 'Standard' | 'Rush' | 'Stat';
  specialInstructions?: string;
  physicianName: string;
  physicianPhone: string;
  physicianEmail: string;
}

export interface LabRequestResponse {
  success: boolean;
  requestId: string;
  message: string;
  estimatedCompletion?: string;
  labLocation?: string;
}

export interface LabResult {
  testName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  collectedAt: string;
  completedAt?: string;
  highlights: string[];
  notes?: string;
  physician: string;
  labLocation: string;
}

export interface LabResultsResponse {
  success: boolean;
  caseId: string;
  results: LabResult[];
  lastUpdated: string;
}

// Standalone functions for easier imports
export async function submitLabRequest(payload: LabRequestData): Promise<LabRequestResponse> {
  return ExamOneService.submitLabRequest(payload);
}

export async function getResults(caseId: string): Promise<LabResultsResponse> {
  return ExamOneService.getLabResults(caseId);
}

export class ExamOneService {
  /**
   * Submit a lab request to ExamOne
   */
  static async submitLabRequest(data: LabRequestData): Promise<LabRequestResponse> {
    try {
      const response = await api.post('/api/v1/examone/lab-request', data);
      
      if (response.status === 202 || response.status === 200) {
        return response.data;
      }
      
      throw new Error(`Failed to submit lab request: HTTP ${response.status}`);
    } catch (error) {
      console.error('Lab request error:', error);
      throw new Error('Failed to submit lab request. Please try again.');
    }
  }

  /**
   * Get lab results for a specific case
   */
  static async getLabResults(caseId: string): Promise<LabResultsResponse> {
    try {
      const response = await api.get('/api/v1/examone/results', { params: { caseId } });
      
      return response.data;
    } catch (error) {
      console.error('Lab results error:', error);
      throw new Error('Failed to retrieve lab results. Please try again.');
    }
  }

  /**
   * Get available lab test types
   */
  static getAvailableLabTests(): Array<{
    id: string;
    name: string;
    description: string;
    turnaroundTime: string;
    cost: number;
  }> {
    return [
      {
        id: 'COMPREHENSIVE_BLOOD',
        name: 'Comprehensive Blood Panel',
        description: 'Complete blood count, chemistry panel, lipid profile',
        turnaroundTime: '2-3 business days',
        cost: 150.00
      },
      {
        id: 'BASIC_METABOLIC',
        name: 'Basic Metabolic Panel',
        description: 'Glucose, BUN, creatinine, electrolytes',
        turnaroundTime: '1-2 business days',
        cost: 75.00
      },
      {
        id: 'LIPID_PROFILE',
        name: 'Lipid Profile',
        description: 'Total cholesterol, HDL, LDL, triglycerides',
        turnaroundTime: '1-2 business days',
        cost: 45.00
      },
      {
        id: 'HEPATITIS_SCREENING',
        name: 'Hepatitis Screening',
        description: 'Hepatitis A, B, C antibody testing',
        turnaroundTime: '3-5 business days',
        cost: 120.00
      },
      {
        id: 'HIV_SCREENING',
        name: 'HIV Screening',
        description: 'HIV antibody and antigen testing',
        turnaroundTime: '1-2 business days',
        cost: 85.00
      }
    ];
  }

  /**
   * Get lab locations near a specific address
   */
  static async getLabLocations(zipCode: string): Promise<Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    hours: string;
    distance: number;
  }>> {
    try {
      const response = await api.get('/api/v1/examone/locations', {
        params: { zipCode }
      });
      
      if (response.status === 200) {
        return response.data.items || response.data.locations || [];
      }
      
      throw new Error(`Failed to get lab locations: ${response.statusText}`);
    } catch (error) {
      console.error('Lab locations error:', error);
      
      // Return mock data for development
      return [
        {
          id: 'loc-001',
          name: 'ExamOne Lab Center - Downtown',
          address: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zip: '90210',
          phone: '(555) 123-4567',
          hours: 'Mon-Fri: 7AM-6PM, Sat: 8AM-2PM',
          distance: 2.1
        },
        {
          id: 'loc-002',
          name: 'ExamOne Lab Center - Westside',
          address: '456 Oak Avenue',
          city: 'Anytown',
          state: 'CA',
          zip: '90211',
          phone: '(555) 234-5678',
          hours: 'Mon-Fri: 8AM-5PM, Sat: 9AM-1PM',
          distance: 4.3
        }
      ];
    }
  }

  /**
   * Schedule a lab appointment
   */
  static async scheduleAppointment(requestId: string, locationId: string, appointmentDate: string, appointmentTime: string): Promise<{
    success: boolean;
    appointmentId: string;
    message: string;
    appointmentDate: string;
    appointmentTime: string;
    location: string;
  }> {
    try {
      const response = await api.post('/api/v1/examone/appointments', {
        requestId,
        locationId,
        appointmentDate,
        appointmentTime
      });
      
      if (response.status === 200) {
        return response.data;
      }
      
      throw new Error(`Failed to schedule appointment: ${response.statusText}`);
    } catch (error) {
      console.error('Appointment scheduling error:', error);
      throw new Error('Failed to schedule appointment. Please try again.');
    }
  }

  /**
   * Cancel a lab appointment
   */
  static async cancelAppointment(appointmentId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await api.delete(`/api/v1/examone/appointments/${appointmentId}`);
      
      if (response.status === 200) {
        return response.data;
      }
      
      throw new Error(`Failed to cancel appointment: ${response.statusText}`);
    } catch (error) {
      console.error('Appointment cancellation error:', error);
      throw new Error('Failed to cancel appointment. Please try again.');
    }
  }
}

export default ExamOneService;
