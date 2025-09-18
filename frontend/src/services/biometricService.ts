import { faceDetectionService } from './faceDetectionService';
import { voiceService } from './voiceService';
import { authService } from './authService';

export interface BiometricMethod {
  type: 'fingerprint' | 'face' | 'voice';
  name: string;
  description: string;
  icon: string;
}

export interface BiometricStatus {
  isAvailable: boolean;
  isEnrolled: boolean;
  isSupported: boolean;
  confidence?: number;
}

export interface BiometricAuthResult {
  success: boolean;
  method: string;
  confidence: number;
  userId?: string;
  error?: string;
  metadata?: any;
}

export interface BiometricEnrollment {
  userId: string;
  method: string;
  data: string; // Encrypted biometric template
  metadata?: any;
}

export interface LivenessCheck {
  success: boolean;
  isLive: boolean;
  confidence: number;
  instructions?: string[];
}

class BiometricService {
  private readonly supportedMethods: BiometricMethod[] = [
    {
      type: 'fingerprint',
      name: 'Fingerprint',
      description: 'Use your fingerprint to authenticate securely',
      icon: '🔐'
    },
    {
      type: 'face',
      name: 'Face Recognition',
      description: 'Look at your device to verify your identity',
      icon: '👁️'
    },
    {
      type: 'voice',
      name: 'Voice Recognition',
      description: 'Speak a passphrase to authenticate',
      icon: '🎤'
    }
  ];

  // Check availability of all biometric methods
  async checkAvailability(): Promise<Record<string, BiometricStatus>> {
    const status: Record<string, BiometricStatus> = {};

    for (const method of this.supportedMethods) {
      status[method.type] = await this.checkMethodAvailability(method.type);
    }

    return status;
  }

  // Check availability of a specific method
  private async checkMethodAvailability(method: string): Promise<BiometricStatus> {
    try {
      switch (method) {
        case 'fingerprint':
          return await this.checkFingerprintAvailability();
        case 'face':
          return await this.checkFaceAvailability();
        case 'voice':
          return await this.checkVoiceAvailability();
        default:
          return { isAvailable: false, isEnrolled: false, isSupported: false };
      }
    } catch (error) {
      console.error(`Error checking ${method} availability:`, error);
      return { isAvailable: false, isEnrolled: false, isSupported: false };
    }
  }

  // Check fingerprint (WebAuthn) availability
  private async checkFingerprintAvailability(): Promise<BiometricStatus> {
    try {
      if (!window.PublicKeyCredential) {
        return { isAvailable: false, isEnrolled: false, isSupported: false };
      }

      const isSupported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      // Check if user has enrolled credentials (simplified check)
      const isEnrolled = await this.checkFingerprintEnrollment();

      return {
        isAvailable: isSupported && isEnrolled,
        isEnrolled,
        isSupported,
        confidence: isEnrolled ? 0.95 : 0
      };
    } catch (error) {
      console.error('Error checking fingerprint availability:', error);
      return { isAvailable: false, isEnrolled: false, isSupported: false };
    }
  }

  // Check face recognition availability
  private async checkFaceAvailability(): Promise<BiometricStatus> {
    try {
      const faceApiStatus = await faceDetectionService.getStatus();
      const isCameraAvailable = await faceDetectionService.isCameraAvailable();
      const isEnrolled = await this.checkFaceEnrollment();

      return {
        isAvailable: faceApiStatus.available && isCameraAvailable && isEnrolled,
        isEnrolled,
        isSupported: faceApiStatus.available && isCameraAvailable,
        confidence: isEnrolled ? 0.9 : 0
      };
    } catch (error) {
      console.error('Error checking face availability:', error);
      return { isAvailable: false, isEnrolled: false, isSupported: false };
    }
  }

  // Check voice recognition availability
  private async checkVoiceAvailability(): Promise<BiometricStatus> {
    try {
      const voiceSupported = await voiceService.checkAvailability();
      const webSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const isEnrolled = await this.checkVoiceEnrollment();

      return {
        isAvailable: (voiceSupported || webSpeechSupported) && isEnrolled,
        isEnrolled,
        isSupported: voiceSupported || webSpeechSupported,
        confidence: isEnrolled ? 0.85 : 0
      };
    } catch (error) {
      console.error('Error checking voice availability:', error);
      return { isAvailable: false, isEnrolled: false, isSupported: false };
    }
  }

  // Check if user has enrolled fingerprint
  private async checkFingerprintEnrollment(): Promise<boolean> {
    try {
      // Check localStorage for enrollment status
      const enrollmentStatus = localStorage.getItem('biometric_fingerprint_enrolled');
      return enrollmentStatus === 'true';
    } catch (error) {
      console.error('Error checking fingerprint enrollment:', error);
      return false;
    }
  }

  // Check if user has enrolled face
  private async checkFaceEnrollment(): Promise<boolean> {
    try {
      const enrollmentStatus = localStorage.getItem('biometric_face_enrolled');
      return enrollmentStatus === 'true';
    } catch (error) {
      console.error('Error checking face enrollment:', error);
      return false;
    }
  }

  // Check if user has enrolled voice
  private async checkVoiceEnrollment(): Promise<boolean> {
    try {
      const enrollmentStatus = localStorage.getItem('biometric_voice_enrolled');
      return enrollmentStatus === 'true';
    } catch (error) {
      console.error('Error checking voice enrollment:', error);
      return false;
    }
  }

  // Enroll user for biometric authentication
  async enrollUser(method: string, userId: string, enrollmentData: any): Promise<BiometricEnrollment> {
    try {
      let data: string;
      let metadata: any;

      switch (method) {
        case 'fingerprint': {
          const fingerprintResult = await this.enrollFingerprint(userId, enrollmentData);
          data = fingerprintResult.credentialId;
          metadata = { type: 'public-key', transports: ['internal'] };
          localStorage.setItem('biometric_fingerprint_enrolled', 'true');
          break;
        }

        case 'face': {
          const faceResult = await this.enrollFace(userId, enrollmentData);
          data = faceResult.templateId;
          metadata = { landmarks: faceResult.landmarks, quality: faceResult.quality };
          localStorage.setItem('biometric_face_enrolled', 'true');
          break;
        }

        case 'voice': {
          const voiceResult = await this.enrollVoice(userId, enrollmentData);
          data = voiceResult.voiceId;
          metadata = { language: voiceResult.language, sampleRate: voiceResult.sampleRate };
          localStorage.setItem('biometric_voice_enrolled', 'true');
          break;
        }

        default:
          throw new Error(`Unsupported biometric method: ${method}`);
      }

      const enrollment: BiometricEnrollment = {
        userId,
        method,
        data,
        metadata
      };

      // Store enrollment locally
      this.storeEnrollment(enrollment);

      return enrollment;
    } catch (error) {
      console.error(`Error enrolling user for ${method}:`, error);
      throw error;
    }
  }

  // Enroll fingerprint using WebAuthn
  private async enrollFingerprint(userId: string, enrollmentData: any): Promise<any> {
    try {
      // Simulate WebAuthn enrollment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        credentialId: `credential_${Date.now()}_${userId}`,
        type: 'public-key',
        transports: ['internal']
      };
    } catch (error) {
      console.error('Error enrolling fingerprint:', error);
      throw error;
    }
  }

  // Enroll face recognition
  private async enrollFace(userId: string, enrollmentData: any): Promise<any> {
    try {
      const result = await faceDetectionService.enrollFace({
        userId,
        name: enrollmentData.name || userId,
        images: enrollmentData.images || []
      });

      return {
        templateId: `face_template_${Date.now()}_${userId}`,
        landmarks: enrollmentData.landmarks || [],
        quality: enrollmentData.quality || 0.9
      };
    } catch (error) {
      console.error('Error enrolling face:', error);
      throw error;
    }
  }

  // Enroll voice recognition
  private async enrollVoice(userId: string, enrollmentData: any): Promise<any> {
    try {
      // Simulate voice enrollment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        voiceId: `voice_${Date.now()}_${userId}`,
        language: enrollmentData.language || 'en-US',
        sampleRate: enrollmentData.sampleRate || 16000
      };
    } catch (error) {
      console.error('Error enrolling voice:', error);
      throw error;
    }
  }

  // Authenticate user using biometric method
  async authenticateUser(method: string, userId?: string): Promise<BiometricAuthResult> {
    try {
      let result: BiometricAuthResult;

      switch (method) {
        case 'fingerprint':
          result = await this.authenticateFingerprint(userId);
          break;
        case 'face':
          result = await this.authenticateFace(userId);
          break;
        case 'voice':
          result = await this.authenticateVoice(userId);
          break;
        default:
          throw new Error(`Unsupported biometric method: ${method}`);
      }

      if (result.success) {
        // Update last used timestamp
        this.updateLastUsed(method);
      }

      return result;
    } catch (error) {
      console.error(`Error authenticating with ${method}:`, error);
      return {
        success: false,
        method,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  // Authenticate using fingerprint
  private async authenticateFingerprint(userId?: string): Promise<BiometricAuthResult> {
    try {
      // Simulate WebAuthn authentication
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        method: 'fingerprint',
        confidence: 0.95,
        userId: userId || 'default_user',
        metadata: { timestamp: Date.now() }
      };
    } catch (error) {
      console.error('Error authenticating fingerprint:', error);
      throw error;
    }
  }

  // Authenticate using face recognition
  private async authenticateFace(userId?: string): Promise<BiometricAuthResult> {
    try {
      // Start camera and capture image
      const stream = await faceDetectionService.startCamera();
      
      // Wait for camera to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capture image (this would need a video element in the UI)
      // For now, simulate the process
      const imageData = 'simulated_face_image_data';
      
      // Verify face
      const result = await faceDetectionService.identifyFace(imageData);
      
      // Stop camera
      faceDetectionService.stopCamera(stream);
      
      if (result.success && result.detected && result.confidence && result.confidence > 0.7) {
        return {
          success: true,
          method: 'face',
          confidence: result.confidence,
          userId: result.userId || userId || 'default_user',
          metadata: { landmarks: result.landmarks, boundingBox: result.boundingBox }
        };
      } else {
        throw new Error('Face not recognized or confidence too low');
      }
    } catch (error) {
      console.error('Error authenticating face:', error);
      throw error;
    }
  }

  // Authenticate using voice recognition
  private async authenticateVoice(userId?: string): Promise<BiometricAuthResult> {
    try {
      const challengePhrase = "SecureInsure authentication";
      
      // Speak challenge phrase
      voiceService.speakText(`Please say: ${challengePhrase}`);
      
      // Wait for user to repeat the phrase
      const transcript = await new Promise<string>((resolve, reject) => {
        const recognition = voiceService.startWebSpeechRecognition(
          (transcript) => {
            const similarity = this.calculateSimilarity(transcript.toLowerCase(), challengePhrase.toLowerCase());
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

      return {
        success: true,
        method: 'voice',
        confidence: 0.85,
        userId: userId || 'default_user',
        metadata: { transcript, challengePhrase }
      };
    } catch (error) {
      console.error('Error authenticating voice:', error);
      throw error;
    }
  }

  // Calculate similarity between two strings
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  // Calculate Levenshtein distance
  private levenshteinDistance(str1: string, str2: string): number {
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
  }

  // Store enrollment data locally
  private storeEnrollment(enrollment: BiometricEnrollment): void {
    try {
      const enrollments = this.getStoredEnrollments();
      enrollments.push(enrollment);
      localStorage.setItem('biometric_enrollments', JSON.stringify(enrollments));
    } catch (error) {
      console.error('Error storing enrollment:', error);
    }
  }

  // Get stored enrollments
  private getStoredEnrollments(): BiometricEnrollment[] {
    try {
      const stored = localStorage.getItem('biometric_enrollments');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored enrollments:', error);
      return [];
    }
  }

  // Update last used timestamp
  private updateLastUsed(method: string): void {
    try {
      const lastUsed = JSON.parse(localStorage.getItem('biometric_last_used') || '{}');
      lastUsed[method] = Date.now();
      localStorage.setItem('biometric_last_used', JSON.stringify(lastUsed));
    } catch (error) {
      console.error('Error updating last used timestamp:', error);
    }
  }

  // Get supported methods
  getSupportedMethods(): BiometricMethod[] {
    return this.supportedMethods;
  }

  // Check if any biometric method is available
  async hasAnyBiometricAvailable(): Promise<boolean> {
    const status = await this.checkAvailability();
    return Object.values(status).some(method => method.isAvailable);
  }

  // Get recommended method based on availability and confidence
  async getRecommendedMethod(): Promise<string | null> {
    const status = await this.checkAvailability();
    let bestMethod: string | null = null;
    let bestConfidence = 0;

    for (const [method, methodStatus] of Object.entries(status)) {
      if (methodStatus.isAvailable && methodStatus.confidence && methodStatus.confidence > bestConfidence) {
        bestMethod = method;
        bestConfidence = methodStatus.confidence;
      }
    }

    return bestMethod;
  }

  // Perform liveness check for face recognition
  async performLivenessCheck(imageData: string): Promise<LivenessCheck> {
    try {
      const result = await faceDetectionService.checkLiveness(imageData);
      return result;
    } catch (error) {
      console.error('Error performing liveness check:', error);
      throw error;
    }
  }

  // Clear all biometric data (for testing/debugging)
  clearAllBiometricData(): void {
    try {
      localStorage.removeItem('biometric_fingerprint_enrolled');
      localStorage.removeItem('biometric_face_enrolled');
      localStorage.removeItem('biometric_voice_enrolled');
      localStorage.removeItem('biometric_enrollments');
      localStorage.removeItem('biometric_last_used');
    } catch (error) {
      console.error('Error clearing biometric data:', error);
    }
  }
}

// Export singleton instance
export const biometricService = new BiometricService();

// Type declarations for WebAuthn
declare global {
  interface Window {
    PublicKeyCredential: any;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
