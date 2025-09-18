import api from '../api';

export async function submitLabRequest(payload:{caseId:string; insured:any}) {
  const { data } = await api.post('/api/v1/examone/lab-request', payload);
  return data; // { ok:true, requestId, caseId }
}

export async function fetchLabResults(caseId:string){
  const { data } = await api.get(`/api/v1/examone/results?caseId=${encodeURIComponent(caseId)}`);
  return data; // array of results rows
}
