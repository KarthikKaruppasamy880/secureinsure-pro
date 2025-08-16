export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  ssn: /^\d{3}-?\d{2}-?\d{4}$/,
  zip: /^\d{5}(-\d{4})?$/,
  currency: /^\d+(\.\d{1,2})?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  percentage: /^(100|[1-9]?\d(\.\d+)?)%?$/
};

// Validation rules for insurance fields
export const INSURANCE_FIELD_VALIDATION: FieldValidation = {
  // Case Setup
  "Language of the Application": { required: true },
  "Policy Number": { required: true, pattern: /^[A-Z0-9-]+$/ },
  "Application State of Signing": { required: true },
  "Application Signing Date": { required: true, custom: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    if (date > today) return "Signing date cannot be in the future";
    return null;
  }},
  "Date Received": { required: true, custom: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    if (date > today) return "Received date cannot be in the future";
    return null;
  }},
  "Product Type": { required: true },
  "Plan Name": { required: true, minLength: 2, maxLength: 100 },
  "Amount of coverage applied for": { required: true, custom: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return "Coverage amount must be a positive number";
    if (num < 10000) return "Coverage amount must be at least $10,000";
    if (num > 10000000) return "Coverage amount cannot exceed $10,000,000";
    return null;
  }},
  "Zinnia Case ID": { required: true, pattern: /^[A-Z0-9-]+$/ },
  "Priority": { required: true },
  "Submission": { required: true },
  "Death Benefit": { required: true, custom: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return "Death benefit must be a positive number";
    return null;
  }},
  "Life Insurance Qualification Test": { required: true },
  "Rate Class Applied For": { required: true },
  "Insurance Age Basis": { required: true },
  "Insurance Age Effective Date": { required: true, custom: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    if (date > today) return "Effective date cannot be in the future";
    return null;
  }},

  // Insured
  "Name": { required: true, minLength: 2, maxLength: 100 },
  "Date of Birth": { required: true, custom: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    if (age < 18) return "Insured must be at least 18 years old";
    if (age > 85) return "Insured age cannot exceed 85 years";
    return null;
  }},
  "Age": { required: true, min: 18, max: 85 },
  "Gender": { required: true },
  "SSN": { required: true, pattern: VALIDATION_PATTERNS.ssn },
  "Driver's License Number": { pattern: /^[A-Z0-9]+$/, maxLength: 20 },
  "Street Address 1": { required: true, minLength: 5, maxLength: 100 },
  "City": { required: true, minLength: 2, maxLength: 50 },
  "State": { required: true },
  "Zip": { required: true, pattern: VALIDATION_PATTERNS.zip },
  "Mobile Phone": { required: true, pattern: VALIDATION_PATTERNS.phone },
  "Email Address": { required: true, pattern: VALIDATION_PATTERNS.email },
  "Occupation": { required: true, minLength: 2, maxLength: 100 },
  "Annual Household Income": { required: true, custom: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return "Income must be a positive number";
    if (num < 10000) return "Income must be at least $10,000";
    return null;
  }},
  "Personal Annual Income": { required: true, custom: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return "Income must be a positive number";
    if (num < 10000) return "Income must be at least $10,000";
    return null;
  }},

  // Beneficiary
  "Primary Beneficiary Name": { required: true, minLength: 2, maxLength: 100 },
  "Primary Beneficiary Relationship": { required: true },
  "Primary Beneficiary Percentage": { required: true, custom: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0 || num > 100) return "Percentage must be between 0 and 100";
    return null;
  }},
  "Primary Beneficiary Date of Birth": { required: true, custom: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    if (date > today) return "Date of birth cannot be in the future";
    return null;
  }},
  "Primary Beneficiary SSN": { required: true, pattern: VALIDATION_PATTERNS.ssn },

  // Owner
  "Owner Name": { required: true, minLength: 2, maxLength: 100 },
  "Owner Relationship to Insured": { required: true },
  "Owner Date of Birth": { required: true, custom: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    if (date > today) return "Date of birth cannot be in the future";
    return null;
  }},
  "Owner SSN": { required: true, pattern: VALIDATION_PATTERNS.ssn },
  "Owner Address": { required: true, minLength: 5, maxLength: 100 },
  "Owner City": { required: true, minLength: 2, maxLength: 50 },
  "Owner State": { required: true },
  "Owner ZIP": { required: true, pattern: VALIDATION_PATTERNS.zip },

  // Payor
  "Payment Method": { required: true },
  "Bank Account Number": { pattern: /^\d{8,17}$/, custom: (value) => {
    if (!value) return null;
    if (value.length < 8 || value.length > 17) return "Account number must be 8-17 digits";
    return null;
  }},
  "Bank Routing Number": { pattern: /^\d{9}$/, custom: (value) => {
    if (!value) return null;
    if (value.length !== 9) return "Routing number must be exactly 9 digits";
    return null;
  }},

  // Medical Information
  "Height": { required: true, custom: (value) => {
    if (!value) return null;
    if (!/^\d+['"]\s*\d*[""]?$/.test(value)) return "Height must be in format: 5'10\"";
    return null;
  }},
  "Weight": { required: true, min: 50, max: 500, custom: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < 50 || num > 500) return "Weight must be between 50 and 500 pounds";
    return null;
  }},

  // Premium Mode
  "Premium Payment Frequency": { required: true },
  "Premium Amount": { required: true, custom: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return "Premium amount must be a positive number";
    if (num < 10) return "Premium amount must be at least $10";
    return null;
  }},
  "Premium Start Date": { required: true, custom: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    if (date < today) return "Premium start date cannot be in the past";
    return null;
  }}
};

export function validateField(fieldName: string, value: any): ValidationResult {
  const rules = INSURANCE_FIELD_VALIDATION[fieldName];
  if (!rules) {
    return { isValid: true, errors: [] };
  }

  const errors: string[] = [];

  // Required validation
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }

  // Skip other validations if value is empty and not required
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return { isValid: true, errors: [] };
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(String(value))) {
    errors.push(`${fieldName} format is invalid`);
  }

  // Length validation
  if (rules.minLength && String(value).length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
  }
  if (rules.maxLength && String(value).length > rules.maxLength) {
    errors.push(`${fieldName} must not exceed ${rules.maxLength} characters`);
  }

  // Numeric range validation
  if (rules.min !== undefined && parseFloat(value) < rules.min) {
    errors.push(`${fieldName} must be at least ${rules.min}`);
  }
  if (rules.max !== undefined && parseFloat(value) > rules.max) {
    errors.push(`${fieldName} must not exceed ${rules.max}`);
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateSection(sectionData: Record<string, any>, sectionFields: string[]): ValidationResult {
  const allErrors: string[] = [];
  let hasErrors = false;

  for (const fieldName of sectionFields) {
    const value = sectionData[fieldName];
    const validation = validateField(fieldName, value);
    
    if (!validation.isValid) {
      hasErrors = true;
      allErrors.push(...validation.errors);
    }
  }

  return {
    isValid: !hasErrors,
    errors: allErrors
  };
}

export function validateForm(formData: Record<string, any>): ValidationResult {
  const allErrors: string[] = [];
  let hasErrors = false;

  for (const [fieldName, value] of Object.entries(formData)) {
    const validation = validateField(fieldName, value);
    
    if (!validation.isValid) {
      hasErrors = true;
      allErrors.push(...validation.errors);
    }
  }

  return {
    isValid: !hasErrors,
    errors: allErrors
  };
}
