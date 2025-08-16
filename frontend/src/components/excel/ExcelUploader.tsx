import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExcelField {
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  validation?: string;
  options?: string[];
  conditional?: {
    field: string;
    value: string;
    show: boolean;
  };
}

interface ExcelSheet {
  name: string;
  fields: ExcelField[];
  data: any[];
}

interface ExcelUploaderProps {
  onDataParsed: (sheets: ExcelSheet[]) => void;
  onFormGenerated: (formData: any) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataParsed, onFormGenerated }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedSheets, setParsedSheets] = useState<ExcelSheet[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'parse' | 'generate'>('upload');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setCurrentStep('parse');
      parseExcelFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const parseExcelFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const sheets: ExcelSheet[] = [];
      const expectedSheets = [
        'Case Setup',
        'Insured',
        'Benefit and Riders',
        'Beneficiary',
        'Owner',
        'Payor',
        'Secondary Address',
        'Life Insurance History',
        'Premium Mood'
      ];

      expectedSheets.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (worksheet) {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          const fields = generateFieldsFromSheet(jsonData, sheetName);
          
          sheets.push({
            name: sheetName,
            fields,
            data: jsonData
          });
        }
      });

      setParsedSheets(sheets);
      onDataParsed(sheets);
      setCurrentStep('generate');
      toast.success(`Successfully parsed ${sheets.length} sheets`);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      toast.error('Failed to parse Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFieldsFromSheet = (data: any[][], sheetName: string): ExcelField[] => {
    const fields: ExcelField[] = [];
    
    if (data.length < 2) return fields;

    // Assume first row contains headers
    const headers = data[0];
    const sampleData = data[1];

    headers.forEach((header, index) => {
      if (header && typeof header === 'string') {
        const field: ExcelField = {
          label: header.toString(),
          type: determineFieldType(header.toString(), sampleData?.[index]),
          required: header.toString().includes('*') || header.toString().toLowerCase().includes('required'),
          validation: generateValidation(header.toString()),
          options: generateOptions(header.toString())
        };

        // Add conditional logic based on business rules
        if (sheetName === 'Benefit and Riders') {
          if (header.toString().includes('Rider')) {
            field.conditional = {
              field: 'Rider_Type',
              value: 'Yes',
              show: true
            };
          }
        }

        fields.push(field);
      }
    });

    return fields;
  };

  const determineFieldType = (header: string, sampleValue: any): ExcelField['type'] => {
    const lowerHeader = header.toLowerCase();
    
    if (lowerHeader.includes('date') || lowerHeader.includes('dob')) {
      return 'date';
    }
    
    if (lowerHeader.includes('amount') || lowerHeader.includes('premium') || lowerHeader.includes('coverage')) {
      return 'number';
    }
    
    if (lowerHeader.includes('yes') || lowerHeader.includes('no') || lowerHeader.includes('check')) {
      return 'checkbox';
    }
    
    if (lowerHeader.includes('notes') || lowerHeader.includes('description') || lowerHeader.includes('comments')) {
      return 'textarea';
    }
    
    if (lowerHeader.includes('type') || lowerHeader.includes('status') || lowerHeader.includes('category')) {
      return 'select';
    }
    
    return 'text';
  };

  const generateValidation = (header: string): string => {
    const lowerHeader = header.toLowerCase();
    
    if (lowerHeader.includes('email')) {
      return 'email';
    }
    
    if (lowerHeader.includes('phone')) {
      return 'phone';
    }
    
    if (lowerHeader.includes('ssn')) {
      return 'ssn';
    }
    
    if (lowerHeader.includes('zip')) {
      return 'zipcode';
    }
    
    return '';
  };

  const generateOptions = (header: string): string[] => {
    const lowerHeader = header.toLowerCase();
    
    if (lowerHeader.includes('gender')) {
      return ['Male', 'Female', 'Other'];
    }
    
    if (lowerHeader.includes('marital')) {
      return ['Single', 'Married', 'Divorced', 'Widowed'];
    }
    
    if (lowerHeader.includes('state')) {
      return ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
    }
    
    if (lowerHeader.includes('yes') || lowerHeader.includes('no')) {
      return ['Yes', 'No'];
    }
    
    return [];
  };

  const generateDynamicForm = () => {
    const formData: Record<string, Record<string, any>> = {};
    parsedSheets.forEach(sheet => {
      formData[sheet.name] = {};
      sheet.fields.forEach(field => {
        formData[sheet.name][field.label] = '';
      });
    });
    
    onFormGenerated(formData);
    toast.success('Dynamic form generated successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Excel File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 'upload' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 dark:text-blue-400">Drop the Excel file here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Upload TPP Excel File
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Drag and drop your Excel file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Supports .xlsx and .xls files
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'parse' && isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Processing Excel file...</p>
            </div>
          )}

          {currentStep === 'generate' && parsedSheets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Parsed Sheets</h3>
                <Button onClick={generateDynamicForm}>
                  Generate Dynamic Form
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parsedSheets.map((sheet, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{sheet.name}</h4>
                      <Badge variant="secondary">{sheet.fields.length} fields</Badge>
                    </div>
                    <div className="space-y-1">
                      {sheet.fields.slice(0, 3).map((field, fieldIndex) => (
                        <div key={fieldIndex} className="text-xs text-gray-600 dark:text-gray-400">
                          {field.label}
                        </div>
                      ))}
                      {sheet.fields.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{sheet.fields.length - 3} more fields
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelUploader; 