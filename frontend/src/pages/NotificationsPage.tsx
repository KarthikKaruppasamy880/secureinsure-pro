import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Mail,
  MessageSquare,
  Send,
  History,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Calendar,
  FileText,
  Settings,
  RefreshCw,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
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

interface NotificationTemplate {
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

interface ComposeForm {
  type: 'email' | 'sms';
  recipient: string;
  subject: string;
  message: string;
  template?: string;
  priority: 'low' | 'normal' | 'high';
  scheduledFor?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [composeForm, setComposeForm] = useState<ComposeForm>({
    type: 'email',
    recipient: '',
    subject: '',
    message: '',
    template: '',
    priority: 'normal'
  });
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadTemplates();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'email',
          recipient: 'john.doe@example.com',
          subject: 'Welcome to SecureInsure Pro',
          message: 'Thank you for choosing SecureInsure Pro. Your account has been successfully created.',
          template: 'welcome_email',
          status: 'delivered',
          createdAt: '2024-01-15T10:00:00Z',
          sentAt: '2024-01-15T10:01:00Z',
          deliveredAt: '2024-01-15T10:02:00Z',
          metadata: {
            provider: 'AWS SES',
            messageId: 'msg_123456',
            cost: 0.0001
          }
        },
        {
          id: '2',
          type: 'sms',
          recipient: '+1234567890',
          message: 'Your verification code is: 123456. Valid for 10 minutes.',
          template: 'verification_sms',
          status: 'sent',
          createdAt: '2024-01-15T09:30:00Z',
          sentAt: '2024-01-15T09:31:00Z',
          metadata: {
            provider: 'Twilio',
            messageId: 'SM123456',
            cost: 0.0075
          }
        },
        {
          id: '3',
          type: 'email',
          recipient: 'jane.smith@example.com',
          subject: 'Policy Update Notification',
          message: 'Your policy has been updated. Please review the changes in your account.',
          template: 'policy_update',
          status: 'pending',
          createdAt: '2024-01-15T11:00:00Z'
        },
        {
          id: '4',
          type: 'sms',
          recipient: '+1987654321',
          message: 'Your claim has been processed. Check your email for details.',
          template: 'claim_processed',
          status: 'failed',
          createdAt: '2024-01-15T08:00:00Z',
          error: 'Invalid phone number format',
          metadata: {
            provider: 'Twilio',
            retryCount: 3
          }
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockTemplates: NotificationTemplate[] = [
        {
          id: '1',
          name: 'Welcome Email',
          type: 'email',
          subject: 'Welcome to SecureInsure Pro, {{firstName}}!',
          content: 'Dear {{firstName}},\n\nWelcome to SecureInsure Pro! Your account has been successfully created.\n\nAccount Details:\n- Username: {{username}}\n- Email: {{email}}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nSecureInsure Pro Team',
          variables: ['firstName', 'username', 'email'],
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Verification SMS',
          type: 'sms',
          content: 'Your verification code is: {{code}}. Valid for {{expiry}} minutes.',
          variables: ['code', 'expiry'],
          isDefault: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Policy Update',
          type: 'email',
          subject: 'Policy Update - {{policyNumber}}',
          content: 'Dear {{firstName}},\n\nYour policy {{policyNumber}} has been updated.\n\nChanges:\n{{changes}}\n\nPlease review the updates in your account.\n\nBest regards,\nSecureInsure Pro Team',
          variables: ['firstName', 'policyNumber', 'changes'],
          isDefault: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          name: 'Claim Processed',
          type: 'sms',
          content: 'Your claim {{claimNumber}} has been processed. Check your email for details.',
          variables: ['claimNumber'],
          isDefault: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!composeForm.recipient.trim() || !composeForm.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (composeForm.type === 'email' && !composeForm.subject.trim()) {
      toast.error('Subject is required for email notifications');
      return;
    }

    setIsComposing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: composeForm.type,
        recipient: composeForm.recipient,
        subject: composeForm.subject,
        message: composeForm.message,
        template: composeForm.template,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      // Reset form
      setComposeForm({
        type: 'email',
        recipient: '',
        subject: '',
        message: '',
        template: '',
        priority: 'normal'
      });

      toast.success(`${composeForm.type.toUpperCase()} notification sent successfully!`);
      setActiveTab('history');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsComposing(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setComposeForm(prev => ({
        ...prev,
        type: template.type,
        subject: template.subject || '',
        message: template.content,
        template: template.id
      }));
    }
  };

  const handleTemplateEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleTemplateSave = async (updatedTemplate: NotificationTemplate) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTemplates(prev => prev.map(t => 
        t.id === updatedTemplate.id ? updatedTemplate : t
      ));
      
      toast.success('Template updated successfully!');
      setShowTemplateEditor(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleTemplateDelete = async (templateId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success('Template deleted successfully!');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      delivered: 'bg-green-100 text-green-800',
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const maskPII = (text: string, type: 'email' | 'phone') => {
    if (type === 'email') {
      const [username, domain] = text.split('@');
      return `${username.charAt(0)}***@${domain}`;
    } else {
      return text.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Manage email and SMS notifications for your organization</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose" className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Compose</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Compose Notification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleComposeSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notification Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Notification Type</Label>
                    <Select
                      value={composeForm.type}
                      onValueChange={(value: 'email' | 'sms') => 
                        setComposeForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>Email</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>SMS</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={composeForm.priority}
                      onValueChange={(value: 'low' | 'normal' | 'high') => 
                        setComposeForm(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Template Selection */}
                <div className="space-y-2">
                  <Label htmlFor="template">Template (Optional)</Label>
                  <Select
                    value={composeForm.template}
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates
                        .filter(t => t.type === composeForm.type)
                        .map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Recipient */}
                <div className="space-y-2">
                  <Label htmlFor="recipient">
                    {composeForm.type === 'email' ? 'Email Address' : 'Phone Number'}
                  </Label>
                  <Input
                    id="recipient"
                    type={composeForm.type === 'email' ? 'email' : 'tel'}
                    placeholder={
                      composeForm.type === 'email' 
                        ? 'Enter email address' 
                        : 'Enter phone number (+1234567890)'
                    }
                    value={composeForm.recipient}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, recipient: e.target.value }))}
                    required
                  />
                </div>

                {/* Subject (Email only) */}
                {composeForm.type === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Enter email subject"
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>
                )}

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder={
                      composeForm.type === 'email' 
                        ? 'Enter your message...' 
                        : 'Enter SMS message (160 characters max)'
                    }
                    value={composeForm.message}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    maxLength={composeForm.type === 'sms' ? 160 : undefined}
                    required
                  />
                  {composeForm.type === 'sms' && (
                    <div className="text-xs text-gray-500 text-right">
                      {composeForm.message.length}/160 characters
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isComposing}
                >
                  {isComposing ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Send {composeForm.type.toUpperCase()}</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Notification History</span>
                </CardTitle>
                <Button
                  onClick={loadNotifications}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No notifications found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {notification.type === 'email' ? (
                            <Mail className="w-5 h-5 text-blue-600" />
                          ) : (
                            <MessageSquare className="w-5 h-5 text-green-600" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {maskPII(notification.recipient, notification.type === 'sms' ? 'phone' : 'email')}
                              </span>
                              {getStatusIcon(notification.status)}
                              {getStatusBadge(notification.status)}
                            </div>
                            {notification.subject && (
                              <p className="text-sm text-gray-600">{notification.subject}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{formatDate(notification.createdAt)}</div>
                          {notification.sentAt && (
                            <div>Sent: {formatDate(notification.sentAt)}</div>
                          )}
                          {notification.deliveredAt && (
                            <div>Delivered: {formatDate(notification.deliveredAt)}</div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700">{notification.message}</p>

                      {notification.error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{notification.error}</AlertDescription>
                        </Alert>
                      )}

                      {notification.metadata && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {notification.metadata.provider && (
                            <span>Provider: {notification.metadata.provider}</span>
                          )}
                          {notification.metadata.messageId && (
                            <span>ID: {notification.metadata.messageId}</span>
                          )}
                          {notification.metadata.cost && (
                            <span>Cost: ${notification.metadata.cost.toFixed(4)}</span>
                          )}
                          {notification.metadata.retryCount && (
                            <span>Retries: {notification.metadata.retryCount}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Notification Templates</span>
                </CardTitle>
                <Button
                  onClick={() => setShowTemplateEditor(true)}
                  variant="outline"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {template.type === 'email' ? (
                          <Mail className="w-4 h-4 text-blue-600" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-green-600" />
                        )}
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {template.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        <Button
                          onClick={() => handleTemplateEdit(template)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleTemplateDelete(template.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {template.subject && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Subject:</p>
                        <p className="text-sm text-gray-600">{template.subject}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-700">Content:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                    </div>

                    {template.variables.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Variables:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Updated: {formatDate(template.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedTemplate ? 'Edit Template' : 'New Template'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateEditor
                template={selectedTemplate}
                onSave={handleTemplateSave}
                onCancel={() => {
                  setShowTemplateEditor(false);
                  setSelectedTemplate(null);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Template Editor Component
interface TemplateEditorProps {
  template: NotificationTemplate | null;
  onSave: (template: NotificationTemplate) => Promise<void>;
  onCancel: () => void;
}

function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [form, setForm] = useState({
    name: template?.name || '',
    type: template?.type || 'email' as 'email' | 'sms',
    subject: template?.subject || '',
    content: template?.content || '',
    variables: template?.variables || [],
    isDefault: template?.isDefault || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (form.type === 'email' && !form.subject.trim()) {
      toast.error('Subject is required for email templates');
      return;
    }

    const updatedTemplate: NotificationTemplate = {
      id: template?.id || Date.now().toString(),
      name: form.name,
      type: form.type,
      subject: form.subject,
      content: form.content,
      variables: form.variables,
      isDefault: form.isDefault,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSave(updatedTemplate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter template name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-type">Type</Label>
          <Select
            value={form.type}
            onValueChange={(value: 'email' | 'sms') => 
              setForm(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {form.type === 'email' && (
        <div className="space-y-2">
          <Label htmlFor="template-subject">Subject</Label>
          <Input
            id="template-subject"
            value={form.subject}
            onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter email subject"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="template-content">Content</Label>
        <Textarea
          id="template-content"
          value={form.content}
          onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Enter template content"
          rows={8}
          required
        />
        <p className="text-xs text-gray-500">
          Use {'{'}variableName{'}'} syntax for dynamic content
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="template-default"
          checked={form.isDefault}
          onChange={(e) => setForm(prev => ({ ...prev, isDefault: e.target.checked }))}
          className="rounded"
        />
        <Label htmlFor="template-default">Set as default template</Label>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}
