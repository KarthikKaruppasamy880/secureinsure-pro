import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { NormalizedField } from '../../services/excelParserService';

interface DynamicFieldProps {
  field: NormalizedField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  showValidation?: boolean;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  showValidation = false
}) => {
  const fieldId = `${field.path?.tab || 'default'}-${field.path?.section || 'section'}-${field.key}`;
  const hasError = showValidation && field.required && !value;

  const renderField = () => {
    switch (field.type?.toLowerCase()) {
      case 'select':
      case 'dropdown':
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(hasError && 'border-red-500')}>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any) => (
                <SelectItem key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </SelectItem>
              )) || (
                <SelectItem value="option1">Option 1</SelectItem>
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
            className={cn(hasError && 'border-red-500')}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label}`}
            disabled={disabled}
            className={cn(hasError && 'border-red-500')}
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground',
                  hasError && 'border-red-500'
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : `Select ${field.label}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date?.toISOString() || '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'number':
        return (
          <Input
            id={fieldId}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label}`}
            disabled={disabled}
            className={cn(hasError && 'border-red-500')}
          />
        );

      case 'email':
        return (
          <Input
            id={fieldId}
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label}`}
            disabled={disabled}
            className={cn(hasError && 'border-red-500')}
          />
        );

      case 'phone':
        return (
          <Input
            id={fieldId}
            type="tel"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label}`}
            disabled={disabled}
            className={cn(hasError && 'border-red-500')}
          />
        );

      case 'ssn':
        return (
          <Input
            id={fieldId}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="XXX-XX-XXXX"
            disabled={disabled}
            className={cn(hasError && 'border-red-500')}
            maxLength={11}
          />
        );

      case 'zip':
        return (
          <Input
            id={fieldId}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="XXXXX"
            disabled={disabled}
            className={cn(hasError && 'border-red-500')}
            maxLength={5}
          />
        );

      default:
        return (
          <Input
            id={fieldId}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label}`}
            disabled={disabled}
            className={cn(hasError && 'border-red-500')}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {renderField()}
      
      {hasError && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>This field is required</span>
        </div>
      )}
      
      {field.format && (
        <p className="text-xs text-gray-500">
          Format: {field.format}
        </p>
      )}
    </div>
  );
};
