import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Camera, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RotateCcw,
  Eye,
  Smile,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FaceAuthProps {
  onSuccess: (userData: any) => void;
  onFailure: (error: string) => void;
  onCancel: () => void;
}

interface Device {
  deviceId: string;
  label: string;
}

export const FaceAuth: React.FC<FaceAuthProps> = ({ onSuccess, onFailure, onCancel }) => {
  const [step, setStep] = useState<'setup' | 'capturing' | 'processing' | 'complete'>('setup');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [livenessScore, setLivenessScore] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadDevices();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`
        }));
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
      toast.error('Failed to load camera devices');
    }
  };

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      setStep('capturing');
      startFaceDetection();
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error('Failed to start camera. Please check permissions.');
    }
  };

  const startFaceDetection = () => {
    // Simulate face detection
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance of detecting face
        setFaceDetected(true);
        clearInterval(interval);
        toast.success('Face detected! Ready to capture.');
      }
    }, 1000);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      setIsCapturing(false);
      setStep('processing');

      // Start liveness detection
      startLivenessDetection();
    }
  };

  const startLivenessDetection = () => {
    setIsProcessing(true);
    const instructions = [
      'Please blink your eyes',
      'Now smile naturally',
      'Turn your head slightly left',
      'Turn your head slightly right',
      'Look straight ahead'
    ];

    let currentIndex = 0;
    const instructionInterval = setInterval(() => {
      if (currentIndex < instructions.length) {
        setCurrentInstruction(instructions[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(instructionInterval);
        completeLivenessDetection();
      }
    }, 2000);
  };

  const completeLivenessDetection = () => {
    // Simulate liveness score calculation
    const score = Math.floor(Math.random() * 30) + 70; // 70-100
    setLivenessScore(score);

    if (score >= 80) {
      setStep('complete');
      toast.success('Liveness detection passed!');
      
      // Simulate successful authentication
      setTimeout(() => {
        onSuccess({
          userId: 'USR001',
          name: 'Karthik Karuppasamy',
          email: 'karthik.karuppasamy@zinnia.com',
          confidence: score,
          method: 'face'
        });
      }, 2000);
    } else {
      toast.error('Liveness detection failed. Please try again.');
      setStep('capturing');
      setIsProcessing(false);
    }
  };

  const retryCapture = () => {
    setCapturedImage('');
    setFaceDetected(false);
    setLivenessScore(0);
    setCurrentInstruction('');
    setIsProcessing(false);
    setStep('capturing');
    startFaceDetection();
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2">
            <Camera className="h-6 w-6" />
            <span>Face Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {['setup', 'capturing', 'processing', 'complete'].map((stepName, index) => (
              <div key={stepName} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName 
                    ? 'bg-blue-600 text-white' 
                    : step === 'complete' || index < ['setup', 'capturing', 'processing', 'complete'].indexOf(step)
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

          {/* Setup Step */}
          {step === 'setup' && (
            <div className="space-y-4">
              <div className="text-center">
                <Camera className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Camera Setup</h3>
                <p className="text-gray-600">Select your camera and ensure good lighting for face recognition.</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Camera Device
                </label>
                <select
                  value={selectedDevice}
                  onChange={(e) => handleDeviceChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <Button onClick={onCancel} variant="outline" className="flex-1 btn-secondary">
                  Cancel
                </Button>
                <Button onClick={startCamera} className="flex-1 btn-primary">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            </div>
          )}

          {/* Capturing Step */}
          {step === 'capturing' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Face Detection</h3>
                <p className="text-gray-600">Position your face in the camera view and wait for detection.</p>
              </div>

              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                />
                
                {/* Face Detection Overlay */}
                {faceDetected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-4 border-green-500 rounded-full animate-pulse">
                      <CheckCircle className="w-full h-full text-green-500 p-4" />
                    </div>
                  </div>
                )}

                {/* Face Detection Status */}
                <div className="absolute top-4 right-4">
                  <Badge variant={faceDetected ? "default" : "secondary"}>
                    {faceDetected ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Face Detected
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Detecting...
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={onCancel} variant="outline" className="flex-1 btn-secondary">
                  Cancel
                </Button>
                <Button 
                  onClick={captureImage} 
                  disabled={!faceDetected}
                  className="flex-1 btn-primary"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Image
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Liveness Detection</h3>
                <p className="text-gray-600">Follow the instructions to verify you are a real person.</p>
              </div>

              {capturedImage && (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured face"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Image Captured
                    </Badge>
                  </div>
                </div>
              )}

              {currentInstruction && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">{currentInstruction}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button onClick={retryCapture} variant="outline" className="flex-1 btn-secondary">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button onClick={onCancel} variant="outline" className="flex-1 btn-secondary">
                  Cancel
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
              <p className="text-gray-600">Face recognition completed successfully.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Liveness Score:</span>
                    <div className="text-lg font-bold text-green-600">{livenessScore}%</div>
                  </div>
                  <div>
                    <span className="font-medium">Confidence:</span>
                    <div className="text-lg font-bold text-blue-600">High</div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Redirecting to dashboard...
              </div>
            </div>
          )}

          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </CardContent>
      </Card>
    </div>
  );
};
