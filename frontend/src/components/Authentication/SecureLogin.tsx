import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  Lock, 
  Camera, 
  Fingerprint, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Smartphone,
  User,
  Key
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FaceAuth } from './FaceAuth';
import { WebAuthnAuth } from './WebAuthnAuth';

interface SecureLoginProps {
  onLoginSuccess: (userData: any) => void;
  onCancel: () => void;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface UserData {
  userId: string;
  name: string;
  email: string;
  role: string;
  method: string;
  confidence?: number;
  credentialId?: string;
}

export const SecureLogin: React.FC<SecureLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [activeTab, setActiveTab] = useState('password');
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMethod, setAuthMethod] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Mock user database
  const validUsers = {
    'admin@insurance.com': {
      password: 'admin123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      department: 'Administration',
      permissions: ['admin', 'user_management', 'system_config', 'view_all', 'delete']
    },
    'karthik.karuppasamy@zinnia.com': {
      password: 'password123',
      role: 'underwriter',
      firstName: 'Karthik',
      lastName: 'Karuppasamy',
      department: 'Underwriting',
      permissions: ['underwrite', 'search', 'approve', 'view_all']
    },
    'agent@insurance.com': {
      password: 'agent123',
      role: 'agent',
      firstName: 'Agent',
      lastName: 'Smith',
      department: 'Sales',
      permissions: ['create_case', 'view_own', 'submit']
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username.trim() || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const user = validUsers[credentials.username.toLowerCase() as keyof typeof validUsers];
      
      if (!user) {
        setError('Invalid username. Please check your credentials.');
        return;
      }

      if (user.password !== credentials.password) {
        setError('Invalid password. Please try again.');
        return;
      }

      // Success
      const userData: UserData = {
        userId: `USR_${Date.now()}`,
        name: `${user.firstName} ${user.lastName}`,
        email: credentials.username,
        role: user.role,
        method: 'password'
      };

      setAuthMethod('password');
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${user.firstName}!`);

      // Redirect after success
      setTimeout(() => {
        onLoginSuccess(userData);
      }, 1000);

    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceAuthSuccess = (userData: any) => {
    setAuthMethod('face');
    setIsAuthenticated(true);
    toast.success('Face authentication successful!');
    
    setTimeout(() => {
      onLoginSuccess({
        ...userData,
        method: 'face'
      });
    }, 1000);
  };

  const handleFaceAuthFailure = (error: string) => {
    setError(`Face authentication failed: ${error}`);
    toast.error('Face authentication failed');
  };

  const handleFingerprintAuthSuccess = (userData: any) => {
    setAuthMethod('fingerprint');
    setIsAuthenticated(true);
    toast.success('Fingerprint authentication successful!');
    
    setTimeout(() => {
      onLoginSuccess({
        ...userData,
        method: 'fingerprint'
      });
    }, 1000);
  };

  const handleFingerprintAuthFailure = (error: string) => {
    setError(`Fingerprint authentication failed: ${error}`);
    toast.error('Fingerprint authentication failed');
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user types
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'password':
        return <Key className="h-4 w-4" />;
      case 'face':
        return <Camera className="h-4 w-4" />;
      case 'fingerprint':
        return <Fingerprint className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'password':
        return 'Password';
      case 'face':
        return 'Face ID';
      case 'fingerprint':
        return 'Fingerprint';
      default:
        return 'Login';
    }
  };

  if (isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card className="card-premium">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Authentication Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              {authMethod === 'password' && 'Password verification completed'}
              {authMethod === 'face' && 'Face recognition completed'}
              {authMethod === 'fingerprint' && 'Fingerprint verification completed'}
            </p>
            
            <Badge variant="default" className="bg-green-600">
              {authMethod.charAt(0).toUpperCase() + authMethod.slice(1)} Authentication
            </Badge>
            
            <div className="mt-4 text-sm text-gray-500">
              Redirecting to dashboard...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="card-premium">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            Secure Insurance Login
          </CardTitle>
          
          <p className="text-gray-600 mt-2">
            Choose your preferred authentication method to access your account
          </p>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="password" className="flex items-center space-x-2">
                {getTabIcon('password')}
                <span>{getTabLabel('password')}</span>
              </TabsTrigger>
              <TabsTrigger value="face" className="flex items-center space-x-2">
                {getTabIcon('face')}
                <span>{getTabLabel('face')}</span>
              </TabsTrigger>
              <TabsTrigger value="fingerprint" className="flex items-center space-x-2">
                {getTabIcon('fingerprint')}
                <span>{getTabLabel('fingerprint')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Password Authentication Tab */}
            <TabsContent value="password" className="space-y-6">
              <div className="text-center">
                <Key className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">Password Authentication</h3>
                <p className="text-gray-600">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username or Email</Label>
                  <Input
                    id="username"
                    type="email"
                    placeholder="Enter your username or email"
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-800 text-sm">{error}</span>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Demo Credentials</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm text-blue-800">
                    <div><strong>Admin:</strong> admin@insurance.com / admin123</div>
                    <div><strong>Underwriter:</strong> karthik.karuppasamy@zinnia.com / password123</div>
                    <div><strong>Agent:</strong> agent@insurance.com / agent123</div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={onCancel} variant="outline" className="flex-1 btn-secondary">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !credentials.username.trim() || !credentials.password}
                    className="flex-1 btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Face Authentication Tab */}
            <TabsContent value="face" className="space-y-6">
              <div className="text-center">
                <Camera className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">Face Recognition</h3>
                <p className="text-gray-600">Use your face to securely authenticate</p>
              </div>

              <FaceAuth
                onSuccess={handleFaceAuthSuccess}
                onFailure={handleFaceAuthFailure}
                onCancel={onCancel}
              />
            </TabsContent>

            {/* Fingerprint Authentication Tab */}
            <TabsContent value="fingerprint" className="space-y-6">
              <div className="text-center">
                <Fingerprint className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">Fingerprint Authentication</h3>
                <p className="text-gray-600">Use your fingerprint for secure access</p>
              </div>

              <WebAuthnAuth
                onSuccess={handleFingerprintAuthSuccess}
                onFailure={handleFingerprintAuthFailure}
                onCancel={onCancel}
              />
            </TabsContent>
          </Tabs>

          {/* Security Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Security Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Multi-factor Authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Encrypted Communication</span>
              </div>
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Biometric Security</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
