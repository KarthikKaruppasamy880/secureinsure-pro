import * as XLSX from 'xlsx';
import { normalizeHeader } from '../config/fieldDictionary';

export interface InsuranceField {
  section: string;
  subsection?: string;
  fieldName: string;
  fieldType: string;
  required: boolean;
  helpText?: string;
  validation?: string;
  businessRules?: string;
  order: number;
}

export interface ParsedSheet {
  name: string;
  fields: InsuranceField[];
}

export class TPPExcelParser {
  private workbook: XLSX.WorkBook | null = null;
  private fieldOrder = 0;

  async parseExcelFile(filePath: string): Promise<InsuranceField[]> {
    try {
      // For browser environment, we'll need to handle file input differently
      // This assumes the file is already available in the public folder
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();
      
      this.workbook = XLSX.read(arrayBuffer, { type: 'array' });
      this.fieldOrder = 0;
      
      const allFields: InsuranceField[] = [];
      
      // Parse Case Setup sheet
      const caseSetupFields = this.parseSheet('Case Setup', allFields);
      allFields.push(...caseSetupFields);
      
      // Parse Insured sheet
      const insuredFields = this.parseSheet('Insured', allFields);
      allFields.push(...insuredFields);
      
      return allFields;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error(`Failed to parse Excel file: ${error}`);
    }
  }

  public parseSheet(sheetName: string, existingFields: InsuranceField[]): InsuranceField[] {
    if (!this.workbook) {
      throw new Error('Workbook not loaded');
    }

    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) {
      console.warn(`Sheet '${sheetName}' not found`);
      return [];
    }

    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const fields: InsuranceField[] = [];

    // Find header row (usually first row with field names)
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      const row = jsonData[i] as string[];
      if (row && row.some(cell => cell && typeof cell === 'string' && 
          (cell.toLowerCase().includes('field') || 
           cell.toLowerCase().includes('name') || 
           cell.toLowerCase().includes('label')))) {
        headerRowIndex = i;
        break;
      }
    }

    const headers = jsonData[headerRowIndex] as string[];
    if (!headers) {
      console.warn(`No headers found in sheet '${sheetName}'`);
      return [];
    }

    // Process each column
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const header = headers[colIndex];
      if (!header || typeof header !== 'string') continue;

      // Normalize the header using our dictionary
      const normalizedHeader = normalizeHeader(header);
      
      // Skip if this field was already processed (avoid duplicates)
      if (existingFields.some(field => field.fieldName === normalizedHeader)) {
        continue;
      }

      // Determine field type and other properties
      const fieldType = this.determineFieldType(normalizedHeader, sheetName);
      const required = this.isRequiredField(normalizedHeader);
      const helpText = this.extractHelpText(jsonData, headerRowIndex, colIndex);
      const validation = this.extractValidation(normalizedHeader);
      const businessRules = this.extractBusinessRules(jsonData, headerRowIndex, colIndex);

      const field: InsuranceField = {
        section: sheetName,
        subsection: this.getSubsection(normalizedHeader, sheetName),
        fieldName: normalizedHeader,
        fieldType,
        required,
        helpText,
        validation,
        businessRules,
        order: this.fieldOrder++
      };

      fields.push(field);
    }

    return fields;
  }

  public determineFieldType(fieldName: string, section: string): string {
    const lowerFieldName = fieldName.toLowerCase();
    
    if (lowerFieldName.includes('date') || lowerFieldName.includes('dob')) {
      return 'date';
    }
    if (lowerFieldName.includes('email')) {
      return 'email';
    }
    if (lowerFieldName.includes('phone') || lowerFieldName.includes('mobile')) {
      return 'tel';
    }
    if (lowerFieldName.includes('ssn')) {
      return 'ssn';
    }
    if (lowerFieldName.includes('zip') || lowerFieldName.includes('postal')) {
      return 'zip';
    }
    if (lowerFieldName.includes('amount') || lowerFieldName.includes('income')) {
      return 'currency';
    }
    if (lowerFieldName.includes('age')) {
      return 'number';
    }
    if (lowerFieldName.includes('gender') || lowerFieldName.includes('type') || 
        lowerFieldName.includes('state') || lowerFieldName.includes('country')) {
      return 'select';
    }
    if (lowerFieldName.includes('name')) {
      return 'text';
    }
    
    return 'text'; // default
  }

  public isRequiredField(fieldName: string): boolean {
    const requiredFields = [
      'Name', 'Date of Birth', 'SSN', 'Email Address', 'Mobile Phone',
      'Street Address 1', 'City', 'State', 'Zip', 'Country'
    ];
    return requiredFields.some(req => fieldName.toLowerCase().includes(req.toLowerCase()));
  }

  public getSubsection(fieldName: string, section: string): string | undefined {
    if (section !== 'Insured') return undefined;
    
    const personalInfo = ['Name', 'Date of Birth', 'Age', 'Gender', 'SSN'];
    const drivingInfo = ['Driver\'s License Number', 'Issuing State', 'U.S. Passport Number'];
    const addressInfo = ['Street Address 1', 'Street Address 2', 'City', 'State', 'Zip', 'Country'];
    const employmentInfo = ['Occupation', 'Annual Household Income', 'Personal Annual Income'];
    const contactInfo = ['Mobile Phone', 'Email Address'];
    
    if (personalInfo.some(field => fieldName.includes(field))) {
      return 'Personal Information';
    }
    if (drivingInfo.some(field => fieldName.includes(field))) {
      return 'Driving Information';
    }
    if (addressInfo.some(field => fieldName.includes(field))) {
      return 'Address Information';
    }
    if (employmentInfo.some(field => fieldName.includes(field))) {
      return 'Employment Information';
    }
    if (contactInfo.some(field => fieldName.includes(field))) {
      return 'Contact Information';
    }
    
    return undefined;
  }

  public extractHelpText(jsonData: any[][], headerRowIndex: number, colIndex: number): string | undefined {
    // Look for help text in rows below the header
    for (let rowIndex = headerRowIndex + 1; rowIndex < Math.min(headerRowIndex + 5, jsonData.length); rowIndex++) {
      const row = jsonData[rowIndex];
      if (row && row[colIndex] && typeof row[colIndex] === 'string') {
        const cellValue = row[colIndex].toString().trim();
        if (cellValue && cellValue.length > 0 && cellValue.length < 200) {
          return cellValue;
        }
      }
    }
    return undefined;
  }

  public extractValidation(fieldName: string): string | undefined {
    const lowerFieldName = fieldName.toLowerCase();
    
    if (lowerFieldName.includes('email')) {
      return 'email';
    }
    if (lowerFieldName.includes('phone')) {
      return 'phone';
    }
    if (lowerFieldName.includes('ssn')) {
      return 'ssn';
    }
    if (lowerFieldName.includes('zip')) {
      return 'zip';
    }
    if (lowerFieldName.includes('date')) {
      return 'date';
    }
    
    return undefined;
  }

  public extractBusinessRules(jsonData: any[][], headerRowIndex: number, colIndex: number): string | undefined {
    // Look for business rules in rows below the header
    for (let rowIndex = headerRowIndex + 1; rowIndex < Math.min(headerRowIndex + 10, jsonData.length); rowIndex++) {
      const row = jsonData[rowIndex];
      if (row && row[colIndex] && typeof row[colIndex] === 'string') {
        const cellValue = row[colIndex].toString().trim();
        if (cellValue && cellValue.length > 10 && cellValue.length < 500) {
          return cellValue;
        }
      }
    }
    return undefined;
  }

  async generateInsuranceFieldsJson(): Promise<string> {
    try {
      const fields = await this.parseExcelFile('/TPP - Field Appendix - FormalCase-New Product -IUL.xlsx');
      
      // Sort fields by section and order
      const sortedFields = fields.sort((a, b) => {
        if (a.section !== b.section) {
          return a.section.localeCompare(b.section);
        }
        if (a.subsection !== b.subsection) {
          return (a.subsection || '').localeCompare(b.subsection || '');
        }
        return a.order - b.order;
      });

      const jsonContent = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        fields: sortedFields
      };

      return JSON.stringify(jsonContent, null, 2);
    } catch (error) {
      console.error('Error generating insurance fields JSON:', error);
      throw error;
    }
  }
}

export default TPPExcelParser;
