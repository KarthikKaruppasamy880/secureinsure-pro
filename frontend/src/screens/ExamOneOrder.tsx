import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "react-hot-toast";

export default function ExamOneOrder(){
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<any>(null);

  async function placeOrder() {
    setBusy(true);
    try{
      const r = await fetch("http://localhost:8082/api/v1/examone/lab-request", { 
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: "current-case" })
      });
      const j = await r.json();
      setResp(j);
      toast.success("Order placed");
    }catch(e){ 
      toast.error("Order failed"); 
    } finally{
      setBusy(false);
    }
  }

  useEffect(()=>{ 
    document.title = "ExamOne / Lab Order"; 
  },[]);

  return (
    <div className="p-6">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>LabPiQture / ExamOne Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-gray-600">
            This window is separate from the Application Details and can be closed independently.
          </div>
          <Button disabled={busy} onClick={placeOrder}>
            {busy ? "Placing Order..." : "Submit Order"}
          </Button>
          {resp && (
            <pre className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
              {JSON.stringify(resp, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
