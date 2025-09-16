import { api } from '../api';

export async function uploadTx1(file: File){
  const fd = new FormData(); 
  fd.append('file', file);
  const { data } = await api.post('/api/v1/tx1/import', fd);
  return data.caseId as string;
}
