// This is the existing ApplicationDetails component renamed for feature flag gating
import React from 'react';
import { useParams } from 'react-router-dom';

export default function ApplicationDetailsLegacy() {
  const { caseId } = useParams<{ caseId: string }>();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Application Details (Legacy)</h1>
      <p className="text-gray-600">Case ID: {caseId}</p>
      <p className="text-sm text-gray-500 mt-2">This is the legacy version. V2 is enabled via feature flag.</p>
    </div>
  );
}
