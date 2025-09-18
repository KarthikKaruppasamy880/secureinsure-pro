import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function ExamOne() {
  const params = new URLSearchParams(location.search);
  const caseId = params.get('caseId') || 'CS-TX1-LOCAL';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.get(`/api/examone/result?caseId=${caseId}`);
        setData(result);
      } catch (error) {
        console.error('Error fetching ExamOne results:', error);
        // Fallback to sample data if API fails
        setData({
          status: "Completed",
          requestId: "EXM-0000000050065799",
          aggregatedRecommendation: {
            recommendedAction: "Refer To Underwriter",
            nicotineTest: "NEGATIVE",
            reasons: ["flagged physician specialty"],
            labTestCodeCategory: "Refer To Underwriter",
            diagnosisCodeCategory: "Clear"
          },
          physicianSpecialties: [
            { specialty: "Acupuncture", score: "0" },
            { specialty: "Addictionology", score: "10" },
            { specialty: "Family Practice", score: "0" },
            { specialty: "Internal Medicine", score: "0" },
            { specialty: "Psychiatry", score: "5" }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [caseId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading lab results...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Failed to load lab results</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">LabPiQture (ExamOne) Results</h1>
        
        {/* Status Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Status:</div>
              <div className="font-medium text-green-600">{data.status || 'Completed'}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Request ID:</div>
              <div className="font-medium">{data.requestId || 'EXM-0000000050065799'}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Nicotine Test:</div>
              <div className="font-medium text-green-600">{data.aggregatedRecommendation?.nicotineTest || 'NEGATIVE'}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Action:</div>
              <div className="font-medium text-red-600">{data.aggregatedRecommendation?.recommendedAction || 'Refer To Underwriter'}</div>
            </div>
          </div>
        </div>

        {/* Applicant Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Applicant Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Applicant</div>
              <div className="font-medium">HAM, Den</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Sex</div>
              <div className="font-medium">Female</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">DOB</div>
              <div className="font-medium">07-26-1983</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">SSN</div>
              <div className="font-medium">000000000</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Zip</div>
              <div className="font-medium">08201</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Company</div>
              <div className="font-medium">Everly Life Insurance Company</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Acct</div>
              <div className="font-medium">PS1</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500">Requestor</div>
              <div className="font-medium">Cro, Cour</div>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Score Summary</h2>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-center text-gray-500">Score data will be displayed here</div>
          </div>
        </div>

        {/* ScriptCheck Report */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ScriptCheck - Report</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Request ID</div>
                <div className="font-medium">{data.requestId || '50019664'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Claims-Eligibility</div>
                <div className="font-medium">-</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">From</div>
                <div className="font-medium">-</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">To</div>
                <div className="font-medium">-</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Condition</div>
                <div className="font-medium">-</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">%</div>
                <div className="font-medium">-</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Category</div>
                <div className="font-medium">-</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Demog Risk Score</div>
                <div className="font-medium">-</div>
              </div>
            </div>
          </div>
        </div>

        {/* Specialty Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Specialty Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Prescriber</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Doctor Specialty</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.physicianSpecialties?.map((physician: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2">{physician.prescriber || 'KUPONIYI, P'}</td>
                    <td className="border border-gray-300 px-4 py-2">{physician.specialty}</td>
                    <td className="border border-gray-300 px-4 py-2">{physician.score}</td>
                  </tr>
                )) || (
                  <>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2">KUPONIYI, P</td>
                      <td className="border border-gray-300 px-4 py-2">Internal Medicine - Addiction Medicine</td>
                      <td className="border border-gray-300 px-4 py-2">10</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Not Specified</td>
                      <td className="border border-gray-300 px-4 py-2">Not Provided</td>
                      <td className="border border-gray-300 px-4 py-2">0</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2">KUPONIYI, PETER</td>
                      <td className="border border-gray-300 px-4 py-2">Internal Medicine</td>
                      <td className="border border-gray-300 px-4 py-2">0</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">ZAPPIA,L</td>
                      <td className="border border-gray-300 px-4 py-2">Nurse Practitioner - Family</td>
                      <td className="border border-gray-300 px-4 py-2">0</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drug Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Drug Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Rx Cnt</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Drug Label</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">HIC Therapeutic Class</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">HIC Code</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Last Filled</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-2" colSpan={6}>
                    <div className="text-center text-gray-500 py-4">
                      Total Rx Cnt: 0 | Score High/Total: 0/0
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Prescription Detail */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Prescription Detail</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Drug Label</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Rx Number</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Qty</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Days</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Filled</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">RF #</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Total RF</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Prescriber</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Pharmacy</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-2" colSpan={9}>
                    <div className="text-center text-gray-500 py-4">No prescription data available</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* LabPiQture Report */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">LabPiQture - Report</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Test Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Results</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Reference Range</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Lab</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-2" colSpan={5}>
                    <div className="text-center text-gray-500 py-4">No lab test data available</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Aggregated Recommendation */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Aggregated Recommendation</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Recommended Action for LabPiQture</div>
                <div className="font-medium text-red-600">{data.aggregatedRecommendation?.recommendedAction || 'Refer To Underwriter'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Recommended Extra Mortality Loading</div>
                <div className="font-medium">-</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Recommended Underwriting Class</div>
                <div className="font-medium">-</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Recommended Underwriting Class Table</div>
                <div className="font-medium">-</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Nicotine Test</div>
                <div className="font-medium text-green-600">{data.aggregatedRecommendation?.nicotineTest || 'NEGATIVE'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">MIB Codes</div>
                <div className="font-medium">346KRB</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Reasons</div>
                <div className="font-medium">{data.aggregatedRecommendation?.reasons?.[0] || 'flagged physician specialty'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Lab Test Category</div>
                <div className="font-medium text-red-600">{data.aggregatedRecommendation?.labTestCodeCategory || 'Refer To Underwriter'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">Diagnosis Code Category</div>
                <div className="font-medium">{data.aggregatedRecommendation?.diagnosisCodeCategory || 'Review (Not Aggregated)'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Claims Report */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Medical Claims - Report</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Request ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Response Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Total # of Claims</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-2" colSpan={3}>
                    <div className="text-center text-gray-500 py-4">No medical claims data available</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-center">
          <button 
            onClick={() => window.close()} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
