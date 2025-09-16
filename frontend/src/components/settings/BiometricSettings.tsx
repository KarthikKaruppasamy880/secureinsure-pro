import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  Shield,
  Fingerprint,
  Eye,
  Mic,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Lock,
  Unlock,
  User,
  Camera,
  Smartphone,
  Zap,
  Trash2,
  Plus,
  Edit,
  Key,
  Bell,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { biometricService, BiometricStatus } from '../../services/biometricService';
import { useAuth } from '../../contexts/AuthContext';

export default function BiometricSettings() {
  const [biometricStatus, setBiometricStatus] = useState<Record<string, BiometricStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [enrollingMethod, setEnrollingMethod] = useState<string | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [preferences, setPreferences] = useState({
    autoLogin: false,
    requireConfirmation: true,
    lockOnExit: true,
    backupMethods: true,
    notifications: true
  });
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const { state } = useAuth();

  useEffect(() => {
    loadBiometricStatus();
    loadPreferences();
  }, []);

  const loadBiometricStatus = async () => {
    try {
      const status = await biometricService.checkAvailability();
      setBiometricStatus(status);
    } catch (error) {
      console.error('Error loading biometric status:', error);
      toast.error('Failed to load biometric status');
    }
  };

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem('biometric_preferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
      
      const level = localStorage.getItem('biometric_security_level');
      if (level) {
        setSecurityLevel(level as 'low' | 'medium' | 'high');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = () => {
    try {
      localStorage.setItem('biometric_preferences', JSON.stringify(preferences));
      localStorage.setItem('biometric_security_level', securityLevel);
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const handleEnrollMethod = async (method: string) => {
    setEnrollingMethod(method);
    setShowEnrollment(true);
    
    try {
      // Simulate enrollment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update local status
      setBiometricStatus(prev => ({
        ...prev,
        [method]: {
          ...prev[method],
          isEnrolled: true,
          isAvailable: true
        }
      }));
      
      toast.success(`${getMethodTitle(method)} enrolled successfully!`);
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Enrollment failed. Please try again.');
    } finally {
      setEnrollingMethod(null);
      setShowEnrollment(false);
    }
  };

  const handleRemoveMethod = async (method: string) => {
    try {
      // Clear enrollment data
      localStorage.removeItem(`biometric_${method}_enrolled`);
      
      // Update status
      setBiometricStatus(prev => ({
        ...prev,
        [method]: {
          ...prev[method],
          isEnrolled: false,
          isAvailable: false
        }
      }));
      
      toast.success(`${getMethodTitle(method)} removed successfully`);
    } catch (error) {
      console.error('Error removing method:', error);
      toast.error('Failed to remove method');
    }
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return <Fingerprint className="w-5 h-5" />;
      case 'face':
        return <Eye className="w-5 h-5" />;
      case 'voice':
        return <Mic className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getMethodTitle = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return 'Fingerprint';
      case 'face':
        return 'Face Recognition';
      case 'voice':
        return 'Voice Recognition';
      default:
        return 'Biometric';
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'fingerprint':
        return 'Use your fingerprint for secure authentication';
      case 'face':
        return 'Look at your device to verify identity';
      case 'voice':
        return 'Speak a passphrase to authenticate';
      default:
        return 'Biometric authentication method';
    }
  };

  const getSecurityLevelConfig = (level: string) => {
    switch (level) {
      case 'low':
        return {
          title: 'Low Security',
          description: 'Fast access with minimal verification',
          icon: <Unlock className="w-4 h-4 text-yellow-600" />,
          color: 'bg-yellow-100 text-yellow-800'
        };
      case 'medium':
        return {
          title: 'Medium Security',
          description: 'Balanced security and convenience',
          icon: <Shield className="w-4 h-4 text-blue-600" />,
          color: 'bg-blue-100 text-blue-800'
        };
      case 'high':
        return {
          title: 'High Security',
          description: 'Maximum security with additional verification',
          icon: <Lock className="w-4 h-4 text-red-600" />,
          color: 'bg-red-100 text-red-800'
        };
      default:
        return {
          title: 'Medium Security',
          description: 'Balanced security and convenience',
          icon: <Shield className="w-4 h-4 text-blue-600" />,
          color: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const renderMethodCard = (method: string, status: BiometricStatus) => (
    <Card key={method} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              status.isAvailable ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
            }`}>
              {getMethodIcon(method)}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">
                {getMethodTitle(method)}
              </h3>
              <p className="text-sm text-gray-600">
                {getMethodDescription(method)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {status.isAvailable ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
        </div>
        
        {status.isAvailable && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Confidence Level</span>
              <span className="font-medium">{Math.round((status.confidence || 0) * 100)}%</span>
            </div>
            
            <div className="mt-2 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRemoveMethod(method)}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {/* TODO: Implement re-enrollment */}}
              >
                <Edit className="w-3 h-3 mr-1" />
                Update
              </Button>
            </div>
          </div>
        )}
        
        {!status.isAvailable && status.isSupported && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button
              size="sm"
              onClick={() => handleEnrollMethod(method)}
              disabled={enrollingMethod === method}
              className="w-full"
            >
              {enrollingMethod === method ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Enrolling...
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 mr-1" />
                  Enroll
                </>
              )}
            </Button>
          </div>
        )}
        
        {!status.isSupported && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Not supported on this device
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="w-5 h-5" />
          <span>Security Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Security Level</Label>
          <div className="mt-2 space-y-2">
            {(['low', 'medium', 'high'] as const).map((level) => {
              const config = getSecurityLevelConfig(level);
              return (
                <div
                  key={level}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    securityLevel === level
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSecurityLevel(level)}
                >
                  <div className={`p-2 rounded-full ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{config.title}</h4>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                  {securityLevel === level && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
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
            <Label className="text-sm font-medium">Auto-login with biometrics</Label>
            <p className="text-xs text-gray-500">Automatically authenticate when biometric is available</p>
          </div>
          <Switch
            checked={preferences.autoLogin}
            onCheckedChange={(checked) => handlePreferenceChange('autoLogin', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Require confirmation</Label>
            <p className="text-xs text-gray-500">Always ask for confirmation before authentication</p>
          </div>
          <Switch
            checked={preferences.requireConfirmation}
            onCheckedChange={(checked) => handlePreferenceChange('requireConfirmation', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Lock on exit</Label>
            <p className="text-xs text-gray-500">Automatically lock when leaving the app</p>
          </div>
          <Switch
            checked={preferences.lockOnExit}
            onCheckedChange={(checked) => handlePreferenceChange('lockOnExit', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Backup methods</Label>
            <p className="text-xs text-gray-500">Enable multiple authentication methods</p>
          </div>
          <Switch
            checked={preferences.backupMethods}
            onCheckedChange={(checked) => handlePreferenceChange('backupMethods', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Notifications</Label>
            <p className="text-xs text-gray-500">Receive alerts for authentication events</p>
          </div>
          <Switch
            checked={preferences.notifications}
            onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
          />
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <Button onClick={savePreferences} className="w-full">
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Biometric Settings</h2>
          <p className="text-gray-600">Manage your biometric authentication preferences</p>
        </div>
        
        <Button
          variant="outline"
          onClick={loadBiometricStatus}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Methods</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(biometricStatus).filter(m => m.isAvailable).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Security Level</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{securityLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Auto-login</p>
                <p className="text-2xl font-bold text-gray-900">
                  {preferences.autoLogin ? 'On' : 'Off'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Biometric Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fingerprint className="w-5 h-5" />
            <span>Biometric Methods</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(biometricStatus).map(([method, status]) =>
              renderMethodCard(method, status)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings & Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSecuritySettings()}
        {renderPreferences()}
      </div>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span>All biometric data is encrypted and stored locally</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>No biometric data is transmitted to servers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-green-600" />
                <span>Face recognition includes liveness detection</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-green-600" />
                <span>WebAuthn standard for fingerprint authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-green-600" />
                <span>Voice patterns are converted to secure templates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-green-600" />
                <span>Immediate alerts for suspicious authentication attempts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
