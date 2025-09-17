import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import {
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Phone,
  Check,
  X,
  Archive,
  Trash2,
  Filter,
  Search,
  Settings,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Star,
  Eye,
  EyeOff,
  MoreVertical,
  Zap,
  Users,
  Shield,
  Calendar,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../../components/ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'system';
  category: 'policy' | 'claim' | 'payment' | 'security' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isAcknowledged: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'email' | 'sms' | 'push' | 'in-app';
  metadata?: {
    caseId?: string;
    policyNumber?: string;
    claimNumber?: string;
    userId?: string;
    actionUrl?: string;
  };
}

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  categories: {
    policy: boolean;
    claim: boolean;
    payment: boolean;
    security: boolean;
    system: boolean;
    reminder: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'type'>('timestamp');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    inAppNotifications: true,
    categories: {
      policy: true,
      claim: true,
      payment: true,
      security: true,
      system: false,
      reminder: true
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    },
    digestFrequency: 'immediate'
  });

  const { state } = useAuth();

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchTerm, activeTab, filterType, filterPriority, sortBy]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Mock data - in production, this would be an API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'info',
          category: 'policy',
          title: 'Policy Renewal Reminder',
          message: 'Your policy #POL-2024-001 is due for renewal in 30 days.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          isRead: false,
          isAcknowledged: false,
          priority: 'medium',
          channel: 'email',
          metadata: { policyNumber: 'POL-2024-001' }
        },
        {
          id: '2',
          type: 'success',
          category: 'claim',
          title: 'Claim Approved',
          message: 'Your claim #CLM-2024-015 has been approved for $5,000.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          isRead: true,
          isAcknowledged: false,
          priority: 'high',
          channel: 'push',
          metadata: { claimNumber: 'CLM-2024-015' }
        },
        {
          id: '3',
          type: 'warning',
          category: 'payment',
          title: 'Payment Overdue',
          message: 'Payment for policy #POL-2024-003 is 7 days overdue.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          isRead: false,
          isAcknowledged: false,
          priority: 'urgent',
          channel: 'sms',
          metadata: { policyNumber: 'POL-2024-003' }
        },
        {
          id: '4',
          type: 'error',
          category: 'security',
          title: 'Login from New Device',
          message: 'We detected a login from a new device. If this wasn\'t you, please secure your account.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          isRead: true,
          isAcknowledged: true,
          priority: 'high',
          channel: 'email',
          metadata: { userId: state.user?.id }
        },
        {
          id: '5',
          type: 'system',
          category: 'system',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur on Sunday, 2:00 AM - 4:00 AM EST.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
          isRead: false,
          isAcknowledged: false,
          priority: 'low',
          channel: 'in-app'
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

  const applyFilters = () => {
    let filtered = [...notifications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tab filter
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead);
        break;
      case 'acknowledged':
        filtered = filtered.filter(n => n.isAcknowledged);
        break;
      case 'urgent':
        filtered = filtered.filter(n => n.priority === 'urgent');
        break;
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'type':
          return a.type.localeCompare(b.type);
        case 'timestamp':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAsAcknowledged = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isAcknowledged: true } : n
        )
      );
      toast.success('Acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'system':
        return <Settings className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'push':
        return <Bell className="w-4 h-4" />;
      case 'in-app':
        return <Zap className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isAcknowledged).length;

  const renderNotificationItem = (notification: Notification) => (
    <Card
      key={notification.id}
      className={`hover:shadow-md transition-shadow ${
        !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`text-sm font-medium ${
                  !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {notification.title}
                </h3>
                
                <Badge className={getPriorityColor(notification.priority)}>
                  {notification.priority}
                </Badge>
                
                <div className="flex items-center space-x-1 text-gray-500">
                  {getChannelIcon(notification.channel)}
                  <span className="text-xs">{notification.channel}</span>
                </div>
              </div>
              
              <p className={`text-sm ${
                !notification.isRead ? 'text-gray-800' : 'text-gray-600'
              } mb-2`}>
                {notification.message}
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(notification.timestamp)}</span>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {notification.category}
                </Badge>
                
                {notification.isAcknowledged && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Check className="w-3 h-3" />
                    <span>Acknowledged</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!notification.isRead && (
                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Mark as Read
                </DropdownMenuItem>
              )}
              
              {!notification.isAcknowledged && (
                <DropdownMenuItem onClick={() => markAsAcknowledged(notification.id)}>
                  <Check className="w-4 h-4 mr-2" />
                  Acknowledge
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => deleteNotification(notification.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Notification Channels</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-xs text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">SMS Notifications</Label>
              <p className="text-xs text-gray-500">Receive urgent notifications via SMS</p>
            </div>
            <Switch
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, smsNotifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-xs text-gray-500">Receive browser push notifications</p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, pushNotifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">In-App Notifications</Label>
              <p className="text-xs text-gray-500">Show notifications within the application</p>
            </div>
            <Switch
              checked={preferences.inAppNotifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, inAppNotifications: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(preferences.categories).map(([category, enabled]) => (
            <div key={category} className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium capitalize">{category}</Label>
                <p className="text-xs text-gray-500">
                  {category === 'policy' && 'Policy renewals, updates, and changes'}
                  {category === 'claim' && 'Claim status updates and approvals'}
                  {category === 'payment' && 'Payment reminders and confirmations'}
                  {category === 'security' && 'Security alerts and login notifications'}
                  {category === 'system' && 'System maintenance and updates'}
                  {category === 'reminder' && 'General reminders and follow-ups'}
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({
                    ...prev,
                    categories: { ...prev.categories, [category]: checked }
                  }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success('Preferences saved!')}>
          <Send className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Manage your notifications and preferences</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="w-4 h-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
          
          <Button onClick={loadNotifications} disabled={isLoading}>
            <Bell className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <EyeOff className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{urgentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => n.isAcknowledged).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && <Badge className="ml-1">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
          <TabsTrigger value="urgent">
            Urgent {urgentCount > 0 && <Badge variant="destructive" className="ml-1">{urgentCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          {renderPreferences()}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="system">System</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="timestamp">Date</option>
              <option value="priority">Priority</option>
              <option value="type">Type</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(renderNotificationItem)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                      ? 'Try adjusting your filters or search terms.'
                      : 'You\'re all caught up! No new notifications at this time.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(renderNotificationItem)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-500">You have no unread notifications.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="acknowledged" className="space-y-4">
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(renderNotificationItem)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No acknowledged notifications</h3>
                  <p className="text-gray-500">Notifications you acknowledge will appear here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(renderNotificationItem)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No urgent notifications</h3>
                  <p className="text-gray-500">All urgent matters have been addressed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;










