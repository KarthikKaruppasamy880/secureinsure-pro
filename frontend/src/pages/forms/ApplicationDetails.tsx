import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

type ApplicationData = Record<string, any>;

const SECTION_TITLES: Record<string,string> = {
  "case-setup": "Case Setup",
  "insured": "Insured",
  "owner": "Owner",
  "payor": "Payor",
  "beneficiary": "Beneficiary",
  "Secondary Address": "Secondary Address",
  "Life Insurance History": "Life Insurance History",
  "Non-Medical Information": "Non-Medical Information",
  "Medical Information": "Medical Information",
  "Premium Mode": "Premium Mode",
};

export default function ApplicationDetails() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState<ApplicationData>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<ApplicationData>({});
  const [activeTab, setActiveTab] = useState("case-setup");
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load application data
  useEffect(() => {
    const loadData = async () => {
      if (!caseId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8082/api/v1/cases/${caseId}/application`);
        if (!response.ok) throw new Error('Failed to load application');
        const data = await response.json();
        setApplicationData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load application');
        toast.error('Failed to load application data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [caseId]);

  const toggleEdit = (key: string, on: boolean) => {
    setIsEditing((p) => ({ ...p, [key]: on }));
    setDraft(on ? applicationData : {});
  };

  const saveSection = async (sectionTitle: string) => {
    if (!caseId) return;
    
    try {
      // only changed keys
      const diff: ApplicationData = {};
      Object.keys(draft).forEach((k) => {
        if (draft[k] !== applicationData[k]) diff[k] = draft[k];
      });
      if (!Object.keys(diff).length) {
        toast("No changes");
        return toggleEdit(sectionTitle, false);
      }
      await fetch(`http://localhost:8082/api/v1/cases/${caseId}/application`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionTitle, fields: diff }),
      });
      setApplicationData((p) => ({ ...p, ...diff }));
      toggleEdit(sectionTitle, false);
      toast.success(`${sectionTitle} saved`);
    } catch (e) {
      toast.error(`Failed to save ${sectionTitle}`);
    }
  };

  const handleField = (name: string, value: any) => setDraft((p) => ({ ...p, [name]: value }));

  const SectionCard = ({ sectionKey, title }: { sectionKey: string; title: string }) => {
    const editable = true; // Simplified for now
    const editing = !!isEditing[title];
    
    // Mock fields for demonstration
    const fields = [
      "Policy Number",
      "Name", 
      "Date of Birth",
      "Address",
      "Phone",
      "Email"
    ];

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6" data-testid={`sec-${sectionKey.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            {sectionKey === "Medical Information" && (
              <button 
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => window.open("/examone/order", "examone_popup", "width=1200,height=800,noopener,noreferrer")}
                data-testid="lab-order"
              >
                Lab/ExamOne
              </button>
            )}
            {editable && !editing && (
              <button 
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => toggleEdit(title, true)}
              >
                Edit
              </button>
            )}
            {editable && editing && (
              <>
                <button 
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => saveSection(title)}
                >
                  Save
                </button>
                <button 
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  onClick={() => toggleEdit(title, false)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          {fields.map((f: string) => {
            const value = editing ? draft[f] ?? applicationData[f] : applicationData[f];
            return (
              <div key={f} className="space-y-1">
                <div className="text-sm text-gray-500">{f}</div>
                {editing ? (
                  <input
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    value={value ?? ""}
                    onChange={(e) => handleField(f, e.target.value)}
                    placeholder={`Enter ${f}`}
                  />
                ) : (
                  <div className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-gray-900">
                    {value ?? "Not Applicable"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6" data-testid="app-details-loading">
        <div className="text-center">Loading application details...</div>
      </div>
    );
  }

  if (error || !applicationData) {
    return (
      <div className="p-6" data-testid="app-details-error">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          {error || 'No application data found'}
        </div>
      </div>
    );
  }

  const displayCaseId = applicationData["Zinnia Case ID"] || caseId || "—";
  const displayName = applicationData["Name"] || "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900" data-testid="app-details-title">Application Details</h1>
          <p className="text-gray-600" data-testid="app-details-caseid">Case: {displayCaseId} — {displayName}</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            onClick={() => navigate('/dashboard')}
          >
            ← Back
          </button>
          <button 
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            onClick={() => setShowAIAssist((v) => !v)}
          >
            AI Assistant
          </button>
        </div>
      </div>

      {showAIAssist && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
          <div className="text-sm text-gray-600">
            AI Assistant functionality would go here.
          </div>
        </div>
      )}

      <div className="space-y-4">
        <SectionCard sectionKey="case-setup" title="Case Setup" />
        <SectionCard sectionKey="insured" title="Insured" />
        <SectionCard sectionKey="owner" title="Owner" />
        <SectionCard sectionKey="payor" title="Payor" />
        <SectionCard sectionKey="beneficiary" title="Beneficiary" />
        <SectionCard sectionKey="Secondary Address" title="Secondary Address" />
        <SectionCard sectionKey="Life Insurance History" title="Life Insurance History" />
        <SectionCard sectionKey="Non-Medical Information" title="Non-Medical Information" />
        <SectionCard sectionKey="Medical Information" title="Medical Information" />
        <SectionCard sectionKey="Premium Mode" title="Premium Mode" />
      </div>
    </div>
  );
}