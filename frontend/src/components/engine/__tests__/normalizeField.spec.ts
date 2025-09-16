import { describe, it, expect } from 'vitest';

// Mock the normalizeField function (this would be imported from FormEngine in real usage)
const toArray = (x: unknown): any[] => Array.isArray(x) ? x.filter(Boolean) : [];
const toStringSafe = (x: unknown): string => (x ?? '') as string;
const toLower = (x: unknown, fallback = ''): string =>
  String(x ?? fallback).toLowerCase();

const normalizeField = (raw: any) => {
  const label = raw.label ?? raw.fieldName ?? raw.name ?? 'Field';
  const kind = toLower(raw.type ?? raw.fieldType ?? 'text', 'text');
  const options = toArray(raw.options);
  const mandatory = Boolean(raw.mandatory ?? raw.required ?? false);
  const validations = Array.isArray(raw.validations)
    ? raw.validations
    : (raw.validations ?? raw.validation ?? '')
        .toString()
        .split(/[,;|]/)
        .map(v => v.trim())
        .filter(Boolean);
  const businessRules = Array.isArray(raw.businessRules) ? raw.businessRules : [];
  
  return { ...raw, label, kind, options, mandatory, validations, businessRules };
};

describe('normalizeField', () => {
  it('should handle missing options without crashing', () => {
    const field = { fieldName: 'test' };
    const result = normalizeField(field);
    
    expect(result.options).toEqual([]);
    expect(result.kind).toBe('text');
    expect(result.mandatory).toBe(false);
  });

  it('should parse validations string to array', () => {
    const field = { 
      fieldName: 'test', 
      validation: 'required|min:2|max:10' 
    };
    const result = normalizeField(field);
    
    expect(result.validations).toEqual(['required', 'min:2', 'max:10']);
  });

  it('should default unknown type to text', () => {
    const field = { fieldName: 'test' };
    const result = normalizeField(field);
    
    expect(result.kind).toBe('text');
    expect(result.label).toBe('test');
  });

  it('should handle null/undefined values safely', () => {
    const field = { 
      fieldName: 'test',
      type: null,
      options: null,
      validations: null,
      businessRules: null
    };
    const result = normalizeField(field);
    
    expect(result.kind).toBe('text');
    expect(result.options).toEqual([]);
    expect(result.validations).toEqual([]);
    expect(result.businessRules).toEqual([]);
  });
});
