export const Deeplinks = {
  "insured": {
    path: "/application/:caseId/insured",
    anchor: null
  },
  "insured.email": {
    path: "/application/:caseId/insured",
    anchor: "Email Address"
  },
  "insured.mobile": {
    path: "/application/:caseId/insured",
    anchor: "Mobile Phone"
  },
  "insured.address": {
    path: "/application/:caseId/insured",
    anchor: "Address Information"
  },
  "insured.dob": {
    path: "/application/:caseId/insured",
    anchor: "Date of Birth"
  },
  "insured.ssn": {
    path: "/application/:caseId/insured",
    anchor: "SSN"
  },
  "caseSetup": {
    path: "/application/:caseId/case-setup",
    anchor: null
  },
  "beneficiary": {
    path: "/application/:caseId/beneficiary",
    anchor: null
  },
  "owner": {
    path: "/application/:caseId/owner",
    anchor: null
  },
  "payor": {
    path: "/application/:caseId/payor",
    anchor: null
  },
  "medical": {
    path: "/application/:caseId/medical",
    anchor: null
  },
  "premium": {
    path: "/application/:caseId/premium",
    anchor: null
  }
};

export interface DeeplinkConfig {
  path: string;
  anchor: string | null;
}

export function navigateToDeeplink(caseId: string, key: string): void {
  const deeplink = Deeplinks[key as keyof typeof Deeplinks];
  if (!deeplink) {
    console.warn(`Unknown deeplink key: ${key}`);
    return;
  }

  const path = deeplink.path.replace(':caseId', caseId);
  
  // Navigate to the path
  window.location.href = path;
  
  // If there's an anchor, scroll to it after navigation
  if (deeplink.anchor) {
    setTimeout(() => {
      const element = document.querySelector(`[data-field="${deeplink.anchor}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight effect
        element.classList.add('ring-2', 'ring-primary-600', 'duration-1000');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary-600', 'duration-1000');
        }, 1000);
      }
    }, 500);
  }
}
