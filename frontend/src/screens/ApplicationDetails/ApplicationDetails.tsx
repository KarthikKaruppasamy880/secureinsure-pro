import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';

type Section = { fields: Record<string, any> };
type AppData = { caseId: string; sections: Record<string, Section> };

export default function ApplicationDetails() {
  const { caseId = '' } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<AppData>({ caseId, sections: {} });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get(`/api/v1/cases/${caseId}/application`)
      .then(r => { if (alive) setData(r.data || { caseId, sections:{} }); })
      .catch(e => setErr(e?.message || 'Load failed'))
      .finally(()=> setLoading(false));
    return () => { alive = false; };
  }, [caseId]);

  async function saveSection(section: string, nextFields: Record<string, any>) {
    const prev = data.sections?.[section]?.fields || {};
    const changed: Record<string, any> = {};
    Object.keys(nextFields || {}).forEach(k => { if (nextFields[k] !== prev[k]) changed[k] = nextFields[k]; });
    if (!Object.keys(changed).length) return;
    await api.patch(`/api/v1/cases/${caseId}/application/${section}`, { fields: changed });
    setData(d => ({
      ...d,
      sections: { ...d.sections, [section]: { fields: { ...prev, ...changed } } }
    }));
  }

  async function orderLab() {
    try {
      const response = await api.post('/api/v1/examone/lab-request', { caseId });
      console.log('Lab order response:', response.data);
      
      // Navigate to ExamOne results screen
      navigate(`/cases/${caseId}/examone`);
    } catch (error) {
      console.error('Lab order failed:', error);
      alert('Lab order failed. Please try again.');
    }
  }

  if (loading) return <div className="p-4">Loading…</div>;
  if (err) return <div className="p-4 text-red-600">Error: {err}</div>;

  const sections = useMemo(() => Object.entries(data.sections || {}), [data.sections]);
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/dashboard" className="text-blue-600 underline">← Back</Link>
        <h1 className="text-xl font-semibold" data-testid="app-details-title">Application Details</h1>
        <span className="text-sm text-gray-500" data-testid="app-details-caseid">Case: {data.caseId}</span>
        <Button onClick={orderLab} className="ml-auto bg-blue-600 text-white">
          Order Lab
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(([name, s]) => (
          <SectionCard key={`${data.caseId}:${name}`} name={name} fields={s.fields} onSave={(nf) => saveSection(name, nf)} />
        ))}
      </div>
    </div>
  );
}

function SectionCard({ name, fields, onSave }: { name: string; fields: Record<string, any>; onSave: (v: any) => void }) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState({ ...(fields || {}) });

  function guardStr(v:any){ return (v ?? '') as string; } // guard .toLowerCase/.length consumers upstream

  return (
    <div className="relative border rounded-xl p-4 bg-white">
      <div className="font-semibold mb-2">{name}</div>
      {!edit ? (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(draft || {}).map(([k, v]) => (
            <div key={k}>
              <div className="text-xs text-gray-500">{k}</div>
              <div>{String(v ?? '')}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(draft || {}).map(([k, v]) => (
            <label key={k} className="flex flex-col text-sm gap-1">
              <span className="text-xs text-gray-500">{k}</span>
              <input
                className="border rounded px-2 py-1"
                value={guardStr(v)}
                onChange={(e) => setDraft(d => ({ ...d, [k]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      )}
      <div className="sticky bottom-0 mt-3 flex gap-2">
        {!edit && <button className="px-3 py-2 rounded border" onClick={() => setEdit(true)}>Edit</button>}
        {edit && (
          <>
            <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => { setEdit(false); onSave(draft); }}>Save</button>
            <button className="px-3 py-2 rounded border" onClick={() => { setEdit(false); setDraft(fields); }}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
