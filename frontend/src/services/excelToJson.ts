import * as XLSX from 'xlsx';

export interface InsuranceField {
  fieldName: string;
  fieldLevel1: string;
  fieldLevel2: string;
  fieldLevel3: string;
  fieldLevel4: string;
  type: string;
  format: string;
  length: number;
  mandatory: boolean;
  validations: string[];
  helpText: string;
  businessRules: string[];
  xpath: string;
  table: string;
  column: string;
  commentary: string;
  sheet: string;
}

export interface InsuranceFieldConfig {
  sheets: {
    [sheetName: string]: {
      fields: InsuranceField[];
      metadata: {
        totalFields: number;
        mandatoryFields: number;
        optionalFields: number;
      };
    };
  };
  version: string;
  generatedAt: string;
  sourceFile: string;
}

const EXPECTED_SHEETS = [
  'Case Setup',
  'Insured',
  'Benefit and Riders',
  'Beneficiary',
  'Owner',
  'Payor',
  'Secondary Address',
  'Life Insurance History',
  'Premium Mood'
];

export class ExcelToJsonService {
  private workbook: XLSX.WorkBook | null = null;
  private parsedData: InsuranceFieldConfig | null = null;

  /**
   * Parse the TPP Excel file and convert to JSON configuration
   */
  async parseExcelFile(file: File): Promise<InsuranceFieldConfig> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      this.workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const config: InsuranceFieldConfig = {
        sheets: {},
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        sourceFile: file.name
      };

      // Process each expected sheet
      for (const sheetName of EXPECTED_SHEETS) {
        const worksheet = this.workbook.Sheets[sheetName];
        if (worksheet) {
          const fields = this.parseSheet(worksheet, sheetName);
          const metadata = this.calculateMetadata(fields);
          
          config.sheets[sheetName] = {
            fields,
            metadata
          };
        }
      }

      this.parsedData = config;
      return config;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse individual sheet and extract field information
   */
  private parseSheet(worksheet: XLSX.WorkSheet, sheetName: string): InsuranceField[] {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    const fields: InsuranceField[] = [];

    if (jsonData.length < 2) return fields;

    // Find header row (look for field level headers)
    const headerRowIndex = this.findHeaderRow(jsonData);
    if (headerRowIndex === -1) return fields;

    const headers = jsonData[headerRowIndex];
    const dataRows = jsonData.slice(headerRowIndex + 1);

    // Process each data row
    for (const row of dataRows) {
      if (this.isValidDataRow(row, headers)) {
        const field = this.parseFieldRow(row, headers, sheetName);
        if (field) {
          fields.push(field);
        }
      }
    }

    return fields;
  }

  /**
   * Find the header row by looking for field level columns
   */
  private findHeaderRow(data: any[][]): number {
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (row && this.hasFieldLevelHeaders(row)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Check if a row contains field level headers
   */
  private hasFieldLevelHeaders(row: any[]): boolean {
    if (!row || row.length < 3) return false;
    
    const rowText = row.map(cell => String(cell || '').toLowerCase());
    return rowText.some(cell => 
      cell.includes('field level') || 
      cell.includes('type') || 
      cell.includes('format') ||
      cell.includes('mandatory')
    );
  }

  /**
   * Check if a data row is valid (has meaningful content)
   */
  private isValidDataRow(row: any[], headers: any[]): boolean {
    if (!row || row.length < headers.length) return false;
    
    // Check if row has at least one non-empty field level value
    const fieldLevelIndices = this.getFieldLevelIndices(headers);
    return fieldLevelIndices.some(index => 
      row[index] && String(row[index]).trim().length > 0
    );
  }

  /**
   * Get indices of field level columns
   */
  private getFieldLevelIndices(headers: any[]): number[] {
    const indices: number[] = [];
    headers.forEach((header, index) => {
      const headerText = String(header || '').toLowerCase();
      if (headerText.includes('field level')) {
        indices.push(index);
      }
    });
    return indices;
  }

  /**
   * Parse a single field row
   */
  private parseFieldRow(row: any[], headers: any[], sheetName: string): InsuranceField | null {
    try {
      const field: InsuranceField = {
        fieldName: '',
        fieldLevel1: '',
        fieldLevel2: '',
        fieldLevel3: '',
        fieldLevel4: '',
        type: '',
        format: '',
        length: 0,
        mandatory: false,
        validations: [],
        helpText: '',
        businessRules: [],
        xpath: '',
        table: '',
        column: '',
        commentary: '',
        sheet: sheetName
      };

      // Map headers to field properties
      headers.forEach((header, index) => {
        const headerText = String(header || '').toLowerCase();
        const value = row[index] || '';

        if (headerText.includes('field level-1')) {
          field.fieldLevel1 = String(value);
          field.fieldName = String(value);
        } else if (headerText.includes('field level-2')) {
          field.fieldLevel2 = String(value);
        } else if (headerText.includes('field level-3')) {
          field.fieldLevel3 = String(value);
        } else if (headerText.includes('field level-4')) {
          field.fieldLevel4 = String(value);
        } else if (headerText.includes('type')) {
          field.type = String(value);
        } else if (headerText.includes('format')) {
          field.format = String(value);
        } else if (headerText.includes('length')) {
          field.length = this.parseLength(value);
        } else if (headerText.includes('mandatory')) {
          field.mandatory = this.parseMandatory(value);
        } else if (headerText.includes('validation')) {
          field.validations = this.parseValidations(value);
        } else if (headerText.includes('help text')) {
          field.helpText = String(value);
        } else if (headerText.includes('business rule')) {
          field.businessRules = this.parseBusinessRules(value);
        } else if (headerText.includes('xpath')) {
          field.xpath = String(value);
        } else if (headerText.includes('table')) {
          field.table = String(value);
        } else if (headerText.includes('column')) {
          field.column = String(value);
        } else if (headerText.includes('commentary')) {
          field.commentary = String(value);
        }
      });

      // Only return field if it has at least a field name
      return field.fieldName ? field : null;
    } catch (error) {
      console.warn('Error parsing field row:', error, row);
      return null;
    }
  }

  /**
   * Parse length value
   */
  private parseLength(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Parse mandatory value
   */
  private parseMandatory(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return lower === 'yes' || lower === 'true' || lower === '1' || lower === 'mandatory';
    }
    return false;
  }

  /**
   * Parse validations
   */
  private parseValidations(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') {
      return value.split(/[,;|]/).map(v => v.trim()).filter(v => v.length > 0);
    }
    return [];
  }

  /**
   * Parse business rules
   */
  private parseBusinessRules(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') {
      return value.split(/[,;|]/).map(v => v.trim()).filter(v => v.length > 0);
    }
    return [];
  }

  /**
   * Calculate metadata for a sheet
   */
  private calculateMetadata(fields: InsuranceField[]) {
    const mandatoryFields = fields.filter(f => f.mandatory).length;
    const optionalFields = fields.length - mandatoryFields;

    return {
      totalFields: fields.length,
      mandatoryFields,
      optionalFields
    };
  }

  /**
   * Export configuration to JSON file
   */
  exportToJson(config: InsuranceFieldConfig, filename: string = 'insuranceFields.json'): void {
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Get parsed data
   */
  getParsedData(): InsuranceFieldConfig | null {
    return this.parsedData;
  }

  /**
   * Validate configuration
   */
  validateConfiguration(config: InsuranceFieldConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.sheets || Object.keys(config.sheets).length === 0) {
      errors.push('No sheets found in configuration');
    }

    for (const [sheetName, sheetData] of Object.entries(config.sheets)) {
      if (!sheetData.fields || sheetData.fields.length === 0) {
        errors.push(`Sheet '${sheetName}' has no fields`);
        continue;
      }

      // Validate required fields
      const requiredFields = sheetData.fields.filter(f => f.mandatory);
      for (const field of requiredFields) {
        if (!field.fieldName) {
          errors.push(`Field in sheet '${sheetName}' missing field name`);
        }
        if (!field.type) {
          errors.push(`Field '${field.fieldName}' in sheet '${sheetName}' missing type`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const excelToJsonService = new ExcelToJsonService(); 