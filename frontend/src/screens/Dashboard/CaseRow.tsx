import React from 'react';
import { Link } from 'react-router-dom';

export default function CaseRow({ item }: { item: any }) {
  const id = item?.caseId ?? item?.caseID ?? item?.id ?? item?.policyId;
  
  if (!id) {
    return <span className="text-gray-500">—</span>;
  }
  
  return (
    <Link 
      to={`/cases/${id}`} 
      className="text-blue-600 underline hover:text-blue-800" 
      data-testid={`case-link-${id}`}
    >
      {id}
    </Link>
  );
}
