import api from './api';

export interface NotificationRequest {
  recipient: string;
  message: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'policy' | 'claim' | 'payment' | 'security' | 'system' | 'reminder';
  metadata?: {
    userId?: string;
    caseId?: string;
    policyNumber?: string;
    claimNumber?: string;
    actionUrl?: string;
    alertType?: string;
  };
}

export interface NotificationResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    deliveredAt?: string;
  };
  error?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  acknowledged: number;
  pending: number;
  resolved: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface WebSocketNotification {
  id: string;
  type: 'notification' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

class NotificationService {
  private websocket: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeWebSocket();
  }

  // WebSocket Management
  private initializeWebSocket() {
    try {
      const wsUrl = `${import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8081'}/notifications`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('Notification WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', null);
      };

      this.websocket.onmessage = (event) => {
        try {
          const notification: WebSocketNotification = JSON.parse(event.data);
          this.emit('notification', notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Notification WebSocket disconnected');
        this.emit('disconnected', null);
        this.handleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, delay);
    }
  }

  // Event Management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // API Methods
  async getNotifications(page = 0, size = 20): Promise<any> {
    try {
      const response = await api.get('/notifications', {
        params: {
          page,
          size,
          sort: 'createdAt,desc'
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getNotificationById(id: string): Promise<any> {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  }

  async createNotification(request: NotificationRequest): Promise<NotificationResponse> {
    try {
      const response = await api.post('/notifications', request);
      return {
        success: true,
        data: {
          id: response.data?.id || 'unknown',
          status: 'sent',
          deliveredAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        error: error.message || 'Failed to create notification'
      };
    }
  }

  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      return { success: true };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.message || 'Failed to mark as read'
      };
    }
  }

  async markAsAcknowledged(notificationId: string): Promise<NotificationResponse> {
    try {
      await api.put(`/notifications/${notificationId}/acknowledge`);
      return { success: true };
    } catch (error: any) {
      console.error('Error acknowledging notification:', error);
      return {
        success: false,
        error: error.message || 'Failed to acknowledge'
      };
    }
  }

  async markAllAsRead(userId?: string): Promise<NotificationResponse> {
    try {
      const endpoint = userId ? `/notifications/users/${userId}/read-all` : '/notifications/read-all';
      await api.put(endpoint);
      return { success: true };
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      return {
        success: false,
        error: error.message || 'Failed to mark all as read'
      };
    }
  }

  async deleteNotification(notificationId: string): Promise<NotificationResponse> {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete notification'
      };
    }
  }

  async getUnreadNotifications(userId?: string): Promise<any> {
    try {
      const endpoint = userId ? `/notifications/users/${userId}/unread` : '/notifications/unread';
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  async getNotificationStats(userId?: string): Promise<NotificationStats> {
    try {
      const endpoint = userId ? `/notifications/users/${userId}/stats` : '/notifications/stats';
      const response = await api.get(endpoint);
      return {
        total: response.data?.total || 0,
        unread: response.data?.unread || 0,
        urgent: response.data?.urgent || 0,
        acknowledged: response.data?.acknowledged || 0,
        pending: response.data?.pending || 0,
        resolved: response.data?.resolved || 0,
        byType: response.data?.byType || {},
        byCategory: response.data?.byCategory || {}
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return {
        total: 0,
        unread: 0,
        urgent: 0,
        acknowledged: 0,
        pending: 0,
        resolved: 0,
        byType: {},
        byCategory: {}
      };
    }
  }

  async updatePreferences(preferences: any): Promise<NotificationResponse> {
    try {
      await api.put('/notifications/preferences', preferences);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      return {
        success: false,
        error: error.message || 'Failed to update preferences'
      };
    }
  }

  async getPreferences(): Promise<any> {
    try {
      const response = await api.get('/notifications/preferences');
      return response;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  }

  async searchNotifications(filters: any, page = 0, size = 20): Promise<any> {
    try {
      const response = await api.get('/notifications/search', {
        params: {
          ...filters,
          page,
          size
        }
      });
      return response;
    } catch (error) {
      console.error('Error searching notifications:', error);
      throw error;
    }
  }

  // Predefined notification types
  async sendWelcomeNotification(userId: string, email: string, firstName: string): Promise<NotificationResponse> {
    return this.createNotification({
      recipient: email,
      message: `Welcome ${firstName}! Your account has been successfully created.`,
      type: 'email',
      priority: 'medium',
      category: 'system',
      metadata: { userId }
    });
  }

  async sendPolicyRenewalReminder(userId: string, email: string, policyNumber: string, renewalDate: string): Promise<NotificationResponse> {
    return this.createNotification({
      recipient: email,
      message: `Your policy ${policyNumber} is due for renewal on ${renewalDate}.`,
      type: 'email',
      priority: 'medium',
      category: 'policy',
      metadata: { userId, policyNumber }
    });
  }

  async sendClaimStatusUpdate(userId: string, email: string, claimNumber: string, status: string): Promise<NotificationResponse> {
    return this.createNotification({
      recipient: email,
      message: `Your claim ${claimNumber} status has been updated to: ${status}.`,
      type: 'email',
      priority: 'high',
      category: 'claim',
      metadata: { userId, claimNumber }
    });
  }

  async sendPaymentReminder(userId: string, email: string, policyNumber: string, amount: string, dueDate: string): Promise<NotificationResponse> {
    return this.createNotification({
      recipient: email,
      message: `Payment of ${amount} for policy ${policyNumber} is due on ${dueDate}.`,
      type: 'email',
      priority: 'urgent',
      category: 'payment',
      metadata: { userId, policyNumber, alertType: 'payment_due' }
    });
  }

  async sendSecurityAlert(userId: string, email: string, alertType: string, description: string): Promise<NotificationResponse> {
    return this.createNotification({
      recipient: email,
      message: `Security Alert: ${alertType} - ${description}`,
      type: 'email',
      priority: 'urgent',
      category: 'security',
      metadata: { userId, alertType }
    });
  }

  // Browser Push Notifications
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async showBrowserNotification(title: string, options?: NotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/logo192.png',
        ...options
      });
    }
  }

  // Cleanup
  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.listeners.clear();
  }
}

export const notificationService = new NotificationService();