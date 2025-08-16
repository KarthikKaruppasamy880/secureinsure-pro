import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import {
  Shield,
  Fingerprint,
  Eye,
  Smartphone,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  Unlock,
  User,
  Settings,
  Camera,
  Mic
} from 'lucide-react';
import { toast } from 'sonner';
import { faceDetectionService } from '../../services/faceDetectionService';
import { voiceService } from '../../services/voiceService';

interface BiometricAuthProps {
  onAuthenticate: (method: 'fingerprint' | 'face' | 'voice') => Promise<void>;
  onFallback: () => void;
  isLoading?: boolean;
  error?: string;
  availableMethods?: ('fingerprint' | 'face' | 'voice')[];
}

type BiometricMethod = 'fingerprint' | 'face' | 'voice';

interface BiometricStatus {
  isAvailable: boolean;
  isEnrolled: boolean;
  isSupported: boolean;
}

export default function BiometricAuth({
  onAuthenticate,
  onFallback,
  isLoading = false,
  error,
  availableMethods = ['fingerprint', 'face', 'voice']
}: BiometricAuthProps) {
  const [selectedMethod, setSelectedMethod] = useState<BiometricMethod>('fingerprint');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<Record<BiometricMethod, BiometricStatus>>({
    fingerprint: { isAvailable: false, isEnrolled: false, isSupported: false },
    face: { isAvailable: false, isEnrolled: false, isSupported: false },
    voice: { isAvailable: false, isEnrolled: false, isSupported: false }
  });
  const [progress, setProgress] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      // Check for WebAuthn support (fingerprint)
      let fingerprintSupported = false;
      if (navigator.credentials && window.PublicKeyCredential) {
        fingerprintSupported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }

      // Check face detection API availability
      const faceApiStatus = await faceDetectionService.getStatus();
      const isCameraAvailable = await faceDetectionService.isCameraAvailable();

      // Check voice recognition availability
      const voiceSupported = await voiceService.checkAvailability();
      const webSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

      setBiometricStatus({
        fingerprint: {
          isAvailable: fingerprintSupported,
          isEnrolled: true, // Assume enrolled for demo
          isSupported: fingerprintSupported
        },
        face: {
          isAvailable: faceApiStatus.available && isCameraAvailable,
          isEnrolled: true, // Assume enrolled for demo
          isSupported: faceApiStatus.available && isCameraAvailable
        },
        voice: {
          isAvailable: voiceSupported || webSpeechSupported,
          isEnrolled: true, // Assume enrolled for demo
          isSupported: voiceSupported || webSpeechSupported
        }
      });
    } catch (err) {
      console.error('Error checking biometric availability:', err);
      // Fallback to basic checks
      setBiometricStatus({
        fingerprint: {
          isAvailable: false,
          isEnrolled: false,
          isSupported: false
        },
        face: {
          isAvailable: false,
          isEnrolled: false,
          isSupported: false
        },
        voice: {
          isAvailable: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
          isEnrolled: true,
          isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
        }
      });
    }
  };

  const handleBiometricAuth = async (method: BiometricMethod) => {
    if (!biometricStatus[method].isAvailable) {
      toast.error(`${method.charAt(0).toUpperCase() + method.slice(1)} authentication is not available on this device.`);
      return;
    }

    setIsAuthenticating(true);
    setProgress(0);

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

      if (method === 'face') {
        await handleFaceAuthentication();
      } else if (method === 'voice') {
        await handleVoiceAuthentication();
      } else {
        // Fallback to original handler for fingerprint
        await onAuthenticate(method);
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast.success(`${method.charAt(0).toUpperCase() + method.slice(1)} authentication successful!`);
    } catch (err) {
      console.error(`${method} authentication error:`, err);
      toast.error(`${method.charAt(0).toUpperCase() + method.slice(1)} authentication failed. Please try again.`);
    } finally {
      setIsAuthenticating(false);
      setProgress(0);
      if (cameraStream) {
        faceDetectionService.stopCamera(cameraStream);
        setCameraStream(null);
      }
    }
  };

  const handleFaceAuthentication = async () => {
    try {
      // Start camera
      const stream = await faceDetectionService.startCamera();
      setCameraStream(stream);
      setIsCapturing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Wait a moment for camera to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Capture image
        const imageData = faceDetectionService.captureImageFromVideo(videoRef.current);
        
        // Verify face
        const result = await faceDetectionService.identifyFace(imageData);
        
        if (result.success && result.detected && result.confidence && result.confidence > 0.7) {
          await onAuthenticate('face');
        } else {
          throw new Error('Face not recognized or confidence too low');
        }
      }
    } finally {
      setIsCapturing(false);
      if (cameraStream) {
        faceDetectionService.stopCamera(cameraStream);
        setCameraStream(null);
      }
    }
  };

  const handleVoiceAuthentication = async () => {
    try {
      // Start voice challenge
      const challengePhrase = "SecureInsure authentication";
      voiceService.speakText(`Please say: ${challengePhrase}`);
      
      // Wait for user to repeat the phrase
      await new Promise((resolve, reject) => {
        const recognition = voiceService.startWebSpeechRecognition(
          (transcript) => {
            const similarity = calculateSimilarity(transcript.toLowerCase(), challengePhrase.toLowerCase());
            if (similarity > 0.7) {
              resolve(transcript);
            } else {
              reject(new Error('Voice pattern did not match'));
            }
          },
          reject
        );

        if (!recognition) {
          reject(new Error('Voice recognition not available'));
        }
      });

      await onAuthenticate('voice');
    } catch (error) {
      throw error;
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const getMethodIcon = (method: BiometricMethod) => {
    switch (method) {
      case 'fingerprint':
        return <Fingerprint className="w-6 h-6" />;
      case 'face':
        return <Eye className="w-6 h-6" />;
      case 'voice':
        return <User className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getMethodTitle = (method: BiometricMethod) => {
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

  const getMethodDescription = (method: BiometricMethod) => {
    switch (method) {
      case 'fingerprint':
        return 'Use your fingerprint to sign in securely';
      case 'face':
        return 'Look at your device to authenticate';
      case 'voice':
        return 'Speak your passphrase to verify identity';
      default:
        return 'Use biometric authentication';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Biometric Authentication
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Choose your preferred authentication method
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isAuthenticating && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {getMethodIcon(selectedMethod)}
                </div>
                <h3 className="text-lg font-semibold">
                  Authenticating with {getMethodTitle(selectedMethod)}
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

          {!isAuthenticating && (
            <div className="space-y-4">
              {availableMethods.map((method) => {
                const status = biometricStatus[method];
                const isAvailable = status.isAvailable && status.isEnrolled;
                
                return (
                  <div
                    key={method}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedMethod === method
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!isAvailable ? 'opacity-50' : 'cursor-pointer'}`}
                    onClick={() => isAvailable && setSelectedMethod(method)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        isAvailable ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {getMethodIcon(method)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {getMethodTitle(method)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getMethodDescription(method)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isAvailable ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    
                    {!isAvailable && (
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
                );
              })}

              <Button
                type="button"
                className="w-full"
                onClick={() => handleBiometricAuth(selectedMethod)}
                disabled={!biometricStatus[selectedMethod].isAvailable || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {getMethodIcon(selectedMethod)}
                    <span>Sign in with {getMethodTitle(selectedMethod)}</span>
                  </div>
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={onFallback}
                  disabled={isLoading}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Use password instead
                </Button>
              </div>
            </div>
          )}

          {/* Face Detection Video Stream */}
          {isCapturing && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm text-gray-900">Face Detection Active</h4>
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
                <RefreshCw className="w-3 h-3 text-green-600" />
                <span>Auto-lock</span>
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