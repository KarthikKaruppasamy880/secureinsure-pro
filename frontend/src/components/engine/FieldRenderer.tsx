import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { HelpCircle, AlertCircle, Info } from 'lucide-react';
import { InsuranceField } from '../../services/excelToJson';

interface FieldRendererProps {
  field: InsuranceField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
  showMetadata?: boolean;
  className?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
  showMetadata = true,
  className = ''
}) => {
  const fieldId = `${field.sheet}-${field.fieldName}`;
  const isRequired = field.mandatory;

  const commonProps = {
    id: fieldId,
    disabled,
    className: `${className} ${isRequired ? 'border-red-200 focus:border-red-500' : ''}`,
    'aria-describedby': `${fieldId}-help`,
    'aria-required': isRequired
  };

  const renderFieldInput = () => {
    switch (field.type.toLowerCase()) {
      case 'text':
      case 'alphanumeric':
      case 'alpha':
        return (
          <Input
            {...commonProps}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            maxLength={field.length > 0 ? field.length : undefined}
            placeholder={field.helpText || `Enter ${field.fieldName.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={field.helpText || `Enter ${field.fieldName.toLowerCase()}`}
          />
        );

      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'email':
        return (
          <Input
            {...commonProps}
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.helpText || `Enter email address`}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger {...commonProps}>
              <SelectValue placeholder={field.helpText || `Select ${field.fieldName.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.validations.includes('in_list') && field.helpText ? (
                field.helpText.split(',').map((option, index) => (
                  <SelectItem key={index} value={option.trim()}>
                    {option.trim()}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <Checkbox
            id={fieldId}
            checked={Boolean(value)}
            onCheckedChange={onChange}
            disabled={disabled}
            aria-describedby={`${fieldId}-help`}
            aria-required={isRequired}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            maxLength={field.length > 0 ? field.length : undefined}
            rows={3}
            placeholder={field.helpText || `Enter ${field.fieldName.toLowerCase()}`}
          />
        );

      case 'currency':
        return (
          <Input
            {...commonProps}
            type="number"
            step="0.01"
            min="0"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={field.helpText || `Enter amount`}
          />
        );

      case 'percentage':
        return (
          <Input
            {...commonProps}
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={field.helpText || `Enter percentage`}
          />
        );

      case 'phone':
        return (
          <Input
            {...commonProps}
            type="tel"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.helpText || `Enter phone number`}
          />
        );

      case 'ssn':
        return (
          <Input
            {...commonProps}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="XXX-XX-XXXX"
            maxLength={11}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.helpText || `Enter ${field.fieldName.toLowerCase()}`}
          />
        );
    }
  };

  const getValidationIcon = () => {
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (field.validations.length > 0) {
      return <Info className="h-4 w-4 text-blue-500" />;
    }
    return null;
  };

  const getValidationColor = () => {
    if (error) return 'text-red-500';
    if (field.validations.length > 0) return 'text-blue-500';
    return 'text-gray-500';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Field Label and Help */}
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {field.fieldName}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="flex items-center gap-2">
          {/* Help Text Icon */}
          {field.helpText && (
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {field.helpText}
              </div>
            </div>
          )}
          
          {/* Validation Icon */}
          {getValidationIcon()}
          
          {/* Validation Badge */}
          {field.validations.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {field.validations.length} validation{field.validations.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Field Input */}
      {renderFieldInput()}

      {/* Field Metadata */}
      {showMetadata && (
        <div className="text-xs text-gray-500 space-y-1">
          {field.fieldLevel2 && (
            <div>Category: {field.fieldLevel2}</div>
          )}
          {field.fieldLevel3 && (
            <div>Subcategory: {field.fieldLevel3}</div>
          )}
          {field.fieldLevel4 && (
            <div>Detail: {field.fieldLevel4}</div>
          )}
          {field.length > 0 && (
            <div>Max length: {field.length}</div>
          )}
          {field.format && (
            <div>Format: {field.format}</div>
          )}
          {field.businessRules.length > 0 && (
            <div>Business rules: {field.businessRules.join(', ')}</div>
          )}
          {field.xpath && (
            <div>XPath: {field.xpath}</div>
          )}
          {field.table && field.column && (
            <div>Database: {field.table}.{field.column}</div>
          )}
          {field.commentary && (
            <div>Comment: {field.commentary}</div>
          )}
        </div>
      )}

      {/* Validation Error */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Details */}
      {field.validations.length > 0 && !error && (
        <div className={`text-xs ${getValidationColor()}`}>
          <div className="font-medium">Validations:</div>
          <ul className="list-disc list-inside ml-2">
            {field.validations.map((validation, index) => (
              <li key={index}>{validation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 