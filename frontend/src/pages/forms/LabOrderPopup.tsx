import React, { useEffect, useState } from "react";

export default function LabOrderPopup() {
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get("caseId") || "";

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function orderAndFetch() {
    setBusy(true); 
    setError(null);
    try {
      // 1) place order (POST TXLife)
      const order = await fetch(`http://localhost:8082/api/lab/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      }).then(r => r.json());

      // 2) poll result (simplified)
      const res = await fetch(`http://localhost:8082/api/lab/orders/${order.id}`).then(r => r.json());
      setResult(res);
    } catch (e: any) {
      setError(e?.message || "Order failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { 
    if (caseId) {
      orderAndFetch(); 
    }
  }, [caseId]);

  return (
    <div className="p-3" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h3 className="mb-3" data-testid="examone-title">ExamOne / LabPiQture</h3>
      {busy && <div className="alert alert-info" data-testid="examone-loading">Placing order…</div>}
      {error && <div className="alert alert-danger" data-testid="examone-error">{error}</div>}

      {result && (
        <>
          <div className="mb-3" data-testid="examone-recommendation">
            <strong>Recommended Action:</strong> {result?.aggregatedRecommendation?.recommendedAction || "-"}
          </div>
          <div className="row g-3" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="col-md-6" style={{ flex: '1' }}>
              <div className="card" style={{ border: '1px solid #e6e8eb', borderRadius: '8px', background: '#fff' }}>
                <div className="card-header" style={{ padding: '12px 16px', background: '#f7f9fc', borderBottom: '1px solid #eef0f3', fontWeight: '600' }}>Applicant Details</div>
                <div className="card-body small" style={{ padding: '16px', fontSize: '0.875rem' }}>
                  <div><b>Name</b>: {result?.party?.name}</div>
                  <div><b>DOB</b>: {result?.party?.dob}</div>
                  <div><b>SSN</b>: {result?.party?.ssnMasked}</div>
                  <div><b>Zip</b>: {result?.party?.zip}</div>
                </div>
              </div>
            </div>
            <div className="col-md-6" style={{ flex: '1' }}>
              <div className="card" style={{ border: '1px solid #e6e8eb', borderRadius: '8px', background: '#fff' }}>
                <div className="card-header" style={{ padding: '12px 16px', background: '#f7f9fc', borderBottom: '1px solid #eef0f3', fontWeight: '600' }}>Risk / Probability</div>
                <div className="card-body small" style={{ padding: '16px', fontSize: '0.875rem' }}>
                  <div><b>Nicotine Test</b>: {result?.aggregatedRecommendation?.nicotineTest}</div>
                  <div><b>Reasons</b>: {result?.aggregatedRecommendation?.reasons?.join(", ")}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3" style={{ border: '1px solid #e6e8eb', borderRadius: '8px', background: '#fff' }}>
            <div className="card-header" style={{ padding: '12px 16px', background: '#f7f9fc', borderBottom: '1px solid #eef0f3', fontWeight: '600' }}>Physician Specialty Scores</div>
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table table-sm mb-0" data-testid="examone-table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eef0f3', fontWeight: '600' }}>Specialty</th>
                    <th className="text-end" style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eef0f3', fontWeight: '600' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(result?.physicianSpecialties || []).map((r: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eef0f3' }}>
                      <td style={{ padding: '12px' }}>{r.specality}</td>
                      <td className="text-end" style={{ padding: '12px', textAlign: 'right' }}>{r.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
