import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

// Types
export interface User {
  id: number;
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
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Context
interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string, mfaCode?: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  const login = useCallback(async (username: string, password: string, mfaCode?: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(username, password, mfaCode);
      const user: User = {
        id: response.userId,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        fullName: response.fullName,
        userType: response.userType,
        roles: response.roles,
        permissions: response.permissions,
        mfaEnabled: response.mfaEnabled,
        biometricEnabled: response.biometricEnabled,
        lastLogin: response.lastLogin,
      };
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, [dispatch, navigate]);

  const register = useCallback(async (userData: RegisterData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.register(userData);
      const user: User = {
        id: response.userId,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        fullName: response.fullName,
        userType: response.userType,
        roles: response.roles,
        permissions: response.permissions,
        mfaEnabled: response.mfaEnabled,
        biometricEnabled: response.biometricEnabled,
        lastLogin: response.lastLogin,
      };
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, [dispatch, navigate]);

  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    navigate('/login');
  }, [dispatch, navigate]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      const user: User = {
        id: response.userId,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        fullName: response.fullName,
        userType: response.userType,
        roles: response.roles,
        permissions: response.permissions,
        mfaEnabled: response.mfaEnabled,
        biometricEnabled: response.biometricEnabled,
        lastLogin: response.lastLogin,
      };
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      navigate('/login');
    }
  }, [dispatch, navigate]);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  const hasPermission = useCallback((permission: string): boolean => {
    return state.user?.permissions.includes(permission) || false;
  }, [state.user]);

  const hasRole = useCallback((role: string): boolean => {
    return state.user?.roles.includes(role) || false;
  }, [state.user]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userInfo = await authService.getUserInfo();
          if (!userInfo) {
            // getUserInfo returned null (CORS/auth issue), clear invalid token
            console.warn('getUserInfo returned null, clearing invalid token');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            dispatch({ type: 'LOGOUT' });
            return;
          }
          
          const user: User = {
            id: userInfo.userId,
            username: userInfo.username,
            email: userInfo.email,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            fullName: userInfo.fullName,
            userType: userInfo.userType,
            roles: userInfo.roles,
            permissions: userInfo.permissions,
            mfaEnabled: userInfo.mfaEnabled,
            biometricEnabled: userInfo.biometricEnabled,
            lastLogin: userInfo.lastLogin,
          };
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user,
              token,
              refreshToken: localStorage.getItem('refreshToken') || '',
            },
          });
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Auto-login for development/testing - BYPASS LOGIN
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !state.isAuthenticated) {
      // Direct admin authentication without API call
      const adminUser: User = {
        id: 1,
        username: 'admin_test',
        email: 'admin_test@secureinsure.com',
        firstName: 'Admin',
        lastName: 'Test',
        fullName: 'Admin Test',
        userType: 'ADMIN',
        roles: ['ADMIN', 'USER'],
        permissions: ['ALL_PERMISSIONS', 'USER_MANAGEMENT', 'SYSTEM_CONFIG'],
        mfaEnabled: false,
        biometricEnabled: false,
        lastLogin: new Date().toISOString()
      };
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: adminUser,
          token: 'mock_admin_token',
          refreshToken: 'mock_refresh_token',
        },
      });
      
      // Only navigate to dashboard if we're on the root path or login page
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/login') {
        navigate('/dashboard');
      }
    }
  }, [dispatch, navigate, state.isAuthenticated]);

  // Save tokens to localStorage when they change
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
    }

    if (state.refreshToken) {
      localStorage.setItem('refreshToken', state.refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }, [state.token, state.refreshToken]);

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    clearError,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 