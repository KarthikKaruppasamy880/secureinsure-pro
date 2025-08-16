import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share,
  Bookmark,
  BookmarkPlus,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Search,
  Highlighter,
  PenTool,
  Type,
  Undo,
  Redo,
  Settings,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  uploadedAt: string;
  uploadedBy: string;
  metadata?: {
    pages?: number;
    dimensions?: { width: number; height: number };
    duration?: number; // for videos/audio
    category?: string;
    tags?: string[];
    description?: string;
    isPublic?: boolean;
    isEncrypted?: boolean;
  };
  annotations?: Annotation[];
  bookmarks?: Bookmark[];
}

interface Annotation {
  id: string;
  type: 'highlight' | 'text' | 'drawing' | 'stamp';
  content?: string;
  position: { x: number; y: number; width?: number; height?: number };
  color: string;
  page: number;
  createdAt: string;
  createdBy: string;
}

interface Bookmark {
  id: string;
  name: string;
  page: number;
  position: { x: number; y: number };
  createdAt: string;
  createdBy: string;
}

interface DocumentViewerProps {
  document: Document;
  onDownload: (documentId: string) => Promise<void>;
  onShare: (documentId: string) => Promise<void>;
  onAddBookmark: (documentId: string, bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  onRemoveBookmark: (documentId: string, bookmarkId: string) => Promise<void>;
  onAddAnnotation: (documentId: string, annotation: Omit<Annotation, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  onRemoveAnnotation: (documentId: string, annotationId: string) => Promise<void>;
  onUpdateAnnotation: (documentId: string, annotationId: string, updates: Partial<Annotation>) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function DocumentViewer({
  document,
  onDownload,
  onShare,
  onAddBookmark,
  onRemoveBookmark,
  onAddAnnotation,
  onRemoveAnnotation,
  onUpdateAnnotation,
  isLoading = false,
  error
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [annotationMode, setAnnotationMode] = useState<'none' | 'highlight' | 'text' | 'drawing'>('none');
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const totalPages = document.metadata?.pages || 1;

  useEffect(() => {
    if (isFullscreen) {
      const doc = document as any;
      if (doc.documentElement && doc.documentElement.requestFullscreen) {
        doc.documentElement.requestFullscreen();
      }
    } else {
      const doc = document as any;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 400));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleDownload = async () => {
    try {
      await onDownload(document.id);
      toast.success('Document download started!');
    } catch (err) {
      toast.error('Failed to download document. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      await onShare(document.id);
      toast.success('Document shared successfully!');
    } catch (err) {
      toast.error('Failed to share document. Please try again.');
    }
  };

  const handleAddBookmark = async (name: string, page: number) => {
    try {
      await onAddBookmark(document.id, {
        name,
        page,
        position: { x: 0, y: 0 }
      });
      setIsBookmarkDialogOpen(false);
      toast.success('Bookmark added successfully!');
    } catch (err) {
      toast.error('Failed to add bookmark. Please try again.');
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      await onRemoveBookmark(document.id, bookmarkId);
      toast.success('Bookmark removed successfully!');
    } catch (err) {
      toast.error('Failed to remove bookmark. Please try again.');
    }
  };

  const handleAddAnnotation = async (annotation: Omit<Annotation, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      await onAddAnnotation(document.id, annotation);
      setAnnotationMode('none');
      toast.success('Annotation added successfully!');
    } catch (err) {
      toast.error('Failed to add annotation. Please try again.');
    }
  };

  const handleRemoveAnnotation = async (annotationId: string) => {
    try {
      await onRemoveAnnotation(document.id, annotationId);
      toast.success('Annotation removed successfully!');
    } catch (err) {
      toast.error('Failed to remove annotation. Please try again.');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Simulate search results - in real implementation, this would search the document
    if (term) {
      setSearchResults([1, 3, 5, 7]); // Example page numbers
      setCurrentSearchIndex(0);
    } else {
      setSearchResults([]);
    }
  };

  const handleNextSearchResult = () => {
    if (searchResults.length > 0) {
      setCurrentSearchIndex(prev => (prev + 1) % searchResults.length);
      setCurrentPage(searchResults[currentSearchIndex]);
    }
  };

  const handlePreviousSearchResult = () => {
    if (searchResults.length > 0) {
      setCurrentSearchIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
      setCurrentPage(searchResults[currentSearchIndex]);
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return <Archive className="w-5 h-5 text-orange-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'highlight':
        return <Highlighter className="w-4 h-4" />;
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'drawing':
        return <PenTool className="w-4 h-4" />;
      default:
        return <PenTool className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getDocumentIcon(document.type)}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{document.name}</h1>
            <p className="text-sm text-gray-600">
              {formatFileSize(document.size)} • {document.metadata?.pages || 1} pages • 
              Uploaded by {document.uploadedBy} on {new Date(document.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {document.metadata?.isPublic && (
            <Badge variant="outline" className="text-green-600">
              <Eye className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )}
          {document.metadata?.isEncrypted && (
            <Badge variant="outline" className="text-blue-600">
              <EyeOff className="w-3 h-3 mr-1" />
              Encrypted
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 400}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Rotation */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search document..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousSearchResult}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <span className="text-xs text-gray-500">
                    {currentSearchIndex + 1} of {searchResults.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextSearchResult}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBookmarkDialogOpen(true)}
              >
                <BookmarkPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Document Viewer</span>
            <div className="flex items-center gap-2">
              <Button
                variant={showAnnotations ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                {showAnnotations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Annotations
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant={annotationMode === 'highlight' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnnotationMode(annotationMode === 'highlight' ? 'none' : 'highlight')}
                >
                  <Highlighter className="w-4 h-4" />
                </Button>
                <Button
                  variant={annotationMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnnotationMode(annotationMode === 'text' ? 'none' : 'text')}
                >
                  <Type className="w-4 h-4" />
                </Button>
                <Button
                  variant={annotationMode === 'drawing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnnotationMode(annotationMode === 'drawing' ? 'none' : 'drawing')}
                >
                  <PenTool className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={viewerRef}
            className="relative border rounded-lg bg-gray-50 min-h-[600px] flex items-center justify-center"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Document Content */}
            <div className="relative">
              {document.type.startsWith('image/') ? (
                <img
                  src={document.url}
                  alt={document.name}
                  className="max-w-full max-h-[600px] object-contain"
                  style={{ transform: `scale(${zoom / 100})` }}
                />
              ) : document.type.includes('pdf') ? (
                <div className="bg-white shadow-lg rounded-lg p-4 min-h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">PDF Viewer</p>
                    <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-lg rounded-lg p-4 min-h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    {getDocumentIcon(document.type)}
                    <p className="text-gray-600 mt-2">{document.name}</p>
                    <p className="text-sm text-gray-500">{document.type}</p>
                  </div>
                </div>
              )}

              {/* Annotations Overlay */}
              {showAnnotations && document.annotations && (
                <div className="absolute inset-0 pointer-events-none">
                  {document.annotations
                    .filter(annotation => annotation.page === currentPage)
                    .map(annotation => (
                      <div
                        key={annotation.id}
                        className="absolute"
                        style={{
                          left: `${annotation.position.x}%`,
                          top: `${annotation.position.y}%`,
                          width: annotation.position.width ? `${annotation.position.width}%` : 'auto',
                          height: annotation.position.height ? `${annotation.position.height}%` : 'auto',
                          backgroundColor: annotation.color,
                          opacity: 0.3,
                          pointerEvents: 'auto',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedAnnotation(annotation)}
                      >
                        {annotation.content && (
                          <div className="p-1 text-xs bg-white rounded">
                            {annotation.content}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Canvas for Drawing */}
            {annotationMode === 'drawing' && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-auto"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar - Bookmarks and Annotations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookmarks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Bookmarks ({document.bookmarks?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {document.bookmarks && document.bookmarks.length > 0 ? (
              <div className="space-y-2">
                {document.bookmarks.map(bookmark => (
                  <div
                    key={bookmark.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{bookmark.name}</p>
                        <p className="text-xs text-gray-500">Page {bookmark.page}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(bookmark.page);
                        handleRemoveBookmark(bookmark.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No bookmarks yet</p>
            )}
          </CardContent>
        </Card>

        {/* Annotations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Annotations ({document.annotations?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {document.annotations && document.annotations.length > 0 ? (
              <div className="space-y-2">
                {document.annotations.map(annotation => (
                  <div
                    key={annotation.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {getAnnotationIcon(annotation.type)}
                      <div>
                        <p className="text-sm font-medium">{annotation.type}</p>
                        <p className="text-xs text-gray-500">Page {annotation.page}</p>
                        {annotation.content && (
                          <p className="text-xs text-gray-600 truncate">{annotation.content}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAnnotation(annotation.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No annotations yet</p>
            )}
          </CardContent>
        </Card>

        {/* Document Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Document Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">File Type</p>
                <p className="text-xs text-gray-500">{document.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">File Size</p>
                <p className="text-xs text-gray-500">{formatFileSize(document.size)}</p>
              </div>
              {document.metadata?.dimensions && (
                <div>
                  <p className="text-sm font-medium">Dimensions</p>
                  <p className="text-xs text-gray-500">
                    {document.metadata.dimensions.width} × {document.metadata.dimensions.height}
                  </p>
                </div>
              )}
              {document.metadata?.duration && (
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-xs text-gray-500">{document.metadata.duration}s</p>
                </div>
              )}
              {document.metadata?.category && (
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-xs text-gray-500">{document.metadata.category}</p>
                </div>
              )}
              {document.metadata?.tags && document.metadata.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {document.metadata.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Bookmark Dialog */}
      <Dialog open={isBookmarkDialogOpen} onOpenChange={setIsBookmarkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5" />
              Add Bookmark
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Bookmark Name</label>
              <input
                type="text"
                placeholder="Enter bookmark name"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    handleAddBookmark(input.value, currentPage);
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Page</label>
              <input
                type="number"
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)}
                min={1}
                max={totalPages}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  const input = (document as any).querySelector('input[type="text"]') as HTMLInputElement;
                  if (input?.value) {
                    handleAddBookmark(input.value, currentPage);
                  }
                }}
              >
                Add Bookmark
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBookmarkDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Annotation Dialog */}
      <Dialog open={isAnnotationDialogOpen} onOpenChange={setIsAnnotationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAnnotation && getAnnotationIcon(selectedAnnotation.type)}
              Annotation Details
            </DialogTitle>
          </DialogHeader>
          {selectedAnnotation && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-xs text-gray-500 capitalize">{selectedAnnotation.type}</p>
              </div>
              {selectedAnnotation.content && (
                <div>
                  <p className="text-sm font-medium">Content</p>
                  <p className="text-xs text-gray-500">{selectedAnnotation.content}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Page</p>
                <p className="text-xs text-gray-500">{selectedAnnotation.page}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedAnnotation.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAnnotationDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveAnnotation(selectedAnnotation.id);
                    setIsAnnotationDialogOpen(false);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 