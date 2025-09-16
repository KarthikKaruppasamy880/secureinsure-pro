import { Router } from 'express';
import { tx1ToApp } from '../tx1/tx1ToApp';

const r = Router();
const store = new Map<string, any>(); // swap with DB later

r.post('/tx1/import', (req, res) => {
  const { caseId, xml } = req.body;
  if (!caseId || !xml) return res.status(400).json({ error: 'caseId and xml required' });
  const normalized = tx1ToApp(xml);
  store.set(caseId, normalized);
  res.json({ ok: true, caseId });
});

r.get('/cases/:id/application', (req, res) => {
  const data = store.get(req.params.id);
  if (!data) return res.status(404).json({ error: 'case not found' });
  res.json(data);
});

// ExamOne endpoints (stub-friendly)
r.post('/examone/lab-request', (req, res) => {
  // persist request & return a fake provider order number
  res.json({ requestId: `EXM-${Date.now()}` });
});
r.get('/examone/results', (req, res) => {
  // return the sample ResponseXML you shared mapped to JSON
  res.json({ status: 'Completed', nicotine: 'NEGATIVE', action: 'Refer To Underwriter', physicians: [], drugs: [] });
});

export default r;
