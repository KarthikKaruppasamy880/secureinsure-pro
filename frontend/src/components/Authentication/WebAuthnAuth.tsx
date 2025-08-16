import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Fingerprint, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RotateCcw,
  Shield,
  Smartphone,
  Lock,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WebAuthnAuthProps {
  onSuccess: (userData: any) => void;
  onFailure: (error: string) => void;
  onCancel: () => void;
}

interface CredentialRequestOptions {
  challenge: ArrayBuffer;
  timeout: number;
  userVerification: UserVerificationRequirement;
  rpId: string;
  allowCredentials?: PublicKeyCredentialDescriptor[];
}

export const WebAuthnAuth: React.FC<WebAuthnAuthProps> = ({ onSuccess, onFailure, onCancel }) => {
  const [step, setStep] = useState<'check' | 'enroll' | 'verify' | 'complete'>('check');
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkWebAuthnSupport();
  }, []);

  const checkWebAuthnSupport = () => {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      setIsSupported(false);
      setError('WebAuthn is not supported in this browser');
      return;
    }

    setIsSupported(true);

    // Check if platform authenticator is available
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then((available) => {
        setIsAvailable(available);
        if (available) {
          setStep('verify');
        } else {
          setError('Platform authenticator (fingerprint) not available');
        }
      })
      .catch((err) => {
        console.error('Error checking platform authenticator:', err);
        setIsAvailable(false);
        setError('Unable to check platform authenticator availability');
      });
  };

  const handleEnrollment = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsEnrolling(true);
    setError('');

    try {
      // Simulate enrollment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock enrollment data
      const mockEnrollmentData = {
        id: 'credential_' + Date.now(),
        type: 'public-key',
        transports: ['internal'],
        username: username,
        createdAt: new Date().toISOString()
      };

      setEnrollmentData(mockEnrollmentData);
      setStep('complete');
      toast.success('Fingerprint enrollment successful!');

      // Simulate successful authentication
      setTimeout(() => {
        onSuccess({
          userId: 'USR001',
          name: 'Karthik Karuppasamy',
          email: 'karthik.karuppasamy@zinnia.com',
          method: 'fingerprint',
          credentialId: mockEnrollmentData.id
        });
      }, 2000);

    } catch (err) {
      console.error('Enrollment error:', err);
      setError('Enrollment failed. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleVerification = async () => {
    setIsVerifying(true);
    setError('');

    try {
      // Simulate WebAuthn verification
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate successful verification
      setStep('complete');
      toast.success('Fingerprint verification successful!');

      // Simulate successful authentication
      setTimeout(() => {
        onSuccess({
          userId: 'USR001',
          name: 'Karthik Karuppasamy',
          email: 'karthik.karuppasamy@zinnia.com',
          method: 'fingerprint',
          confidence: 95
        });
      }, 2000);

    } catch (err) {
      console.error('Verification error:', err);
      setError('Fingerprint verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const retryVerification = () => {
    setError('');
    setStep('verify');
  };

  const resetEnrollment = () => {
    setUsername('');
    setPassword('');
    setEnrollmentData(null);
    setError('');
    setStep('enroll');
  };

  const getStepIcon = () => {
    switch (step) {
      case 'check':
        return <Fingerprint className="h-8 w-8" />;
      case 'enroll':
        return <User className="h-8 w-8" />;
      case 'verify':
        return <Shield className="h-8 w-8" />;
      case 'complete':
        return <CheckCircle className="h-8 w-8" />;
      default:
        return <Fingerprint className="h-8 w-8" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'check':
        return 'Checking Compatibility';
      case 'enroll':
        return 'Fingerprint Enrollment';
      case 'verify':
        return 'Fingerprint Verification';
      case 'complete':
        return 'Authentication Complete';
      default:
        return 'Fingerprint Authentication';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'check':
        return 'Verifying WebAuthn support and platform authenticator availability';
      case 'enroll':
        return 'Set up fingerprint authentication for your account';
      case 'verify':
        return 'Place your finger on the sensor to authenticate';
      case 'complete':
        return 'Fingerprint authentication completed successfully';
      default:
        return 'Secure fingerprint authentication using WebAuthn';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2">
            <Fingerprint className="h-6 w-6" />
            <span>Fingerprint Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {['check', 'enroll', 'verify', 'complete'].map((stepName, index) => (
              <div key={stepName} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName 
                    ? 'bg-blue-600 text-white' 
                    : step === 'complete' || index < ['check', 'enroll', 'verify', 'complete'].indexOf(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step === 'complete' && stepName === 'complete' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-sm ${
                  step === stepName ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Check Step */}
          {step === 'check' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                {getStepIcon()}
              </div>
              
              <h3 className="text-lg font-medium">{getStepTitle()}</h3>
              <p className="text-gray-600">{getStepDescription()}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Badge variant={isSupported ? "default" : "destructive"}>
                    {isSupported ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        WebAuthn Supported
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        WebAuthn Not Supported
                      </>
                    )}
                  </Badge>
                </div>

                {isSupported && (
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant={isAvailable ? "default" : "destructive"}>
                      {isAvailable ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Platform Authenticator Available
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Platform Authenticator Not Available
                        </>
                      )}
                    </Badge>
                  </div>
                )}
              </div>

              {!isSupported && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">
                    Your browser does not support WebAuthn. Please use a modern browser or try a different authentication method.
                  </p>
                </div>
              )}

              {isSupported && !isAvailable && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    Platform authenticator (fingerprint sensor) is not available on this device. You can still enroll using password authentication.
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button onClick={onCancel} variant="outline" className="flex-1 btn-secondary">
                  Cancel
                </Button>
                {isSupported && (
                  <Button 
                    onClick={() => setStep('enroll')} 
                    className="flex-1 btn-primary"
                  >
                    Continue
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Enroll Step */}
          {step === 'enroll' && (
            <div className="space-y-4">
              <div className="text-center">
                <User className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{getStepTitle()}</h3>
                <p className="text-gray-600">{getStepDescription()}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Enrollment Process</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Enter your credentials to verify identity</li>
                  <li>• Follow device prompts to register fingerprint</li>
                  <li>• Your biometric data is encrypted and stored securely</li>
                  <li>• You can use fingerprint for future logins</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button onClick={onCancel} variant="outline" className="flex-1 btn-secondary">
                  Cancel
                </Button>
                <Button 
                  onClick={handleEnrollment} 
                  disabled={isEnrolling || !username.trim() || !password.trim()}
                  className="flex-1 btn-primary"
                >
                  {isEnrolling ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Start Enrollment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Verify Step */}
          {step === 'verify' && (
            <div className="space-y-4">
              <div className="text-center">
                <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{getStepTitle()}</h3>
                <p className="text-gray-600">{getStepDescription()}</p>
              </div>

              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <Fingerprint className="h-16 w-16 text-white" />
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 border-4 border-green-500 rounded-full animate-ping opacity-20"></div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  {isVerifying ? 'Verifying fingerprint...' : 'Place your finger on the sensor'}
                </p>
                
                {isVerifying && (
                  <div className="flex items-center justify-center space-x-2">
                    <RotateCcw className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-600">Processing...</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Security Features</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Encrypted biometric template storage</li>
                  <li>• Liveness detection prevents spoofing</li>
                  <li>• Device-bound credentials</li>
                  <li>• No password transmission</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button onClick={onCancel} variant="outline" className="flex-1 btn-secondary">
                  Cancel
                </Button>
                <Button 
                  onClick={handleVerification} 
                  disabled={isVerifying}
                  className="flex-1 btn-primary"
                >
                  {isVerifying ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Verify Fingerprint
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <h3 className="text-xl font-medium text-green-800">Authentication Successful!</h3>
              <p className="text-gray-600">Fingerprint authentication completed successfully.</p>
              
              {enrollmentData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Enrollment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Credential ID:</span>
                      <div className="text-xs font-mono text-gray-600 truncate">
                        {enrollmentData.id}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <div className="text-gray-600">{enrollmentData.type}</div>
                    </div>
                    <div>
                      <span className="font-medium">Username:</span>
                      <div className="text-gray-600">{enrollmentData.username}</div>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <div className="text-gray-600">
                        {new Date(enrollmentData.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Redirecting to dashboard...
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && step !== 'check' && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <Button 
                  onClick={step === 'verify' ? retryVerification : resetEnrollment}
                  variant="outline" 
                  size="sm"
                  className="btn-secondary"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {step === 'verify' ? 'Retry' : 'Reset'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
