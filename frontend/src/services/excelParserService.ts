import * as XLSX from 'xlsx';

export interface FieldValidation {
  type: 'length' | 'regex' | 'min' | 'max' | 'required' | 'email' | 'phone' | 'ssn' | 'zip';
  value?: number | string;
  pattern?: string;
  message?: string;
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface BusinessRule {
  when: {
    all?: Array<{ key: string; op: string; value: any }>;
    any?: Array<{ key: string; op: string; value: any }>;
  };
  then: Array<{ action: string; target: string; value?: any }>;
}

export interface FieldPath {
  tab: string;
  section: string;
  subsection: string;
  group: string;
  fieldset: string;
}

export interface NormalizedField {
  id: string;
  path: FieldPath;
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'currency' | 'percent' | 'phone' | 'ssn' | 'email' | 'address';
  format?: string;
  required: boolean;
  validations: FieldValidation[];
  options?: FieldOption[];
  rules?: BusinessRule[];
  auditable: boolean;
  order: number;
  extensions: Record<string, any>;
}

export interface Template {
  name: string;
  status: 'Draft' | 'Published';
  version: string;
  tabs: Array<{ key: string; name: string; order: number }>;
  fields: NormalizedField[];
  createdAt: string;
  updatedAt: string;
}

export class ExcelParserService {
  private static readonly COLUMN_SYNONYMS = {
    // Field identification
    'Field Level 1': 'level1',
    'Section': 'level1',
    'L1': 'level1',
    'Field Level 2': 'level2',
    'Subsection': 'level2',
    'L2': 'level2',
    'Field Level 3': 'level3',
    'Group': 'level3',
    'L3': 'level3',
    'Field Level 4': 'level4',
    'Fieldset': 'level4',
    'L4': 'level4',
    
    // Field properties
    'Field Name': 'fieldName',
    'Label': 'label',
    'Display Name': 'label',
    'Type': 'type',
    'Field Type': 'type',
    'Input Type': 'type',
    
    // Validation
    'Mandatory': 'required',
    'Required': 'required',
    'Is Required': 'required',
    'Length': 'length',
    'Max Length': 'length',
    'Validation': 'validation',
    'Validation Rules': 'validation',
    'Validation Message': 'validationMessage',
    'Error Message': 'validationMessage',
    
    // Options
    'Allowable values': 'options',
    'Options': 'options',
    'Choices': 'options',
    'Values': 'options',
    'Valid Values': 'options',
    
    // Business rules
    'Rules': 'rules',
    'Business Rules': 'rules',
    'Conditions': 'rules',
    'Dependencies': 'rules',
    
    // Metadata
    'Order': 'order',
    'Sort Order': 'order',
    'Sequence': 'order',
    'Auditable': 'auditable',
    'Track Changes': 'auditable'
  };

  private static readonly TYPE_MAPPING = {
    'text': 'text',
    'string': 'text',
    'varchar': 'text',
    'number': 'number',
    'integer': 'number',
    'int': 'number',
    'decimal': 'number',
    'float': 'number',
    'date': 'date',
    'datetime': 'date',
    'time': 'date',
    'select': 'select',
    'dropdown': 'select',
    'choice': 'select',
    'checkbox': 'checkbox',
    'boolean': 'checkbox',
    'yes/no': 'checkbox',
    'currency': 'currency',
    'money': 'currency',
    'dollar': 'currency',
    'percent': 'percent',
    'percentage': 'percent',
    'phone': 'phone',
    'telephone': 'phone',
    'ssn': 'ssn',
    'social': 'ssn',
    'email': 'email',
    'address': 'address',
    'location': 'address'
  };

  private static readonly FORMAT_MAPPING = {
    'currency': 'currency',
    'percent': 'percent',
    'date': 'date',
    'zip': 'zip',
    'phone': 'phone',
    'ssn': 'ssn',
    'email': 'email'
  };

  static parseExcelWorkbook(file: File): Promise<Template> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const template = this.processWorkbook(workbook);
          resolve(template);
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private static processWorkbook(workbook: XLSX.WorkBook): Template {
    const sheets = workbook.SheetNames;
    const allFields: NormalizedField[] = [];
    const tabs: Array<{ key: string; name: string; order: number }> = [];
    
    // Process each sheet
    sheets.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length > 1) { // Has headers + data
        const fields = this.processSheet(sheetName, jsonData);
        allFields.push(...fields);
        
        tabs.push({
          key: sheetName,
          name: sheetName,
          order: index
        });
      }
    });

    return {
      name: `Template-${new Date().toISOString().split('T')[0]}`,
      status: 'Draft',
      version: '1.0.0',
      tabs,
      fields: allFields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private static processSheet(sheetName: string, data: any[][]): NormalizedField[] {
    const headers = data[0];
    const rows = data.slice(1);
    const fields: NormalizedField[] = [];
    
    // Create column mapping
    const columnMap = this.createColumnMapping(headers);
    
    // Process each row
    rows.forEach((row, rowIndex) => {
      if (this.isValidFieldRow(row, columnMap)) {
        const field = this.processFieldRow(sheetName, row, columnMap, rowIndex);
        if (field) {
          fields.push(field);
        }
      }
    });
    
    return fields;
  }

  private static createColumnMapping(headers: any[]): Record<string, number> {
    const mapping: Record<string, number> = {};
    
    headers.forEach((header, index) => {
      if (header && typeof header === 'string') {
        const normalizedKey = this.normalizeColumnHeader(header);
        if (normalizedKey) {
          mapping[normalizedKey] = index;
        }
        // Always store original header for extensions
        mapping[`extensions.${header}`] = index;
      }
    });
    
    return mapping;
  }

  private static normalizeColumnHeader(header: string): string | null {
    const cleanHeader = header.trim().toLowerCase();
    
    for (const [synonym, normalized] of Object.entries(this.COLUMN_SYNONYMS)) {
      if (cleanHeader.includes(synonym.toLowerCase()) || 
          cleanHeader === synonym.toLowerCase()) {
        return normalized;
      }
    }
    
    return null;
  }

  private static isValidFieldRow(row: any[], columnMap: Record<string, number>): boolean {
    // Must have at least a field name and type
    return !!(row[columnMap.fieldName] || row[columnMap.label]) && 
           !!(row[columnMap.type]);
  }

  private static processFieldRow(
    sheetName: string, 
    row: any[], 
    columnMap: Record<string, number>, 
    rowIndex: number
  ): NormalizedField | null {
    try {
      const fieldName = row[columnMap.fieldName] || row[columnMap.label] || `Field_${rowIndex}`;
      const fieldType = row[columnMap.type];
      
      if (!fieldName || !fieldType) return null;
      
      // Build path from levels
      const path = this.buildFieldPath(sheetName, row, columnMap);
      
      // Parse field properties
      const type = this.normalizeType(fieldType);
      const format = this.parseFormat(row, columnMap);
      const required = this.parseRequired(row, columnMap);
      const validations = this.parseValidations(row, columnMap);
      const options = this.parseOptions(row, columnMap);
      const rules = this.parseRules(row, columnMap);
      const order = this.parseOrder(row, columnMap, rowIndex);
      
      // Capture extensions (unknown columns)
      const extensions = this.captureExtensions(row, columnMap);
      
      return {
        id: this.generateFieldId(sheetName, fieldName, rowIndex),
        path,
        key: this.generateFieldKey(fieldName),
        label: fieldName,
        type,
        format,
        required,
        validations,
        options,
        rules,
        auditable: true,
        order,
        extensions
      };
    } catch (error) {
      console.warn(`Failed to process field row ${rowIndex}:`, error);
      return null;
    }
  }

  private static buildFieldPath(sheetName: string, row: any[], columnMap: Record<string, number>): FieldPath {
    const level1 = row[columnMap.level1] || '';
    const level2 = row[columnMap.level2] || '';
    const level3 = row[columnMap.level3] || '';
    const level4 = row[columnMap.level4] || '';
    
    return {
      tab: sheetName,
      section: level1.trim(),
      subsection: level2.trim(),
      group: level3.trim(),
      fieldset: level4.trim()
    };
  }

  private static normalizeType(rawType: string): NormalizedField['type'] {
    const cleanType = rawType.toString().toLowerCase().trim();
    
    for (const [raw, normalized] of Object.entries(this.TYPE_MAPPING)) {
      if (cleanType.includes(raw)) {
        return normalized as NormalizedField['type'];
      }
    }
    
    return 'text'; // Default fallback
  }

  private static parseFormat(row: any[], columnMap: Record<string, number>): string | undefined {
    const formatValue = row[columnMap.format];
    if (!formatValue) return undefined;
    
    const cleanFormat = formatValue.toString().toLowerCase().trim();
    
    for (const [raw, normalized] of Object.entries(this.FORMAT_MAPPING)) {
      if (cleanFormat.includes(raw)) {
        return normalized;
      }
    }
    
    return formatValue.toString();
  }

  private static parseRequired(row: any[], columnMap: Record<string, number>): boolean {
    const requiredValue = row[columnMap.required];
    if (requiredValue === undefined) return false;
    
    if (typeof requiredValue === 'boolean') return requiredValue;
    if (typeof requiredValue === 'string') {
      const clean = requiredValue.toLowerCase().trim();
      return ['yes', 'true', '1', 'mandatory', 'required'].includes(clean);
    }
    if (typeof requiredValue === 'number') return requiredValue === 1;
    
    return false;
  }

  private static parseValidations(row: any[], columnMap: Record<string, number>): FieldValidation[] {
    const validations: FieldValidation[] = [];
    
    // Parse length validation
    if (columnMap.length !== undefined) {
      const lengthValue = row[columnMap.length];
      if (lengthValue && !isNaN(Number(lengthValue))) {
        validations.push({
          type: 'length',
          value: Number(lengthValue),
          message: `Maximum length is ${lengthValue} characters`
        });
      }
    }
    
    // Parse validation rules
    if (columnMap.validation !== undefined) {
      const validationRules = row[columnMap.validation];
      if (validationRules && typeof validationRules === 'string') {
        const parsed = this.parseValidationString(validationRules);
        validations.push(...parsed);
      }
    }
    
    // Parse validation message
    if (columnMap.validationMessage !== undefined) {
      const message = row[columnMap.validationMessage];
      if (message && validations.length > 0) {
        validations[validations.length - 1].message = message.toString();
      }
    }
    
    return validations;
  }

  private static parseValidationString(validationStr: string): FieldValidation[] {
    const validations: FieldValidation[] = [];
    const rules = validationStr.split(';').map(r => r.trim());
    
    rules.forEach(rule => {
      if (rule.includes('min:')) {
        const value = rule.split(':')[1];
        validations.push({ type: 'min', value: Number(value) });
      } else if (rule.includes('max:')) {
        const value = rule.split(':')[1];
        validations.push({ type: 'max', value: Number(value) });
      } else if (rule.includes('regex:')) {
        const pattern = rule.split(':')[1];
        validations.push({ type: 'regex', pattern });
      }
    });
    
    return validations;
  }

  private static parseOptions(row: any[], columnMap: Record<string, number>): FieldOption[] | undefined {
    const optionsValue = row[columnMap.options];
    if (!optionsValue) return undefined;
    
    if (typeof optionsValue === 'string') {
      return this.parseOptionsString(optionsValue);
    }
    
    return undefined;
  }

  private static parseOptionsString(optionsStr: string): FieldOption[] {
    const options: FieldOption[] = [];
    const pairs = optionsStr.split(';').map(p => p.trim());
    
    pairs.forEach(pair => {
      if (pair.includes(':')) {
        const [value, label] = pair.split(':');
        options.push({ value: value.trim(), label: label.trim() || value.trim() });
      } else {
        options.push({ value: pair, label: pair });
      }
    });
    
    return options;
  }

  private static parseRules(row: any[], columnMap: Record<string, number>): BusinessRule[] | undefined {
    const rulesValue = row[columnMap.rules];
    if (!rulesValue) return undefined;
    
    // Simple rule parsing - can be enhanced
    try {
      if (typeof rulesValue === 'string') {
        return this.parseRulesString(rulesValue);
      }
    } catch (error) {
      console.warn('Failed to parse business rules:', error);
    }
    
    return undefined;
  }

  private static parseRulesString(rulesStr: string): BusinessRule[] {
    // Basic rule parsing - can be enhanced with more sophisticated DSL
    const rules: BusinessRule[] = [];
    
    // Example: "show:state when:country=US"
    const ruleParts = rulesStr.split(' ');
    if (ruleParts.length >= 3) {
      const action = ruleParts[0].split(':')[1];
      const target = ruleParts[1].split(':')[1];
      const condition = ruleParts[2].split(':')[1];
      
      if (action && target && condition) {
        const [key, op, value] = condition.split('=');
        rules.push({
          when: {
            all: [{ key, op: 'eq', value }]
          },
          then: [{ action, target }]
        });
      }
    }
    
    return rules;
  }

  private static parseOrder(row: any[], columnMap: Record<string, number>, rowIndex: number): number {
    if (columnMap.order !== undefined) {
      const orderValue = row[columnMap.order];
      if (orderValue && !isNaN(Number(orderValue))) {
        return Number(orderValue);
      }
    }
    
    return rowIndex * 10; // Default ordering
  }

  private static captureExtensions(row: any[], columnMap: Record<string, number>): Record<string, any> {
    const extensions: Record<string, any> = {};
    
    Object.entries(columnMap).forEach(([key, index]) => {
      if (key.startsWith('extensions.')) {
        const originalHeader = key.replace('extensions.', '');
        const value = row[index];
        if (value !== undefined && value !== null && value !== '') {
          extensions[originalHeader] = value;
        }
      }
    });
    
    return extensions;
  }

  private static generateFieldId(sheetName: string, fieldName: string, rowIndex: number): string {
    return `${sheetName}_${fieldName}_${rowIndex}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private static generateFieldKey(fieldName: string): string {
    return fieldName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');
  }

  // Utility method to get a summary of the parsed template
  static getTemplateSummary(template: Template): {
    totalSheets: number;
    totalFields: number;
    fieldCountByTab: Record<string, number>;
    sampleFields: Record<string, NormalizedField[]>;
  } {
    const fieldCountByTab: Record<string, number> = {};
    const sampleFields: Record<string, NormalizedField[]> = {};
    
    template.tabs.forEach(tab => {
      const tabFields = template.fields.filter(f => f.path.tab === tab.key);
      fieldCountByTab[tab.key] = tabFields.length;
      sampleFields[tab.key] = tabFields.slice(0, 5); // First 5 fields per tab
    });
    
    return {
      totalSheets: template.tabs.length,
      totalFields: template.fields.length,
      fieldCountByTab,
      sampleFields
    };
  }
}
