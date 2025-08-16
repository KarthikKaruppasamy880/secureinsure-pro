import { toast } from 'sonner';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const NOTIFICATION_API_URL = `${API_BASE_URL}/api/v1/notifications`;

// Types
export interface NotificationRequest {
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  message: string;
  template?: string;
  priority?: 'low' | 'normal' | 'high';
  scheduledFor?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    status: string;
    messageId?: string;
    cost?: number;
  };
  error?: string;
}

export interface NotificationHistory {
  id: string;
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  message: string;
  template?: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  metadata?: {
    provider?: string;
    messageId?: string;
    cost?: number;
    retryCount?: number;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateRequest {
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
  isDefault: boolean;
}

// Utility functions
const maskPII = (text: string, type: 'email' | 'sms'): string => {
  if (type === 'email') {
    const [username, domain] = text.split('@');
    if (username.length <= 1) return text;
    return `${username.charAt(0)}***@${domain}`;
  } else {
    // Phone number masking: +1234567890 -> +123***7890
    if (text.length < 7) return text;
    return text.replace(/(\+\d{3})\d{3}(\d{4})/, '$1***$2');
  }
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

const validateNotificationRequest = (request: NotificationRequest): string[] => {
  const errors: string[] = [];

  if (!request.recipient.trim()) {
    errors.push('Recipient is required');
  } else if (request.type === 'email' && !validateEmail(request.recipient)) {
    errors.push('Invalid email address format');
  } else if (request.type === 'sms' && !validatePhone(request.recipient)) {
    errors.push('Invalid phone number format');
  }

  if (!request.message.trim()) {
    errors.push('Message is required');
  }

  if (request.type === 'email' && !request.subject?.trim()) {
    errors.push('Subject is required for email notifications');
  }

  if (request.type === 'sms' && request.message.length > 160) {
    errors.push('SMS message cannot exceed 160 characters');
  }

  return errors;
};

// API helper function
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${NOTIFICATION_API_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Main notification service
export const notificationService = {
  // Send email notification
  async sendEmail(request: Omit<NotificationRequest, 'type'>): Promise<NotificationResponse> {
    try {
      const notificationRequest: NotificationRequest = {
        ...request,
        type: 'email'
      };

      const errors = validateNotificationRequest(notificationRequest);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await makeRequest<NotificationResponse>('/email', {
        method: 'POST',
        body: JSON.stringify(notificationRequest),
      });

      if (response.success) {
        toast.success('Email sent successfully!');
      } else {
        toast.error(`Email failed: ${response.error || 'Unknown error'}`);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      toast.error(`Email error: ${errorMessage}`);
      throw error;
    }
  },

  // Send SMS notification
  async sendSms(request: Omit<NotificationRequest, 'type'>): Promise<NotificationResponse> {
    try {
      const notificationRequest: NotificationRequest = {
        ...request,
        type: 'sms'
      };

      const errors = validateNotificationRequest(notificationRequest);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await makeRequest<NotificationResponse>('/sms', {
        method: 'POST',
        body: JSON.stringify(notificationRequest),
      });

      if (response.success) {
        toast.success('SMS sent successfully!');
      } else {
        toast.error(`SMS failed: ${response.error || 'Unknown error'}`);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send SMS';
      toast.error(`SMS error: ${errorMessage}`);
      throw error;
    }
  },

  // Send notification (auto-detect type)
  async sendNotification(request: NotificationRequest): Promise<NotificationResponse> {
    if (request.type === 'email') {
      return this.sendEmail(request);
    } else {
      return this.sendSms(request);
    }
  },

  // Get notification history
  async getNotificationHistory(
    filters?: {
      type?: 'email' | 'sms';
      status?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<NotificationHistory[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.offset) queryParams.append('offset', filters.offset.toString());

      const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await makeRequest<{ data: NotificationHistory[] }>(endpoint);

      // Mask PII in the response
      return response.data.map(notification => ({
        ...notification,
        recipient: maskPII(notification.recipient, notification.type)
      }));
    } catch (error) {
      console.error('Failed to fetch notification history:', error);
      toast.error('Failed to load notification history');
      throw error;
    }
  },

  // Get specific notification by ID
  async getNotification(id: string): Promise<NotificationHistory | null> {
    try {
      const response = await makeRequest<{ data: NotificationHistory }>(`/${id}`);
      
      // Mask PII in the response
      const notification = response.data;
      return {
        ...notification,
        recipient: maskPII(notification.recipient, notification.type)
      };
    } catch (error) {
      console.error(`Failed to fetch notification ${id}:`, error);
      toast.error('Failed to load notification details');
      throw error;
    }
  },

  // Get notification templates
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    try {
      const response = await makeRequest<{ data: NotificationTemplate[] }>('/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      toast.error('Failed to load notification templates');
      throw error;
    }
  },

  // Create new template
  async createTemplate(template: TemplateRequest): Promise<NotificationTemplate> {
    try {
      const response = await makeRequest<{ data: NotificationTemplate }>('/templates', {
        method: 'POST',
        body: JSON.stringify(template),
      });

      toast.success('Template created successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create template';
      toast.error(`Template creation failed: ${errorMessage}`);
      throw error;
    }
  },

  // Update existing template
  async updateTemplate(id: string, template: Partial<TemplateRequest>): Promise<NotificationTemplate> {
    try {
      const response = await makeRequest<{ data: NotificationTemplate }>(`/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(template),
      });

      toast.success('Template updated successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update template';
      toast.error(`Template update failed: ${errorMessage}`);
      throw error;
    }
  },

  // Delete template
  async deleteTemplate(id: string): Promise<void> {
    try {
      await makeRequest(`/templates/${id}`, {
        method: 'DELETE',
      });

      toast.success('Template deleted successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete template';
      toast.error(`Template deletion failed: ${errorMessage}`);
      throw error;
    }
  },

  // Process webhook from notification providers
  async processWebhook(provider: string, payload: any): Promise<void> {
    try {
      await makeRequest(`/webhook/${provider}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error(`Failed to process webhook from ${provider}:`, error);
      throw error;
    }
  },

  // Get notification statistics
  async getNotificationStats(
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
    cost: number;
  }> {
    try {
      const response = await makeRequest<{ data: any }>(`/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification statistics:', error);
      throw error;
    }
  },

  // Retry failed notification
  async retryNotification(id: string): Promise<NotificationResponse> {
    try {
      const response = await makeRequest<NotificationResponse>(`/${id}/retry`, {
        method: 'POST',
      });

      if (response.success) {
        toast.success('Notification retry initiated successfully!');
      } else {
        toast.error(`Retry failed: ${response.error || 'Unknown error'}`);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retry notification';
      toast.error(`Retry error: ${errorMessage}`);
      throw error;
    }
  },

  // Cancel pending notification
  async cancelNotification(id: string): Promise<void> {
    try {
      await makeRequest(`/${id}/cancel`, {
        method: 'POST',
      });

      toast.success('Notification cancelled successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel notification';
      toast.error(`Cancellation error: ${errorMessage}`);
      throw error;
    }
  },

  // Bulk send notifications
  async bulkSend(notifications: Omit<NotificationRequest, 'type'>[]): Promise<{
    success: number;
    failed: number;
    results: Array<{ success: boolean; recipient: string; error?: string }>;
  }> {
    try {
      const response = await makeRequest<{
        success: number;
        failed: number;
        results: Array<{ success: boolean; recipient: string; error?: string }>;
      }>('/bulk', {
        method: 'POST',
        body: JSON.stringify({ notifications }),
      });

      const total = response.success + response.failed;
      if (response.success > 0) {
        toast.success(`Successfully sent ${response.success} out of ${total} notifications`);
      }
      if (response.failed > 0) {
        toast.error(`Failed to send ${response.failed} out of ${total} notifications`);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send bulk notifications';
      toast.error(`Bulk send error: ${errorMessage}`);
      throw error;
    }
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await makeRequest<{ status: string; timestamp: string }>('/health');
      return response;
    } catch (error) {
      console.error('Notification service health check failed:', error);
      throw error;
    }
  },

  // Utility functions
  maskPII,
  validateEmail,
  validatePhone,
  validateNotificationRequest,
};

// Export default instance
export default notificationService; 