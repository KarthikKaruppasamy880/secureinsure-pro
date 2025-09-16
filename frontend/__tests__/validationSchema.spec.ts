import { describe, it, expect } from 'vitest';
import { createValidationSchema } from '../src/components/engine/validationSchema';

describe('validationSchema util', () => {
  it('creates schema for basic text and required', async () => {
    const { schema, errors } = createValidationSchema({
      sheets: {
        Test: {
          fields: [
            { fieldName: 'Name', fieldType: 'text', required: true }
          ]
        }
      }
    } as any);

    expect(errors.length).toBeGreaterThanOrEqual(0);
    const parsed = await schema.safeParseAsync({ 'Test.Name': 'John' });
    expect(parsed.success).toBe(true);
    const failed = await schema.safeParseAsync({ 'Test.Name': '' });
    expect(failed.success).toBe(false);
  });

  it('handles number with min/max', async () => {
    const { schema } = createValidationSchema({
      sheets: {
        Test: {
          fields: [
            { fieldName: 'Age', fieldType: 'number', validation: 'min:18,max:120' }
          ]
        }
      }
    } as any);

    expect((await schema.safeParseAsync({ 'Test.Age': 25 })).success).toBe(true);
    expect((await schema.safeParseAsync({ 'Test.Age': '25' })).success).toBe(true);
    expect((await schema.safeParseAsync({ 'Test.Age': 10 })).success).toBe(false);
  });
});









