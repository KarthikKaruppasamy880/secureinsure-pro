import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import RegisterForm from '@/components/Authentication/RegisterForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  marketingEmails?: boolean;
}

export default function Register() {
  const navigate = useNavigate();
  const [registrationStep, setRegistrationStep] = useState<'form' | 'verification' | 'success'>('form');
  const [verificationEmail, setVerificationEmail] = useState('');

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate validation
      if (data.email.includes('existing')) {
        throw new Error('Email already exists');
      }
      
      // Successful registration
      return { 
        userId: 'user-123',
        email: data.email,
        message: 'Registration successful. Please check your email for verification.'
      };
    },
    onSuccess: (data) => {
      setVerificationEmail(data.email);
      setRegistrationStep('verification');
      toast.success('Registration successful! Please check your email for verification.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  });

  // Email verification mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (code: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (code !== '123456') {
        throw new Error('Invalid verification code');
      }
      
      return { verified: true };
    },
    onSuccess: () => {
      setRegistrationStep('success');
      toast.success('Email verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Email verification failed.');
    }
  });

  const handleRegister = async (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const handleResendVerification = async () => {
    // Simulate resending verification email
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Verification email sent!');
  };

  const handleVerifyEmail = async (code: string) => {
    verifyEmailMutation.mutate(code);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {registrationStep === 'form' && (
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">
                Join SecureInsure Pro and protect what matters most
              </p>
            </div>

            <RegisterForm
              onRegister={handleRegister}
              isLoading={registerMutation.isPending}
              error={registerMutation.error?.message}
            />
          </div>
        )}

        {registrationStep === 'verification' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600">
                We've sent a verification link to:
              </p>
              <p className="font-medium text-gray-900 mt-2">
                {verificationEmail}
              </p>
            </div>

            <Card className="shadow-lg border-0">
              <CardContent className="p-6 space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please check your email and click the verification link to activate your account.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Didn't receive the email? Check your spam folder or try:
                  </p>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendVerification}
                    className="w-full"
                  >
                    Resend Verification Email
                  </Button>
                  
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setRegistrationStep('form')}
                    className="w-full"
                  >
                    Use Different Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="text-primary hover:text-primary/80 p-0 h-auto"
                  onClick={handleBackToLogin}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </div>
        )}

        {registrationStep === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to SecureInsure Pro!
              </h1>
              <p className="text-gray-600">
                Your account has been successfully created and verified.
              </p>
            </div>

            <Card className="shadow-lg border-0">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Next Steps:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Complete your profile</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Set up your first policy</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Configure security preferences</span>
                    </li>
                  </ul>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 