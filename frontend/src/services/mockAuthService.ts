// Mock Authentication Service for SecureInsure Pro
// This service provides working authentication without requiring a backend

export interface MockUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  permissions: string[];
}

export interface MockAuthResponse {
  success: boolean;
  token: string;
  user: MockUser;
  message: string;
}

// Mock user database
const mockUsers: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@secureinsure.com',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    role: 'ADMIN',
    permissions: ['read', 'write', 'delete', 'admin']
  },
  {
    id: 2,
    username: 'user',
    email: 'user@secureinsure.com',
    firstName: 'Regular',
    lastName: 'User',
    fullName: 'Regular User',
    role: 'USER',
    permissions: ['read', 'write']
  },
  {
    id: 3,
    username: 'agent',
    email: 'agent@secureinsure.com',
    firstName: 'Insurance',
    lastName: 'Agent',
    fullName: 'Insurance Agent',
    role: 'AGENT',
    permissions: ['read', 'write', 'claims']
  }
];

// Mock passwords (in real app, these would be hashed)
const mockPasswords: Record<string, string> = {
  'admin': 'admin123',
  'user': 'user123',
  'agent': 'agent123'
};

export const mockAuthService = {
  // Login
  async login(username: string, password: string): Promise<MockAuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.username === username);
    const correctPassword = mockPasswords[username];
    
    if (user && password === correctPassword) {
      const token = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        token,
        user,
        message: 'Login successful'
      };
    } else {
      throw new Error('Invalid username or password');
    }
  },

  // Register
  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<MockAuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if username already exists
    if (mockUsers.find(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }
    
    // Check if email already exists
    if (mockUsers.find(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }
    
    const newUser: MockUser = {
      id: mockUsers.length + 1,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      fullName: `${userData.firstName} ${userData.lastName}`,
      role: 'USER',
      permissions: ['read', 'write']
    };
    
    // Add to mock database
    mockUsers.push(newUser);
    mockPasswords[userData.username] = userData.password;
    
    const token = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    return {
      success: true,
      token,
      user: newUser,
      message: 'Registration successful'
    };
  },

  // Logout
  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser(): MockUser | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Validate token
  async validateToken(): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return !!localStorage.getItem('token');
  },

  // Get user info
  async getUserInfo(): Promise<MockUser | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.getCurrentUser();
  }
};

export default mockAuthService;
