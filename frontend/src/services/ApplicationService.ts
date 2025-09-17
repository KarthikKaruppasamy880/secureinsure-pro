import { api } from '../lib/api';

export class ApplicationService {
  static async loadApplication(caseId: string) {
    if (!caseId) return null;
    try {
      const { data } = await api.get(`/api/v1/cases/${encodeURIComponent(caseId)}/application`);
      return data ?? null;
    } catch (e: any) {
      console.error('Error loading application:', e?.message || e);
      return null;
    }
  }

  static async saveSection(sectionData: {
    caseId: string;
    section: string;
    data?: any;
  }) {
    try {
      const { data } = await api.post(`/api/v1/cases/${encodeURIComponent(sectionData.caseId)}/sections/${sectionData.section}`, sectionData.data);
      return { success: true, data };
    } catch (e: any) {
      console.error('Error saving section:', e?.message || e);
      return { success: false, error: e?.message || e };
    }
  }

  static validateSection(sectionName: string, sectionData: any) {
    // Basic validation logic
    const errors: string[] = [];
    
    if (sectionName === 'Insured') {
      if (!sectionData['Insured Name']) {
        errors.push('Insured Name is required');
      }
      if (!sectionData['Age']) {
        errors.push('Age is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: sectionData
    };
  }

  static async getByCaseId(caseId: string) {
    return this.loadApplication(caseId);
  }
}

// Export individual functions for backward compatibility
export async function getByCaseId(caseId: string) {
  return ApplicationService.getByCaseId(caseId);
}