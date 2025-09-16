// Field normalization utilities for FormEngine
// Safely maps any incoming JSON to our internal InsuranceField interface

export interface NormalizedField {
  fieldName: string;
  name: string;
  label: string;
  type: string;
  fieldType: string;
  kind: string;
  required: boolean;
  mandatory: boolean;
  validations: string[];
  validation: string[];
  helpText: string;
  length?: number;
  format?: string;
  fieldLevel1?: string;
  fieldLevel2?: string;
  fieldLevel3?: string;
  fieldLevel4?: string;
  options: string[];
  businessRules: string[];
  [key: string]: any; // Allow extensions
}

// Parse validation string/array into normalized array
function parseValidation(validation: any): string[] {
  if (Array.isArray(validation)) {
    return validation.filter(Boolean).map(String);
  }
  if (typeof validation === 'string') {
    return validation
      .split(/[,;|]/)
      .map(v => v.trim())
      .filter(Boolean);
  }
  return [];
}

// Parse options from various formats
function parseOptions(options: any, helpText?: string): string[] {
  if (Array.isArray(options)) {
    return options.filter(Boolean).map(String);
  }
  if (typeof options === 'string') {
    return options
      .split(/[,;|]/)
      .map(v => v.trim())
      .filter(Boolean);
  }
  if (helpText && typeof helpText === 'string') {
    // Try to extract options from helpText if it looks like a list
    const optionMatch = helpText.match(/^([A-Za-z0-9\s\-_]+(?:[,;]\s*[A-Za-z0-9\s\-_]+)*)$/);
    if (optionMatch) {
      return optionMatch[1]
        .split(/[,;]/)
        .map(v => v.trim())
        .filter(Boolean);
    }
  }
  return [];
}

// Normalize field type to our internal kind
function normalizeType(type: any, fieldType?: any): string {
  const typeStr = String(type ?? fieldType ?? 'text').toLowerCase();
  
  // Map common synonyms
  const typeMap: Record<string, string> = {
    'text': 'text',
    'string': 'text',
    'alphanumeric': 'text',
    'alpha': 'text',
    'number': 'number',
    'numeric': 'number',
    'integer': 'number',
    'int': 'number',
    'decimal': 'number',
    'float': 'number',
    'date': 'date',
    'datetime': 'date',
    'time': 'date',
    'email': 'email',
    'mail': 'email',
    'select': 'select',
    'dropdown': 'select',
    'choice': 'select',
    'checkbox': 'checkbox',
    'check': 'checkbox',
    'boolean': 'checkbox',
    'bool': 'checkbox',
    'textarea': 'textarea',
    'multiline': 'textarea',
    'longtext': 'textarea',
    'currency': 'number',
    'money': 'number',
    'percent': 'number',
    'percentage': 'number',
    'phone': 'text',
    'telephone': 'text',
    'ssn': 'text',
    'social': 'text',
    'address': 'textarea',
    'zip': 'text',
    'postal': 'text'
  };
  
  return typeMap[typeStr] || 'text';
}

// Main normalization function
export function normalizeField(raw: any): NormalizedField {
  // Ensure we have a valid object
  if (!raw || typeof raw !== 'object') {
    console.warn('[normalizeField] Invalid field data:', raw);
    raw = {};
  }

  // Extract and normalize core properties
  const fieldName = String(raw.fieldName ?? raw.name ?? raw.label ?? 'UnnamedField');
  const name = String(raw.name ?? raw.fieldName ?? raw.label ?? 'UnnamedField');
  const label = String(raw.label ?? raw.name ?? raw.fieldName ?? 'Unnamed Field');
  
  // Normalize type information
  const type = String(raw.type ?? raw.fieldType ?? 'text');
  const fieldType = String(raw.fieldType ?? raw.type ?? 'text');
  const kind = normalizeType(raw.type, raw.fieldType);
  
  // Normalize required flags
  const required = Boolean(raw.mandatory ?? raw.required ?? false);
  const mandatory = Boolean(raw.mandatory ?? raw.required ?? false);
  
  // Normalize validations
  const validations = parseValidation(raw.validations ?? raw.validation);
  const validation = parseValidation(raw.validations ?? raw.validation);
  
  // Normalize other properties
  const helpText = String(raw.helpText ?? raw.help ?? raw.description ?? '');
  const length = typeof raw.length === 'number' ? raw.length : undefined;
  const format = String(raw.format ?? '');
  
  // Normalize field levels
  const fieldLevel1 = String(raw.fieldLevel1 ?? raw.section ?? raw.level1 ?? '');
  const fieldLevel2 = String(raw.fieldLevel2 ?? raw.subsection ?? raw.level2 ?? '');
  const fieldLevel3 = String(raw.fieldLevel3 ?? raw.group ?? raw.level3 ?? '');
  const fieldLevel4 = String(raw.fieldLevel4 ?? raw.fieldset ?? raw.level4 ?? '');
  
  // Parse options and business rules
  const options = parseOptions(raw.options, helpText);
  const businessRules = Array.isArray(raw.businessRules) 
    ? raw.businessRules.filter(Boolean).map(String)
    : [];
  
  // Log warnings in DEV for missing types
  if (import.meta.env.DEV && !raw.type && !raw.fieldType) {
    console.warn('[normalizeField] Missing type; defaulted to text for', raw);
  }
  
  return {
    fieldName,
    name,
    label,
    type,
    fieldType,
    kind,
    required,
    mandatory,
    validations,
    validation,
    helpText,
    length,
    format,
    fieldLevel1,
    fieldLevel2,
    fieldLevel3,
    fieldLevel4,
    options,
    businessRules,
    // Preserve any additional properties
    ...raw
  };
}

// Batch normalize multiple fields
export function normalizeFields(fields: any[]): NormalizedField[] {
  if (!Array.isArray(fields)) {
    console.warn('[normalizeFields] Expected array, got:', typeof fields);
    return [];
  }
  
  return fields
    .filter(field => field && typeof field === 'object')
    .map((field, index) => {
      try {
        return normalizeField(field);
      } catch (error) {
        console.warn(`[normalizeFields] Failed to normalize field at index ${index}:`, error, field);
        // Return a safe fallback
        return normalizeField({
          fieldName: `field_${index}`,
          name: `Field ${index}`,
          label: `Field ${index}`,
          type: 'text'
        });
      }
    });
}

// Generate unique key for React rendering
export function generateFieldKey(field: NormalizedField, path: string, index: number): string {
  const fieldId = field.fieldName || field.name || `field_${index}`;
  return `${path}.${fieldId}.${index}`;
}
