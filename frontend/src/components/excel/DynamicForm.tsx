import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Save, Edit, Eye, EyeOff } from 'lucide-react';
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

interface DynamicFormProps {
  sheets: ExcelSheet[];
  initialData?: any;
  isAdmin?: boolean;
  onSave?: (data: any) => void;
  onEdit?: (data: any) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  sheets,
  initialData = {},
  isAdmin = false,
  onSave,
  onEdit
}) => {
  // Helper function to safely get error message
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) return error.message;
    return 'Invalid input';
  };
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(initialData);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: initialData
  });

  const watchedValues = watch();

  useEffect(() => {
    setFormData(watchedValues);
  }, [watchedValues]);

  const onSubmit = async (data: any) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Form data saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save form data');
      console.error('Form submission error:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (onEdit) {
      onEdit(formData);
    }
  };

  const renderField = (field: ExcelField, sheetName: string) => {
    const fieldName = `${sheetName}.${field.label}`;
    const isVisible = field.conditional 
      ? watchedValues[`${sheetName}.${field.conditional.field}`] === field.conditional.value
      : true;

    if (!isVisible) return null;

    const fieldError = errors[fieldName];

    switch (field.type) {
      case 'text':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: field.required ? `${field.label} is required` : false,
                pattern: field.validation === 'email' 
                  ? { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                  : field.validation === 'phone'
                  ? { value: /^[\+]?[1-9][\d]{0,15}$/, message: 'Invalid phone number' }
                  : field.validation === 'ssn'
                  ? { value: /^\d{3}-?\d{2}-?\d{4}$/, message: 'Invalid SSN format' }
                  : undefined
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  id={fieldName}
                  type="text"
                  value={value || ''}
                  onChange={onChange}
                  disabled={!isEditing}
                  className={fieldError ? 'border-red-500' : ''}
                />
              )}
            />
            {fieldError && (
              <p className="text-sm text-red-500">{getErrorMessage(fieldError)}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: field.required ? `${field.label} is required` : false,
                min: { value: 0, message: 'Value must be positive' }
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  id={fieldName}
                  type="number"
                  value={value || ''}
                  onChange={onChange}
                  disabled={!isEditing}
                  className={fieldError ? 'border-red-500' : ''}
                />
              )}
            />
            {fieldError && (
              <p className="text-sm text-red-500">{getErrorMessage(fieldError)}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: field.required ? `${field.label} is required` : false
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  id={fieldName}
                  type="date"
                  value={value || ''}
                  onChange={onChange}
                  disabled={!isEditing}
                  className={fieldError ? 'border-red-500' : ''}
                />
              )}
            />
            {fieldError && (
              <p className="text-sm text-red-500">{getErrorMessage(fieldError)}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: field.required ? `${field.label} is required` : false
              }}
              render={({ field: { onChange, value } }) => (
                <Select
                  value={value || ''}
                  onValueChange={onChange}
                  disabled={!isEditing}
                >
                  <SelectTrigger className={fieldError ? 'border-red-500' : ''}>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {fieldError && (
              <p className="text-sm text-red-500">{getErrorMessage(fieldError)}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldName} className="flex items-center space-x-2">
            <Controller
              name={fieldName}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  id={fieldName}
                  checked={value || false}
                  onCheckedChange={onChange}
                  disabled={!isEditing}
                />
              )}
            />
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: field.required ? `${field.label} is required` : false
              }}
              render={({ field: { onChange, value } }) => (
                <Textarea
                  id={fieldName}
                  value={value || ''}
                  onChange={onChange}
                  disabled={!isEditing}
                  className={fieldError ? 'border-red-500' : ''}
                  rows={3}
                />
              )}
            />
            {fieldError && (
              <p className="text-sm text-red-500">{getErrorMessage(fieldError)}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSheet = (sheet: ExcelSheet) => {
    const fields = sheet.fields.filter(field => {
      if (!field.conditional) return true;
      const conditionalField = `${sheet.name}.${field.conditional.field}`;
      return watchedValues[conditionalField] === field.conditional.value;
    });

    return (
      <TabsContent key={sheet.name} value={sheet.name} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => renderField(field, sheet.name))}
        </div>
      </TabsContent>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dynamic Application Form</CardTitle>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  {!isEditing ? (
                    <Button variant="outline" onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                </>
              )}
              {isEditing && (
                <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={sheets[0]?.name} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              {sheets.map((sheet) => (
                <TabsTrigger key={sheet.name} value={sheet.name}>
                  {sheet.name}
                  <Badge variant="secondary" className="ml-2">
                    {sheet.fields.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            {sheets.map((sheet) => renderSheet(sheet))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicForm; 