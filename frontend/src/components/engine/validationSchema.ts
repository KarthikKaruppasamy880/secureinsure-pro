import { z } from 'zod';

export interface NormalizedField {
  fieldName: string;
  type: string;
  format?: string;
  length: number;
  mandatory: boolean;
  validations: string[];
  helpText?: string;
}

export interface NormalizedSheetConfig {
  fields: NormalizedField[];
  metadata?: {
    totalFields?: number;
    mandatoryFields?: number;
    optionalFields?: number;
  };
}

export interface NormalizedConfig {
  sheets: Record<string, NormalizedSheetConfig>;
}

function toStringLower(value: unknown): string {
  return String(value ?? '').toLowerCase();
}

function parseValidations(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[,;|]/)
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }
  return [];
}

export function normalizeField(input: any): NormalizedField | null {
  try {
    const fieldName: string = String(input?.fieldName ?? input?.name ?? '').trim();
    if (!fieldName) return null;

    const typeRaw = input?.type ?? input?.fieldType ?? 'text';
    const type = toStringLower(typeRaw) || 'text';

    const mandatory: boolean = Boolean(
      input?.mandatory ?? input?.required ?? false
    );

    const validations: string[] = parseValidations(
      input?.validations ?? input?.validation ?? []
    );

    const length: number = typeof input?.length === 'number'
      ? input.length
      : Number.parseInt(String(input?.length ?? '0'), 10) || 0;

    const format: string | undefined = input?.format ? String(input.format) : undefined;
    const helpText: string | undefined = input?.helpText ? String(input.helpText) : undefined;

    return {
      fieldName,
      type,
      format,
      length,
      mandatory,
      validations,
      helpText
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
       
      console.warn('normalizeField failed for input:', input, err);
    }
    return null;
  }
}

function applyTypeSchema(baseType: string, field: NormalizedField): z.ZodTypeAny {
  const kind = baseType || 'text';
  switch (kind) {
    case 'number':
    case 'numeric':
      return z.preprocess((val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string' && val.trim().length > 0) {
          const parsed = Number(val);
          return Number.isNaN(parsed) ? undefined : parsed;
        }
        return undefined;
      }, z.number());
    case 'date':
      return z.string().refine((val) => {
        return typeof val === 'string' && !Number.isNaN(Date.parse(val));
      }, { message: 'Invalid date format' });
    case 'email':
      return z.string().email();
    case 'checkbox':
    case 'boolean':
      return z.union([
        z.boolean(),
        z.string().transform((v) => toStringLower(v) === 'true')
      ]);
    case 'select':
      return z.string();
    case 'ssn':
      return z.string().regex(/^(\d{3}-?\d{2}-?\d{4})$/i, { message: 'Invalid SSN' });
    case 'phone':
      return z.string().regex(/^[0-9+\-()\s]{7,20}$/i, { message: 'Invalid phone' });
    case 'currency':
      return z.string().regex(/^[\$]?\d{1,3}(,\d{3})*(\.\d{2})?$/).or(z.number());
    case 'alphanumeric':
    case 'alpha':
    case 'text':
    default:
      return z.string();
  }
}

function applyAdditionalValidations(schema: z.ZodTypeAny, field: NormalizedField): z.ZodTypeAny {
  let current = schema;

  // length constraint
  if (field.length && field.length > 0 && typeof (current as any).max === 'function') {
    current = (current as any).max(field.length);
  }

  const validations = field.validations || [];
  for (const rule of validations) {
    const lower = toStringLower(rule);
    if (lower === 'required') {
      // handled later using refine to support multiple types
      continue;
    }

    if (lower.startsWith('min:')) {
      const val = Number(rule.split(':')[1]);
      if (!Number.isNaN(val)) {
        if (typeof (current as any).min === 'function') {
          current = (current as any).min(val);
        } else {
          current = current.refine((v: any) => typeof v === 'number' ? v >= val : true, { message: `Must be >= ${val}` });
        }
      }
      continue;
    }

    if (lower.startsWith('max:')) {
      const val = Number(rule.split(':')[1]);
      if (!Number.isNaN(val)) {
        if (typeof (current as any).max === 'function') {
          current = (current as any).max(val);
        } else {
          current = current.refine((v: any) => typeof v === 'number' ? v <= val : true, { message: `Must be <= ${val}` });
        }
      }
      continue;
    }

    if (lower.startsWith('length:')) {
      const val = Number(rule.split(':')[1]);
      if (!Number.isNaN(val) && typeof (current as any).length === 'function') {
        current = (current as any).length(val);
      }
      continue;
    }

    if (lower.startsWith('regex:') || lower.startsWith('pattern:')) {
      const pattern = rule.substring(rule.indexOf(':') + 1).trim();
      try {
        const body = pattern.startsWith('/') && pattern.lastIndexOf('/') > 0
          ? pattern.slice(1, pattern.lastIndexOf('/'))
          : pattern;
        const flags = pattern.startsWith('/') && pattern.lastIndexOf('/') > 0
          ? pattern.slice(pattern.lastIndexOf('/') + 1)
          : undefined;
        const re = new RegExp(body, flags);
        current = (current as any).regex(re);
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
           
          console.warn('Invalid regex validation:', rule, e);
        }
      }
      continue;
    }

    if (lower.startsWith('enum:') || lower === 'in_list') {
      let values: string[] = [];
      if (lower.startsWith('enum:')) {
        values = rule.substring(rule.indexOf(':') + 1).split(/[,|]/).map(v => v.trim()).filter(Boolean);
      } else if (field.helpText && field.helpText.includes(',')) {
        values = field.helpText.split(',').map(v => v.trim()).filter(Boolean);
      }
      if (values.length > 0) {
        const set = new Set(values);
        current = current.refine((v: any) => typeof v === 'string' ? set.has(v) : true, { message: `Must be one of: ${values.join(', ')}` });
      }
      continue;
    }
  }

  // required last
  if (field.mandatory || field.validations.some(v => toStringLower(v) === 'required')) {
    current = current.refine((val: any) => {
      if (typeof val === 'string') return val.trim().length > 0;
      if (typeof val === 'boolean') return val === true;
      if (typeof val === 'number') return !Number.isNaN(val);
      return val !== null && val !== undefined;
    }, { message: `${field.fieldName} is required` });
  }

  return current;
}

export function createValidationSchema(config: NormalizedConfig): { schema: z.ZodObject<any>; errors: string[] } {
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  const errors: string[] = [];

  const sheets = config?.sheets || {};
  for (const [sheetName, sheet] of Object.entries(sheets)) {
    const fields = Array.isArray((sheet as any)?.fields) ? (sheet as any).fields : [];
    for (const rawField of fields) {
      const field = normalizeField(rawField);
      if (!field) {
        if (process.env.NODE_ENV !== 'production') {
           
          console.warn('Skipping invalid field in sheet:', sheetName, rawField);
        }
        errors.push(`Invalid field skipped in '${sheetName}'`);
        continue;
      }

      const fieldPath = `${sheetName}.${field.fieldName}`;
      const base = applyTypeSchema(field.type, field);
      const withRules = applyAdditionalValidations(base, field);
      schemaFields[fieldPath] = withRules;
    }
  }

  return { schema: z.object(schemaFields), errors };
}










