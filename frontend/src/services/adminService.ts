import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  occupation?: string;
  company?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: string;
    dataSharing: boolean;
    analytics: boolean;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

export interface SystemAudit {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failure';
}

export interface SystemConfiguration {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  isEncrypted: boolean;
  isReadOnly: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  responseTime: number;
  uptime: number;
  lastUpdated: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
  profile?: Partial<UserProfile>;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
  status?: string;
  profile?: Partial<UserProfile>;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
  isActive?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export const adminService = {
  // User Management
  async getUsers(page = 0, size = 20, filters?: {
    status?: string;
    role?: string;
    search?: string;
  }): Promise<{
    content: User[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  async getUserById(userId: string): Promise<User> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  async activateUser(userId: string): Promise<User> {
    const response = await api.post(`/admin/users/${userId}/activate`);
    return response.data;
  },

  async deactivateUser(userId: string): Promise<User> {
    const response = await api.post(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  async suspendUser(userId: string, reason: string): Promise<User> {
    const response = await api.post(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  async resetUserPassword(userId: string): Promise<{ temporaryPassword: string }> {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  },

  async getUserAuditLog(userId: string, page = 0, size = 20): Promise<{
    content: SystemAudit[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await api.get(`/admin/users/${userId}/audit?${params.toString()}`);
    return response.data;
  },

  // Role Management
  async getRoles(): Promise<Role[]> {
    const response = await api.get('/admin/roles');
    return response.data;
  },

  async getRoleById(roleId: string): Promise<Role> {
    const response = await api.get(`/admin/roles/${roleId}`);
    return response.data;
  },

  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    const response = await api.post('/admin/roles', roleData);
    return response.data;
  },

  async updateRole(roleId: string, roleData: UpdateRoleRequest): Promise<Role> {
    const response = await api.put(`/admin/roles/${roleId}`, roleData);
    return response.data;
  },

  async deleteRole(roleId: string): Promise<void> {
    await api.delete(`/admin/roles/${roleId}`);
  },

  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    const response = await api.post(`/admin/users/${userId}/roles`, { roleId });
    return response.data;
  },

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}/roles/${roleId}`);
  },

  // Permission Management
  async getPermissions(): Promise<Permission[]> {
    const response = await api.get('/admin/permissions');
    return response.data;
  },

  async getPermissionsByCategory(category: string): Promise<Permission[]> {
    const response = await api.get(`/admin/permissions/category/${category}`);
    return response.data;
  },

  // System Audit
  async getAuditLogs(page = 0, size = 20, filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<{
    content: SystemAudit[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/admin/audit?${params.toString()}`);
    return response.data;
  },

  async exportAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/admin/audit/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // System Configuration
  async getSystemConfigurations(category?: string): Promise<SystemConfiguration[]> {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }

    const response = await api.get(`/admin/configurations?${params.toString()}`);
    return response.data;
  },

  async getSystemConfiguration(key: string): Promise<SystemConfiguration> {
    const response = await api.get(`/admin/configurations/${key}`);
    return response.data;
  },

  async updateSystemConfiguration(key: string, value: string): Promise<SystemConfiguration> {
    const response = await api.put(`/admin/configurations/${key}`, { value });
    return response.data;
  },

  async createSystemConfiguration(configData: {
    key: string;
    value: string;
    description: string;
    category: string;
    isEncrypted?: boolean;
  }): Promise<SystemConfiguration> {
    const response = await api.post('/admin/configurations', configData);
    return response.data;
  },

  async deleteSystemConfiguration(key: string): Promise<void> {
    await api.delete(`/admin/configurations/${key}`);
  },

  // System Metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await api.get('/admin/metrics');
    return response.data;
  },

  async getSystemMetricsHistory(duration: string): Promise<{
    timestamps: string[];
    cpuUsage: number[];
    memoryUsage: number[];
    diskUsage: number[];
    activeUsers: number[];
    totalRequests: number[];
    errorRate: number[];
    responseTime: number[];
  }> {
    const response = await api.get(`/admin/metrics/history?duration=${duration}`);
    return response.data;
  },

  // System Health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'up' | 'down' | 'warning';
      responseTime: number;
      lastChecked: string;
      message?: string;
    }>;
    overallStatus: string;
    lastUpdated: string;
  }> {
    const response = await api.get('/admin/health');
    return response.data;
  },

  // Backup and Restore
  async createBackup(backupData: {
    name: string;
    description?: string;
    includeData: boolean;
    includeConfig: boolean;
  }): Promise<{
    backupId: string;
    status: string;
    estimatedTime: number;
  }> {
    const response = await api.post('/admin/backup', backupData);
    return response.data;
  },

  async getBackupStatus(backupId: string): Promise<{
    backupId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    startTime: string;
    endTime?: string;
    errorMessage?: string;
    downloadUrl?: string;
  }> {
    const response = await api.get(`/admin/backup/${backupId}/status`);
    return response.data;
  },

  async getBackups(): Promise<Array<{
    backupId: string;
    name: string;
    description?: string;
    status: string;
    size: number;
    createdAt: string;
    downloadUrl?: string;
  }>> {
    const response = await api.get('/admin/backup');
    return response.data;
  },

  async restoreBackup(backupId: string): Promise<{
    restoreId: string;
    status: string;
    estimatedTime: number;
  }> {
    const response = await api.post(`/admin/backup/${backupId}/restore`);
    return response.data;
  },

  // Reports
  async generateReport(reportData: {
    type: string;
    parameters: Record<string, any>;
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<{
    reportId: string;
    status: string;
    estimatedTime: number;
  }> {
    const response = await api.post('/admin/reports', reportData);
    return response.data;
  },

  async getReportStatus(reportId: string): Promise<{
    reportId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    startTime: string;
    endTime?: string;
    errorMessage?: string;
    downloadUrl?: string;
  }> {
    const response = await api.get(`/admin/reports/${reportId}/status`);
    return response.data;
  },

  async getReports(): Promise<Array<{
    reportId: string;
    type: string;
    status: string;
    createdAt: string;
    downloadUrl?: string;
  }>> {
    const response = await api.get('/admin/reports');
    return response.data;
  },

  // System Statistics
  async getSystemStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalPolicies: number;
    activePolicies: number;
    totalClaims: number;
    openClaims: number;
    totalRevenue: number;
    averageResponseTime: number;
    systemUptime: number;
    lastUpdated: string;
  }> {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  // User Activity
  async getUserActivity(days: number = 30): Promise<{
    dates: string[];
    activeUsers: number[];
    newUsers: number[];
    loginAttempts: number[];
    failedLogins: number[];
  }> {
    const response = await api.get(`/admin/activity?days=${days}`);
    return response.data;
  },

  // System Logs
  async getSystemLogs(page = 0, size = 20, filters?: {
    level?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    content: Array<{
      id: string;
      level: string;
      source: string;
      message: string;
      timestamp: string;
      metadata?: Record<string, any>;
    }>;
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/admin/logs?${params.toString()}`);
    return response.data;
  },
}; 