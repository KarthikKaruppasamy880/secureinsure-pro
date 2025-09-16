import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import {
  User,
  Shield,
  Fingerprint,
  Bell,
  Settings,
  Camera,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Lock,
  Key,
  Eye,
  Mic
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import BiometricSettings from '../../components/settings/BiometricSettings';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@secureinsure.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, ST 12345',
    occupation: 'Software Engineer',
    company: 'Tech Corp'
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    passwordChangeRequired: false
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    darkMode: false,
    language: 'en'
  });

  const { state } = useAuth();

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecuritySettingChange = (setting: string, value: boolean | number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePreferenceChange = (preference: string, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement API call to save profile data
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setIsEditing(false);
    toast.info('Changes discarded');
  };

  const renderPersonalInfo = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Information</span>
          </CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={personalInfo.firstName}
              onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={personalInfo.lastName}
              onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={personalInfo.address}
              onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={personalInfo.occupation}
              onChange={(e) => handlePersonalInfoChange('occupation', e.target.value)}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={personalInfo.company}
              onChange={(e) => handlePersonalInfoChange('company', e.target.value)}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Security Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Two-Factor Authentication</Label>
            <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <Switch
            checked={securitySettings.twoFactorAuth}
            onCheckedChange={(checked) => handleSecuritySettingChange('twoFactorAuth', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Login Notifications</Label>
            <p className="text-xs text-gray-500">Get notified when someone logs into your account</p>
          </div>
          <Switch
            checked={securitySettings.loginNotifications}
            onCheckedChange={(checked) => handleSecuritySettingChange('loginNotifications', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Suspicious Activity Alerts</Label>
            <p className="text-xs text-gray-500">Receive alerts for unusual account activity</p>
          </div>
          <Switch
            checked={securitySettings.suspiciousActivityAlerts}
            onCheckedChange={(checked) => handleSecuritySettingChange('suspiciousActivityAlerts', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Password Change Required</Label>
            <p className="text-xs text-gray-500">Force password change on next login</p>
          </div>
          <Switch
            checked={securitySettings.passwordChangeRequired}
            onCheckedChange={(checked) => handleSecuritySettingChange('passwordChangeRequired', checked)}
          />
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <Button variant="outline" className="w-full">
            <Key className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPreferences = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Email Notifications</Label>
            <p className="text-xs text-gray-500">Receive important updates via email</p>
          </div>
          <Switch
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">SMS Notifications</Label>
            <p className="text-xs text-gray-500">Receive urgent alerts via text message</p>
          </div>
          <Switch
            checked={preferences.smsNotifications}
            onCheckedChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Push Notifications</Label>
            <p className="text-xs text-gray-500">Get real-time updates in your browser</p>
          </div>
          <Switch
            checked={preferences.pushNotifications}
            onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Marketing Emails</Label>
            <p className="text-xs text-gray-500">Receive promotional content and offers</p>
          </div>
          <Switch
            checked={preferences.marketingEmails}
            onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Dark Mode</Label>
            <p className="text-xs text-gray-500">Use dark theme for better visibility</p>
          </div>
          <Switch
            checked={preferences.darkMode}
            onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderAccountStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>Account Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Account Status</p>
              <p className="text-lg font-semibold text-green-600">Active</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Role</p>
              <p className="text-lg font-semibold text-blue-600">{state.user?.role || 'User'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Fingerprint className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Biometric Status</p>
              <p className="text-lg font-semibold text-purple-600">
                {state.user?.biometricEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Login</p>
              <p className="text-lg font-semibold text-orange-600">
                {state.user?.lastLogin ? new Date(state.user.lastLogin).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {personalInfo.occupation} at {personalInfo.company}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Account Active
              </Badge>
              <Badge variant="secondary">
                {state.user?.role || 'User'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Personal</span>
          </TabsTrigger>
          <TabsTrigger value="biometric" className="flex items-center space-x-2">
            <Fingerprint className="w-4 h-4" />
            <span>Biometric</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Status</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          {renderPersonalInfo()}
        </TabsContent>

        <TabsContent value="biometric" className="space-y-4">
          <BiometricSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {renderSecuritySettings()}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {renderPreferences()}
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          {renderAccountStatus()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage; 