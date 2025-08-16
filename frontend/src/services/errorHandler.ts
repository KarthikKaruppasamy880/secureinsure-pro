import { toast } from 'react-hot-toast';

export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  username?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount: Map<string, number> = new Map();
  private readonly MAX_ERRORS_PER_MINUTE = 5;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle API errors with appropriate user feedback
   */
  handleApiError(error: any, context?: string): void {
    const errorInfo = this.extractErrorInfo(error, context);
    
    // Log error
    this.logError(errorInfo);
    
    // Show user-friendly message
    this.showUserMessage(errorInfo);
    
    // Track error frequency
    this.trackErrorFrequency(errorInfo.message);
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: any, context?: string): void {
    const errorInfo: ErrorInfo = {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logError(errorInfo);
    
    // Show validation errors to user
    if (typeof errors === 'object') {
      Object.entries(errors).forEach(([field, message]) => {
        if (message) {
          toast.error(`${field}: ${message}`);
        }
      });
    } else {
      toast.error('Please check your input and try again.');
    }
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: any, context?: string): void {
    const errorInfo: ErrorInfo = {
      message: 'Network connection error',
      code: 'NETWORK_ERROR',
      details: error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logError(errorInfo);
    
    if (navigator.onLine) {
      toast.error('Unable to connect to the server. Please try again.');
    } else {
      toast.error('You are offline. Please check your internet connection.');
    }
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: any, context?: string): void {
    const errorInfo: ErrorInfo = {
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
      details: error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logError(errorInfo);
    
    // Redirect to login if token is invalid
    if (error?.response?.status === 401) {
      toast.error('Your session has expired. Please log in again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      toast.error('Authentication failed. Please try again.');
    }
  }

  /**
   * Handle permission errors
   */
  handlePermissionError(error: any, context?: string): void {
    const errorInfo: ErrorInfo = {
      message: 'Access denied',
      code: 'PERMISSION_ERROR',
      details: error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logError(errorInfo);
    
    toast.error('You do not have permission to perform this action.');
  }

  /**
   * Extract error information from various error types
   */
  private extractErrorInfo(error: any, context?: string): ErrorInfo {
    let message = 'An unexpected error occurred';
    let code = 'UNKNOWN_ERROR';
    let status: number | undefined;
    let details: any = error;

    if (error?.response) {
      // Axios error
      status = error.response.status;
      details = error.response.data;
      
      if (error.response.status === 400) {
        message = 'Invalid request. Please check your input.';
        code = 'BAD_REQUEST';
      } else if (error.response.status === 401) {
        message = 'Authentication required.';
        code = 'UNAUTHORIZED';
      } else if (error.response.status === 403) {
        message = 'Access denied.';
        code = 'FORBIDDEN';
      } else if (error.response.status === 404) {
        message = 'Resource not found.';
        code = 'NOT_FOUND';
      } else if (error.response.status === 429) {
        message = 'Too many requests. Please try again later.';
        code = 'RATE_LIMITED';
      } else if (error.response.status >= 500) {
        message = 'Server error. Please try again later.';
        code = 'SERVER_ERROR';
      }
    } else if (error?.message) {
      // Standard Error object
      message = error.message;
      code = error.name || 'ERROR';
    } else if (typeof error === 'string') {
      // String error
      message = error;
      code = 'STRING_ERROR';
    }

    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return {
      message,
      code,
      status,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: user.id,
      username: user.username,
    };
  }

  /**
   * Log error to console and potentially to monitoring service
   */
  private logError(errorInfo: ErrorInfo): void {
    // Console logging
    console.error('Error occurred:', errorInfo);

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorInfo);
      localStorage.setItem('app_errors', JSON.stringify(existingErrors.slice(-20))); // Keep last 20 errors
    } catch (e) {
      console.error('Failed to store error in localStorage:', e);
    }

    // In production, send to monitoring service (e.g., Sentry, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorInfo);
    }
  }

  /**
   * Show appropriate user message based on error type
   */
  private showUserMessage(errorInfo: ErrorInfo): void {
    // Don't show too many error messages
    if (this.shouldThrottleError(errorInfo.message)) {
      return;
    }

    // Show user-friendly message
    if (errorInfo.code === 'NETWORK_ERROR') {
      toast.error('Connection error. Please check your internet connection.');
    } else if (errorInfo.code === 'VALIDATION_ERROR') {
      toast.error('Please check your input and try again.');
    } else if (errorInfo.code === 'SERVER_ERROR') {
      toast.error('Server error. Please try again later.');
    } else if (errorInfo.code === 'RATE_LIMITED') {
      toast.error('Too many requests. Please wait a moment and try again.');
    } else {
      toast.error(errorInfo.message);
    }
  }

  /**
   * Track error frequency to prevent spam
   */
  private trackErrorFrequency(message: string): void {
    const key = message.substring(0, 50); // Truncate long messages
    const count = this.errorCount.get(key) || 0;
    this.errorCount.set(key, count + 1);

    // Clean up old counts after 1 minute
    setTimeout(() => {
      const currentCount = this.errorCount.get(key) || 0;
      if (currentCount > 0) {
        this.errorCount.set(key, Math.max(0, currentCount - 1));
      }
    }, 60000);
  }

  /**
   * Check if error should be throttled
   */
  private shouldThrottleError(message: string): boolean {
    const key = message.substring(0, 50);
    const count = this.errorCount.get(key) || 0;
    return count >= this.MAX_ERRORS_PER_MINUTE;
  }

  /**
   * Send error to monitoring service
   */
  private sendToMonitoringService(errorInfo: ErrorInfo): void {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just log to console
    console.log('Sending error to monitoring service:', errorInfo);
  }

  /**
   * Get all stored errors for debugging
   */
  getStoredErrors(): ErrorInfo[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors(): void {
    localStorage.removeItem('app_errors');
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): string {
    const errors = this.getStoredErrors();
    return JSON.stringify(errors, null, 2);
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
export default errorHandler; 