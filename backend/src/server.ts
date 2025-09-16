import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { CASES, SEARCH_INDEX } from './store';
import { parseTx1ToApp } from './tx1/parser';

const app = express();
app.use(cors({
  origin: [/^http:\/\/(localhost|127\.0\.0\.1):(3000|5173)$/, /^http:\/\/192\.168\.\d+\.\d+:\d+$/],
  credentials: true
}));
app.use(bodyParser.json({ limit:'10mb' }));
app.use(fileUpload());

// health
app.get('/health', (_req,res)=>res.json({ok:true, service:'mock-backend'}));
app.get('/ready',  (_req,res)=>res.json({ok:true}));
app.get('/version',(_req,res)=>res.json({env:'dev'}));

// auth dev stub to stop FE loops
app.get('/api/v1/auth/validate', (_req,res)=>res.json({id:'dev', name:'Admin'}));

// TX1 import (multipart or raw)
app.post('/api/v1/tx1/import', (req, res) => {
  const xml = (req as any).files?.file?.data?.toString()
          || (req.body?.xml as string);
  if (!xml) return res.status(400).json({error:'missing xml'});
  const appObj = parseTx1ToApp(xml);
  CASES.set(appObj.caseId, appObj);
  const fullName = [appObj.sections.insured.fields.firstName, appObj.sections.insured.fields.lastName].filter(Boolean).join(' ');
  SEARCH_INDEX.push({ caseId: appObj.caseId, insured: fullName });
  res.json({ caseId: appObj.caseId });
});

// Application
app.get('/api/v1/cases/:caseId/application', (req,res) => {
  const a = CASES.get(req.params.caseId);
  if (!a) return res.status(404).json({error:'not found'});
  res.json(a);
});
app.post('/api/v1/cases/:caseId/application', (req,res) => {
  if (!CASES.has(req.params.caseId)) CASES.set(req.params.caseId, req.body);
  return res.json(CASES.get(req.params.caseId));
});
app.patch('/api/v1/cases/:caseId/application/:section', (req,res) => {
  const a = CASES.get(req.params.caseId);
  if (!a) return res.status(404).json({error:'not found'});
  const s = req.params.section as keyof typeof a.sections;
  a.sections[s] = {
    ...a.sections[s],
    fields: { ...a.sections[s]?.fields, ...req.body?.fields }
  };
  CASES.set(a.caseId, a);
  res.json(a.sections[s]);
});

// ExamOne mock (order + results)
app.post('/api/v1/examone/lab-request', (req,res) => {
  const { caseId } = req.body ?? {};
  if (!caseId || !CASES.has(caseId)) return res.status(400).json({error:'invalid caseId'});
  res.json({ ok:true, requestId:`EXM-${Date.now()}`, caseId });
});
app.get('/api/v1/examone/results', (req,res) => {
  const caseId = String(req.query.caseId||'');
  if (!caseId || !CASES.has(caseId)) return res.json({ rows: [] });
  // tiny deterministic table from your screenshots
  res.json({
    applicant: CASES.get(caseId)?.sections.insured.fields,
    rows: [
      { test:'Cholesterol', result:'180 mg/dL', reference:'<200', score:'OK' },
      { test:'HbA1c', result:'5.2 %', reference:'<5.7', score:'OK' },
      { test:'Nicotine', result:'NEGATIVE', reference:'NEG', score:'OK' },
    ]
  });
});

// search / chatbot stubs
app.get('/api/search', (req,res) => {
  const q = String(req.query.q||'').toLowerCase();
  res.json(SEARCH_INDEX.filter(r => r.caseId.toLowerCase().includes(q) || r.insured.toLowerCase().includes(q)));
});
app.post('/api/v1/chatbot/session/start', (_req,res)=>res.json({id:`s_${Date.now()}`}));
app.post('/api/v1/chatbot/message', (_req,res)=>res.json({ok:true}));

const PORT = 8081;
app.listen(PORT, () => console.log(`BE on ${PORT}`));
