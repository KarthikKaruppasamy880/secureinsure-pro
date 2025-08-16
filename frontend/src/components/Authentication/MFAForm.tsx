import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Smartphone,
  Key,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  QrCode,
  Copy,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const mfaSchema = z.object({
  code: z.string().length(6, 'Please enter a 6-digit code'),
});

const backupCodeSchema = z.object({
  backupCode: z.string().min(8, 'Please enter a valid backup code'),
});

type MFAFormData = z.infer<typeof mfaSchema>;
type BackupCodeFormData = z.infer<typeof backupCodeSchema>;

interface MFAFormProps {
  onVerify: (data: MFAFormData) => Promise<void>;
  onBackupCode: (data: BackupCodeFormData) => Promise<void>;
  onResendCode: () => Promise<void>;
  onSetupTOTP: () => Promise<{ qrCode: string; secret: string }>;
  isLoading?: boolean;
  error?: string;
  method?: 'sms' | 'totp' | 'backup';
  phoneNumber?: string;
  email?: string;
}

export default function MFAForm({
  onVerify,
  onBackupCode,
  onResendCode,
  onSetupTOTP,
  isLoading = false,
  error,
  method = 'sms',
  phoneNumber,
  email
}: MFAFormProps) {
  const [activeTab, setActiveTab] = useState<'sms' | 'totp' | 'backup'>(method);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'sms' | 'totp' | 'backup');
  };
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [qrCode, setQrCode] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const {
    register: registerMFA,
    handleSubmit: handleSubmitMFA,
    formState: { errors: mfaErrors, isValid: mfaIsValid },
    reset: resetMFA
  } = useForm<MFAFormData>({
    resolver: zodResolver(mfaSchema),
    mode: 'onChange'
  });

  const {
    register: registerBackup,
    handleSubmit: handleSubmitBackup,
    formState: { errors: backupErrors, isValid: backupIsValid },
    reset: resetBackup
  } = useForm<BackupCodeFormData>({
    resolver: zodResolver(backupCodeSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleMFAVerify = async (data: MFAFormData) => {
    try {
      await onVerify(data);
      toast.success('Verification successful!');
    } catch (err) {
      toast.error('Verification failed. Please try again.');
    }
  };

  const handleBackupCodeVerify = async (data: BackupCodeFormData) => {
    try {
      await onBackupCode(data);
      toast.success('Backup code verification successful!');
    } catch (err) {
      toast.error('Backup code verification failed.');
    }
  };

  const handleResendCode = async () => {
    try {
      await onResendCode();
      setCountdown(60);
      toast.success('Verification code sent!');
    } catch (err) {
      toast.error('Failed to send verification code.');
    }
  };

  const handleSetupTOTP = async () => {
    try {
      const result = await onSetupTOTP();
      setQrCode(result.qrCode);
      setTotpSecret(result.secret);
      setActiveTab('totp');
    } catch (err) {
      toast.error('Failed to setup TOTP.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadBackupCodes = () => {
    const codes = [
      'ABC123DEF456',
      'GHI789JKL012',
      'MNO345PQR678',
      'STU901VWX234',
      'YZA567BCD890',
      'EFG123HIJ456',
      'KLM789NOP012',
      'QRS345TUV678'
    ];
    
    const content = `SecureInsure Pro - Backup Codes\n\nPlease save these codes in a secure location:\n\n${codes.join('\n')}\n\nEach code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'secureinsure-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Two-Factor Authentication
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Verify your identity to continue
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sms" disabled={isLoading}>
                <Smartphone className="w-4 h-4 mr-2" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="totp" disabled={isLoading}>
                <Key className="w-4 h-4 mr-2" />
                TOTP
              </TabsTrigger>
              <TabsTrigger value="backup" disabled={isLoading}>
                <Shield className="w-4 h-4 mr-2" />
                Backup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sms" className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  We've sent a verification code to:
                </p>
                <p className="font-medium text-gray-900">
                  {phoneNumber || email}
                </p>
              </div>

              <form onSubmit={handleSubmitMFA(handleMFAVerify)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsCode">Verification Code</Label>
                  <Input
                    id="smsCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    {...registerMFA('code')}
                    disabled={isLoading}
                  />
                  {mfaErrors.code && (
                    <p className="text-sm text-red-600">{mfaErrors.code.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!mfaIsValid || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify Code'
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isLoading}
                  className="text-sm"
                >
                  {countdown > 0 ? (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Resend in {countdown}s</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend Code</span>
                    </div>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="totp" className="space-y-4">
              {!qrCode ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    Set up Time-based One-Time Password (TOTP) for enhanced security
                  </p>
                  <Button
                    type="button"
                    onClick={handleSetupTOTP}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Setup TOTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your authenticator app
                    </p>
                    <div className="bg-white p-4 rounded-lg border inline-block">
                      <img src={qrCode} alt="TOTP QR Code" className="w-32 h-32" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type={showSecret ? 'text' : 'password'}
                        value={totpSecret}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(totpSecret)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitMFA(handleMFAVerify)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="totpCode">TOTP Code</Label>
                      <Input
                        id="totpCode"
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        {...registerMFA('code')}
                        disabled={isLoading}
                      />
                      {mfaErrors.code && (
                        <p className="text-sm text-red-600">{mfaErrors.code.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!mfaIsValid || isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        'Verify TOTP'
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Use a backup code to access your account
                </p>
              </div>

              <form onSubmit={handleSubmitBackup(handleBackupCodeVerify)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backupCode">Backup Code</Label>
                  <Input
                    id="backupCode"
                    type="text"
                    placeholder="Enter backup code"
                    className="text-center font-mono"
                    {...registerBackup('backupCode')}
                    disabled={isLoading}
                  />
                  {backupErrors.backupCode && (
                    <p className="text-sm text-red-600">{backupErrors.backupCode.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!backupIsValid || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify Backup Code'
                  )}
                </Button>
              </form>

              <div className="text-center space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Backup Codes
                </Button>
                
                {showBackupCodes && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-xs text-gray-600">
                      Save these codes in a secure location. Each code can only be used once.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {['ABC123DEF456', 'GHI789JKL012', 'MNO345PQR678', 'STU901VWX234'].map((code, index) => (
                        <div key={index} className="bg-white p-2 rounded border text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              Need help?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 