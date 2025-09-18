// ExamOne XML Request/Response handlers for ACORD standard

export function buildExamOneRequestXml(payload: any): string {
  const {
    trackingId = 'EXM-0000000050065799',
    policyNumber = 'CA0002118006',
    firstName = 'Thomas',
    lastName = 'Dowd',
    ssn = '011766359',
    dob = '1991-11-24',
    gender = 'M',
    occupation = 'Salaried',
    address = {
      line1: '5 Waller Way',
      city: 'Edgartown',
      state: 'MA',
      zip: '02539'
    },
    phone = '774-5633151',
    email = 'thomas284k@gmail.com'
  } = payload;

  return `<?xml version="1.0" encoding="UTF-8"?>
<TXLife xmlns="http://ACORD.org/Standards/Life/2" Version="2.10.00">
   <UserAuthRequest>
      <UserLoginName/>
      <UserPswd>
         <CryptType/>
         <Pswd/>
      </UserPswd>
      <UserDate>${new Date().toISOString().split('T')[0]}</UserDate>
      <UserTime>${new Date().toTimeString().split(' ')[0]}</UserTime>
      <VendorApp>
         <VendorName VendorCode=""/>
         <AppName/>
         <AppVer/>
      </VendorApp>
   </UserAuthRequest>
   <TXLifeRequest PrimaryObjectID="Holding_1">
      <TransRefGUID>${trackingId}</TransRefGUID>
      <TransType tc="121">121</TransType>
      <TransExeDate>${new Date().toISOString().split('T')[0]}</TransExeDate>
      <TransExeTime>${new Date().toTimeString().split(' ')[0]}</TransExeTime>
      <TransMode tc="2">ORIGINAL</TransMode>
      <OLifE>
         <SourceInfo>
            <CreationDate>${new Date().toISOString().split('T')[0]}</CreationDate>
            <CreationTime>${new Date().toTimeString().split(' ')[0]}</CreationTime>
         </SourceInfo>
         <Holding id="Holding_1">
            <HoldingTypeCode tc="2">Policy</HoldingTypeCode>
            <Policy>
               <PolNumber>${policyNumber}</PolNumber>
               <LineOfBusiness tc="1">Life</LineOfBusiness>
               <ProductType tc="5">IUL</ProductType>
               <ProductCode>ELIULV01</ProductCode>
               <CarrierCode>ELIC</CarrierCode>
               <PolicyStatus tc="12">Proposed</PolicyStatus>
               <Life>
                  <FaceAmt>2000000</FaceAmt>
                  <Coverage>
                     <IndicatorCode tc="1">Base</IndicatorCode>
                     <LifeParticipant PartyID="Party_1">
                        <LifeParticipantRoleCode tc="1">primins</LifeParticipantRoleCode>
                     </LifeParticipant>
                  </Coverage>
               </Life>
               <ApplicationInfo>
                  <TrackingID>${trackingId}</TrackingID>
                  <ApplicationJurisdiction tc="26">MA</ApplicationJurisdiction>
               </ApplicationInfo>
               <RequirementInfo AppliesToPartyID="Party_1"
                                RequesterPartyID="Party_Requestor"
                                RequestorContactPartyID="Party_Requestor">
                  <ReqCode tc="1003802253">HealthPiQture</ReqCode>
                  <RequirementInfoUniqueID>50052714</RequirementInfoUniqueID>
                  <RequestedDate>${new Date().toISOString().split('T')[0]}</RequestedDate>
                  <RequirementAcctNum>NAO</RequirementAcctNum>
               </RequirementInfo>
            </Policy>
         </Holding>
         <Party id="Party_1">
            <PartyTypeCode tc="1">Person</PartyTypeCode>
            <GovtID>${ssn}</GovtID>
            <GovtIDTC tc="1">SSN</GovtIDTC>
            <ResidenceState tc="26">MA</ResidenceState>
            <ResidenceCountry tc="1">US</ResidenceCountry>
            <Person>
               <FirstName>${firstName}</FirstName>
               <LastName>${lastName}</LastName>
               <Occupation>${occupation}</Occupation>
               <Gender tc="1">${gender}</Gender>
               <BirthDate>${dob}</BirthDate>
               <DriversLicenseNum>S45359822</DriversLicenseNum>
               <DriversLicenseState tc="26">MA</DriversLicenseState>
               <BirthCountry tc="1">US</BirthCountry>
               <BirthJurisdictionTC tc="26">MA</BirthJurisdictionTC>
            </Person>
            <Address>
               <AddressTypeCode tc="1">H</AddressTypeCode>
               <Line1>${address.line1}</Line1>
               <City>${address.city}</City>
               <AddressStateTC tc="26">${address.state}</AddressStateTC>
               <Zip>${address.zip}</Zip>
            </Address>
            <Address>
               <AddressTypeCode tc="17">M</AddressTypeCode>
            </Address>
            <Phone>
               <PhoneTypeCode tc="2">BUSIN</PhoneTypeCode>
            </Phone>
            <Phone>
               <PhoneTypeCode tc="12">CELL</PhoneTypeCode>
               <AreaCode>${phone.split('-')[0]}</AreaCode>
               <DialNumber>${phone.split('-')[1]}</DialNumber>
            </Phone>
            <Phone>
               <PhoneTypeCode tc="1">HOME</PhoneTypeCode>
            </Phone>
            <EMailAddress>
               <AddrLine>${email}</AddrLine>
            </EMailAddress>
         </Party>
         <Party id="Party_Requestor">
            <FullName>ELIC</FullName>
            <Organization/>
            <Carrier>
               <CarrierCode>ELIC</CarrierCode>
            </Carrier>
            <EMailAddress/>
         </Party>
         <Relation id="Relation_1"
                   OriginatingObjectID="Holding_1"
                   RelatedObjectID="Party_1">
            <OriginatingObjectType tc="4">Holding</OriginatingObjectType>
            <RelatedObjectType tc="6">Party</RelatedObjectType>
            <RelationRoleCode tc="32">primins</RelationRoleCode>
         </Relation>
         <Relation id="Relation_2"
                   OriginatingObjectID="Holding_1"
                   RelatedObjectID="Party_Requestor">
            <OriginatingObjectType tc="4">Holding</OriginatingObjectType>
            <RelatedObjectType tc="6">Party</RelatedObjectType>
            <RelationRoleCode tc="97">Requestor</RelationRoleCode>
         </Relation>
      </OLifE>
   </TXLifeRequest>
</TXLife>`;
}

export function parseExamOneResponseXml(xml: string): any {
  // Parse the response XML and extract key information
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  
  const pick = (q: string) => {
    const element = doc.querySelector(q);
    return element?.textContent?.trim() || "";
  };

  const pickAll = (q: string) => {
    const elements = doc.querySelectorAll(q);
    return Array.from(elements).map(el => el.textContent?.trim() || "");
  };

  // Extract aggregated recommendation
  const aggregatedRecommendation = {
    recommendedAction: pick("recommendedAction"),
    nicotineTest: pick("nicotineTest"),
    reasons: pickAll("reason"),
    labTestCodeCategory: pick("labTestCodeCategory"),
    diagnosisCodeCategory: pick("diagnosisCodeCategory")
  };

  // Extract lab test results
  const labTestResults = pickAll("testName").map((testName, index) => ({
    testName,
    action: pickAll("action")[index] || "",
    mostRecentServiceDate: pickAll("mostRecentServiceDate")[index] || "",
    underwritingClass: pickAll("underwritingClass")[index] || ""
  }));

  // Extract physician specialties
  const physicianSpecialties = pickAll("specality").map((specialty, index) => ({
    specialty,
    score: pickAll("score")[index] || "0"
  }));

  return {
    status: "Completed",
    requestId: pick("transRefGuid"),
    aggregatedRecommendation,
    labTestResults,
    physicianSpecialties,
    // Legacy format for compatibility
    nicotine: aggregatedRecommendation.nicotineTest,
    action: aggregatedRecommendation.recommendedAction,
    physicians: physicianSpecialties,
    drugs: []
  };
}

// Sample response data based on your provided XML
export function getSampleExamOneResponse(): any {
  return {
    status: "Completed",
    requestId: "EXM-0000000050065799",
    aggregatedRecommendation: {
      recommendedAction: "Refer To Underwriter",
      nicotineTest: "NEGATIVE",
      reasons: ["flagged physician specialty"],
      labTestCodeCategory: "Refer To Underwriter",
      diagnosisCodeCategory: "Clear"
    },
    labTestResults: [
      {
        testName: "flagged physician specialty",
        action: "Refer To Underwriter",
        mostRecentServiceDate: "0001-01-01",
        underwritingClass: ""
      },
      {
        testName: "Gamma glutamyl transferase GGT (2324-2)",
        action: "Approve",
        mostRecentServiceDate: "2019-09-24",
        underwritingClass: "Preferred Plus"
      },
      {
        testName: "Hemoglobin A1c/Hemoglobin.total (4548-4)",
        action: "Approve",
        mostRecentServiceDate: "2019-09-24",
        underwritingClass: "Preferred Plus"
      },
      {
        testName: "Blood Pressure",
        action: "Approve",
        mostRecentServiceDate: "2019-09-24",
        underwritingClass: "Preferred Plus"
      },
      {
        testName: "Cholesterol (2093-3)",
        action: "Approve",
        mostRecentServiceDate: "2019-09-24",
        underwritingClass: "Preferred Plus"
      },
      {
        testName: "Urine Nicotine (3854-7) (NEGATIVE)",
        action: "Approve",
        mostRecentServiceDate: "2019-09-24",
        underwritingClass: "Preferred Plus"
      }
    ],
    physicianSpecialties: [
      {
        specialty: "Acupuncture",
        score: "0"
      },
      {
        specialty: "Addictionology",
        score: "10"
      },
      {
        specialty: "Family Practice",
        score: "0"
      },
      {
        specialty: "Internal Medicine",
        score: "0"
      },
      {
        specialty: "Psychiatry",
        score: "5"
      }
    ],
    // Legacy format for compatibility
    nicotine: "NEGATIVE",
    action: "Refer To Underwriter",
    physicians: [
      { specialty: "Acupuncture", score: "0" },
      { specialty: "Addictionology", score: "10" },
      { specialty: "Family Practice", score: "0" },
      { specialty: "Internal Medicine", score: "0" },
      { specialty: "Psychiatry", score: "5" }
    ],
    drugs: []
  };
}