import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ROLES,
  PERMISSIONS,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessFeature,
  canAccessRoute,
  canAccessComponent,
  canAccessAPI,
  getEffectivePermissions,
  isUnderwriter,
  isRestricted,
  type Role,
  type Permission
} from '../config/roles';

export const useAccessControl = () => {
  const { state } = useAuth();
  
  const userRoles = useMemo(() => state.user?.roles || [], [state.user?.roles]);
  const userPermissions = useMemo(() => state.user?.permissions || [], [state.user?.permissions]);
  
  // Memoize effective permissions to avoid recalculation
  const effectivePermissions = useMemo(() => 
    getEffectivePermissions(userRoles), 
    [userRoles]
  );
  
  // Role checks
  const hasRoleCheck = (role: Role): boolean => hasRole(userRoles, role);
  const hasAnyRoleCheck = (roles: Role[]): boolean => hasAnyRole(userRoles, roles);
  const hasAllRolesCheck = (roles: Role[]): boolean => hasAllRoles(userRoles, roles);
  
  // Permission checks
  const hasPermissionCheck = (permission: Permission): boolean => hasPermission(userPermissions, permission);
  const hasAnyPermissionCheck = (permissions: Permission[]): boolean => hasAnyPermission(userPermissions, permissions);
  const hasAllPermissionsCheck = (permissions: Permission[]): boolean => hasAllPermissions(userPermissions, permissions);
  
  // Feature access checks
  const canAccessFeatureCheck = (feature: string): boolean => 
    canAccessFeature(userRoles, userPermissions, feature as any);
  
  // Route access checks
  const canAccessRouteCheck = (route: string): boolean => canAccessRoute(userRoles, route);
  
  // Component access checks
  const canAccessComponentCheck = (componentName: string): boolean => 
    canAccessComponent(userRoles, componentName);
  
  // API access checks
  const canAccessAPICheck = (method: string, endpoint: string): boolean => 
    canAccessAPI(userRoles, method, endpoint);
  
  // Special role checks
  const isUnderwriterCheck = (): boolean => isUnderwriter(userRoles);
  const isRestrictedCheck = (): boolean => isRestricted(userRoles);
  
  // Convenience methods for common role combinations
  const isCustomer = (): boolean => hasRoleCheck(ROLES.CUSTOMER);
  const isAgent = (): boolean => hasRoleCheck(ROLES.AGENT);
  const isCaseManager = (): boolean => hasRoleCheck(ROLES.CASE_MANAGER);
  const isAdmin = (): boolean => hasRoleCheck(ROLES.ADMIN);
  
  // Check if user can perform underwriting actions
  const canUnderwrite = (): boolean => hasAnyRoleCheck([ROLES.UNDERWRITER, ROLES.ADMIN]);
  
  // Check if user can manage cases
  const canManageCases = (): boolean => hasAnyRoleCheck([ROLES.CASE_MANAGER, ROLES.UNDERWRITER, ROLES.ADMIN]);
  
  // Check if user can manage users
  const canManageUsers = (): boolean => hasAnyRoleCheck([ROLES.ADMIN]);
  
  // Check if user can approve policies
  const canApprovePolicies = (): boolean => hasAnyPermissionCheck([
    PERMISSIONS.APPROVE_BASIC_POLICIES,
    PERMISSIONS.APPROVE_COMPLEX_POLICIES
  ]);
  
  // Check if user can approve complex policies (underwriter only)
  const canApproveComplexPolicies = (): boolean => hasAnyRoleCheck([ROLES.UNDERWRITER, ROLES.ADMIN]);
  
  // Check if user can set premium rates (underwriter only)
  const canSetPremiumRates = (): boolean => hasAnyRoleCheck([ROLES.UNDERWRITER, ROLES.ADMIN]);
  
  // Check if user can assess risk (underwriter only)
  const canAssessRisk = (): boolean => hasAnyRoleCheck([ROLES.UNDERWRITER, ROLES.ADMIN]);
  
  // Check if user can override underwriting rules (underwriter only)
  const canOverrideRules = (): boolean => hasAnyRoleCheck([ROLES.UNDERWRITER, ROLES.ADMIN]);
  
  // Check if user can view underwriting reports (underwriter only)
  const canViewUnderwritingReports = (): boolean => hasAnyRoleCheck([ROLES.UNDERWRITER, ROLES.ADMIN]);
  
  // Get user's role display information
  const getUserRoleInfo = () => {
    const primaryRole = userRoles[0] || 'USER';
    const roleCount = userRoles.length;
    
    return {
      primaryRole,
      allRoles: userRoles,
      roleCount,
      isMultiRole: roleCount > 1,
      displayName: primaryRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    };
  };
  
  // Get user's permission summary
  const getPermissionSummary = () => {
    const totalPermissions = effectivePermissions.length;
    const underwritingPermissions = effectivePermissions.filter(p => 
      p.includes('UNDERWRITE') || p.includes('PREMIUM') || p.includes('RISK') || p.includes('RULES')
    ).length;
    
    return {
      totalPermissions,
      underwritingPermissions,
      hasUnderwritingAccess: underwritingPermissions > 0,
      permissionBreakdown: {
        customer: effectivePermissions.filter(p => p.includes('OWN_') || p.includes('PROFILE')).length,
        agent: effectivePermissions.filter(p => p.includes('CUSTOMER_') || p.includes('CREATE_')).length,
        caseManager: effectivePermissions.filter(p => p.includes('MANAGE_') || p.includes('ASSIGN_')).length,
        underwriting: underwritingPermissions,
        admin: effectivePermissions.filter(p => p.includes('ADMIN_') || p.includes('SYSTEM_')).length
      }
    };
  };
  
  return {
    // User state
    userRoles,
    userPermissions,
    effectivePermissions,
    
    // Role checks
    hasRole: hasRoleCheck,
    hasAnyRole: hasAnyRoleCheck,
    hasAllRoles: hasAllRolesCheck,
    
    // Permission checks
    hasPermission: hasPermissionCheck,
    hasAnyPermission: hasAnyPermissionCheck,
    hasAllPermissions: hasAllPermissionsCheck,
    
    // Access checks
    canAccessFeature: canAccessFeatureCheck,
    canAccessRoute: canAccessRouteCheck,
    canAccessComponent: canAccessComponentCheck,
    canAccessAPI: canAccessAPICheck,
    
    // Special checks
    isUnderwriter: isUnderwriterCheck,
    isRestricted: isRestrictedCheck,
    
    // Convenience role checks
    isCustomer,
    isAgent,
    isCaseManager,
    isAdmin,
    
    // Feature-specific checks
    canUnderwrite,
    canManageCases,
    canManageUsers,
    canApprovePolicies,
    canApproveComplexPolicies,
    canSetPremiumRates,
    canAssessRisk,
    canOverrideRules,
    canViewUnderwritingReports,
    
    // Information getters
    getUserRoleInfo,
    getPermissionSummary,
    
    // Constants for use in components
    ROLES,
    PERMISSIONS
  };
}; 