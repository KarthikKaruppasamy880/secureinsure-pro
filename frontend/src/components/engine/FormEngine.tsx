import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createValidationSchema as buildValidationSchema } from './validationSchema';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Save, 
  Edit, 
  Eye, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { InsuranceField, InsuranceFieldConfig } from '../../services/excelToJson';
import { normalizeField, generateFieldKey, type NormalizedField } from '../../lib/normalizeField';

// Use the imported normalizeField utility

interface FormEngineProps {
  config: InsuranceFieldConfig;
  initialData?: Record<string, any>;
  onSave?: (data: Record<string, any>) => void;
  onCancel?: () => void;
  isAdmin?: boolean;
  isEditing?: boolean;
  onToggleEdit?: () => void;
}

interface FormData {
  [sheetName: string]: {
    [fieldName: string]: any;
  };
}

export const FormEngine: React.FC<FormEngineProps> = ({
  config,
  initialData = {},
  onSave,
  onCancel,
  isAdmin = false,
  isEditing = false,
  onToggleEdit
}) => {
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({});


  // Initialize form data
  useEffect(() => {
    if (config.sheets) {
      const initialFormData: FormData = {};
      Object.keys(config.sheets).forEach(sheetName => {
        initialFormData[sheetName] = {};
        config.sheets[sheetName].fields.forEach(field => {
          initialFormData[sheetName][field.fieldName] = initialData[sheetName]?.[field.fieldName] || '';
        });
      });
      setFormData(initialFormData);
      setActiveSheet(Object.keys(config.sheets)[0] || '');
    }
  }, [config, initialData]);

  // Create validation schema (hardened util)
  const { schema: validationSchema } = buildValidationSchema({ sheets: config.sheets as any });
  const form = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: formData
  });

  const handleFieldChange = (sheetName: string, fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [sheetName]: {
        ...prev[sheetName],
        [fieldName]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const isValid = await form.trigger();
      if (isValid) {
        const dataToSave = form.getValues();
        onSave?.(dataToSave);
        toast.success('Form data saved successfully');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Please fix validation errors before saving');
    }
  };

  const renderField = (field: InsuranceField, sheetName: string, idx: number) => {
    // Normalize the field to ensure null-safety
    const normalizedField = normalizeField(field);
    const fieldPath = `${sheetName}.${normalizedField.fieldName}`;
    const fieldValue = formData[sheetName]?.[normalizedField.fieldName] || '';
    const isRequired = normalizedField.mandatory;

    const commonProps = {
      id: fieldPath,
      disabled: !isEditing,
      className: isRequired ? 'border-red-200 focus:border-red-500' : '',
      'aria-describedby': `${fieldPath}-help`,
      'aria-required': isRequired
    };

    const kind = normalizedField.kind;
    const renderFieldInput = () => {
      switch (kind) {
        case 'text':
        case 'alphanumeric':
        case 'alpha':
          return (
            <Input
              {...commonProps}
              type="text"
              value={fieldValue}
              onChange={(e) => handleFieldChange(sheetName, normalizedField.fieldName, e.target.value)}
              maxLength={normalizedField.length && normalizedField.length > 0 ? normalizedField.length : undefined}
            />
          );

        case 'number':
          return (
            <Input
              {...commonProps}
              type="number"
              value={fieldValue}
              onChange={(e) => handleFieldChange(sheetName, normalizedField.fieldName, parseFloat(e.target.value) || 0)}
            />
          );

        case 'date':
          return (
            <Input
              {...commonProps}
              type="date"
              value={fieldValue}
              onChange={(e) => handleFieldChange(sheetName, normalizedField.fieldName, e.target.value)}
            />
          );

        case 'email':
          return (
            <Input
              {...commonProps}
              type="email"
              value={fieldValue}
              onChange={(e) => handleFieldChange(sheetName, normalizedField.fieldName, e.target.value)}
            />
          );

        case 'select':
          return (
            <Select
              value={fieldValue}
              onValueChange={(value) => handleFieldChange(sheetName, normalizedField.fieldName, value)}
              disabled={!isEditing}
            >
              <SelectTrigger {...commonProps}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {normalizedField.validations && Array.isArray(normalizedField.validations) && normalizedField.validations.includes('in_list') && normalizedField.helpText ? (
                  normalizedField.helpText.split(',').map((option, index) => (
                    <SelectItem key={index} value={option.trim()}>
                      {option.trim()}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          );

        case 'checkbox':
          return (
            <Checkbox
              id={fieldPath}
              checked={Boolean(fieldValue)}
              onCheckedChange={(checked) => handleFieldChange(sheetName, normalizedField.fieldName, checked)}
              disabled={!isEditing}
              aria-describedby={`${fieldPath}-help`}
              aria-required={isRequired}
            />
          );

        case 'textarea':
          return (
            <Textarea
              {...commonProps}
              value={fieldValue}
              onChange={(e) => handleFieldChange(sheetName, normalizedField.fieldName, e.target.value)}
              maxLength={normalizedField.length && normalizedField.length > 0 ? normalizedField.length : undefined}
              rows={3}
            />
          );

        default:
          return (
            <Input
              {...commonProps}
              type="text"
              value={fieldValue}
              onChange={(e) => handleFieldChange(sheetName, normalizedField.fieldName, e.target.value)}
            />
          );
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={fieldPath} className="text-sm font-medium">
            {normalizedField.fieldName}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="flex items-center gap-2">
            {normalizedField.helpText && (
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {normalizedField.helpText}
                </div>
              </div>
            )}
            {normalizedField.validations && Array.isArray(normalizedField.validations) && normalizedField.validations.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {normalizedField.validations.length} validation{normalizedField.validations.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {renderFieldInput()}

        {/* Field metadata */}
        <div className="text-xs text-gray-500 space-y-1">
          {normalizedField.fieldLevel2 && (
            <div>Category: {normalizedField.fieldLevel2}</div>
          )}
          {normalizedField.fieldLevel3 && (
            <div>Subcategory: {normalizedField.fieldLevel3}</div>
          )}
          {normalizedField.length && normalizedField.length > 0 && (
            <div>Max length: {normalizedField.length}</div>
          )}
          {normalizedField.businessRules && Array.isArray(normalizedField.businessRules) && normalizedField.businessRules.length > 0 && (
            <div>Business rules: {normalizedField.businessRules.join(', ')}</div>
          )}
        </div>


      </div>
    );
  };

  const renderSheet = (sheetName: string) => {
    const sheetData = config.sheets[sheetName];
    if (!sheetData) return null;

    return (
      <Card key={sheetName} className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{sheetName}</span>
              <Badge variant="outline">
                {sheetData.metadata.totalFields} fields
              </Badge>
              <Badge variant="secondary">
                {sheetData.metadata.mandatoryFields} required
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(sheetData.fields ?? [])
              .filter(field => {
                if (!field || typeof field !== 'object') {
                  console.warn(`Skipping invalid field in ${sheetName}:`, field);
                  return false;
                }
                return true;
              })
              .map((field, idx) => {
                // Generate unique key using the utility function
                const uniqueKey = generateFieldKey(normalizeField(field), sheetName, idx);
                
                return (
                  <div key={uniqueKey}>
                    {renderField(field, sheetName, idx)}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!config.sheets || Object.keys(config.sheets).length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No form configuration found. Please load a valid configuration file.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Insurance Application Form</h2>
          <p className="text-gray-600">Complete all required fields to submit your application</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={onToggleEdit}
              className="flex items-center gap-2"
            >
              {isEditing ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {isEditing ? 'View' : 'Edit'}
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sheet navigation */}
      <div className="flex flex-wrap gap-2 border-b">
        {Object.keys(config.sheets).map(sheetName => (
          <button
            key={sheetName}
            onClick={() => setActiveSheet(sheetName)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeSheet === sheetName
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {sheetName}
          </button>
        ))}
      </div>

      {/* Active sheet content */}
      {activeSheet && renderSheet(activeSheet)}

      {/* Form summary */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Sheets:</span> {Object.keys(config.sheets).length}
            </div>
            <div>
              <span className="font-medium">Total Fields:</span> {
                Object.values(config.sheets).reduce((sum, sheet) => sum + (sheet.metadata?.totalFields || 0), 0)
              }
            </div>
            <div>
              <span className="font-medium">Required Fields:</span> {
                Object.values(config.sheets).reduce((sum, sheet) => sum + (sheet.metadata?.mandatoryFields || 0), 0)
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 