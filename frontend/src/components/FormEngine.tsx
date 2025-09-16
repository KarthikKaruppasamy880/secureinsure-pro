import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Field normalizer to handle null/undefined metadata
const normalizeField = (field: any) => {
  if (!field) return null;
  
  return {
    id: field.id || field.fieldId || `field-${Math.random()}`,
    name: field.name || field.fieldName || '',
    type: field.type || field.fieldType || 'text',
    label: field.label || field.displayName || field.name || 'Untitled Field',
    required: Boolean(field.required || field.mandatory),
    validation: field.validation || field.validations || {},
    options: field.options || field.choices || [],
    placeholder: field.placeholder || '',
    defaultValue: field.defaultValue || field.default || '',
    description: field.description || field.helpText || '',
    section: field.section || 'default',
    order: field.order || field.sortOrder || 0
  };
};

// Section normalizer
const normalizeSection = (section: any) => {
  if (!section) return null;
  
  return {
    id: section.id || section.sectionId || `section-${Math.random()}`,
    name: section.name || section.sectionName || 'Untitled Section',
    title: section.title || section.displayName || section.name || 'Untitled Section',
    description: section.description || '',
    fields: (section.fields || []).map(normalizeField).filter(Boolean),
    order: section.order || section.sortOrder || 0,
    required: Boolean(section.required)
  };
};

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="p-4 border border-red-300 rounded-md bg-red-50">
    <h3 className="text-red-800 font-medium">Form Error</h3>
    <p className="text-red-600 text-sm mt-1">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
    >
      Try Again
    </button>
  </div>
);

// Field component with guards
const FieldComponent: React.FC<{ field: any; value: any; onChange: (value: any) => void }> = ({ 
  field, 
  value, 
  onChange 
}) => {
  const normalizedField = normalizeField(field);
  if (!normalizedField) return null;

  const { id, name, type, label, required, placeholder, options } = normalizedField;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const renderField = () => {
    switch (type?.toLowerCase()) {
      case 'select':
      case 'dropdown':
        return (
          <select
            id={id}
            name={name}
            value={value || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={required}
          >
            <option value="">Select an option</option>
            {Array.isArray(options) && options.map((option: any, index: number) => (
              <option key={option.value || option.id || index} value={option.value || option.id}>
                {option.label || option.name || option.value || option.id}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            id={id}
            name={name}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={required}
            rows={3}
          />
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={id}
            name={name}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {Array.isArray(options) && options.map((option: any, index: number) => (
              <label key={option.value || option.id || index} className="flex items-center">
                <input
                  type="radio"
                  name={name}
                  value={option.value || option.id}
                  checked={value === (option.value || option.id)}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {option.label || option.name || option.value || option.id}
                </span>
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type={type || 'text'}
            id={id}
            name={name}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={required}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
    </div>
  );
};

// Main FormEngine component
interface FormEngineProps {
  template?: any;
  data?: any;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  sectionId?: string;
}

const FormEngine: React.FC<FormEngineProps> = ({
  template,
  data = {},
  onSave,
  onCancel,
  readOnly = false,
  sectionId
}) => {
  const [formData, setFormData] = useState(data);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Normalize template data
  useEffect(() => {
    if (!template) return;
    
    try {
      const normalizedSections = (template.sections || template.fields || [])
        .map(normalizeSection)
        .filter(Boolean)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      
      setSections(normalizedSections);
    } catch (error) {
      console.error('Error normalizing template:', error);
      setSections([]);
    }
  }, [template]);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save error:', error);
      setErrors({ general: 'Failed to save form data' });
    } finally {
      setLoading(false);
    }
  }, [formData, onSave]);

  const renderSection = (section: any) => {
    if (!section || !Array.isArray(section.fields)) return null;
    
    return (
      <div key={section.id} className="mb-8 p-6 border border-gray-200 rounded-lg bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {section.title || section.name}
        </h3>
        {section.description && (
          <p className="text-gray-600 text-sm mb-4">{section.description}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.fields.map((field: any) => (
            <FieldComponent
              key={field.id}
              field={field}
              value={formData[field.id] || formData[field.name]}
              onChange={(value) => handleFieldChange(field.id || field.name, value)}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading form...</span>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="max-w-4xl mx-auto p-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{errors.general}</p>
          </div>
        )}
        
        {sections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No form sections available</p>
            <p className="text-gray-400 text-sm mt-1">
              {template ? 'Template has no valid sections' : 'No template provided'}
            </p>
          </div>
        ) : (
          <>
            {sections.map(renderSection)}
            
            {!readOnly && (onSave || onCancel) && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 mt-8">
                <div className="flex justify-end space-x-3">
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                  {onSave && (
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default FormEngine;
