import { api } from './api';

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  userRoles: string[];
  action: string;
  resource: string;
  resourceType: 'route' | 'component' | 'api' | 'feature';
  accessGranted: boolean;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AccessAttempt {
  userId: string;
  username: string;
  userRoles: string[];
  action: string;
  resource: string;
  resourceType: 'route' | 'component' | 'api' | 'feature';
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requiredFeatures?: string[];
  accessGranted: boolean;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface RoleChangeAudit {
  id: string;
  adminUserId: string;
  adminUsername: string;
  targetUserId: string;
  targetUsername: string;
  action: 'ASSIGN_ROLE' | 'REMOVE_ROLE' | 'UPDATE_ROLE';
  roleName: string;
  previousRoles?: string[];
  newRoles?: string[];
  reason?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PermissionChangeAudit {
  id: string;
  adminUserId: string;
  adminUsername: string;
  targetUserId: string;
  targetUsername: string;
  action: 'GRANT_PERMISSION' | 'REVOKE_PERMISSION' | 'UPDATE_PERMISSIONS';
  permissionName: string;
  previousPermissions?: string[];
  newPermissions?: string[];
  reason?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UnderwritingAudit {
  id: string;
  underwriterId: string;
  underwriterUsername: string;
  action: 'ASSESS_RISK' | 'SET_PREMIUM_RATES' | 'OVERRIDE_RULES' | 'APPROVE_COMPLEX_POLICY';
  policyId?: string;
  caseId?: string;
  details: string;
  riskScore?: number;
  premiumRate?: number;
  overrideReason?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const auditService = {
  // Log access attempts
  async logAccessAttempt(accessData: AccessAttempt): Promise<AuditLog> {
    try {
      const response = await api.post('/audit/access', accessData);
      return response.data;
    } catch (error) {
      console.error('Error logging access attempt:', error);
      // Don't throw error to avoid breaking the main flow
      return {
        id: Date.now().toString(),
        userId: accessData.userId,
        username: accessData.username,
        userRoles: accessData.userRoles,
        action: accessData.action,
        resource: accessData.resource,
        resourceType: accessData.resourceType,
        accessGranted: accessData.accessGranted,
        reason: accessData.reason,
        ipAddress: accessData.ipAddress,
        userAgent: accessData.userAgent,
        timestamp: new Date().toISOString(),
        metadata: accessData.metadata
      };
    }
  },

  // Log unauthorized access attempts
  async logUnauthorizedAccess(accessData: Omit<AccessAttempt, 'accessGranted'>): Promise<AuditLog> {
    return this.logAccessAttempt({
      ...accessData,
      accessGranted: false,
      reason: 'Insufficient permissions or role requirements not met'
    });
  },

  // Log role changes
  async logRoleChange(roleChangeData: Omit<RoleChangeAudit, 'id' | 'timestamp'>): Promise<RoleChangeAudit> {
    try {
      const response = await api.post('/audit/roles', roleChangeData);
      return response.data;
    } catch (error) {
      console.error('Error logging role change:', error);
      return {
        id: Date.now().toString(),
        adminUserId: roleChangeData.adminUserId,
        adminUsername: roleChangeData.adminUsername,
        targetUserId: roleChangeData.targetUserId,
        targetUsername: roleChangeData.targetUsername,
        action: roleChangeData.action,
        roleName: roleChangeData.roleName,
        previousRoles: roleChangeData.previousRoles,
        newRoles: roleChangeData.newRoles,
        reason: roleChangeData.reason,
        timestamp: new Date().toISOString(),
        metadata: roleChangeData.metadata
      };
    }
  },

  // Log permission changes
  async logPermissionChange(permissionChangeData: Omit<PermissionChangeAudit, 'id' | 'timestamp'>): Promise<PermissionChangeAudit> {
    try {
      const response = await api.post('/audit/permissions', permissionChangeData);
      return response.data;
    } catch (error) {
      console.error('Error logging permission change:', error);
      return {
        id: Date.now().toString(),
        adminUserId: permissionChangeData.adminUserId,
        adminUsername: permissionChangeData.adminUsername,
        targetUserId: permissionChangeData.targetUserId,
        targetUsername: permissionChangeData.targetUsername,
        action: permissionChangeData.action,
        permissionName: permissionChangeData.permissionName,
        previousPermissions: permissionChangeData.previousPermissions,
        newPermissions: permissionChangeData.newPermissions,
        reason: permissionChangeData.reason,
        timestamp: new Date().toISOString(),
        metadata: permissionChangeData.metadata
      };
    }
  },

  // Log underwriting actions
  async logUnderwritingAction(underwritingData: Omit<UnderwritingAudit, 'id' | 'timestamp'>): Promise<UnderwritingAudit> {
    try {
      const response = await api.post('/audit/underwriting', underwritingData);
      return response.data;
    } catch (error) {
      console.error('Error logging underwriting action:', error);
      return {
        id: Date.now().toString(),
        underwriterId: underwritingData.underwriterId,
        underwriterUsername: underwritingData.underwriterUsername,
        action: underwritingData.action,
        policyId: underwritingData.policyId,
        caseId: underwritingData.caseId,
        details: underwritingData.details,
        riskScore: underwritingData.riskScore,
        premiumRate: underwritingData.premiumRate,
        overrideReason: underwritingData.overrideReason,
        timestamp: new Date().toISOString(),
        metadata: underwritingData.metadata
      };
    }
  },

  // Get audit logs for a user
  async getUserAuditLogs(userId: string, page = 0, size = 20): Promise<{
    content: AuditLog[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await api.get(`/audit/user/${userId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      throw error;
    }
  },

  // Get audit logs for a resource
  async getResourceAuditLogs(resource: string, resourceType: string, page = 0, size = 20): Promise<{
    content: AuditLog[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await api.get(`/audit/resource?resource=${resource}&resourceType=${resourceType}&page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resource audit logs:', error);
      throw error;
    }
  },

  // Get unauthorized access attempts
  async getUnauthorizedAccessLogs(page = 0, size = 20): Promise<{
    content: AuditLog[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await api.get(`/audit/unauthorized?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unauthorized access logs:', error);
      throw error;
    }
  },

  // Get role change audit logs
  async getRoleChangeLogs(page = 0, size = 20): Promise<{
    content: RoleChangeAudit[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await api.get(`/audit/roles?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role change logs:', error);
      throw error;
    }
  },

  // Get underwriting audit logs
  async getUnderwritingAuditLogs(page = 0, size = 20): Promise<{
    content: UnderwritingAudit[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await api.get(`/audit/underwriting?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching underwriting audit logs:', error);
      throw error;
    }
  },

  // Export audit logs
  async exportAuditLogs(filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    resource?: string;
    resourceType?: string;
    accessGranted?: boolean;
    action?: string;
  }): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/audit/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  },

  // Mock data for development
  getMockAuditLogs(): AuditLog[] {
    return [
      {
        id: '1',
        userId: 'user1',
        username: 'john.doe',
        userRoles: ['AGENT'],
        action: 'ACCESS_ATTEMPT',
        resource: '/policies',
        resourceType: 'route',
        accessGranted: true,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...'
      },
      {
        id: '2',
        userId: 'user2',
        username: 'jane.smith',
        userRoles: ['CUSTOMER'],
        action: 'ACCESS_ATTEMPT',
        resource: '/admin',
        resourceType: 'route',
        accessGranted: false,
        reason: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...'
      }
    ];
  }
}; 