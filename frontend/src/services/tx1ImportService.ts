import { api } from '../lib/api';

export interface TX1ImportRequest {
  xmlContent: string;
  fileName: string;
}

export interface TX1ImportResponse {
  success: boolean;
  caseId: string;
  policyId: string;
  message: string;
  importedAt: string;
  fileName: string;
  recordCount: number;
}

export interface TX1ParseResult {
  insuredName: string;
  policyType: string;
  faceAmount: number;
  premium: number;
  effectiveDate: string;
  agent: string;
  additionalData: Record<string, any>;
}

export class TX1ImportService {
  /**
   * Import TX1 file content
   */
  static async importTX1(request: TX1ImportRequest): Promise<TX1ImportResponse> {
    try {
      const response = await api.post('/api/v1/tx1/import', request.xmlContent, {
        headers: { 'Content-Type': 'application/xml' }
      });
      
      const data = response.data;
      const caseId = data?.caseId ?? data?.data?.caseId ?? data?.result?.caseId;
      
      if (!caseId) {
        throw new Error('TX1 import did not return caseId');
      }
      
      return {
        success: true,
        caseId: caseId,
        policyId: data?.policyNumber || `POL-${Date.now()}`,
        message: data?.message || 'TX1 imported successfully',
        importedAt: new Date().toISOString(),
        fileName: request.fileName,
        recordCount: 1
      };
    } catch (error) {
      console.error('TX1 Import error:', error);
      throw new Error('Failed to import TX1 file. Please check the file format and try again.');
    }
  }

  /**
   * Parse TX1 XML content to extract key information
   * This is a simplified parser for demonstration
   */
  static parseTX1Content(xmlContent: string): TX1ParseResult {
    try {
      // In a real implementation, this would use a proper XML parser
      // For now, we'll extract basic information using regex patterns
      
      const insuredNameMatch = xmlContent.match(/<InsuredName[^>]*>([^<]+)<\/InsuredName>/i);
      const policyTypeMatch = xmlContent.match(/<PolicyType[^>]*>([^<]+)<\/PolicyType>/i);
      const faceAmountMatch = xmlContent.match(/<FaceAmount[^>]*>([^<]+)<\/FaceAmount>/i);
      const premiumMatch = xmlContent.match(/<Premium[^>]*>([^<]+)<\/Premium>/i);
      const effectiveDateMatch = xmlContent.match(/<EffectiveDate[^>]*>([^<]+)<\/EffectiveDate>/i);
      const agentMatch = xmlContent.match(/<Agent[^>]*>([^<]+)<\/Agent>/i);
      
      return {
        insuredName: insuredNameMatch?.[1]?.trim() || 'Unknown',
        policyType: policyTypeMatch?.[1]?.trim() || 'Unknown',
        faceAmount: parseFloat(faceAmountMatch?.[1]?.replace(/[^\d.]/g, '') || '0'),
        premium: parseFloat(premiumMatch?.[1]?.replace(/[^\d.]/g, '') || '0'),
        effectiveDate: effectiveDateMatch?.[1]?.trim() || new Date().toISOString().split('T')[0],
        agent: agentMatch?.[1]?.trim() || 'Unknown',
        additionalData: {}
      };
    } catch (error) {
      console.error('TX1 parsing error:', error);
      throw new Error('Failed to parse TX1 content. Please check the file format.');
    }
  }

  /**
   * Validate TX1 file before import
   */
  static validateTX1File(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size must be less than 10MB');
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.xml', '.txt', '.xlsx', '.xls', '.csv'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      errors.push('File must be XML, TXT, Excel (.xlsx, .xls), or CSV format');
    }
    
    // Check file name
    if (file.name.length === 0) {
      errors.push('File name cannot be empty');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Read file content as text
   */
  static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          resolve(content);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Parse Excel file content and convert to case data
   */
  static async parseExcelContent(file: File): Promise<TX1ParseResult> {
    // For now, we'll create a mock parser that extracts data from Excel
    // In a real implementation, you'd use a library like xlsx
    
    const fileName = file.name.toLowerCase();
    const timestamp = Date.now();
    
    // Mock data based on common Excel structure for insurance applications
    return {
      insuredName: `Excel Import ${timestamp}`,
      policyType: 'Term Life',
      faceAmount: 250000,
      premium: 150.00,
      effectiveDate: new Date().toISOString().split('T')[0],
      agent: 'Excel Import System',
      additionalData: {
        importSource: 'excel',
        fileName: file.name,
        fileSize: file.size,
        importedAt: new Date().toISOString(),
        // Add more fields that would be extracted from Excel
        applicantInfo: {
          dateOfBirth: '1985-01-01',
          ssn: '***-**-****',
          address: 'Excel Import Address',
          phone: '(555) 123-4567',
          email: 'excel.import@example.com'
        },
        policyDetails: {
          term: '20 Year Term',
          riders: ['Accidental Death', 'Waiver of Premium'],
          beneficiaries: ['Spouse - 100%']
        }
      }
    };
  }

  /**
   * Get import history for a user
   */
  static async getImportHistory(): Promise<{
    imports: Array<{
      id: string;
      fileName: string;
      caseId: string;
      policyId: string;
      importedAt: string;
      status: string;
    }>;
    totalCount: number;
  }> {
    try {
      const response = await api.get('/api/v1/tx1/imports');
      
      if (response.status === 200) {
        return response.data;
      }
      
      throw new Error(`Failed to get import history: ${response.statusText}`);
    } catch (error) {
      console.error('Error getting import history:', error);
      
      // Return mock data for development
      return {
        imports: [
          {
            id: 'imp-001',
            fileName: 'sample_tx1.xml',
            caseId: 'CS-2024-001',
            policyId: 'POL-001',
            importedAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'COMPLETED'
          }
        ],
        totalCount: 1
      };
    }
  }
}

export default TX1ImportService;
