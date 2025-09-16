export type SectionName =
  | 'caseSetup' | 'insured' | 'owner' | 'payor'
  | 'beneficiaries' | 'riders' | 'medical' | 'nonMedical';

export interface Application {
  caseId: string;
  sections: Record<SectionName, { title: string; fields: Record<string, any> }>;
}
