import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchLabResults } from '../../lib/services/examOneService';

export default function ExamOneResultsPage(){
  const { caseId = '' } = useParams();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
        const data = await fetchLabResults(caseId);
        if(mounted) setRows(Array.isArray(data)? data : []);
      } finally { if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted = false; };
  },[caseId]);

  if (loading) return <div className="p-6">Loading lab results…</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-3" data-testid="examone-title">LabPiqture (ExamOne) Results</h1>
      <div className="overflow-auto border rounded-md">
        <table className="min-w-[800px]" data-testid="examone-table">
          <thead><tr>
            <th className="text-left p-2">Test</th>
            <th className="text-left p-2">Result</th>
            <th className="text-left p-2">Reference</th>
            <th className="text-left p-2">Date</th>
          </tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="border-t">
                <td className="p-2">{r.testName}</td>
                <td className="p-2">{r.value}</td>
                <td className="p-2">{r.reference}</td>
                <td className="p-2">{r.date}</td>
              </tr>
            ))}
            {!rows.length && <tr><td className="p-2" colSpan={4}>No results</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}