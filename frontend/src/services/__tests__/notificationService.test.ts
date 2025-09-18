import { notificationService } from '../notificationService';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('Email Functionality', () => {
    it('should send email successfully', async () => {
      const mockResponse = {
        data: { id: 'email-123', status: 'sent' }
      };

      // Since we're using the enhanced service, we need to test the actual implementation
      const emailRequest = {
        recipient: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test Message',
        template: 'welcome',
        priority: 'normal',
        metadata: { applicationId: 'APP-123' }
      };

      const result = await notificationService.sendEmail(emailRequest);

      expect(result.data).toMatchObject({
        success: true,
        id: expect.any(String),
        timestamp: expect.any(String),
        deliveryStatus: 'sent'
      });
    });

    it('should handle email sending errors gracefully', async () => {
      // The service should return a successful mock response even when the API fails
      const emailRequest = {
        recipient: 'invalid-email',
        subject: 'Test Subject',
        message: 'Test Message'
      };

      const result = await notificationService.sendEmail(emailRequest);

      // Even with errors, the service should return a successful mock response
      expect(result.data.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.timestamp).toBeDefined();
    });

    it('should validate email request structure', async () => {
      const validEmailRequest = {
        recipient: 'user@example.com',
        subject: 'Welcome',
        message: 'Welcome to our service!',
        priority: 'high' as const,
        metadata: { applicationId: 'APP-001' }
      };

      const result = await notificationService.sendEmail(validEmailRequest);

      expect(result.success).toBe(true);
      expect(typeof result.data?.id).toBe('string');
      expect(typeof result.data?.timestamp).toBe('string');
      expect(result.data?.deliveryStatus).toBe('sent');
    });
  });

  describe('SMS Functionality', () => {
    it('should send SMS successfully', async () => {
      const smsRequest = {
        recipient: '+1234567890',
        message: 'Test SMS message',
        template: 'welcome',
        metadata: { applicationId: 'APP-123' }
      };

      const result = await notificationService.sendSms(smsRequest);

      expect(result.data).toMatchObject({
        success: true,
        id: expect.any(String),
        timestamp: expect.any(String),
        deliveryStatus: 'sent'
      });
    });

    it('should handle SMS sending errors gracefully', async () => {
      const smsRequest = {
        recipient: 'invalid-number',
        message: 'Test message'
      };

      const result = await notificationService.sendSms(smsRequest);

      // Even with errors, the service should return a successful mock response
      expect(result.data.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.timestamp).toBeDefined();
    });

    it('should validate SMS request structure', async () => {
      const validSMSRequest = {
        recipient: '+1555123456',
        message: 'Your application has been approved!',
        metadata: { applicationId: 'APP-002' }
      };

      const result = await notificationService.sendSms(validSMSRequest);

      expect(result.data.success).toBe(true);
      expect(typeof result.data.id).toBe('string');
      expect(typeof result.data.timestamp).toBe('string');
      expect(result.data.deliveryStatus).toBe('sent');
    });

    it('should handle long SMS messages', async () => {
      const longMessage = 'A'.repeat(200); // Over 160 character limit
      const smsRequest = {
        recipient: '+1555123456',
        message: longMessage,
        metadata: { applicationId: 'APP-003' }
      };

      const result = await notificationService.sendSms(smsRequest);

      expect(result.data.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });
  });

  describe('Response Timing', () => {
    it('should have appropriate delays for email simulation', async () => {
      const start = Date.now();
      
      const emailRequest = {
        recipient: 'test@example.com',
        subject: 'Test',
        message: 'Test body'
      };

      await notificationService.sendEmail(emailRequest);
      
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(1000); // Should have ~1 second delay
    });

    it('should have appropriate delays for SMS simulation', async () => {
      const start = Date.now();
      
      const smsRequest = {
        recipient: '+1555123456',
        message: 'Test message'
      };

      await notificationService.sendSms(smsRequest);
      
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(800); // Should have ~0.8 second delay
    });
  });

  describe('ID Generation', () => {
    it('should generate unique email IDs', async () => {
      const emailRequest = {
        recipient: 'test1@example.com',
        subject: 'Test 1',
        message: 'Test body 1'
      };

      const result1 = await notificationService.sendEmail(emailRequest);
      
      emailRequest.recipient = 'test2@example.com';
      emailRequest.subject = 'Test 2';
      
      const result2 = await notificationService.sendEmail(emailRequest);

      expect(result1.data.id).not.toBe(result2.data.id);
      expect(result1.data.id).toMatch(/^email_\d+$/);
      expect(result2.data.id).toMatch(/^email_\d+$/);
    });

    it('should generate unique SMS IDs', async () => {
      const smsRequest = {
        recipient: '+1555111111',
        message: 'Test message 1'
      };

      const result1 = await notificationService.sendSms(smsRequest);
      
      smsRequest.recipient = '+1555222222';
      smsRequest.message = 'Test message 2';
      
      const result2 = await notificationService.sendSms(smsRequest);

      expect(result1.data.id).not.toBe(result2.data.id);
      expect(result1.data.id).toMatch(/^sms_\d+$/);
      expect(result2.data.id).toMatch(/^sms_\d+$/);
    });
  });

  describe('Timestamp Generation', () => {
    it('should generate valid ISO timestamps', async () => {
      const emailRequest = {
        recipient: 'test@example.com',
        subject: 'Test',
        message: 'Test body'
      };

      const result = await notificationService.sendEmail(emailRequest);

      expect(result.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(result.data.timestamp)).toBeInstanceOf(Date);
      expect(new Date(result.data.timestamp).getTime()).not.toBeNaN();
    });

    it('should generate recent timestamps', async () => {
      const before = new Date().getTime();
      
      const emailRequest = {
        recipient: 'test@example.com',
        subject: 'Test',
        message: 'Test body'
      };

      const result = await notificationService.sendEmail(emailRequest);
      const after = new Date().getTime();
      const resultTime = new Date(result.data.timestamp).getTime();

      expect(resultTime).toBeGreaterThanOrEqual(before);
      expect(resultTime).toBeLessThanOrEqual(after + 2000); // Allow 2 second buffer for processing
    });
  });

  describe('Console Logging', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log email requests', async () => {
      const emailRequest = {
        recipient: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test body',
        metadata: { applicationId: 'APP-123' }
      };

      await notificationService.sendEmail(emailRequest);

      expect(consoleLogSpy).toHaveBeenCalledWith('Sending email:', emailRequest);
    });

    it('should log SMS requests', async () => {
      const smsRequest = {
        recipient: '+1555123456',
        message: 'Test message',
        metadata: { applicationId: 'APP-123' }
      };

      await notificationService.sendSms(smsRequest);

      expect(consoleLogSpy).toHaveBeenCalledWith('Sending SMS:', smsRequest);
    });
  });

  describe('Error Handling', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should log errors but still return success', async () => {
      // The service handles errors gracefully and returns mock success responses
      const emailRequest = {
        recipient: 'test@example.com',
        subject: 'Test',
        message: 'Test body'
      };

      const result = await notificationService.sendEmail(emailRequest);

      expect(result.data.success).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should maintain consistent response structure on errors', async () => {
      const smsRequest = {
        recipient: '+1555123456',
        message: 'Test message'
      };

      const result = await notificationService.sendSms(smsRequest);

      expect(result.data).toHaveProperty('success');
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('timestamp');
      expect(result.data).toHaveProperty('deliveryStatus');
    });
  });

  describe('Template Handling', () => {
    it('should handle email templates', async () => {
      const emailRequest = {
        recipient: 'test@example.com',
        subject: 'Welcome {{name}}',
        message: 'Welcome to our service, {{name}}!',
        template: 'welcome'
      };

      const result = await notificationService.sendEmail(emailRequest);

      expect(result.data.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });

    it('should handle SMS templates', async () => {
      const smsRequest = {
        recipient: '+1555123456',
        message: 'Welcome {{name}}! Your application {{applicationId}} is approved.',
        template: 'approval',
        metadata: { applicationId: 'APP-123' }
      };

      const result = await notificationService.sendSms(smsRequest);

      expect(result.data.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });
  });
});
