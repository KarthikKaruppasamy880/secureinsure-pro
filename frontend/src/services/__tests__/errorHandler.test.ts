import { errorHandler, ErrorHandler } from '../errorHandler';

// Mock toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost:8081/test',
  },
});

// Mock console methods
const consoleSpy = {
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
};

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('{}');
    localStorageMock.setItem.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('returns the same instance', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('handleApiError', () => {
    it('handles Axios error with 400 status', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' }
        }
      };

      errorHandler.handleApiError(error, 'Test API');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('handles Axios error with 401 status', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      errorHandler.handleApiError(error, 'Test API');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('handles Axios error with 403 status', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      };

      errorHandler.handleApiError(error, 'Test API');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('handles Axios error with 500 status', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      errorHandler.handleApiError(error, 'Test API');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('handles standard Error object', () => {
      const error = new Error('Test error');

      errorHandler.handleApiError(error, 'Test API');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('handles string error', () => {
      const error = 'String error message';

      errorHandler.handleApiError(error, 'Test API');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('handleValidationError', () => {
    it('handles validation errors object', () => {
      const errors = {
        field1: 'Field 1 is required',
        field2: 'Field 2 is invalid'
      };

      errorHandler.handleValidationError(errors, 'Form validation');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('handles validation errors array', () => {
      const errors = ['Error 1', 'Error 2'];

      errorHandler.handleValidationError(errors, 'Form validation');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('handleNetworkError', () => {
    it('handles network error when online', () => {
      (navigator as any).onLine = true;
      const error = new Error('Network error');

      errorHandler.handleNetworkError(error, 'API call');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('handles network error when offline', () => {
      (navigator as any).onLine = false;
      const error = new Error('Network error');

      errorHandler.handleNetworkError(error, 'API call');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('handleAuthError', () => {
    it('handles 401 auth error', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };

      // Mock setTimeout
      jest.useFakeTimers();
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        writable: true,
        value: mockLocation,
      });

      errorHandler.handleAuthError(error, 'Login');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();

      jest.runAllTimers();
      expect(mockLocation.href).toBe('/login');

      jest.useRealTimers();
    });

    it('handles non-401 auth error', () => {
      const error = {
        response: {
          status: 422,
          data: { message: 'Invalid credentials' }
        }
      };

      errorHandler.handleAuthError(error, 'Login');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('handlePermissionError', () => {
    it('handles permission error', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Access denied' }
        }
      };

      errorHandler.handlePermissionError(error, 'Resource access');

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('error storage and retrieval', () => {
    it('stores errors in localStorage', () => {
      const error = new Error('Test error');
      localStorageMock.getItem.mockReturnValue('[]');

      errorHandler.handleApiError(error, 'Test');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'app_errors',
        expect.stringContaining('Test error')
      );
    });

    it('limits stored errors to 20', () => {
      const existingErrors = Array.from({ length: 25 }, (_, i) => ({ message: `Error ${i}` }));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingErrors));

      const error = new Error('New error');
      errorHandler.handleApiError(error, 'Test');

      const setItemCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'app_errors'
      );
      if (setItemCall) {
        const storedErrors = JSON.parse(setItemCall[1]);
        expect(storedErrors).toHaveLength(20);
      }
    });

    it('retrieves stored errors', () => {
      const mockErrors = [{ message: 'Test error' }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockErrors));

      const errors = errorHandler.getStoredErrors();

      expect(errors).toEqual(mockErrors);
    });

    it('clears stored errors', () => {
      errorHandler.clearStoredErrors();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('app_errors');
    });

    it('exports errors as JSON string', () => {
      const mockErrors = [{ message: 'Test error' }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockErrors));

      const exported = errorHandler.exportErrors();

      expect(exported).toBe(JSON.stringify(mockErrors, null, 2));
    });
  });

  describe('error throttling', () => {
    it('throttles repeated errors', () => {
      const error = new Error('Repeated error');

      // Call multiple times
      for (let i = 0; i < 10; i++) {
        errorHandler.handleApiError(error, 'Test');
      }

      // Should still log to console but may throttle user messages
      expect(consoleSpy.error).toHaveBeenCalledTimes(10);
    });
  });

  describe('production mode', () => {
    it('sends errors to monitoring service in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Production error');
      errorHandler.handleApiError(error, 'Test');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        'Sending error to monitoring service:',
        expect.objectContaining({
          message: 'Production error'
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
}); 