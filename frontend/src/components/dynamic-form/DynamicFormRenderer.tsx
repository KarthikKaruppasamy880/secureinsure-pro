import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { DynamicField } from './DynamicField';
import { SectionContainer } from './CollapsibleSection';
import { NormalizedField, Template } from '../../services/excelParserService';
import { RulesEngine } from '../../lib/rulesEngine';
import { Validators } from '../../lib/validators';
import { toast } from 'react-hot-toast';

interface DynamicFormRendererProps {
  template: Template;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string[]>) => void;
  disabled?: boolean;
  showValidation?: boolean;
  className?: string;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  template,
  initialValues = {},
  onSubmit,
  onValidationChange,
  disabled = false,
  showValidation = true,
  className
}) => {
  // Safety check for template
  if (!template || !template.fields || !Array.isArray(template.fields)) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No template available or template structure is invalid.</p>
      </div>
    );
  }
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues);
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>({});
  const [fieldEnabled, setFieldEnabled] = useState<Record<string, boolean>>({});
  const [fieldRequired, setFieldRequired] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState(template?.tabs?.[0]?.key || '');

  // Initialize field states
  useEffect(() => {
    if (!template?.fields || !Array.isArray(template.fields)) {
      console.warn('Template fields not available or invalid');
      return;
    }

    const initialVisibility: Record<string, boolean> = {};
    const initialEnabled: Record<string, boolean> = {};
    const initialRequired: Record<string, boolean> = {};

    template.fields.forEach(field => {
      initialVisibility[field.key] = true;
      initialEnabled[field.key] = true;
      initialRequired[field.key] = field.required;
    });

    setFieldVisibility(initialVisibility);
    setFieldEnabled(initialEnabled);
    setFieldRequired(initialRequired);
  }, [template]);

  // Evaluate business rules when form values change
  useEffect(() => {
    if (!template?.fields || !Array.isArray(template.fields)) {
      return;
    }
    
    if (template.fields.some(field => field.rules && field.rules.length > 0)) {
      const ruleResults = RulesEngine.evaluateRules(
        template.fields.flatMap(field => field.rules || []),
        {
          fieldValues: formValues,
          fieldMetadata: Object.fromEntries(template.fields.map(f => [f.key, f]))
        }
      );

      if (ruleResults.actions.length > 0) {
        const updatedStates = RulesEngine.applyRuleResults(
          ruleResults.actions,
          formValues,
          fieldVisibility,
          fieldEnabled,
          fieldRequired
        );

        setFieldVisibility(updatedStates.fieldVisibility);
        setFieldEnabled(updatedStates.fieldEnabled);
        setFieldRequired(updatedStates.fieldRequired);
        setFormValues(updatedStates.formState);
      }
    }
  }, [formValues, template.fields]);

  // Validate form when values change
  useEffect(() => {
    if (!template?.fields || !Array.isArray(template.fields)) {
      return;
    }
    
    if (showValidation) {
      const validationContexts = template.fields
        .filter(field => fieldVisibility[field.key])
        .map(field => ({
          fieldId: field.id,
          fieldKey: field.key,
          value: formValues[field.key],
          type: field.type,
          format: field.format,
          required: fieldRequired[field.key],
          validations: field.validations
        }));

      const validationResult = Validators.validateForm(validationContexts);
      
      setValidationErrors(validationResult.errors);
      onValidationChange?.(validationResult.isValid, validationResult.errors);
    }
  }, [formValues, fieldVisibility, fieldRequired, template.fields, showValidation, onValidationChange]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix validation errors before submitting');
      return;
    }
    
    onSubmit?.(formValues);
  };

  // Group fields by tab and hierarchy
  const organizedFields = useMemo(() => {
    if (!template?.tabs || !template?.fields || !Array.isArray(template.tabs) || !Array.isArray(template.fields)) {
      return {};
    }
    
    const organized: Record<string, Record<string, Record<string, Record<string, NormalizedField[]>>>> = {};
    
    template.tabs.forEach(tab => {
      organized[tab.key] = {};
      
      const tabFields = template.fields.filter(field => field.path?.tab === tab.key);
      
      tabFields.forEach(field => {
        const { section, subsection, group, fieldset } = field.path || {};
        
        if (!organized[tab.key][section]) {
          organized[tab.key][section] = {};
        }
        if (!organized[tab.key][section][subsection]) {
          organized[tab.key][section][subsection] = {};
        }
        if (!organized[tab.key][section][subsection][group]) {
          organized[tab.key][section][subsection][group] = {};
        }
        if (!organized[tab.key][section][subsection][group][fieldset]) {
          organized[tab.key][section][subsection][group][fieldset] = [];
        }
        
        organized[tab.key][section][subsection][group][fieldset].push(field);
      });
    });
    
    return organized;
  }, [template]);

  // Render fields for a specific hierarchy level
  const renderFieldsForLevel = (
    fields: NormalizedField[],
    level: number,
    parentKey: string
  ): React.ReactNode[] => {
    if (!Array.isArray(fields)) {
      return [];
    }
    
    return fields
      .filter(field => field?.key && fieldVisibility[field.key])
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(field => (
        <DynamicField
          key={field.id || field.key}
          field={field}
          value={formValues[field.key]}
          onChange={(value) => handleFieldChange(field.key, value)}
          disabled={disabled || !fieldEnabled[field.key]}
          showValidation={showValidation}
        />
      ));
  };

  // Render sections recursively
  const renderSections = (
    tabKey: string,
    sections: Record<string, any>,
    level: number
  ): React.ReactNode[] => {
    if (!sections || typeof sections !== 'object') {
      return [];
    }
    
    return Object.entries(sections)
      .filter(([_, sectionData]) => {
        if (level === 1) return true;
        if (level === 2) return Object.keys(sectionData || {}).some(key => 
          typeof sectionData[key] === 'object' && !Array.isArray(sectionData[key])
        );
        if (level === 3) return Object.keys(sectionData || {}).some(key => 
          typeof sectionData[key] === 'object' && !Array.isArray(sectionData[key])
        );
        return Array.isArray(sectionData);
      })
      .map(([sectionName, sectionData]) => {
        if (level === 4 || Array.isArray(sectionData)) {
          // This is a fieldset level
          const fields = sectionData as NormalizedField[];
          const errorCount = fields.reduce((count, field) => {
            return count + (validationErrors[field?.key]?.length || 0);
          }, 0);
          
          return (
            <SectionContainer
              key={`${tabKey}-${sectionName}`}
              title={sectionName || 'General Fields'}
              level={level}
              fields={renderFieldsForLevel(fields, level, sectionName)}
              errorCount={errorCount}
            />
          );
        } else {
          // This is a container level
          return (
            <SectionContainer
              key={`${tabKey}-${sectionName}`}
              title={sectionName || 'Section'}
              level={level}
              fields={renderSections(tabKey, sectionData, level + 1)}
            />
          );
        }
      });
  };

  // Get error count for a tab
  const getTabErrorCount = (tabKey: string): number => {
    if (!template?.fields || !Array.isArray(template.fields)) {
      return 0;
    }
    
    return template.fields
      .filter(field => field.path?.tab === tabKey)
      .reduce((count, field) => {
        return count + (validationErrors[field.key]?.length || 0);
      }, 0);
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {template?.tabs?.map(tab => {
              const errorCount = getTabErrorCount(tab.key);
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="flex items-center space-x-2"
                >
                  <span>{tab.name}</span>
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {errorCount}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {template?.tabs?.map(tab => (
            <TabsContent key={tab.key} value={tab.key} className="space-y-6">
              <div className="space-y-6">
                {renderSections(tab.key, organizedFields[tab.key] || {}, 1)}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {onSubmit && (
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => setFormValues(initialValues)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={disabled || Object.keys(validationErrors).length > 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        )}
      </form>

      {/* Validation Summary */}
      {showValidation && Object.keys(validationErrors).length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Validation Errors</h3>
          </div>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(validationErrors).map(([fieldKey, errors]) => {
                const field = template?.fields?.find(f => f?.key === fieldKey);
                return errors.map((error, index) => (
                  <li key={`${fieldKey}-${index}`}>
                    <strong>{field?.label || fieldKey}:</strong> {error}
                  </li>
                ));
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
