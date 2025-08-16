import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon, 
  EyeIcon, 
  TrashIcon, 
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import { toast } from 'react-hot-toast';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  category: string;
  tags: string[];
  description: string;
  version: string;
  caseId?: string;
  insuredId?: string;
  filePath: string;
  mimeType: string;
  checksum: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  documentCount: number;
}

const DocumentCenter: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Application_Form_CS-2024-001.pdf',
        type: 'application/pdf',
        size: 245760,
        uploadedBy: 'John Smith',
        uploadedAt: '2024-01-15T10:30:00Z',
        status: 'approved',
        category: 'Application Forms',
        tags: ['application', 'form', 'required'],
        description: 'Completed insurance application form',
        version: '1.0',
        caseId: 'CS-2024-001',
        insuredId: 'INS-001',
        filePath: '/documents/applications/CS-2024-001/application_form.pdf',
        mimeType: 'application/pdf',
        checksum: 'a1b2c3d4e5f6'
      },
      {
        id: '2',
        name: 'ID_Documents_Jane_Doe.zip',
        type: 'application/zip',
        size: 1048576,
        uploadedBy: 'Jane Doe',
        uploadedAt: '2024-01-15T11:15:00Z',
        status: 'under_review',
        category: 'Identity Documents',
        tags: ['id', 'passport', 'drivers_license'],
        description: 'Government issued identification documents',
        version: '1.0',
        caseId: 'CS-2024-001',
        insuredId: 'INS-001',
        filePath: '/documents/identity/CS-2024-001/id_documents.zip',
        mimeType: 'application/zip',
        checksum: 'f6e5d4c3b2a1'
      },
      {
        id: '3',
        name: 'Financial_Statements_2023.pdf',
        type: 'application/pdf',
        size: 512000,
        uploadedBy: 'Jane Doe',
        uploadedAt: '2024-01-15T12:00:00Z',
        status: 'pending',
        category: 'Financial Documents',
        tags: ['financial', 'statements', 'tax'],
        description: 'Annual financial statements and tax returns',
        version: '1.0',
        caseId: 'CS-2024-001',
        insuredId: 'INS-001',
        filePath: '/documents/financial/CS-2024-001/financial_statements.pdf',
        mimeType: 'application/pdf',
        checksum: 'b2a1c3d4e5f6'
      },
      {
        id: '4',
        name: 'Medical_Questionnaire.pdf',
        type: 'application/pdf',
        size: 128000,
        uploadedBy: 'Dr. Michael Chen',
        uploadedAt: '2024-01-15T14:30:00Z',
        status: 'approved',
        category: 'Medical Documents',
        tags: ['medical', 'questionnaire', 'health'],
        description: 'Completed medical questionnaire',
        version: '1.0',
        caseId: 'CS-2024-001',
        insuredId: 'INS-001',
        filePath: '/documents/medical/CS-2024-001/medical_questionnaire.pdf',
        mimeType: 'application/pdf',
        checksum: 'c3d4e5f6a1b2'
      }
    ];

    const mockCategories: DocumentCategory[] = [
      {
        id: '1',
        name: 'Application Forms',
        description: 'Insurance application and related forms',
        required: true,
        documentCount: 1
      },
      {
        id: '2',
        name: 'Identity Documents',
        description: 'Government issued identification',
        required: true,
        documentCount: 1
      },
      {
        id: '3',
        name: 'Financial Documents',
        description: 'Financial statements and tax returns',
        required: true,
        documentCount: 1
      },
      {
        id: '4',
        name: 'Medical Documents',
        description: 'Medical history and examination reports',
        required: false,
        documentCount: 1
      }
    ];

    setDocuments(mockDocuments);
    setCategories(mockCategories);
  }, []);

  // Filter and sort documents
  const filteredAndSortedDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Document];
      let bValue: any = b[sortBy as keyof Document];
      
      if (sortBy === 'uploadedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === 'size') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'under_review':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      'approved': { color: 'bg-green-100 text-green-800', text: 'Approved' },
      'under_review': { color: 'bg-blue-100 text-blue-800', text: 'Under Review' },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      'pending': { color: 'bg-gray-100 text-gray-800', text: 'Pending' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <DocumentTextIcon className="h-8 w-8 text-blue-500" />;
    } else if (mimeType.includes('zip') || mimeType.includes('rar')) {
      return <DocumentTextIcon className="h-8 w-8 text-purple-500" />;
    } else {
      return <DocumentTextIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleDocumentAction = (action: string, document: Document) => {
    switch (action) {
      case 'view':
        setSelectedDocument(document);
        setShowDocumentModal(true);
        break;
      case 'download':
        // In a real app, this would trigger a download
        toast.success(`Downloading ${document.name}`);
        break;
      case 'edit':
        setSelectedDocument(document);
        setShowDocumentModal(true);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${document.name}?`)) {
          setDocuments(prev => prev.filter(d => d.id !== document.id));
          toast.success('Document deleted successfully');
        }
        break;
      default:
        break;
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    // In a real app, this would upload files to the server
    Array.from(files).forEach(file => {
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedBy: 'Current User',
        uploadedAt: new Date().toISOString(),
        status: 'pending',
        category: 'Uncategorized',
        tags: [],
        description: `Uploaded file: ${file.name}`,
        version: '1.0',
        filePath: `/uploads/${file.name}`,
        mimeType: file.type,
        checksum: 'temp'
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      toast.success(`Uploaded ${file.name}`);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Center</h1>
          <p className="text-gray-600">Manage and organize case documents</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      {/* Document Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Document Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <Badge variant="outline">{category.documentCount} docs</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                {category.required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="uploadedAt-desc">Newest First</option>
                <option value="uploadedAt-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="size-desc">Largest First</option>
                <option value="size-asc">Smallest First</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredAndSortedDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAndSortedDocuments.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getFileIcon(document.mimeType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
                      {getStatusBadge(document.status)}
                      {document.category && (
                        <Badge variant="outline" className="text-xs">
                          {document.category}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{document.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{document.uploadedBy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{formatDate(document.uploadedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DocumentTextIcon className="h-4 w-4" />
                        <span>{formatFileSize(document.size)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FolderIcon className="h-4 w-4" />
                        <span>v{document.version}</span>
                      </div>
                    </div>
                    
                    {document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {document.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <FunnelIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDocumentAction('view', document)}>
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDocumentAction('download', document)}>
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDocumentAction('edit', document)}>
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDocumentAction('delete', document)}
                          className="text-red-600"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAndSortedDocuments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No documents found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upload Documents</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-gray-600 mb-4">
                  Support for PDF, images, and compressed files up to 10MB
                </p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>Choose Files</span>
                  </Button>
                </label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success('Upload completed');
                  setShowUploadModal(false);
                }}>
                  Upload Documents
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Details Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Document Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedDocument(null);
                }}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {getFileIcon(selectedDocument.mimeType)}
                <div>
                  <h3 className="text-lg font-medium">{selectedDocument.name}</h3>
                  <p className="text-gray-600">{selectedDocument.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                  <p className="text-sm text-gray-900">{selectedDocument.mimeType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                  <p className="text-sm text-gray-900">{formatFileSize(selectedDocument.size)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded By</label>
                  <p className="text-sm text-gray-900">{selectedDocument.uploadedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedDocument.uploadedAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedDocument.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                  <p className="text-sm text-gray-900">{selectedDocument.version}</p>
                </div>
              </div>
              
              {selectedDocument.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedDocument(null);
                  }}
                >
                  Close
                </Button>
                <Button onClick={() => handleDocumentAction('download', selectedDocument)}>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCenter; 