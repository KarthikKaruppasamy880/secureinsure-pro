import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import LoginForm from '@/components/Authentication/LoginForm';
import BiometricAuth from '@/components/Authentication/BiometricAuth';
import MFAForm from '@/components/Authentication/MFAForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Fingerprint,
  Smartphone,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface MFAData {
  code: string;
}

interface BackupCodeData {
  backupCode: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [authStep, setAuthStep] = useState<'login' | 'mfa' | 'biometric'>('login');
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [mfaMethod, setMfaMethod] = useState<'sms' | 'totp' | 'backup'>('sms');

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate different responses based on email
      if (data.email.includes('mfa')) {
        throw new Error('MFA_REQUIRED');
      }
      if (data.email.includes('biometric')) {
        throw new Error('BIOMETRIC_AVAILABLE');
      }
      
      // Successful login
      return { token: 'mock-jwt-token', user: { id: 1, email: data.email } };
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      if (error.message === 'MFA_REQUIRED') {
        setLoginData({ email: loginData?.email || '', password: loginData?.password || '' });
        setAuthStep('mfa');
        setMfaMethod('sms');
      } else if (error.message === 'BIOMETRIC_AVAILABLE') {
        setAuthStep('biometric');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    }
  });

  // MFA verification mutation
  const mfaMutation = useMutation({
    mutationFn: async (data: MFAData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (data.code !== '123456') {
        throw new Error('Invalid MFA code');
      }
      
      return { token: 'mock-jwt-token', user: { id: 1, email: loginData?.email } };
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('MFA verification successful!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'MFA verification failed.');
    }
  });

  // Backup code verification mutation
  const backupCodeMutation = useMutation({
    mutationFn: async (data: BackupCodeData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (data.backupCode !== 'ABC123DEF456') {
        throw new Error('Invalid backup code');
      }
      
      return { token: 'mock-jwt-token', user: { id: 1, email: loginData?.email } };
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Backup code verification successful!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Backup code verification failed.');
    }
  });

  // Biometric authentication mutation
  const biometricMutation = useMutation({
    mutationFn: async (method: 'fingerprint' | 'face' | 'voice') => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { token: 'mock-jwt-token', user: { id: 1, email: 'user@example.com' } };
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Biometric authentication successful!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error('Biometric authentication failed.');
    }
  });

  const handleLogin = async (data: LoginData) => {
    setLoginData(data);
    loginMutation.mutate(data);
  };

  const handleMFAVerify = async (data: MFAData) => {
    mfaMutation.mutate(data);
  };

  const handleBackupCode = async (data: BackupCodeData) => {
    backupCodeMutation.mutate(data);
  };

  const handleResendCode = async () => {
    // Simulate resending code
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Verification code sent!');
  };

  const handleSetupTOTP = async () => {
    // Simulate TOTP setup
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      secret: 'JBSWY3DPEHPK3PXP'
    };
  };

  const handleBiometricAuth = async (method: 'fingerprint' | 'face' | 'voice') => {
    biometricMutation.mutate(method);
  };

  const handleFallback = () => {
    setAuthStep('login');
  };

  const handleBackToLogin = () => {
    setAuthStep('login');
    setLoginData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {authStep === 'login' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                SecureInsure Pro
              </h1>
              <p className="text-gray-600">
                Sign in to your account
              </p>
            </div>

            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="biometric">
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Biometric
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="mt-6">
                <LoginForm
                  onLogin={handleLogin}
                  onBiometricAuth={async () => {
                    setAuthStep('biometric');
                    return Promise.resolve();
                  }}
                  onMFA={() => setAuthStep('mfa')}
                  isLoading={loginMutation.isPending}
                  error={loginMutation.error?.message}
                />
              </TabsContent>

              <TabsContent value="biometric" className="mt-6">
                <BiometricAuth
                  onAuthenticate={handleBiometricAuth}
                  onFallback={() => setAuthStep('login')}
                  isLoading={biometricMutation.isPending}
                  error={biometricMutation.error?.message}
                />
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="text-primary hover:text-primary/80 p-0 h-auto"
                  onClick={() => navigate('/register')}
                >
                  Sign up
                </Button>
              </p>
            </div>
          </div>
        )}

        {authStep === 'mfa' && (
          <div className="space-y-6">
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                className="absolute top-4 left-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Two-Factor Authentication
              </h1>
              <p className="text-gray-600">
                Verify your identity to continue
              </p>
            </div>

            <MFAForm
              onVerify={handleMFAVerify}
              onBackupCode={handleBackupCode}
              onResendCode={handleResendCode}
              onSetupTOTP={handleSetupTOTP}
              isLoading={mfaMutation.isPending || backupCodeMutation.isPending}
              error={mfaMutation.error?.message || backupCodeMutation.error?.message}
              method={mfaMethod}
              phoneNumber="+1 (555) 123-4567"
              email={loginData?.email}
            />
          </div>
        )}

        {authStep === 'biometric' && (
          <div className="space-y-6">
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                className="absolute top-4 left-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Biometric Authentication
              </h1>
              <p className="text-gray-600">
                Choose your preferred method
              </p>
            </div>

            <BiometricAuth
              onAuthenticate={handleBiometricAuth}
              onFallback={handleFallback}
              isLoading={biometricMutation.isPending}
              error={biometricMutation.error?.message}
            />
          </div>
        )}
      </div>
    </div>
  );
} 