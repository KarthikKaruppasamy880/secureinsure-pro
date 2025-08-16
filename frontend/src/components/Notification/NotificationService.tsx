import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  User,
  Phone,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notificationService } from '../../services/notificationService';

interface NotificationServiceProps {
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  templateType?: 'email' | 'sms' | 'both';
}

const NotificationService: React.FC<NotificationServiceProps> = ({
  recipientId,
  recipientEmail,
  recipientPhone,
  templateType = 'email'
}) => {
  const [activeTab, setActiveTab] = useState(templateType);
  const [isSending, setIsSending] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  const [retryDelay] = useState(5000); // 5 seconds
  const [isConnected, setIsConnected] = useState(false);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const maxConnectionRetries = 5;
  const [notificationData, setNotificationData] = useState({
    recipientEmail: recipientEmail || '',
    recipientPhone: recipientPhone || '',
    subject: '',
    message: '',
    template: 'custom',
    priority: 'normal' as 'low' | 'normal' | 'high'
  });

  const emailTemplates = [
    { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to SecureInsure Pro', message: 'Thank you for joining SecureInsure Pro. We\'re excited to have you on board!' },
    { id: 'policy_update', name: 'Policy Update', subject: 'Your Policy Has Been Updated', message: 'Your insurance policy has been successfully updated. Please review the changes.' },
    { id: 'claim_status', name: 'Claim Status', subject: 'Claim Status Update', message: 'Your claim status has been updated. Please check your dashboard for details.' },
    { id: 'payment_reminder', name: 'Payment Reminder', subject: 'Payment Due Reminder', message: 'Your premium payment is due soon. Please ensure timely payment to avoid any interruptions.' },
    { id: 'custom', name: 'Custom Message', subject: '', message: '' }
  ];

  const smsTemplates = [
    { id: 'welcome_sms', name: 'Welcome SMS', message: 'Welcome to SecureInsure Pro! Your account is now active.' },
    { id: 'otp', name: 'OTP Verification', message: 'Your verification code is: {OTP}. Valid for 10 minutes.' },
    { id: 'claim_update', name: 'Claim Update', message: 'Your claim #{CLAIM_ID} status has been updated. Check your dashboard.' },
    { id: 'payment_reminder_sms', name: 'Payment Reminder', message: 'Premium payment due: ${AMOUNT}. Due date: {DUE_DATE}.' },
    { id: 'custom_sms', name: 'Custom SMS', message: '' }
  ];

  const handleTemplateChange = (templateId: string, type: 'email' | 'sms') => {
    const templates = type === 'email' ? emailTemplates : smsTemplates;
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      setNotificationData(prev => ({
        ...prev,
        template: templateId,
        subject: type === 'email' ? (template as any).subject || prev.subject : prev.subject,
        message: template.message || prev.message
      }));
    }
  };

  const handleSendEmail = async () => {
    if (!notificationData.recipientEmail || !notificationData.subject || !notificationData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    setRetryCount(0);
    
    await sendEmailWithRetry({
      to: notificationData.recipientEmail,
      subject: notificationData.subject,
      message: notificationData.message,
      template: notificationData.template,
      priority: notificationData.priority
    });
  };

  const sendEmailWithRetry = async (emailData: any, attempt: number = 1): Promise<void> => {
    try {
      const response = await notificationService.sendEmail(emailData);
      toast.success('Email sent successfully');
      console.log('Email sent:', response);
      setRetryCount(0);
      setIsConnected(true);
    } catch (error) {
      console.error(`Email attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        setRetryCount(attempt);
        toast.error(`Email failed, retrying in ${retryDelay / 1000} seconds... (${attempt}/${maxRetries})`);
        
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return sendEmailWithRetry(emailData, attempt + 1);
      } else {
        toast.error('Email failed after all retry attempts');
        setRetryCount(0);
        setIsConnected(false);
      }
    } finally {
      if (attempt >= maxRetries) {
        setIsSending(false);
      }
    }
  };

  const handleSendSMS = async () => {
    if (!notificationData.recipientPhone || !notificationData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    setRetryCount(0);
    
    await sendSMSWithRetry({
      to: notificationData.recipientPhone,
      message: notificationData.message,
      template: notificationData.template,
      priority: notificationData.priority
    });
  };

  const sendSMSWithRetry = async (smsData: any, attempt: number = 1): Promise<void> => {
    try {
      const response = await notificationService.sendSms(smsData);
      toast.success('SMS sent successfully');
      console.log('SMS sent:', response);
      setRetryCount(0);
      setIsConnected(true);
    } catch (error) {
      console.error(`SMS attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        setRetryCount(attempt);
        toast.error(`SMS failed, retrying in ${retryDelay / 1000} seconds... (${attempt}/${maxRetries})`);
        
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return sendSMSWithRetry(smsData, attempt + 1);
      } else {
        toast.error('SMS failed after all retry attempts');
        setRetryCount(0);
        setIsConnected(false);
      }
    } finally {
      if (attempt >= maxRetries) {
        setIsSending(false);
      }
    }
  };

  const handleSendBoth = async () => {
    if (!notificationData.recipientEmail || !notificationData.recipientPhone || 
        !notificationData.subject || !notificationData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    try {
      const [emailResponse, smsResponse] = await Promise.all([
        notificationService.sendEmail({
          recipient: notificationData.recipientEmail,
          subject: notificationData.subject,
          message: notificationData.message,
          template: notificationData.template,
          priority: notificationData.priority
        }),
        notificationService.sendSms({
          recipient: notificationData.recipientPhone,
          message: notificationData.message,
          template: notificationData.template
        })
      ]);

      toast.success('Email and SMS sent successfully');
      console.log('Notifications sent:', { email: emailResponse, sms: smsResponse });
    } catch (error) {
      toast.error('Failed to send notifications');
      console.error('Notification error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notification Service
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Retry Status */}
              {retryCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Retry {retryCount}/{maxRetries}
                </Badge>
              )}
              
              {/* Connection Retries */}
              {connectionRetries > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Connection Retry {connectionRetries}/{maxConnectionRetries}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'email' | 'sms' | 'both')} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="both" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Both
              </TabsTrigger>
            </TabsList>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Recipient Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={notificationData.recipientEmail}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="recipient@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={notificationData.priority}
                    onValueChange={(value) => setNotificationData(prev => ({ ...prev, priority: value as 'low' | 'normal' | 'high' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-template">Template</Label>
                <Select
                  value={notificationData.template}
                  onValueChange={(value) => handleTemplateChange(value, 'email')}
                >
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

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={notificationData.subject}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-message">Message</Label>
                <Textarea
                  id="email-message"
                  value={notificationData.message}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Email message content"
                  rows={6}
                />
              </div>

              <Button onClick={handleSendEmail} disabled={isSending} className="w-full">
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </TabsContent>

            {/* SMS Tab */}
            <TabsContent value="sms" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Recipient Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={notificationData.recipientPhone}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, recipientPhone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sms-priority">Priority</Label>
                  <Select
                    value={notificationData.priority}
                    onValueChange={(value) => setNotificationData(prev => ({ ...prev, priority: value as 'low' | 'normal' | 'high' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sms-template">Template</Label>
                <Select
                  value={notificationData.template}
                  onValueChange={(value) => handleTemplateChange(value, 'sms')}
                >
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

              <div className="space-y-2">
                <Label htmlFor="sms-message">Message</Label>
                <Textarea
                  id="sms-message"
                  value={notificationData.message}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="SMS message content"
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Character count: {notificationData.message.length}/160
                </p>
              </div>

              <Button onClick={handleSendSMS} disabled={isSending} className="w-full">
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Send SMS
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Both Tab */}
            <TabsContent value="both" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="both-email">Recipient Email</Label>
                  <Input
                    id="both-email"
                    type="email"
                    value={notificationData.recipientEmail}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="recipient@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="both-phone">Recipient Phone</Label>
                  <Input
                    id="both-phone"
                    type="tel"
                    value={notificationData.recipientPhone}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, recipientPhone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="both-priority">Priority</Label>
                  <Select
                    value={notificationData.priority}
                    onValueChange={(value) => setNotificationData(prev => ({ ...prev, priority: value as 'low' | 'normal' | 'high' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="both-template">Template</Label>
                  <Select
                    value={notificationData.template}
                    onValueChange={(value) => handleTemplateChange(value, 'email')}
                  >
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
                <Label htmlFor="both-subject">Subject (Email)</Label>
                <Input
                  id="both-subject"
                  value={notificationData.subject}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="both-message">Message</Label>
                <Textarea
                  id="both-message"
                  value={notificationData.message}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Message content (will be sent via both email and SMS)"
                  rows={6}
                />
              </div>

              <Button onClick={handleSendBoth} disabled={isSending} className="w-full">
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email & SMS
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationService; 