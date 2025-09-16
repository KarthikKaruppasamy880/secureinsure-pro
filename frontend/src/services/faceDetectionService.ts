import axios from 'axios';
import { assertSecureContext, requestCameraPermission } from '../utils/secureContext';

const FACE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/face-api';

const faceApi = axios.create({
  baseURL: FACE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FaceDetectionResult {
  success: boolean;
  detected: boolean;
  confidence: number;
  userId?: string;
  landmarks?: any[];
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FaceEnrollment {
  userId: string;
  name: string;
  images: string[]; // Base64 encoded images
}

export interface LivenessCheck {
  success: boolean;
  isLive: boolean;
  confidence: number;
  instructions?: string[];
}

export const faceDetectionService = {
  // Detect face in image
  async detectFace(imageData: string): Promise<FaceDetectionResult> {
    try {
      const response = await faceApi.post('/face/detect', {
        image: imageData
      });
      return response.data;
    } catch (error) {
      console.error('Error detecting face:', error);
      throw error;
    }
  },

  // Verify face against enrolled user
  async verifyFace(imageData: string, userId: string): Promise<FaceDetectionResult> {
    try {
      const response = await faceApi.post('/face/verify', {
        image: imageData,
        userId: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying face:', error);
      throw error;
    }
  },

  // Identify face from enrolled users
  async identifyFace(imageData: string): Promise<FaceDetectionResult> {
    try {
      const response = await faceApi.post('/face/identify', {
        image: imageData
      });
      return response.data;
    } catch (error) {
      console.error('Error identifying face:', error);
      throw error;
    }
  },

  // Enroll new face
  async enrollFace(enrollment: FaceEnrollment): Promise<{ success: boolean; message: string }> {
    try {
      const response = await faceApi.post('/face/enroll', enrollment);
      return response.data;
    } catch (error) {
      console.error('Error enrolling face:', error);
      throw error;
    }
  },

  // Liveness detection
  async checkLiveness(imageData: string): Promise<LivenessCheck> {
    try {
      const response = await faceApi.post('/face/liveness', {
        image: imageData
      });
      return response.data;
    } catch (error) {
      console.error('Error checking liveness:', error);
      throw error;
    }
  },

  // Start face authentication session
  async startAuthSession(): Promise<{ sessionId: string; instructions: string[] }> {
    try {
      const response = await faceApi.post('/face/auth/start');
      return response.data;
    } catch (error) {
      console.error('Error starting face auth session:', error);
      throw error;
    }
  },

  // Complete face authentication
  async completeFaceAuth(sessionId: string, imageData: string): Promise<FaceDetectionResult> {
    try {
      const response = await faceApi.post('/face/auth/complete', {
        sessionId,
        image: imageData
      });
      return response.data;
    } catch (error) {
      console.error('Error completing face authentication:', error);
      throw error;
    }
  },

  // Capture image from video stream
  captureImageFromVideo(videoElement: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Canvas context not available');
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  },

  // Start camera stream
  async startCamera(): Promise<MediaStream> {
    try {
      if (!assertSecureContext()) {
        throw new Error('Camera access requires a secure context (HTTPS or localhost)');
      }
      
      const stream = await requestCameraPermission({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      return stream;
    } catch (error) {
      console.error('Error starting camera:', error);
      throw error;
    }
  },

  // Stop camera stream
  stopCamera(stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop());
  },

  // Check if camera is available
  async isCameraAvailable(): Promise<boolean> {
    try {
      if (!assertSecureContext()) {
        return false;
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  },

  // Get face API status
  async getStatus(): Promise<{ available: boolean; version: string }> {
    try {
      const response = await faceApi.get('/face/status');
      return response.data;
    } catch (error) {
      console.error('Error getting face API status:', error);
      return { available: false, version: 'unknown' };
    }
  }
};