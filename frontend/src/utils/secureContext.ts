/**
 * Utility functions for secure context and permissions
 */

/**
 * Check if the current context is secure (HTTPS or localhost)
 */
export const assertSecureContext = (): boolean => {
  // Allow if it's a secure context (HTTPS)
  if (window.isSecureContext) {
    return true;
  }
  
  // Allow localhost and 127.0.0.1 in development
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }
  
  return false;
};

/**
 * Get user-friendly message for non-secure context
 */
export const getSecureContextMessage = (): string => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'Microphone/Camera access is available on localhost.';
  }
  
  return 'Microphone/Camera require HTTPS. Please use HTTPS or open the app at http://localhost:5173';
};

/**
 * Check if media devices are available
 */
export const checkMediaDevices = async (): Promise<{ audio: boolean; video: boolean }> => {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return { audio: false, video: false };
    }
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    return {
      audio: audioDevices.length > 0,
      video: videoDevices.length > 0
    };
  } catch (error) {
    console.warn('Failed to enumerate media devices:', error);
    return { audio: false, video: false };
  }
};

/**
 * Request microphone permission with error handling
 */
export const requestMicrophonePermission = async (): Promise<MediaStream | null> => {
  try {
    if (!assertSecureContext()) {
      throw new Error(getSecureContextMessage());
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone permission denied. Please allow microphone access and try again.');
      }
      throw error;
    }
    throw new Error('Failed to access microphone');
  }
};

/**
 * Request camera permission with error handling
 */
export const requestCameraPermission = async (): Promise<MediaStream | null> => {
  try {
    if (!assertSecureContext()) {
      throw new Error(getSecureContextMessage());
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    return stream;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera permission denied. Please allow camera access and try again.');
      }
      throw error;
    }
    throw new Error('Failed to access camera');
  }
};
