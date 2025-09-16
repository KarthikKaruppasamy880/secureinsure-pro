import React, { useMemo, useState } from "react";
import { useParams } from 'react-router-dom';
import templateMap from '../config/templateMap.json';
import { tx1ToAppModel } from '../lib/tx1/toApplicationModel';
import { Button } from '../components/ui/button';
import { Edit, Save, X, Stethoscope, Bot } from "lucide-react";

// 1) feed TX1 from router state, api, or file upload. For now: window.__TX1_XML loaded elsewhere.
declare global { interface Window { __TX1_XML?: string } }

// Sample TX1 XML data for testing
const SAMPLE_TX1_XML = `<?xml version="1.0" encoding="UTF-8"?>
<TXLife xmlns="http://ACORD.org/Standards/Life/2" Version="2.23.00">
   <UserAuthRequest>
      <UserLoginName>eApp</UserLoginName>
      <UserPswd>
         <CryptType>NONE</CryptType>
         <Pswd>SBLife</Pswd>
      </UserPswd>
      <VendorApp>
         <VendorName VendorCode="220">eApp</VendorName>
         <AppName>eApp</AppName>
         <AppVer>6.4</AppVer>
      </VendorApp>
   </UserAuthRequest>
   <TXLifeRequest PrimaryObjectID="Holding_1">
      <TransRefGUID>6479f7c2fd99c0315b29f35c</TransRefGUID>
      <TransType tc="103">New Business Submission</TransType>
      <TransSubType tc="12100">General Requirement Order Administration</TransSubType>
      <TransExeDate>2023-06-02</TransExeDate>
      <TransExeTime>14:10:42</TransExeTime>
      <OLifE>
         <SourceInfo>
            <SourceInfoName>E-APP</SourceInfoName>
         </SourceInfo>
         <Holding id="Holding_1">
            <HoldingTypeCode tc="2">Policy</HoldingTypeCode>
            <HoldingStatus tc="3">Proposed</HoldingStatus>
            <HoldingForm tc="1">Individual</HoldingForm>
            <Policy CarrierPartyID="Party_Carrier_1">
               <LineOfBusiness tc="1">Life</LineOfBusiness>
               <ProductType tc="5">Index Universal Life</ProductType>
               <ProductCode>ELIULV01</ProductCode>
               <CarrierCode>ELIC</CarrierCode>
               <PlanName>ELIULV01</PlanName>
               <ShortName>Everly IUL TermVest Plus</ShortName>
               <PolicyStatus tc="21">Applied For</PolicyStatus>
               <Life>
                  <FaceAmt>200000</FaceAmt>
                  <Coverage id="Base_Coverage">
                     <PlanName>ELIULV01</PlanName>
                     <ProductCode>ELIULV01</ProductCode>
                     <IndicatorCode tc="1">Base</IndicatorCode>
                     <DeathBenefitOptType tc="1">Level</DeathBenefitOptType>
                     <CurrentAmt>200000</CurrentAmt>
                     <PayToYear>20</PayToYear>
                     <CovOption id="OPT_BASE">
                        <UnderwritingClass tc="11">Standard Non-Tobacco</UnderwritingClass>
                     </CovOption>
                     <LifeParticipant id="LP_Insured_1" PartyID="Party_PI_1">
                        <LifeParticipantRoleCode tc="1">Primary Insured</LifeParticipantRoleCode>
                        <IssueAge>31</IssueAge>
                     </LifeParticipant>
                     <LifeParticipant id="LP_Owner_1" PartyID="Party_PI_1">
                        <LifeParticipantRoleCode tc="18">Owner</LifeParticipantRoleCode>
                     </LifeParticipant>
                  </Coverage>
               </Life>
               <ApplicationInfo>
                  <TrackingID>6479f7c2fd99c0315b29f35c</TrackingID>
                  <HOAppFormNumber>AA12345678</HOAppFormNumber>
                  <ApplicationType tc="1">New</ApplicationType>
                  <ApplicationJurisdiction tc="10">DC</ApplicationJurisdiction>
                  <SubmissionType tc="2">Electronic</SubmissionType>
                  <ApplicationCollectionDate>2023-06-02</ApplicationCollectionDate>
                  <OLifEExtension VendorCode="154">
                     <QuoteID>Q622023106387458</QuoteID>
                     <QuoteDate>2023-06-02</QuoteDate>
                  </OLifEExtension>
               </ApplicationInfo>
            </Policy>
         </Holding>
         <Party id="Party_PI_1">
            <PartyTypeCode tc="1">Person</PartyTypeCode>
            <PartyKey>2002720</PartyKey>
            <ResidenceState tc="10">DC</ResidenceState>
            <IDReferenceNo>0014z00001rQihcAAC</IDReferenceNo>
            <IDReferenceType tc="35">Customer Number</IDReferenceType>
            <Person>
               <FirstName>Antoina</FirstName>
               <LastName>Wynn</LastName>
               <Gender tc="2">Female</Gender>
               <BirthDate>1992-02-11</BirthDate>
               <Age>31</Age>
               <AgeRecordedDate>2023-06-02</AgeRecordedDate>
               <NetIncomeAmt>25000</NetIncomeAmt>
               <DriversLicenseNum>W500067488111</DriversLicenseNum>
               <NoDriversLicenseInd tc="0">false</NoDriversLicenseInd>
               <DriversLicenseState tc="25">MD</DriversLicenseState>
               <BirthCountry tc="1">US</BirthCountry>
               <BirthJurisdictionTC tc="1">Alabama</BirthJurisdictionTC>
            </Person>
            <Address id="Address_Party_PI_1">
               <AddressTypeCode tc="1">Residence</AddressTypeCode>
               <Line1>2390 Pomeroy Rd SE</Line1>
               <Line2>Apt 413</Line2>
               <City>Washington</City>
               <AddressStateTC tc="10">DC</AddressStateTC>
               <Zip>20020</Zip>
            </Address>
            <Phone id="Phone_Party_PI_1">
               <PhoneTypeCode tc="12">Mobile</PhoneTypeCode>
               <AreaCode>202</AreaCode>
               <DialNumber>6408408</DialNumber>
               <PrefPhone tc="1">true</PrefPhone>
            </Phone>
            <EMailAddress id="EMailAddress_1">
               <EMailType tc="2">Personal</EMailType>
               <AddrLine>antoinawynn@gmail.com</AddrLine>
            </EMailAddress>
            <Employment>
               <OccupClass tc="1">Employed</OccupClass>
               <Occupation>Software Engineer</Occupation>
            </Employment>
            <GovtIDInfo id="GOVTID_1">
               <GovtID>577231664</GovtID>
               <GovtIDTC tc="1">Social Security Number</GovtIDTC>
            </GovtIDInfo>
            <OLifEExtension VendorCode="154">
               <HouseholdIncome>35000</HouseholdIncome>
            </OLifEExtension>
         </Party>
         <Party id="Party_Child_1">
            <PartyTypeCode tc="1">Person</PartyTypeCode>
            <Person>
               <FirstName>Lawrence</FirstName>
               <LastName>Thomas</LastName>
               <Gender tc="1">Male</Gender>
               <BirthDate>1985-02-11</BirthDate>
               <Age>12</Age>
            </Person>
            <Address id="Address_Party_Child_1">
               <AddressTypeCode tc="1">Residence</AddressTypeCode>
               <Line1>820 N Winnebago</Line1>
               <City>Rockford</City>
               <AddressStateTC tc="17">IL</AddressStateTC>
               <Zip>60012</Zip>
            </Address>
         </Party>
         <Party id="Party_Carrier_1">
            <PartyTypeCode tc="2">Organization</PartyTypeCode>
            <FullName>Everly Life</FullName>
         </Party>
      </OLifE>
   </TXLifeRequest>
</TXLife>`;

export default function ApplicationDetailsV2() {
  const { caseId } = useParams<{ caseId: string }>();
  const actualCaseId = caseId || 'CS-TX1-LOCAL';
  
  // Use sample data if no TX1 XML is available
  const tx1Xml = window.__TX1_XML || SAMPLE_TX1_XML;
  const parsed = useMemo(() => tx1ToAppModel(tx1Xml), [tx1Xml]);
  const [data, setData] = useState<Record<string, any>>(parsed);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [showAI, setShowAI] = useState(false);

  const startEdit = (section: string) =>
    setEditing(s => ({ ...s, [section]: true }));

  const saveEdit = (section: string, patch: Record<string, any>) => {
    setData(d => ({ ...d, ...patch }));
    setEditing(s => ({ ...s, [section]: false }));
    // POST only the changed fields to keep BE small:
    fetch(`/api/v1/cases/${data["Zinnia Case ID"]}/application`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, patch })
    });
  };

  const cancelEdit = (section: string) =>
    setEditing(s => ({ ...s, [section]: false }));

  // 2) ExamOne popup (not dashboard)
  const openExamOne = () => {
    const url = `/examone/result?caseId=${encodeURIComponent(data["Zinnia Case ID"] || actualCaseId)}`;
    window.open(url, "examone_popup", "width=1200,height=900,scrollbars=yes,resizable=yes");
  };

  const renderSection = (key: keyof typeof templateMap, title: string, extraRight?: React.ReactNode) => {
    const fields = (templateMap as any)[key] as string[];
    const isEditing = editing[title];
    const sectionTestId = title.toLowerCase().replace(/\s+/g, '-');

    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm" data-testid={`sec-${sectionTestId}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex gap-2">
            {extraRight}
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => startEdit(title)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
            ) : (
              <>
                <Button size="sm" onClick={() => saveEdit(title, {})}><Save className="mr-2 h-4 w-4" />Save</Button>
                <Button variant="outline" size="sm" onClick={() => cancelEdit(title)}><X className="mr-2 h-4 w-4" />Cancel</Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((label) => (
            <div key={label} className="space-y-1">
              <div className="text-xs font-medium text-gray-500">{label}</div>
              {!isEditing ? (
                <div className="rounded-md border bg-gray-50 px-3 py-2">{String(data[label] ?? "Not Applicable")}</div>
              ) : (
                <input
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                  value={data[label] ?? ""}
                  onChange={(e) => setData(d => ({ ...d, [label]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="container mx-auto max-w-[1280px] space-y-6 p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'} data-testid="back-button">
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold" data-testid="app-details-title">Application Details</h1>
            <p className="text-gray-600" data-testid="app-details-caseid">Case: {data["Zinnia Case ID"] ?? actualCaseId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="lg" 
            variant="default" 
            onClick={openExamOne} 
            data-testid="lab-order"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Stethoscope className="mr-2 h-5 w-5" />
            Lab / ExamOne
          </Button>
          <Button variant="outline" onClick={() => setShowAI(s => !s)}><Bot className="mr-2 h-4 w-4" />AI Assistant</Button>
        </div>
      </header>

      {showAI && (
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-gray-600">AI Assistant Panel - Coming Soon</div>
        </div>
      )}

      {renderSection("Case Setup", "Case Setup")}
      {renderSection("Insured", "Insured")}
      {renderSection("Child Insured", "Child Insured")}
      {renderSection("Owner", "Owner")}
      {renderSection("Payor", "Payor")}
      {renderSection("Beneficiary", "Beneficiary")}

      {/* Requirements Section - Similar to Risk 360 */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm" data-testid="sec-requirements">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Requirements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Requirement Display Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Image/Data</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Messages</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="border border-gray-300 px-4 py-2">Instant ID (LexisNexis)</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Received
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </td>
                <td className="border border-gray-300 px-4 py-2">-</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Criminal History (Milliman)</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Received
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </td>
                <td className="border border-gray-300 px-4 py-2">-</td>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-300 px-4 py-2">RX (Milliman)</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Reviewed
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button className="text-blue-600 hover:text-blue-800 underline">Link</button>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">MVR (LexisNexis)</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Reviewed
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button className="text-blue-600 hover:text-blue-800 underline">Link</button>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-300 px-4 py-2">MIB (MIB)</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Reviewed
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button className="text-blue-600 hover:text-blue-800 underline">View Result</button>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">Risk Classifier (LexisNexis)</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Reviewed
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button className="text-blue-600 hover:text-blue-800 underline">Link</button>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-300 px-4 py-2">
                  <button 
                    onClick={openExamOne}
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    LabPiqture (ExamOne)
                  </button>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Reviewed
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button 
                    onClick={openExamOne}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {renderSection("Premium Mode", "Premium Mode")}
    </div>
  );
}
