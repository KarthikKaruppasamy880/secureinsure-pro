export type RawField = { fieldType?:string; fieldName?:string; required?:boolean; validation?:any };
export type NormField = { type:string; key:string; mandatory:boolean; validations:any };
export function normalizeField(f?:RawField):NormField{
  const t=(f?.fieldType||'text').toString().toLowerCase?.() || 'text';
  const k=(f?.fieldName||'').toString();
  return { type:t, key:k, mandatory:!!f?.required, validations:f?.validation||{} };
}
