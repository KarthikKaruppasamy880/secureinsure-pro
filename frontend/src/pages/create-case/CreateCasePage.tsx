import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DynamicFormRenderer } from '../../components/dynamic-form/DynamicFormRenderer';
import { ExcelParserService, Template } from '../../services/excelParserService';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const CreateCasePage: React.FC = () => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  // Check if there's a published template available
  useEffect(() => {
    const loadPublishedTemplate = async () => {
      setIsLoading(true);
      try {
        // Call the API to get published templates
        const response = await api.get('/api/v1/auth/templates');
        console.log('API Response:', response.data); // Debug log
        
        // Handle different response structures
        let templates = response.data.data || response.data.templates || response.data;
          if (!Array.isArray(templates)) {
            templates = [templates];
          }
          
          const publishedTemplate = templates.find((t: any) => 
            t.status === 'PUBLISHED' || t.template?.status === 'PUBLISHED' || t.isDefault === true
          );
          
          if (publishedTemplate) {
            // Handle both direct template and nested template structure
            const templateData = publishedTemplate.template || publishedTemplate;
            if (templateData && templateData.fields) {
              setTemplate(templateData);
              toast.success('Loaded published template');
            } else if (publishedTemplate.isDefault) {
              // Create a mock template for dev bypass
              const mockTemplate = {
                id: publishedTemplate.id,
                name: publishedTemplate.name,
                fields: [
                  {
                    fieldName: 'insured_name',
                    fieldType: 'text',
                    required: true,
                    label: 'Insured Name'
                  },
                  {
                    fieldName: 'policy_type',
                    fieldType: 'select',
                    required: true,
                    label: 'Policy Type',
                    options: ['Term Life', 'Whole Life', 'IUL']
                  }
                ]
              };
              setTemplate(mockTemplate);
              toast.success('Loaded default template');
            } else {
              console.warn('Template data structure invalid:', templateData);
            }
          } else {
            // Create a default template for dev mode
            const defaultTemplate = {
              id: 'default-template',
              name: 'Default Case Template',
              fields: [
                { fieldName: 'insured_name', fieldType: 'text', required: true, label: 'Insured Name' },
                { fieldName: 'insured_dob', fieldType: 'date', required: true, label: 'Date of Birth' },
                { fieldName: 'insured_ssn', fieldType: 'text', required: false, label: 'SSN (Optional)' },
                { fieldName: 'policy_type', fieldType: 'select', required: true, label: 'Policy Type', options: ['Term Life', 'Whole Life', 'IUL', 'Variable Life'] },
                { fieldName: 'face_amount', fieldType: 'number', required: true, label: 'Face Amount' },
                { fieldName: 'premium', fieldType: 'number', required: false, label: 'Premium (Optional)' },
                { fieldName: 'agent', fieldType: 'text', required: false, label: 'Agent Name' }
              ]
            };
            setTemplate(defaultTemplate);
            toast.success('Loaded default template');
          }
      } catch (error) {
        console.warn('No published template found or API error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublishedTemplate();
  }, []);



  const handleFormValidationChange = (isValid: boolean, errors: Record<string, string[]>) => {
    setIsFormValid(isValid);
    setValidationErrors(errors);
  };

  const handleFormSubmit = async (values: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const caseData = {
        templateId: template?.id || 'template-1',
        templateVersion: template?.version || '1.0.0',
        formData: values,
        status: 'draft',
        insuredName: values.insured_name || 'Unknown',
        policyType: 'Term Life',
        coverageAmount: '$250,000',
        agent: 'Current User'
      };

      // Call the API to create a new case
      const response = await api.post('/api/v1/cases', caseData);
      
      toast.success('Case created successfully!');
      
      // Navigate to the new case - handle different response structures
      const caseId = response.data.data?.caseId || response.data.caseId;
      if (caseId) {
        navigate(`/cases/${caseId}`);
      } else {
        console.error('No caseId returned from API:', response.data);
        navigate('/dashboard');
      }
      
    } catch (error) {
      toast.error('Failed to create case');
      console.error('Case creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const draftData = {
        templateId: template?.id || 'template-1',
        templateVersion: template?.version || '1.0.0',
        formData: formValues,
        savedAt: new Date().toISOString(),
        status: 'draft'
      };

      // Save draft to localStorage
      localStorage.setItem('currentDraft', JSON.stringify(draftData));
      toast.success('Draft saved successfully');
      
    } catch (error) {
      toast.error('Failed to save draft');
      console.error('Draft save error:', error);
    }
  };

  const handleLoadDraft = () => {
    try {
      const draftData = localStorage.getItem('currentDraft');
      if (draftData) {
        const draft = JSON.parse(draftData);
        setFormValues(draft.formData);
        toast.success('Draft loaded successfully');
      } else {
        toast.info('No draft found');
      }
    } catch (error) {
      toast.error('Failed to load draft');
      console.error('Draft load error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span>Loading Template...</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Please wait while we load the template...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                <span>Create New Case</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Published Template Available</h3>
                <p className="text-gray-600 mb-6">
                  To create a new case, you need a published template. Please contact an administrator to create and publish a template.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-blue-800 mb-2">
                        Template Management
                      </p>
                      <p className="text-sm text-blue-700 mb-4">
                        Templates are managed in the Admin Template Studio. Only published templates can be used for case creation.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/admin')}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Go to Admin Panel
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p>Template creation process:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Admin uploads Excel file in Template Studio</li>
                      <li>Admin reviews and edits the generated template</li>
                      <li>Admin publishes the template</li>
                      <li>Users can then create cases using the published template</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Case
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Using template: {template?.name || 'Unnamed Template'} (v{template?.version || '1.0.0'})
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={template?.status === 'Published' ? 'default' : 'secondary'}>
              {template?.status || 'Unknown'}
            </Badge>
                         <span className="text-sm text-gray-500">
               {template?.tabs?.length || 0} tabs, {template?.fields?.length || 0} fields
             </span>
          </div>
        </div>
      </div>

      {/* Template Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Template Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="text-center p-4 bg-blue-50 rounded-lg">
               <div className="text-2xl font-bold text-blue-600">{template?.tabs?.length || 0}</div>
               <div className="text-sm text-blue-800">Excel Sheets</div>
             </div>
             <div className="text-center p-4 bg-green-50 rounded-lg">
               <div className="text-2xl font-bold text-green-600">{template?.fields?.length || 0}</div>
               <div className="text-sm text-green-800">Total Fields</div>
             </div>
             <div className="text-center p-4 bg-purple-50 rounded-lg">
               <div className="text-2xl font-bold text-purple-600">
                 {template?.fields?.filter(f => f?.required)?.length || 0}
               </div>
               <div className="text-sm text-purple-800">Required Fields</div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Case Information</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadDraft}
                disabled={isSubmitting}
              >
                Load Draft
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSubmitting || !template}
              >
                Save Draft
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {template && (
            <DynamicFormRenderer
              template={template}
              initialValues={formValues}
              onSubmit={handleFormSubmit}
              onValidationChange={handleFormValidationChange}
              disabled={isSubmitting}
              showValidation={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveDraft}
          variant="outline"
          disabled={isSubmitting || !template}
        >
          Save Draft
        </Button>
        <Button
          onClick={() => {
            const form = document.querySelector('form');
            form?.requestSubmit();
          }}
          disabled={isSubmitting || !isFormValid}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            'Create Case'
          )}
        </Button>
      </div>

      {/* Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Please fix the following errors:</h3>
          </div>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(validationErrors).map(([fieldKey, errors]) => {
                const field = template?.fields?.find(f => f.key === fieldKey);
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

export default CreateCasePage;
