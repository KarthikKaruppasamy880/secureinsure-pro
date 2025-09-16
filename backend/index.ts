import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import applicationRoutes from './src/routes/application';
import { examone } from './src/routes/examone';

const app = express();
app.use(bodyParser.json());

const ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173').split(',').filter(Boolean);
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = ORIGINS.some(allowedOrigin => 
      origin.startsWith(allowedOrigin) || origin === allowedOrigin
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS Warning: Frontend origin ${origin} may not be in backend ALLOWED_ORIGINS`);
      callback(null, true); // Allow for now, but log warning
    }
  },
  credentials: true 
}));

// in-memory store
const store: Record<string, any> = Object.create(null);

// Health
app.get('/health', (_req,res)=>res.json({ok:true}));
app.get('/ready',  (_req,res)=>res.json({ok:true}));
app.get('/version',(_req,res)=>res.json({service:'mock-backend',version:'dev'}));

// Mount application routes
app.use('/api/v1', applicationRoutes);
app.use('/api', examone);

// Application
app.get('/api/v1/cases/:caseId/application',(req,res)=>{
  const appObj = store[req.params.caseId];
  if(!appObj) return res.status(404).json({error:'not found'});
  res.json(appObj);
});
app.post('/api/v1/cases/:caseId/application',(req,res)=>{
  const { caseId } = req.params;
  store[caseId] = store[caseId] || { case:{caseNumber: caseId}, sections:{} };
  res.json(store[caseId]);
});
app.patch('/api/v1/cases/:caseId/application/:section',(req,res)=>{
  const { caseId, section } = req.params;
  const fields = req.body?.fields || {};
  store[caseId] = store[caseId] || { case:{caseNumber:caseId}, sections:{} };
  const sec = store[caseId].sections[section] ||= { fields:{} };
  sec.fields = { ...sec.fields, ...fields };
  res.json(sec);
});

// ExamOne
app.post('/api/v1/examone/lab-request',(req,res)=>{
  const {caseId} = req.body || {};
  if(!caseId) return res.status(400).json({error:'missing caseId'});
  res.json({ ok:true, requestId:'REQ-'+Date.now(), caseId });
});
app.get('/api/v1/examone/results',(req,res)=>{
  const { caseId } = req.query as any;
  // deterministic mock rows
  res.json([
    { testName:'Hemoglobin A1c', value:'5.1%', reference:'4.2–5.6', date:'2019-09-24' },
    { testName:'Cholesterol', value:'168 mg/dL', reference:'<200', date:'2019-09-24' },
  ]);
});

// Lab Order endpoints for ExamOne popup
app.post('/api/lab/orders', async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) return res.status(400).json({ error: 'missing caseId' });
  
  // Simulate creating an order by sending TXLife request
  // In real implementation, this would send the actual TXLife XML to ExamOne
  const orderId = `EXM-${caseId}-${Date.now()}`;
  
  // Store the order in our in-memory store
  store[`order_${orderId}`] = {
    id: orderId,
    caseId,
    status: 'processing',
    createdAt: new Date().toISOString()
  };
  
  res.json({ id: orderId });
});

app.get('/api/lab/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = store[`order_${id}`];
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  // Simulate provider response by returning shaped JSON
  // In real implementation, this would parse the actual SOAP response from ExamOne
  const shaped = {
    party: { 
      name: "Thomas Dowd", 
      dob: "1991-11-24", 
      ssnMasked: "011-76-6359", 
      zip: "02539" 
    },
    aggregatedRecommendation: {
      recommendedAction: "Refer To Underwriter",
      nicotineTest: "NEGATIVE",
      reasons: ["flagged physician specialty"],
    },
    physicianSpecialties: [
      { specality: "Addictionology", score: 10 },
      { specality: "Psychiatry", score: 5 },
      { specality: "Acupuncture", score: 0 },
    ],
  };
  
  res.json(shaped);
});

const port = +(process.env.PORT || 8081);
app.listen(port, ()=>console.log('BE listening on', port));
