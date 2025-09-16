import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import TX1ImportService, { TX1ParseResult } from '../../services/tx1ImportService';

interface TX1ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (caseId: string, policyId: string) => void;
}

export const TX1ImportModal: React.FC<TX1ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedData, setParsedData] = useState<TX1ParseResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'review' | 'complete'>('upload');
  const [importResult, setImportResult] = useState<{
    caseId: string;
    policyId: string;
    recordCount: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = TX1ImportService.validateTX1File(file);
    if (!validation.isValid) {
      toast.error(`File validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    
    try {
      const fileName = file.name.toLowerCase();
      
      // Handle Excel files
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        // Parse Excel content
        const parsed = await TX1ImportService.parseExcelContent(file);
        setParsedData(parsed);
        setFileContent(`Excel file: ${file.name}`);
        toast.success('Excel file parsed successfully');
      } else {
        // Handle XML/TXT files
        const content = await TX1ImportService.readFileContent(file);
        setFileContent(content);
        
        // Parse TX1 content
        const parsed = TX1ImportService.parseTX1Content(content);
        setParsedData(parsed);
        toast.success('File parsed successfully');
      }
      
      setImportStep('review');
    } catch (error) {
      toast.error('Failed to read file content');
      console.error('File reading error:', error);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !fileContent) return;

    setIsImporting(true);
    
    try {
      const result = await TX1ImportService.importTX1({
        xmlContent: fileContent,
        fileName: selectedFile.name
      });
      
      setImportResult({
        caseId: result.caseId,
        policyId: result.policyId,
        recordCount: result.recordCount
      });
      
      setImportStep('complete');
      toast.success('TX1 file imported successfully!');
      
      // Call success callback
      onImportSuccess(result.caseId, result.policyId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setSelectedFile(null);
    setFileContent('');
    setParsedData(null);
    setImportStep('upload');
    setImportResult(null);
    onClose();
  };

  const handleNewImport = () => {
    setImportStep('upload');
    setSelectedFile(null);
    setFileContent('');
    setParsedData(null);
    setImportResult(null);
  };

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Upload className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Upload TX1 File</h3>
        <p className="text-sm text-gray-500">
          Select a TX1 XML file to import into the system
        </p>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml,.txt,.xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose File
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: XML, TXT, Excel (.xlsx, .xls), CSV (Max 10MB)
        </p>
      </div>
      
      {selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <Badge variant="secondary">{selectedFile.size} bytes</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Eye className="w-6 h-6 text-yellow-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Review Import Data</h3>
        <p className="text-sm text-gray-500">
          Please review the parsed information before importing
        </p>
      </div>
      
      {parsedData && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Parsed Information</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-gray-600">Insured Name</Label>
              <p className="font-medium">{parsedData.insuredName}</p>
            </div>
            <div>
              <Label className="text-gray-600">Policy Type</Label>
              <p className="font-medium">{parsedData.policyType}</p>
            </div>
            <div>
              <Label className="text-gray-600">Face Amount</Label>
              <p className="font-medium">${parsedData.faceAmount.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-gray-600">Premium</Label>
              <p className="font-medium">${parsedData.premium.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-gray-600">Effective Date</Label>
              <p className="font-medium">{parsedData.effectiveDate}</p>
            </div>
            <div>
              <Label className="text-gray-600">Agent</Label>
              <p className="font-medium">{parsedData.agent}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Ready to Import</p>
            <p>This will create a new case and policy in the system.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Import Complete!</h3>
        <p className="text-sm text-gray-500">
          Your TX1 file has been successfully imported
        </p>
      </div>
      
      {importResult && (
        <div className="bg-green-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-green-900">Created Records</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-green-700">Case ID</Label>
              <p className="font-medium text-green-900">{importResult.caseId}</p>
            </div>
            <div>
              <Label className="text-green-700">Policy ID</Label>
              <p className="font-medium text-green-900">{importResult.policyId}</p>
            </div>
            <div>
              <Label className="text-green-700">Records Imported</Label>
              <p className="font-medium text-green-900">{importResult.recordCount}</p>
            </div>
            <div>
              <Label className="text-green-700">Status</Label>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Next Steps</p>
            <p>You can now view the case details or continue with other tasks.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFooter = () => {
    switch (importStep) {
      case 'upload':
        return (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        );
      
      case 'review':
        return (
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportStep('upload')}>
              Back
            </Button>
            <Button 
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : 'Import TX1'}
            </Button>
          </DialogFooter>
        );
      
      case 'complete':
        return (
          <DialogFooter>
            <Button variant="outline" onClick={handleNewImport}>
              Import Another
            </Button>
            <Button onClick={handleClose}>
              Done
            </Button>
          </DialogFooter>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import TX1 File</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {importStep === 'upload' && renderUploadStep()}
          {importStep === 'review' && renderReviewStep()}
          {importStep === 'complete' && renderCompleteStep()}
        </div>
        
        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
};

export default TX1ImportModal;
