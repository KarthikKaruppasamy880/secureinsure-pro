// Role-Based Access Control (RBAC) Configuration
// Phase 6: RBAC with Underwriter-only restrictions

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  AGENT: 'AGENT', 
  CASE_MANAGER: 'CASE_MANAGER',
  UNDERWRITER: 'UNDERWRITER',
  ADMIN: 'ADMIN'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  // Customer permissions
  VIEW_OWN_POLICIES: 'VIEW_OWN_POLICIES',
  VIEW_OWN_CLAIMS: 'VIEW_OWN_CLAIMS',
  SUBMIT_CLAIMS: 'SUBMIT_CLAIMS',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  
  // Agent permissions
  VIEW_CUSTOMER_POLICIES: 'VIEW_CUSTOMER_POLICIES',
  CREATE_POLICIES: 'CREATE_POLICIES',
  UPDATE_POLICIES: 'UPDATE_POLICIES',
  SUBMIT_APPLICATIONS: 'SUBMIT_APPLICATIONS',
  
  // Case Manager permissions
  MANAGE_CASES: 'MANAGE_CASES',
  ASSIGN_AGENTS: 'ASSIGN_AGENTS',
  REVIEW_APPLICATIONS: 'REVIEW_APPLICATIONS',
  APPROVE_BASIC_POLICIES: 'APPROVE_BASIC_POLICIES',
  
  // Underwriter permissions (RESTRICTED)
  UNDERWRITE_POLICIES: 'UNDERWRITE_POLICIES',
  APPROVE_COMPLEX_POLICIES: 'APPROVE_COMPLEX_POLICIES',
  SET_PREMIUM_RATES: 'SET_PREMIUM_RATES',
  ASSESS_RISK: 'ASSESS_RISK',
  OVERRIDE_UNDERWRITING_RULES: 'OVERRIDE_UNDERWRITING_RULES',
  VIEW_UNDERWRITING_REPORTS: 'VIEW_UNDERWRITING_REPORTS',
  
  // Admin permissions
  ADMIN_ACCESS: 'ADMIN_ACCESS',
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_ROLES: 'MANAGE_ROLES',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  
  // General permissions
  POLICY_READ: 'POLICY_READ',
  POLICY_WRITE: 'POLICY_WRITE',
  CLAIM_READ: 'CLAIM_READ',
  CLAIM_WRITE: 'CLAIM_WRITE',
  SEARCH_ACCESS: 'SEARCH_ACCESS',
  DOCUMENT_ACCESS: 'DOCUMENT_ACCESS'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role hierarchy and permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.CUSTOMER]: [
    PERMISSIONS.VIEW_OWN_POLICIES,
    PERMISSIONS.VIEW_OWN_CLAIMS,
    PERMISSIONS.SUBMIT_CLAIMS,
    PERMISSIONS.UPDATE_PROFILE,
    PERMISSIONS.SEARCH_ACCESS
  ],
  
  [ROLES.AGENT]: [
    PERMISSIONS.VIEW_CUSTOMER_POLICIES,
    PERMISSIONS.CREATE_POLICIES,
    PERMISSIONS.UPDATE_POLICIES,
    PERMISSIONS.SUBMIT_APPLICATIONS,
    PERMISSIONS.POLICY_READ,
    PERMISSIONS.CLAIM_READ,
    PERMISSIONS.SEARCH_ACCESS,
    PERMISSIONS.DOCUMENT_ACCESS
  ],
  
  [ROLES.CASE_MANAGER]: [
    PERMISSIONS.MANAGE_CASES,
    PERMISSIONS.ASSIGN_AGENTS,
    PERMISSIONS.REVIEW_APPLICATIONS,
    PERMISSIONS.APPROVE_BASIC_POLICIES,
    PERMISSIONS.POLICY_READ,
    PERMISSIONS.POLICY_WRITE,
    PERMISSIONS.CLAIM_READ,
    PERMISSIONS.CLAIM_WRITE,
    PERMISSIONS.SEARCH_ACCESS,
    PERMISSIONS.DOCUMENT_ACCESS
  ],
  
  [ROLES.UNDERWRITER]: [
    // Underwriter-specific permissions (RESTRICTED)
    PERMISSIONS.UNDERWRITE_POLICIES,
    PERMISSIONS.APPROVE_COMPLEX_POLICIES,
    PERMISSIONS.SET_PREMIUM_RATES,
    PERMISSIONS.ASSESS_RISK,
    PERMISSIONS.OVERRIDE_UNDERWRITING_RULES,
    PERMISSIONS.VIEW_UNDERWRITING_REPORTS,
    
    // Standard permissions
    PERMISSIONS.POLICY_READ,
    PERMISSIONS.POLICY_WRITE,
    PERMISSIONS.CLAIM_READ,
    PERMISSIONS.CLAIM_WRITE,
    PERMISSIONS.SEARCH_ACCESS,
    PERMISSIONS.DOCUMENT_ACCESS
  ],
  
  [ROLES.ADMIN]: [
    // Admin has access to everything
    ...Object.values(PERMISSIONS)
  ]
};

// Underwriter-only features that need special access control
export const UNDERWRITER_ONLY_FEATURES = {
  UI_COMPONENTS: [
    'PremiumRateCalculator',
    'RiskAssessmentPanel',
    'UnderwritingRulesEditor',
    'ComplexPolicyApproval',
    'RiskProfileAnalysis'
  ],
  
  API_ENDPOINTS: [
    '/api/underwriting/assess-risk',
    '/api/underwriting/set-premium-rates',
    '/api/underwriting/override-rules',
    '/api/underwriting/approve-complex',
    '/api/underwriting/reports'
  ],
  
  ACTIONS: [
    'SET_PREMIUM_RATES',
    'ASSESS_RISK',
    'OVERRIDE_UNDERWRITING_RULES',
    'APPROVE_COMPLEX_POLICIES',
    'VIEW_UNDERWRITING_REPORTS'
  ]
};

// Access control rules
export const ACCESS_RULES = {
  // Routes that require specific roles
  ROUTE_ACCESS: {
    '/underwriting': [ROLES.UNDERWRITER, ROLES.ADMIN],
    '/admin': [ROLES.ADMIN],
    '/case-management': [ROLES.CASE_MANAGER, ROLES.UNDERWRITER, ROLES.ADMIN],
    '/risk-assessment': [ROLES.UNDERWRITER, ROLES.ADMIN],
    '/premium-calculator': [ROLES.UNDERWRITER, ROLES.ADMIN]
  },
  
  // Components that require specific roles
  COMPONENT_ACCESS: {
    'PremiumCalculator': [ROLES.UNDERWRITER, ROLES.ADMIN],
    'RiskAssessment': [ROLES.UNDERWRITER, ROLES.ADMIN],
    'UnderwritingRules': [ROLES.UNDERWRITER, ROLES.ADMIN],
    'ComplexPolicyApproval': [ROLES.UNDERWRITER, ROLES.ADMIN],
    'UserManagement': [ROLES.ADMIN],
    'SystemConfiguration': [ROLES.ADMIN]
  },
  
  // API endpoints that require specific roles
  API_ACCESS: {
    'POST:/api/underwriting/assess-risk': [ROLES.UNDERWRITER, ROLES.ADMIN],
    'POST:/api/underwriting/set-premium-rates': [ROLES.UNDERWRITER, ROLES.ADMIN],
    'POST:/api/underwriting/override-rules': [ROLES.UNDERWRITER, ROLES.ADMIN],
    'POST:/api/underwriting/approve-complex': [ROLES.UNDERWRITER, ROLES.ADMIN],
    'GET:/api/underwriting/reports': [ROLES.UNDERWRITER, ROLES.ADMIN],
    'POST:/api/admin/users': [ROLES.ADMIN],
    'PUT:/api/admin/users/:id': [ROLES.ADMIN],
    'DELETE:/api/admin/users/:id': [ROLES.ADMIN]
  }
};

// Helper functions for access control
export const hasRole = (userRoles: string[], requiredRole: Role): boolean => {
  return userRoles.includes(requiredRole);
};

export const hasAnyRole = (userRoles: string[], requiredRoles: Role[]): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};

export const hasAllRoles = (userRoles: string[], requiredRoles: Role[]): boolean => {
  return requiredRoles.every(role => userRoles.includes(role));
};

export const hasPermission = (userPermissions: string[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: Permission[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: Permission[]): boolean => {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

// Check if user can access a specific feature
export const canAccessFeature = (
  userRoles: string[], 
  userPermissions: string[], 
  feature: keyof typeof UNDERWRITER_ONLY_FEATURES.UI_COMPONENTS | keyof typeof UNDERWRITER_ONLY_FEATURES.ACTIONS
): boolean => {
  if (UNDERWRITER_ONLY_FEATURES.UI_COMPONENTS.includes(feature as any) || 
      UNDERWRITER_ONLY_FEATURES.ACTIONS.includes(feature as any)) {
    return hasAnyRole(userRoles, [ROLES.UNDERWRITER, ROLES.ADMIN]);
  }
  return true;
};

// Check if user can access a specific route
export const canAccessRoute = (userRoles: string[], route: string): boolean => {
  const requiredRoles = ACCESS_RULES.ROUTE_ACCESS[route as keyof typeof ACCESS_RULES.ROUTE_ACCESS];
  if (!requiredRoles) return true; // No restrictions
  return hasAnyRole(userRoles, requiredRoles);
};

// Check if user can access a specific component
export const canAccessComponent = (userRoles: string[], componentName: string): boolean => {
  const requiredRoles = ACCESS_RULES.COMPONENT_ACCESS[componentName as keyof typeof ACCESS_RULES.COMPONENT_ACCESS];
  if (!requiredRoles) return true; // No restrictions
  return hasAnyRole(userRoles, requiredRoles);
};

// Check if user can access a specific API endpoint
export const canAccessAPI = (userRoles: string[], method: string, endpoint: string): boolean => {
  const key = `${method}:${endpoint}`;
  const requiredRoles = ACCESS_RULES.API_ACCESS[key as keyof typeof ACCESS_RULES.API_ACCESS];
  if (!requiredRoles) return true; // No restrictions
  return hasAnyRole(userRoles, requiredRoles);
};

// Get user's effective permissions based on roles
export const getEffectivePermissions = (userRoles: string[]): Permission[] => {
  const permissions = new Set<Permission>();
  
  userRoles.forEach(role => {
    const rolePermissions = ROLE_PERMISSIONS[role as Role];
    if (rolePermissions) {
      rolePermissions.forEach(permission => permissions.add(permission));
    }
  });
  
  return Array.from(permissions);
};

// Check if user is an underwriter (for special restrictions)
export const isUnderwriter = (userRoles: string[]): boolean => {
  return hasAnyRole(userRoles, [ROLES.UNDERWRITER, ROLES.ADMIN]);
};

// Check if user is restricted from certain features
export const isRestricted = (userRoles: string[]): boolean => {
  return !isUnderwriter(userRoles);
}; 