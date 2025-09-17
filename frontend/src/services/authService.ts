import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

// Create axios instance
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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', null, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
  mfaCode?: string;
  biometricData?: string;
  biometricType?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: string;
  roles: string[];
  permissions: string[];
  mfaEnabled: boolean;
  biometricEnabled: boolean;
  lastLogin: string;
  message?: string;
}



export const authService = {
  // Login - Using real API
  async login(username: string, password: string, mfaCode?: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/v1/auth/login', {
        username,
        password,
        mfaCode
      });
      
      if (response.data.success) {
        const user = response.data.user;
        return {
          accessToken: response.data.token,
          refreshToken: response.data.token,
          tokenType: 'Bearer',
          expiresIn: 3600,
          userId: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          userType: user.role,
          roles: [user.role],
          permissions: user.permissions,
          mfaEnabled: false,
          biometricEnabled: false,
          lastLogin: new Date().toISOString(),
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  },

  // Register - Using real API
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/v1/auth/register', userData);
      
      if (response.data.success) {
        const user = response.data.user;
        return {
          accessToken: 'demo-token-' + Date.now(),
          refreshToken: 'demo-token-' + Date.now(),
          tokenType: 'Bearer',
          expiresIn: 3600,
          userId: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          fullName: user.fullName || user.username,
          userType: user.role,
          roles: [user.role],
          permissions: ['read', 'write'],
          mfaEnabled: false,
          biometricEnabled: false,
          lastLogin: new Date().toISOString(),
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  // Logout - Using real API
  async logout(): Promise<void> {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get user info - Using real API
  async getUserInfo(): Promise<AuthResponse | null> {
    try {
      const response = await api.get('/api/v1/auth/validate');
      if (response.data.valid) {
        const user = response.data.user;
        return {
          accessToken: localStorage.getItem('token') || '',
          refreshToken: localStorage.getItem('token') || '',
          tokenType: 'Bearer',
          expiresIn: 3600,
          userId: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          fullName: user.fullName || user.username,
          userType: user.role,
          roles: [user.role],
          permissions: ['read', 'write'],
          mfaEnabled: false,
          biometricEnabled: false,
          lastLogin: new Date().toISOString(),
          message: 'User info retrieved'
        };
      }
      return null;
    } catch (error: any) {
      console.warn('Auth user call failed:', error.message);
      return null;
    }
  },

  // Validate token - Using real API
  async validateToken(): Promise<boolean> {
    try {
      const response = await api.get('/api/v1/auth/validate');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  },

  // MFA operations
  async setupMfa(username: string): Promise<string> {
    const response = await api.post<string>('/auth/mfa/setup', null, {
      params: { username },
    });
    return response.data;
  },

  async verifyMfa(username: string, mfaCode: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/mfa/verify', null, {
      params: { username, mfaCode },
    });
    return response.data;
  },

  // Biometric operations
  async setupBiometric(username: string, biometricData: string, biometricType: string): Promise<string> {
    const response = await api.post<string>('/auth/biometric/setup', null, {
      params: { username, biometricData, biometricType },
    });
    return response.data;
  },

  async verifyBiometric(username: string, biometricData: string, biometricType: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/biometric/verify', null, {
      params: { username, biometricData, biometricType },
    });
    return response.data;
  },
};

export default authService; 