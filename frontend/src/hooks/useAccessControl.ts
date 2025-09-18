import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAccessControl() {
  const { state } = useContext(AuthContext);
  
  const canManageUsers = () => {
    return state.isAuthenticated && state.user?.roles?.includes('ADMIN');
  };
  
  const canEditApplications = () => {
    return state.isAuthenticated && (
      state.user?.roles?.includes('ADMIN') || 
      state.user?.roles?.includes('UNDERWRITER')
    );
  };
  
  const canViewApplications = () => {
    return state.isAuthenticated;
  };

  // Role-based access control
  const hasAnyRole = (roles: string[]) => {
    if (!state.isAuthenticated || !state.user?.roles) return false;
    return roles.some(role => state.user?.roles?.includes(role));
  };

  const hasAllRoles = (roles: string[]) => {
    if (!state.isAuthenticated || !state.user?.roles) return false;
    return roles.every(role => state.user?.roles?.includes(role));
  };

  // Permission-based access control
  const hasAllPermissions = (permissions: string[]) => {
    if (!state.isAuthenticated || !state.user?.permissions) return false;
    return permissions.every(permission => state.user?.permissions?.includes(permission));
  };

  const hasAnyPermission = (permissions: string[]) => {
    if (!state.isAuthenticated || !state.user?.permissions) return false;
    return permissions.some(permission => state.user?.permissions?.includes(permission));
  };

  // Feature-based access control
  const canAccessFeature = (feature: string) => {
    if (!state.isAuthenticated) return false;
    
    // Default feature access based on roles
    const featureAccess: Record<string, string[]> = {
      'PremiumCalculator': ['UNDERWRITER', 'ADMIN'],
      'RiskAssessment': ['UNDERWRITER', 'ADMIN'],
      'AuditLogs': ['ADMIN'],
      'UserManagement': ['ADMIN'],
      'SystemSettings': ['ADMIN']
    };

    const requiredRoles = featureAccess[feature] || [];
    return hasAnyRole(requiredRoles);
  };

  // User role information
  const getUserRoleInfo = () => {
    const roles = state.user?.roles || [];
    const primaryRole = roles[0] || 'USER';
    
    const roleDisplayNames: Record<string, string> = {
      'ADMIN': 'Administrator',
      'UNDERWRITER': 'Underwriter',
      'AGENT': 'Insurance Agent',
      'USER': 'User'
    };

    return {
      roles,
      primaryRole,
      displayName: roleDisplayNames[primaryRole] || primaryRole,
      isMultiRole: roles.length > 1,
      roleCount: roles.length
    };
  };

  return {
    canManageUsers,
    canEditApplications,
    canViewApplications,
    hasAnyRole,
    hasAllRoles,
    hasAllPermissions,
    hasAnyPermission,
    canAccessFeature,
    getUserRoleInfo
  };
}