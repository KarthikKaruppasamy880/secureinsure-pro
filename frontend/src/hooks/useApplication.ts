import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

export function useApplication(caseId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<unknown>(null);
  const fetched = useRef(false);

  useEffect(() => {
    let alive = true;
    if (fetched.current) return; // prevents loops
    fetched.current = true;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/cases/${caseId}/application`);
        if (alive) setData(res);
      } catch (e) {
        if (alive) setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [caseId]);

  return { data, loading, err };
}
