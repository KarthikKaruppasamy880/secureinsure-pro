export interface ValidationContext {
  fieldId: string;
  fieldKey: string;
  value: any;
  type: string;
  format?: string;
  required: boolean;
  validations: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export class Validators {
  static validateForm(contexts: ValidationContext[]): ValidationResult {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    contexts.forEach(context => {
      const fieldErrors = this.validateField(context);
      if (fieldErrors.length > 0) {
        errors[context.fieldKey] = fieldErrors;
        isValid = false;
      }
    });

    return { isValid, errors };
  }

  static validateField(context: ValidationContext): string[] {
    const errors: string[] = [];

    // Required field validation
    if (context.required && (context.value === null || context.value === undefined || context.value === '')) {
      errors.push('This field is required');
    }

    // Type-specific validation
    if (context.value !== null && context.value !== undefined && context.value !== '') {
      switch (context.type?.toLowerCase()) {
        case 'email':
          if (!this.isValidEmail(context.value)) {
            errors.push('Please enter a valid email address');
          }
          break;

        case 'phone':
          if (!this.isValidPhone(context.value)) {
            errors.push('Please enter a valid phone number');
          }
          break;

        case 'ssn':
          if (!this.isValidSSN(context.value)) {
            errors.push('Please enter a valid SSN (XXX-XX-XXXX)');
          }
          break;

        case 'zip':
          if (!this.isValidZip(context.value)) {
            errors.push('Please enter a valid ZIP code');
          }
          break;

        case 'number':
          if (isNaN(Number(context.value))) {
            errors.push('Please enter a valid number');
          }
          break;

        case 'date':
          if (!this.isValidDate(context.value)) {
            errors.push('Please enter a valid date');
          }
          break;
      }
    }

    // Custom validation rules - guard against missing validations array
    (context.validations ?? []).forEach(validation => {
      const validationError = this.applyValidationRule(validation, context.value);
      if (validationError) {
        errors.push(validationError);
      }
    });

    return errors;
  }

  private static isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  private static isValidPhone(value: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  }

  private static isValidSSN(value: string): boolean {
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    return ssnRegex.test(value);
  }

  private static isValidZip(value: string): boolean {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(value);
  }

  private static isValidDate(value: string): boolean {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }

  private static applyValidationRule(rule: string, value: any): string | null {
    // Parse validation rules like "length:5:10" or "regex:^[A-Z]+$"
    const [ruleType, ...params] = rule.split(':');

    switch (ruleType) {
      case 'length':
        if (params.length >= 2) {
          const min = parseInt(params[0]);
          const max = parseInt(params[1]);
          if (value.length < min || value.length > max) {
            return `Length must be between ${min} and ${max} characters`;
          }
        }
        break;

      case 'min': {
        const min = parseInt(params[0]);
        if (Number(value) < min) {
          return `Value must be at least ${min}`;
        }
        break;
      }

      case 'max': {
        const max = parseInt(params[0]);
        if (Number(value) > max) {
          return `Value must be at most ${max}`;
        }
        break;
      }

      case 'regex':
        try {
          const regex = new RegExp(params[0]);
          if (!regex.test(value)) {
            return 'Value does not match required format';
          }
        } catch (error) {
          console.warn('Invalid regex in validation rule:', params[0]);
        }
        break;
    }

    return null;
  }
}
