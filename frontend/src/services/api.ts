import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { auditService } from './auditService';
import { errorHandler } from './errorHandler';

// Extend AxiosRequestConfig to include _retry property
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
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

// Response interceptor to handle errors and audit access
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful access attempts for restricted endpoints
    const url = response.config.url || '';
    const method = response.config.method || 'GET';
    
    if (url.includes('/underwriting') || url.includes('/admin') || url.includes('/risk-assessment')) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      auditService.logAccessAttempt({
        userId: user.id || 'unknown',
        username: user.username || 'unknown',
        userRoles: user.roles || [],
        action: 'API_ACCESS',
        resource: url,
        resourceType: 'api',
        accessGranted: true,
        ipAddress: 'client-side',
        userAgent: navigator.userAgent,
        metadata: {
          method,
          statusCode: response.status,
          responseSize: JSON.stringify(response.data).length
        }
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
      // Handle 401 Unauthorized - try to refresh token
  if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
    originalRequest._retry = true;
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/auth/refresh`,
          { refreshToken }
        );
        
        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      }
    } catch (refreshError) {
      // Refresh failed, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
    
    // Handle 403 Forbidden - log unauthorized access attempt
    if (error.response?.status === 403) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const url = originalRequest?.url || '';
      const method = originalRequest?.method || 'GET';
      
      // Log unauthorized access attempt
      auditService.logUnauthorizedAccess({
        userId: user.id || 'unknown',
        username: user.username || 'unknown',
        userRoles: user.roles || [],
        action: 'API_ACCESS_DENIED',
        resource: url,
        resourceType: 'api',
        reason: 'Insufficient permissions or role requirements not met',
        ipAddress: 'client-side',
        userAgent: navigator.userAgent,
        metadata: {
          method,
          statusCode: 403,
          errorMessage: (error.response?.data as any)?.message || 'Access forbidden',
          requiredRoles: (error.response?.data as any)?.requiredRoles,
          requiredPermissions: (error.response?.data as any)?.requiredPermissions
        }
      });
      
      // Use error handler for consistent error handling
      errorHandler.handlePermissionError(error, 'API Access');
      
      // Optionally redirect to access denied page
      if (url.includes('/underwriting') || url.includes('/admin')) {
        // Redirect to dashboard with access denied message
        window.location.href = '/dashboard?error=access_denied';
      }
    }
    
    // Handle 500+ server errors
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      
      // Log server errors for monitoring
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      auditService.logAccessAttempt({
        userId: user.id || 'unknown',
        username: user.username || 'unknown',
        userRoles: user.roles || [],
        action: 'API_SERVER_ERROR',
        resource: originalRequest?.url || 'unknown',
        resourceType: 'api',
        accessGranted: false,
        reason: `Server error: ${error.response.status}`,
        ipAddress: 'client-side',
        userAgent: navigator.userAgent,
        metadata: {
          method: originalRequest?.method || 'GET',
          statusCode: error.response.status,
          errorMessage: (error.response.data as any)?.message || 'Internal server error'
        }
      });
      
      // Use error handler for server errors
      errorHandler.handleApiError(error, 'API Server Error');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get user info from localStorage
const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

// Enhanced API methods with audit logging
const enhancedApi = {
  ...api,
  
  // GET with audit logging
  async get(url: string, config?: any) {
    try {
      const response = await api.get(url, config);
      return response;
    } catch (error) {
      await this.logApiError('GET', url, error);
      errorHandler.handleApiError(error, `GET ${url}`);
      throw error;
    }
  },
  
  // POST with audit logging
  async post(url: string, data?: any, config?: any) {
    try {
      const response = await api.post(url, data, config);
      return response;
    } catch (error) {
      await this.logApiError('POST', url, error);
      errorHandler.handleApiError(error, `POST ${url}`);
      throw error;
    }
  },
  
  // PUT with audit logging
  async put(url: string, data?: any, config?: any) {
    try {
      const response = await api.put(url, data, config);
      return response;
    } catch (error) {
      await this.logApiError('PUT', url, error);
      errorHandler.handleApiError(error, `PUT ${url}`);
      throw error;
    }
  },
  
  // DELETE with audit logging
  async delete(url: string, config?: any) {
    try {
      const response = await api.delete(url, config);
      return response;
    } catch (error) {
      await this.logApiError('DELETE', url, error);
      errorHandler.handleApiError(error, `DELETE ${url}`);
      throw error;
    }
  },
  
  // Log API errors for audit purposes
  async logApiError(method: string, url: string, error: any) {
    const user = getUserInfo();
    
    try {
      await auditService.logAccessAttempt({
        userId: user.id || 'unknown',
        username: user.username || 'unknown',
        userRoles: user.roles || [],
        action: 'API_ERROR',
        resource: url,
        resourceType: 'api',
        accessGranted: false,
        reason: error.response?.data?.message || error.message || 'API request failed',
        ipAddress: 'client-side',
        userAgent: navigator.userAgent,
        metadata: {
          method,
          statusCode: error.response?.status,
          errorType: error.name,
          errorMessage: error.message
        }
      });
    } catch (auditError) {
      // Don't let audit logging errors break the main flow
      console.error('Failed to log API error for audit:', auditError);
    }
  }
};

export { api, enhancedApi };
export default api; 