import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Download,
  Trash2,
  FolderOpen,
  Cloud,
  Shield,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'uploading' | 'completed' | 'error' | 'processing';
  progress: number;
  error?: string;
  uploadedAt: string;
  metadata?: {
    category?: string;
    tags?: string[];
    description?: string;
    isPublic?: boolean;
    isEncrypted?: boolean;
  };
}

interface FileUploadProps {
  onFileUpload: (files: File[]) => Promise<void>;
  onFileDelete: (fileId: string) => Promise<void>;
  onFileDownload: (fileId: string) => Promise<void>;
  onFilePreview: (fileId: string) => Promise<void>;
  onFileUpdate: (fileId: string, metadata: any) => Promise<void>;
  uploadedFiles: UploadedFile[];
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  maxFiles?: number;
  allowMultiple?: boolean;
  isUploading?: boolean;
  error?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
  if (type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
  if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
  if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return <Archive className="w-5 h-5 text-orange-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
};

const getFileTypeColor = (type: string) => {
  if (type.startsWith('image/')) return 'bg-blue-100 text-blue-800';
  if (type.startsWith('video/')) return 'bg-purple-100 text-purple-800';
  if (type.startsWith('audio/')) return 'bg-green-100 text-green-800';
  if (type.includes('pdf')) return 'bg-red-100 text-red-800';
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-800';
};

export default function FileUpload({
  onFileUpload,
  onFileDelete,
  onFileDownload,
  onFilePreview,
  onFileUpdate,
  uploadedFiles,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['*/*'],
  maxFiles = 10,
  allowMultiple = true,
  isUploading = false,
  error
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Max size is ${formatFileSize(maxFileSize)}`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} has an invalid file type`);
        } else {
          toast.error(`${file.name} was rejected: ${error.message}`);
        }
      });
    });

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...acceptedFiles]);
      handleFileUpload(acceptedFiles);
    }
  }, [maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    maxFiles: allowMultiple ? maxFiles : 1,
    disabled: isUploading
  });

  const handleFileUpload = async (files: File[]) => {
    try {
      await onFileUpload(files);
      setSelectedFiles([]);
      toast.success(`${files.length} file(s) uploaded successfully!`);
    } catch (err) {
      toast.error('Failed to upload files. Please try again.');
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await onFileDelete(fileId);
      toast.success('File deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete file. Please try again.');
    }
  };

  const handleFileDownload = async (fileId: string) => {
    try {
      await onFileDownload(fileId);
      toast.success('File download started!');
    } catch (err) {
      toast.error('Failed to download file. Please try again.');
    }
  };

  const handleFilePreview = async (fileId: string) => {
    try {
      await onFilePreview(fileId);
    } catch (err) {
      toast.error('Failed to preview file. Please try again.');
    }
  };

  const handleFileUpdate = async (fileId: string, metadata: any) => {
    try {
      await onFileUpdate(fileId, metadata);
      toast.success('File metadata updated successfully!');
    } catch (err) {
      toast.error('Failed to update file metadata. Please try again.');
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">File Upload</h1>
          <p className="text-gray-600 mt-1">Upload and manage your documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {uploadedFiles.length} files
          </Badge>
          <Badge variant="outline">
            {formatFileSize(uploadedFiles.reduce((acc, file) => acc + file.size, 0))}
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </h3>
                <p className="text-gray-600 mt-2">
                  or click to browse files
                </p>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
                <p>Maximum files: {maxFiles}</p>
                <p>Accepted types: {acceptedFileTypes.join(', ')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="w-5 h-5" />
              Selected Files ({selectedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelectedFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Uploaded Files ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{file.name}</h4>
                          <Badge className={getFileTypeColor(file.type)}>
                            {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                          <Badge className={getStatusColor(file.status)}>
                            {file.status}
                          </Badge>
                          {file.metadata?.isPublic && (
                            <Badge variant="outline" className="text-green-600">
                              <Unlock className="w-3 h-3 mr-1" />
                              Public
                            </Badge>
                          )}
                          {file.metadata?.isEncrypted && (
                            <Badge variant="outline" className="text-blue-600">
                              <Lock className="w-3 h-3 mr-1" />
                              Encrypted
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                        
                        {/* Progress Bar for Uploading Files */}
                        {file.status === 'uploading' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Uploading...</span>
                              <span>{file.progress}%</span>
                            </div>
                            <Progress value={file.progress} className="h-2" />
                          </div>
                        )}

                        {/* Error Message */}
                        {file.status === 'error' && file.error && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{file.error}</AlertDescription>
                          </Alert>
                        )}

                        {/* Metadata */}
                        {file.metadata && (
                          <div className="mt-2 space-y-1">
                            {file.metadata.category && (
                              <p className="text-xs text-gray-500">
                                Category: {file.metadata.category}
                              </p>
                            )}
                            {file.metadata.tags && file.metadata.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {file.metadata.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {file.metadata.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {file.metadata.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFilePreview(file.id)}
                        disabled={file.status !== 'completed'}
                        className="p-1 h-8 w-8"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileDownload(file.id)}
                        disabled={file.status !== 'completed'}
                        className="p-1 h-8 w-8"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileDelete(file.id)}
                        className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Upload Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.filter(f => f.status === 'uploading').map((file) => (
                <div key={file.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{file.name}</span>
                    <span>{file.progress}%</span>
                  </div>
                  <Progress value={file.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Statistics */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              File Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{uploadedFiles.length}</p>
                <p className="text-sm text-gray-600">Total Files</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {uploadedFiles.filter(f => f.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {uploadedFiles.filter(f => f.status === 'error').length}
                </p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {formatFileSize(uploadedFiles.reduce((acc, file) => acc + file.size, 0))}
                </p>
                <p className="text-sm text-gray-600">Total Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 