import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  Shield,
  Fingerprint,
  Eye,
  Mic,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  Unlock,
  User,
  Settings,
  Camera,
  Smartphone,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { biometricService, BiometricMethod, BiometricStatus } from '../../services/biometricService';
import { useAuth } from '../../contexts/AuthContext';

interface BiometricLoginProps {
  onSuccess: (userData: any) => void;
  onFallback: () => void;
  onBack: () => void;
  username?: string;
}

export default function BiometricLogin({
  onSuccess,
  onFallback,
  onBack,
  username
}: BiometricLoginProps) {
  const [step, setStep] = useState<'select' | 'enroll' | 'authenticate' | 'complete'>('select');
  const [selectedMethod, setSelectedMethod] = useState<string>('fingerprint');
  const [biometricStatus, setBiometricStatus] = useState<Record<string, BiometricStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useAuth();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const status = await biometricService.checkAvailability();
      setBiometricStatus(status);
      
      // Auto-select best available method
      const recommended = await biometricService.getRecommendedMethod();
      if (recommended) {
        setSelectedMethod(recommended);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setError('Unable to check biometric availability');
    }
  };

  const handleMethodSelect = (method: string) => {
    const status = biometricStatus[method];
    if (status?.isAvailable) {
      setSelectedMethod(method);
      if (status.isEnrolled) {
        setStep('authenticate');
      } else {
        setStep('enroll');
      }
    } else {
      toast.error(`${method.charAt(0).toUpperCase() + method.slice(1)} is not available`);
    }
  };

  const handleEnrollment = async () => {
    if (!username) {
      setError('Username is required for enrollment');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError('');

    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      let enrollmentData: any = {};

      switch (selectedMethod) {
        case 'face':
          enrollmentData = await enrollFace();
          break;
        case 'voice':
          enrollmentData = await enrollVoice();
          break;
        case 'fingerprint':
          enrollmentData = await enrollFingerprint();
          break;
        default:
          throw new Error(`Unsupported method: ${selectedMethod}`);
      }

      clearInterval(progressInterval);
      setProgress(100);

      const enrollment = await biometricService.enrollUser(
        selectedMethod,
        username,
        enrollmentData
      );

      setEnrollmentData(enrollment);
      toast.success(`${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)} enrollment successful!`);
      
      // Auto-proceed to authentication
      setTimeout(() => {
        setStep('authenticate');
        setProgress(0);
      }, 1500);

    } catch (error: any) {
      console.error('Enrollment error:', error);
      setError(error.message || 'Enrollment failed');
      toast.error('Enrollment failed. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const enrollFace = async (): Promise<any> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      
      setCameraStream(stream);
      setIsCapturing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Wait for camera to stabilize
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Capture multiple images for better enrollment
        const images: string[] = [];
        for (let i = 0; i < 3; i++) {
          if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              context.drawImage(videoRef.current, 0, 0);
              images.push(canvas.toDataURL('image/jpeg', 0.8));
            }
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Stop camera
        stream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
        setIsCapturing(false);

        return { images, name: username };
      }
    } catch (error) {
      console.error('Face enrollment error:', error);
      throw new Error('Failed to capture face images');
    }
  };

  const enrollVoice = async (): Promise<any> => {
    try {
      // Simulate voice enrollment with challenge phrase
      const challengePhrase = "SecureInsure authentication";
      
      return new Promise((resolve, reject) => {
        toast.info(`Please say: "${challengePhrase}"`);
        
        // Simulate voice capture
        setTimeout(() => {
          resolve({
            language: 'en-US',
            sampleRate: 16000,
            challengePhrase
          });
        }, 3000);
      });
    } catch (error) {
      console.error('Voice enrollment error:', error);
      throw new Error('Failed to enroll voice');
    }
  };

  const enrollFingerprint = async (): Promise<any> => {
    try {
      // Simulate WebAuthn enrollment
      toast.info('Follow your device prompts to register fingerprint');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return { type: 'public-key', transports: ['internal'] };
    } catch (error) {
      console.error('Fingerprint enrollment error:', error);
      throw new Error('Failed to enroll fingerprint');
    }
  };

  const handleAuthentication = async () => {
    setIsLoading(true);
    setProgress(0);
    setError('');

    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await biometricService.authenticateUser(selectedMethod, username);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        toast.success(`${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)} authentication successful!`);
        setStep('complete');
        
        // Simulate successful login
        setTimeout(() => {
          onSuccess({
            userId: result.userId || username,
            method: selectedMethod,
            confidence: result.confidence,
            metadata: result.metadata
          });
        }, 1500);
      } else {
        throw new Error(result.error || 'Authentication failed');
      }

    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
      toast.error('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return <Fingerprint className="w-6 h-6" />;
      case 'face':
        return <Eye className="w-6 h-6" />;
      case 'voice':
        return <Mic className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getMethodTitle = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return 'Fingerprint';
      case 'face':
        return 'Face Recognition';
      case 'voice':
        return 'Voice Recognition';
      default:
        return 'Biometric';
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return 'Use your fingerprint to sign in securely';
      case 'face':
        return 'Look at your device to verify your identity';
      case 'voice':
        return 'Speak a passphrase to authenticate';
      default:
        return 'Use biometric authentication';
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Choose Authentication Method</h3>
        <p className="text-sm text-gray-600">Select your preferred biometric authentication method</p>
      </div>

      <div className="grid gap-3">
        {Object.entries(biometricStatus).map(([method, status]) => (
          <div
            key={method}
            className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedMethod === method
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            } ${!status.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => status.isAvailable && handleMethodSelect(method)}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                status.isAvailable ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
              }`}>
                {getMethodIcon(method)}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {getMethodTitle(method)}
                </h4>
                <p className="text-sm text-gray-600">
                  {getMethodDescription(method)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {status.isAvailable ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="w-3 h-3 mr-1" />
                    Unavailable
                  </Badge>
                )}
              </div>
            </div>
            
            {!status.isAvailable && (
              <div className="mt-2 text-xs text-gray-500">
                {!status.isSupported 
                  ? 'Not supported on this device'
                  : !status.isEnrolled 
                    ? 'Not enrolled'
                    : 'Not available'
                }
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex space-x-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onFallback} variant="outline" className="flex-1">
          Use Password
        </Button>
      </div>
    </div>
  );

  const renderEnrollment = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          {getMethodIcon(selectedMethod)}
        </div>
        <h3 className="text-lg font-semibold">
          Enroll {getMethodTitle(selectedMethod)}
        </h3>
        <p className="text-sm text-gray-600">
          Set up {getMethodTitle(selectedMethod).toLowerCase()} for your account
        </p>
      </div>

      {selectedMethod === 'face' && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm text-blue-900">Face Enrollment</h4>
          <p className="text-sm text-blue-800">
            Position your face in the center of the frame and follow the prompts.
          </p>
        </div>
      )}

      {selectedMethod === 'voice' && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm text-blue-900">Voice Enrollment</h4>
          <p className="text-sm text-blue-800">
            Speak clearly when prompted. Your voice pattern will be securely stored.
          </p>
        </div>
      )}

      {selectedMethod === 'fingerprint' && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm text-blue-900">Fingerprint Enrollment</h4>
          <p className="text-sm text-blue-800">
            Follow your device prompts to register your fingerprint securely.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {getMethodIcon(selectedMethod)}
            </div>
            <h3 className="text-lg font-semibold">
              Enrolling {getMethodTitle(selectedMethod)}...
            </h3>
            <p className="text-sm text-gray-600">
              Please follow the prompts on your device
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Enrollment Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Face Detection Video Stream */}
      {isCapturing && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm text-gray-900">Camera Active</h4>
          <div className="relative">
            <video 
              ref={videoRef}
              className="w-full h-48 bg-black rounded-lg object-cover"
              autoPlay
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse" />
            <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
              <Camera className="inline w-3 h-3 mr-1" />
              Recording
            </div>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-3">
        <Button onClick={() => setStep('select')} variant="outline" className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleEnrollment}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Enrolling...
            </>
          ) : (
            <>
              {getMethodIcon(selectedMethod)}
              <span>Start Enrollment</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderAuthentication = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          {getMethodIcon(selectedMethod)}
        </div>
        <h3 className="text-lg font-semibold">
          {getMethodTitle(selectedMethod)} Authentication
        </h3>
        <p className="text-sm text-gray-600">
          Verify your identity using {getMethodTitle(selectedMethod).toLowerCase()}
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {getMethodIcon(selectedMethod)}
            </div>
            <h3 className="text-lg font-semibold">
              Authenticating with {getMethodTitle(selectedMethod)}...
            </h3>
            <p className="text-sm text-gray-600">
              Please follow the prompts on your device
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Authentication Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-3">
        <Button onClick={() => setStep('select')} variant="outline" className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleAuthentication}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              {getMethodIcon(selectedMethod)}
              <span>Authenticate</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      
      <h3 className="text-xl font-medium text-green-800">Authentication Successful!</h3>
      <p className="text-gray-600">
        {getMethodTitle(selectedMethod)} authentication completed successfully.
      </p>
      
      {enrollmentData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Authentication Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Method:</span>
              <div className="text-gray-600">{getMethodTitle(selectedMethod)}</div>
            </div>
            <div>
              <span className="font-medium">User ID:</span>
              <div className="text-gray-600">{enrollmentData.userId}</div>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <div className="text-gray-600">Verified</div>
            </div>
            <div>
              <span className="font-medium">Timestamp:</span>
              <div className="text-gray-600">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        Redirecting to dashboard...
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Biometric Login
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Secure authentication using biometric methods
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'select' && renderMethodSelection()}
          {step === 'enroll' && renderEnrollment()}
          {step === 'authenticate' && renderAuthentication()}
          {step === 'complete' && renderComplete()}

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm text-gray-900">Security Features</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Lock className="w-3 h-3 text-green-600" />
                <span>Encrypted storage</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-green-600" />
                <span>Local processing</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-green-600" />
                <span>Fast access</span>
              </div>
              <div className="flex items-center space-x-1">
                <Settings className="w-3 h-3 text-green-600" />
                <span>Configurable</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
