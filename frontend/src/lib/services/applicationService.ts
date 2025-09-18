import api from '../api';

export async function getApplicationByCase(caseId: string){
  const { data } = await api.get(`/api/v1/cases/${caseId}/application`);
  return data;
}

export async function patchApplicationSection(caseId: string, section: string, diff: Record<string, any>) {
  const { data } = await api.patch(`/api/v1/cases/${caseId}/application/${section}`, { fields: diff });
  return data; // normalized section with .fields
}
