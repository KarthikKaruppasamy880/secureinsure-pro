export interface ExcelField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  section: string;
  subsection?: string;
  order: number;
  description?: string;
  defaultValue?: any;
}

export interface ExcelFormTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  fields: ExcelField[];
  sections: string[];
  metadata: {
    createdBy: string;
    createdAt: string;
    lastModified: string;
    totalFields: number;
    requiredFields: number;
  };
}

export interface ExcelImportResult {
  success: boolean;
  template?: ExcelFormTemplate;
  errors?: string[];
  warnings?: string[];
  stats: {
    totalRows: number;
    processedRows: number;
    skippedRows: number;
    fieldsDetected: number;
  };
}

export class ExcelFormService {
  /**
   * Process Excel file and generate form template
   */
  static async processExcelFile(file: File): Promise<ExcelImportResult> {
    try {
      const content = await this.readExcelFile(file);
      const template = this.generateFormTemplate(content, file.name);
      
      return {
        success: true,
        template,
        stats: {
          totalRows: content.length,
          processedRows: content.length,
          skippedRows: 0,
          fieldsDetected: template.fields.length
        }
      };
    } catch (error) {
      console.error('Excel processing error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        stats: {
          totalRows: 0,
          processedRows: 0,
          skippedRows: 0,
          fieldsDetected: 0
        }
      };
    }
  }

  /**
   * Read Excel file content
   */
  private static async readExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          // For now, we'll simulate Excel processing
          // In a real implementation, you'd use a library like SheetJS
          const mockData = this.generateMockExcelData();
          resolve(mockData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Generate form template from Excel data
   */
  private static generateFormTemplate(data: any[], fileName: string): ExcelFormTemplate {
    const fields: ExcelField[] = [];
    const sections = new Set<string>();
    
    // Process each row to extract field information
    data.forEach((row, index) => {
      if (row.fieldName && row.fieldType) {
        const field: ExcelField = {
          key: row.fieldKey || `field_${index}`,
          label: row.fieldName,
          type: this.mapFieldType(row.fieldType),
          required: row.required === 'true' || row.required === true,
          section: row.section || 'General',
          subsection: row.subsection,
          order: parseInt(row.order) || index,
          description: row.description,
          defaultValue: row.defaultValue
        };

        // Add validation rules
        if (row.validation) {
          field.validation = this.parseValidationRules(row.validation);
        }

        fields.push(field);
        sections.add(field.section);
      }
    });

    // Sort fields by order
    fields.sort((a, b) => a.order - b.order);

    return {
      id: `template_${Date.now()}`,
      name: fileName.replace(/\.[^/.]+$/, ''),
      description: `Auto-generated from ${fileName}`,
      version: '1.0.0',
      fields,
      sections: Array.from(sections).sort(),
      metadata: {
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        totalFields: fields.length,
        requiredFields: fields.filter(f => f.required).length
      }
    };
  }

  /**
   * Map Excel field types to form field types
   */
  private static mapFieldType(excelType: string): ExcelField['type'] {
    const typeMap: Record<string, ExcelField['type']> = {
      'text': 'text',
      'string': 'text',
      'number': 'number',
      'integer': 'number',
      'decimal': 'number',
      'date': 'date',
      'datetime': 'date',
      'select': 'select',
      'dropdown': 'select',
      'textarea': 'textarea',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'boolean': 'checkbox'
    };

    return typeMap[excelType.toLowerCase()] || 'text';
  }

  /**
   * Parse validation rules from Excel
   */
  private static parseValidationRules(validation: string): ExcelField['validation'] {
    const rules: ExcelField['validation'] = {};
    
    // Parse common validation patterns
    if (validation.includes('min:')) {
      const match = validation.match(/min:(\d+)/);
      if (match) rules.min = parseInt(match[1]);
    }
    
    if (validation.includes('max:')) {
      const match = validation.match(/max:(\d+)/);
      if (match) rules.max = parseInt(match[1]);
    }
    
    if (validation.includes('pattern:')) {
      const match = validation.match(/pattern:(.+)/);
      if (match) rules.pattern = match[1];
    }
    
    if (validation.includes('options:')) {
      const match = validation.match(/options:\[(.+)\]/);
      if (match) {
        rules.options = match[1].split(',').map(opt => opt.trim());
      }
    }
    
    return rules;
  }

  /**
   * Generate mock Excel data for development
   */
  private static generateMockExcelData(): any[] {
    return [
      {
        fieldKey: 'insured_name',
        fieldName: 'Insured Name',
        fieldType: 'text',
        required: 'true',
        section: 'Insured',
        order: 1,
        description: 'Full name of the insured person'
      },
      {
        fieldKey: 'insured_dob',
        fieldName: 'Date of Birth',
        fieldType: 'date',
        required: 'true',
        section: 'Insured',
        order: 2,
        description: 'Date of birth of the insured person'
      },
      {
        fieldKey: 'insured_ssn',
        fieldName: 'Social Security Number',
        fieldType: 'text',
        required: 'true',
        section: 'Insured',
        order: 3,
        description: 'SSN of the insured person',
        validation: 'pattern:^\\d{3}-\\d{2}-\\d{4}$'
      },
      {
        fieldKey: 'face_amount',
        fieldName: 'Face Amount',
        fieldType: 'number',
        required: 'true',
        section: 'Policy',
        order: 4,
        description: 'Death benefit amount',
        validation: 'min:10000,max:10000000'
      },
      {
        fieldKey: 'policy_type',
        fieldName: 'Policy Type',
        fieldType: 'select',
        required: 'true',
        section: 'Policy',
        order: 5,
        description: 'Type of life insurance policy',
        validation: 'options:[Term Life,Whole Life,Universal Life,Variable Life]'
      },
      {
        fieldKey: 'premium_frequency',
        fieldName: 'Premium Frequency',
        fieldType: 'select',
        required: 'true',
        section: 'Policy',
        order: 6,
        description: 'How often premiums are paid',
        validation: 'options:[Monthly,Quarterly,Semi-Annually,Annually]'
      }
    ];
  }

  /**
   * Export form template to Excel format
   */
  static async exportTemplateToExcel(template: ExcelFormTemplate): Promise<Blob> {
    // In a real implementation, you'd use a library like SheetJS to create Excel files
    // For now, we'll create a CSV format that can be opened in Excel
    
    const csvContent = this.convertTemplateToCSV(template);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    return blob;
  }

  /**
   * Convert template to CSV format
   */
  private static convertTemplateToCSV(template: ExcelFormTemplate): string {
    const headers = ['fieldKey', 'fieldName', 'fieldType', 'required', 'section', 'subsection', 'order', 'description', 'defaultValue', 'validation'];
    
    const csvRows = [headers.join(',')];
    
    template.fields.forEach(field => {
      const row = [
        field.key,
        field.label,
        field.type,
        field.required ? 'true' : 'false',
        field.section,
        field.subsection || '',
        field.order,
        field.description || '',
        field.defaultValue || '',
        this.serializeValidation(field.validation)
      ].map(value => `"${value}"`).join(',');
      
      csvRows.push(row);
    });
    
    return csvRows.join('\n');
  }

  /**
   * Serialize validation rules for CSV export
   */
  private static serializeValidation(validation?: ExcelField['validation']): string {
    if (!validation) return '';
    
    const parts: string[] = [];
    
    if (validation.min !== undefined) parts.push(`min:${validation.min}`);
    if (validation.max !== undefined) parts.push(`max:${validation.max}`);
    if (validation.pattern) parts.push(`pattern:${validation.pattern}`);
    if (validation.options) parts.push(`options:[${validation.options.join(',')}]`);
    
    return parts.join(';');
  }

  /**
   * Validate form template
   */
  static validateTemplate(template: ExcelFormTemplate): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check required fields
    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }
    
    if (!template.fields || template.fields.length === 0) {
      errors.push('Template must have at least one field');
    }
    
    // Validate individual fields
    template.fields.forEach((field, index) => {
      if (!field.key || field.key.trim().length === 0) {
        errors.push(`Field ${index + 1}: Key is required`);
      }
      
      if (!field.label || field.label.trim().length === 0) {
        errors.push(`Field ${index + 1}: Label is required`);
      }
      
      if (!field.section || field.section.trim().length === 0) {
        errors.push(`Field ${index + 1}: Section is required`);
      }
      
      // Check for duplicate keys
      const duplicateKeys = template.fields.filter(f => f.key === field.key);
      if (duplicateKeys.length > 1) {
        errors.push(`Duplicate field key: ${field.key}`);
      }
      
      // Validate validation rules
      if (field.validation) {
        if (field.validation.min !== undefined && field.validation.max !== undefined) {
          if (field.validation.min > field.validation.max) {
            errors.push(`Field ${field.key}: Min value cannot be greater than max value`);
          }
        }
        
        if (field.type === 'select' && (!field.validation.options || field.validation.options.length === 0)) {
          warnings.push(`Field ${field.key}: Select field should have options`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
