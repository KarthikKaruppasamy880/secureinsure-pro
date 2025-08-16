import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Phone,
  Globe,
  Bell,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notificationService, NotificationResponse } from '../../services/notificationService';

// Local interfaces for this component
interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  applicationId?: string;
  priority?: 'low' | 'normal' | 'high';
  template?: string;
}

interface SMSRequest {
  to: string;
  message: string;
  applicationId?: string;
  template?: string;
}

// Using NotificationResponse from notificationService

interface NotificationSystemProps {
  applicationId?: string;
  customerData?: {
    email?: string;
    phone?: string;
    name?: string;
  };
  onNotificationSent?: (type: 'email' | 'sms', success: boolean) => void;
}

interface NotificationHistory {
  id: string;
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: Date;
  response?: NotificationResponse;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  applicationId,
  customerData,
  onNotificationSent
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  
  // Email form state
  const [emailForm, setEmailForm] = useState({
    to: customerData?.email || '',
    subject: '',
    message: '',
    template: 'custom',
    priority: 'normal' as 'low' | 'normal' | 'high'
  });

  // SMS form state
  const [smsForm, setSmsForm] = useState({
    to: customerData?.phone || '',
    message: '',
    template: 'custom'
  });

  const emailTemplates = [
    { id: 'custom', name: 'Custom Message', subject: '', body: '' },
    { id: 'welcome', name: 'Welcome Message', subject: 'Welcome to SecureInsure Pro', body: 'Thank you for choosing SecureInsure Pro. Your application is being processed.' },
    { id: 'approval', name: 'Application Approved', subject: 'Application Approved - Policy Issued', body: 'Congratulations! Your insurance application has been approved and your policy is now active.' },
    { id: 'review', name: 'Review Required', subject: 'Application Review Required', body: 'Your application requires additional review. Our underwriting team will contact you within 2 business days.' },
    { id: 'documents', name: 'Documents Needed', subject: 'Additional Documents Required', body: 'To process your application, we need additional documentation. Please upload the required documents in your portal.' },
    { id: 'payment', name: 'Payment Reminder', subject: 'Payment Due Reminder', body: 'Your premium payment is due soon. Please ensure timely payment to maintain your coverage.' }
  ];

  const smsTemplates = [
    { id: 'custom', name: 'Custom Message', body: '' },
    { id: 'welcome', name: 'Welcome SMS', body: 'Welcome to SecureInsure Pro! Your application is being processed. Reference: {{applicationId}}' },
    { id: 'approval', name: 'Approval SMS', body: 'Great news! Your insurance application has been approved. Policy details will be emailed shortly.' },
    { id: 'review', name: 'Review SMS', body: 'Your application requires review. Our team will contact you within 2 business days. Ref: {{applicationId}}' },
    { id: 'documents', name: 'Documents SMS', body: 'Additional documents needed for your application. Please check your email or portal for details.' },
    { id: 'payment', name: 'Payment SMS', body: 'Payment reminder: Your premium is due soon. Pay online or call us at 1-800-SECURE.' }
  ];

  const handleTemplateChange = (templateId: string, type: 'email' | 'sms') => {
    if (type === 'email') {
      const template = emailTemplates.find(t => t.id === templateId);
      if (template) {
        setEmailForm(prev => ({
          ...prev,
          template: templateId,
          subject: template.subject,
          message: template.body
        }));
      }
    } else {
      const template = smsTemplates.find(t => t.id === templateId);
      if (template) {
        setSmsForm(prev => ({
          ...prev,
          template: templateId,
          message: template.body
        }));
      }
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const emailRequest: EmailRequest = {
        to: emailForm.to,
        subject: emailForm.subject.replace('{{applicationId}}', applicationId || 'N/A'),
        body: emailForm.message.replace('{{applicationId}}', applicationId || 'N/A'),
        applicationId,
        priority: emailForm.priority,
        template: emailForm.template !== 'custom' ? emailForm.template : undefined
      };

      const response = await notificationService.sendEmail({
        recipient: emailRequest.to,
        subject: emailRequest.subject,
        message: emailRequest.body,
        template: emailRequest.template,
        priority: emailRequest.priority
      });
      
      // Add to history
      const historyItem: NotificationHistory = {
        id: response.data?.id || Date.now().toString(),
        type: 'email',
        recipient: emailForm.to,
        subject: emailForm.subject,
        message: emailForm.message,
        status: response.success ? 'sent' : 'failed',
        timestamp: new Date(),
        response
      };
      
      setHistory(prev => [historyItem, ...prev]);
      
      if (response.success) {
        toast.success('Email sent successfully!');
        if (onNotificationSent) onNotificationSent('email', true);
      } else {
        toast.error(`Failed to send email: ${response.error}`);
        if (onNotificationSent) onNotificationSent('email', false);
      }
      
    } catch (error) {
      console.error('Email sending error:', error);
      toast.error('Failed to send email');
      if (onNotificationSent) onNotificationSent('email', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!smsForm.to || !smsForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const smsRequest: SMSRequest = {
        to: smsForm.to,
        message: smsForm.message.replace('{{applicationId}}', applicationId || 'N/A'),
        applicationId,
        template: smsForm.template !== 'custom' ? smsForm.template : undefined
      };

      const response = await notificationService.sendSms({
        recipient: smsRequest.to,
        message: smsRequest.message,
        template: smsRequest.template
      });
      
      // Add to history
      const historyItem: NotificationHistory = {
        id: response.data?.id || Date.now().toString(),
        type: 'sms',
        recipient: smsForm.to,
        message: smsForm.message,
        status: response.success ? 'sent' : 'failed',
        timestamp: new Date(),
        response
      };
      
      setHistory(prev => [historyItem, ...prev]);
      
      if (response.success) {
        toast.success('SMS sent successfully!');
        if (onNotificationSent) onNotificationSent('sms', true);
      } else {
        toast.error(`Failed to send SMS: ${response.error}`);
        if (onNotificationSent) onNotificationSent('sms', false);
      }
      
    } catch (error) {
      console.error('SMS sending error:', error);
      toast.error('Failed to send SMS');
      if (onNotificationSent) onNotificationSent('sms', false);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Center</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'sms'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>SMS</span>
            </button>
          </div>

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-to">Recipient Email *</Label>
                  <Input
                    id="email-to"
                    type="email"
                    value={emailForm.to}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="recipient@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-template">Template</Label>
                  <Select value={emailForm.template} onValueChange={(value) => handleTemplateChange(value, 'email')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject *</Label>
                <Input
                  id="email-subject"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-message">Message *</Label>
                <Textarea
                  id="email-message"
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Email message content..."
                  rows={6}
                />
              </div>

              <div className="flex justify-between items-center">
                <Select value={emailForm.priority} onValueChange={(value: any) => setEmailForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={handleSendEmail} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* SMS Tab */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-to">Recipient Phone *</Label>
                  <Input
                    id="sms-to"
                    type="tel"
                    value={smsForm.to}
                    onChange={(e) => setSmsForm(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms-template">Template</Label>
                  <Select value={smsForm.template} onValueChange={(value) => handleTemplateChange(value, 'sms')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {smsTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sms-message">Message * ({smsForm.message.length}/160 characters)</Label>
                <Textarea
                  id="sms-message"
                  value={smsForm.message}
                  onChange={(e) => setSmsForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="SMS message content..."
                  rows={4}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500">
                  SMS messages are limited to 160 characters. Longer messages may be split into multiple parts.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSendSMS} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send SMS
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Notification History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {item.type === 'email' ? (
                      <Mail className="h-5 w-5 text-blue-500" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {item.type === 'email' ? 'Email' : 'SMS'} to {item.recipient}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {item.subject && (
                      <p className="text-sm text-gray-600 mt-1">
                        Subject: {item.subject}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {item.message}
                    </p>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {item.timestamp.toLocaleString()}
                    </p>
                    
                    {item.response?.error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {item.response.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationSystem;
