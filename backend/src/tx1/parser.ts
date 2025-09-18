import { XMLParser } from 'fast-xml-parser';
import { Application } from '../types/app';

const p = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
});

export function parseTx1ToApp(xml: string): Application {
  const doc = p.parse(xml);
  // TXLife → TXLifeRequest → OLifE
  const life = doc?.TXLife?.TXLifeRequest?.OLifE;
  const holding = life?.Holding?.Policy ?? life?.Holding?.[0]?.Policy;

  // Case/Policy
  const productCode = holding?.ProductCode ?? holding?.Life?.Coverage?.ProductCode;
  const planName = holding?.PlanName ?? holding?.Life?.Coverage?.PlanName;
  const faceAmt   = Number(holding?.Life?.FaceAmt ?? holding?.Life?.Coverage?.CurrentAmt ?? 0);
  const premium   = Number(holding?.PaymentAmt ?? 0);

  // Primary insured party (by id Party_PI_1 in your sample)
  const partyMap: Record<string, any> = {};
  (Array.isArray(life?.Party) ? life.Party : [life?.Party])
    .filter(Boolean).forEach((pt: any) => { partyMap[pt.id] = pt; });

  // pick insured by LifeParticipant → PartyID or Relation 'Insured'
  const insuredPartyId =
    holding?.Life?.Coverage?.LifeParticipant?.PartyID ||
    life?.Relation?.find?.((r: any) => r.RelationRoleCode?.includes?.('Insured'))?.RelatedObjectID;

  const insured = partyMap[insuredPartyId] || {};
  const person  = insured.Person || {};
  const addr    = insured.Address || insured.Address?.[0] || {};

  const caseId = holding?.ApplicationInfo?.TrackingID
              || holding?.PolNumber
              || `CS-${new Date().getFullYear()}-${Math.floor(Math.random()*900+100)}`;

  const app: Application = {
    caseId,
    sections: {
      caseSetup: {
        title: 'Case Setup',
        fields: {
          productCode,
          planName,
          faceAmount: faceAmt,
          premium,
          policyStatus: holding?.PolicyStatus,
          applicationJurisdiction: holding?.ApplicationInfo?.ApplicationJurisdiction,
        }
      },
      insured: {
        title: 'Insured',
        fields: {
          firstName: person.FirstName || '',
          lastName:  person.LastName  || '',
          gender:    person.Gender?.[Object.keys(person.Gender)[0]] || person.Gender || '',
          dob:       person.BirthDate || '',
          ssn:       insured.GovtID || '',
          address1:  addr.Line1 || '',
          city:      addr.City  || '',
          state:     addr.AddressStateTC || insured.ResidenceState || '',
          zip:       addr.Zip   || '',
          email:     insured.EMailAddress?.AddrLine || '',
          phone:     insured.Phone?.DialNumber || '',
        }
      },
      owner:   { title:'Owner',   fields:{} },
      payor:   { title:'Payor',   fields:{} },
      beneficiaries: { title:'Beneficiaries', fields:{} },
      riders:  { title:'Benefits / Riders', fields:{} },
      medical: { title:'Medical', fields:{} },
      nonMedical: { title:'Non-Medical', fields:{} },
    }
  };

  return app;
}
