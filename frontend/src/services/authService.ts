import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

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
  // Login
  async login(username: string, password: string, mfaCode?: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      usernameOrEmail: username,
      password,
      mfaCode,
    });
    return response.data;
  },

  // Register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Get user info
  async getUserInfo(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/user');
    return response.data;
  },

  // Validate token
  async validateToken(): Promise<boolean> {
    try {
      const response = await api.get<boolean>('/auth/validate');
      return response.data;
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