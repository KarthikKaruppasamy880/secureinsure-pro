import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Edit, Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import templateMap from '../../config/templateMap.json';
import { validateSection } from '../../services/validationService';
import apiService from '../../services/apiService';

export interface InsuranceField {
  section: string;
  subsection?: string;
  fieldName: string;
  fieldType: string;
  required: boolean;
  helpText?: string;
  validation?: string;
  businessRules?: string;
  order: number;
}

interface TemplateRendererProps {
  fields: InsuranceField[];
  data: Record<string, any>;
  onDataChange: (fieldName: string, value: any) => void;
  readOnly?: boolean;
  showSubsections?: boolean;
  caseId?: string;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  fields,
  data,
  onDataChange,
  readOnly = false,
  showSubsections = true,
  caseId
}) => {
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setEditData(data);
  }, [data]);

  const handleEdit = (sectionKey: string) => {
    setEditMode(prev => ({ ...prev, [sectionKey]: true }));
    setValidationErrors(prev => ({ ...prev, [sectionKey]: [] }));
  };

  const handleSave = async (sectionKey: string) => {
    if (!caseId) {
      toast.error('Case ID is required to save changes');
      return;
    }

    setIsSaving(prev => ({ ...prev, [sectionKey]: true }));

    try {
      // Get section fields
      const sectionFields = getSectionFields(sectionKey);
      const sectionData = sectionFields.reduce((acc, fieldName) => {
        acc[fieldName] = editData[fieldName];
        return acc;
      }, {} as Record<string, any>);

      // Validate section
      const validation = validateSection(sectionData, sectionFields);
      if (!validation.isValid) {
        setValidationErrors(prev => ({ ...prev, [sectionKey]: validation.errors }));
        toast.error(`Validation failed: ${validation.errors.length} error(s) found`);
        setIsSaving(prev => ({ ...prev, [sectionKey]: false }));
        return;
      }

      // Clear validation errors
      setValidationErrors(prev => ({ ...prev, [sectionKey]: [] }));

      // Save to API based on section
      const response = await saveSectionToAPI(sectionKey, sectionData, caseId);
      
      if (response.success) {
        setEditMode(prev => ({ ...prev, [sectionKey]: false }));
        toast.success(`${sectionKey} saved successfully`);
      } else {
        toast.error(`Failed to save ${sectionKey}: ${response.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Error saving ${sectionKey}`);
    } finally {
      setIsSaving(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  const handleCancel = (sectionKey: string) => {
    setEditMode(prev => ({ ...prev, [sectionKey]: false }));
    setEditData(data); // Reset to original data
    setValidationErrors(prev => ({ ...prev, [sectionKey]: [] }));
  };

  const getSectionFields = (sectionKey: string): string[] => {
    const sectionData = templateMap[sectionKey as keyof typeof templateMap];
    if (typeof sectionData === 'object' && !Array.isArray(sectionData)) {
      // Handle subsections
      return Object.values(sectionData).flat();
    } else if (Array.isArray(sectionData)) {
      // Handle simple sections
      return sectionData;
    }
    return [];
  };

  const saveSectionToAPI = async (sectionKey: string, data: any, caseId: string) => {
    switch (sectionKey) {
      case 'Case Setup':
        return await apiService.updateCaseSetup(caseId, data);
      case 'Insured':
        return await apiService.updateInsured(caseId, data);
      case 'Beneficiary':
        return await apiService.updateBeneficiary(caseId, data);
      case 'Owner':
        return await apiService.updateOwner(caseId, data);
      case 'Payor':
        return await apiService.updatePayor(caseId, data);
      case 'Medical Information':
        return await apiService.updateMedical(caseId, data);
      case 'Premium Mode':
        return await apiService.updatePremium(caseId, data);
      default:
        // For other sections, use a generic update
        return await apiService.makeRequest(`/api/v1/cases/${caseId}/${sectionKey.toLowerCase().replace(/\s+/g, '-')}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
    }
  };

  const renderField = (field: InsuranceField) => {
    const value = editData[field.fieldName] || data[field.fieldName] || '';
    const isEditing = editMode[field.section];
    const isReadOnly = readOnly || !isEditing;
    const fieldErrors = validationErrors[field.section]?.filter(error => 
      error.includes(field.fieldName)
    ) || [];

    const handleChange = (newValue: any) => {
      if (isReadOnly) return;
      
      setEditData(prev => ({ ...prev, [field.fieldName]: newValue }));
      onDataChange(field.fieldName, newValue);
    };

    const renderInput = () => {
      const fieldId = `field-${field.fieldName.replace(/\s+/g, '-').toLowerCase()}`;
      const hasErrors = fieldErrors.length > 0;
      const ariaDescribedBy = [
        field.helpText ? `help-${fieldId}` : null,
        hasErrors ? fieldErrors.map((_, index) => `error-${fieldId}-${index}`).join(' ') : null
      ].filter(Boolean).join(' ');

      switch (field.fieldType) {
        case 'select':
          return (
            <Select value={value} onValueChange={handleChange} disabled={isReadOnly}>
              <SelectTrigger 
                className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
                id={fieldId}
                aria-describedby={ariaDescribedBy || undefined}
                aria-invalid={hasErrors}
              >
                <SelectValue placeholder={isReadOnly ? "Not provided" : `Select ${field.fieldName}`} />
              </SelectTrigger>
              <SelectContent>
                {getSelectOptions(field).map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case 'date':
          return (
            <Input
              id={fieldId}
              type="date"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "Not provided" : `Enter ${field.fieldName}`}
              className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );

        case 'email':
          return (
            <Input
              id={fieldId}
              type="email"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "Not provided" : `Enter ${field.fieldName}`}
              className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );

        case 'phone':
          return (
            <Input
              id={fieldId}
              type="tel"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "Not provided" : `Enter ${field.fieldName}`}
              className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );

        case 'tel':
          return (
            <Input
              id={fieldId}
              type="tel"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "Not provided" : `Enter ${field.fieldName}`}
              className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );

        case 'ssn':
          return (
            <Input
              id={fieldId}
              type="text"
              value={maskSSN(value) || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "Not provided" : "***-**-****"}
              className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );

        case 'zip':
          return (
            <Input
              id={fieldId}
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "Not provided" : `Enter ${field.fieldName}`}
              className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
              maxLength={10}
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );

        case 'currency':
          return (
            <Input
              id={fieldId}
              type="number"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "Not provided" : `Enter ${field.fieldName}`}
              className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
              min="0"
              step="0.01"
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );

        case 'number':
          return (
            <Input
              id={fieldId}
              type="number"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "Not provided" : `Enter ${field.fieldName}`}
              className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );

        case 'textarea':
          return (
            <Textarea
              id={fieldId}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "Not provided" : `Enter ${field.fieldName}`}
              className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
              rows={3}
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );

        case 'checkbox':
          return (
            <Checkbox
              id={fieldId}
              checked={!!value}
              onCheckedChange={handleChange}
              disabled={isReadOnly}
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );

        default:
          return (
            <Input
              id={fieldId}
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "Not provided" : `Enter ${field.fieldName}`}
              className={`w-full ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-describedby={ariaDescribedBy || undefined}
              aria-invalid={hasErrors}
            />
          );
      }
    };

    return (
      <div key={field.fieldName} className="space-y-2" data-field={field.fieldName}>
        <label 
          htmlFor={`field-${field.fieldName.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-sm font-medium text-gray-700"
        >
          {field.fieldName}
          {field.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        <div className="relative">
          {renderInput()}
          {fieldErrors.length > 0 && (
            <div 
              className="flex items-start gap-2 mt-1"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="text-xs text-red-600">
                {fieldErrors.map((error, index) => (
                  <div key={index} id={`error-${field.fieldName.replace(/\s+/g, '-').toLowerCase()}-${index}`}>
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {field.helpText && (
          <p className="text-xs text-gray-500 mt-1" id={`help-${field.fieldName.replace(/\s+/g, '-').toLowerCase()}`}>
            {field.helpText}
          </p>
        )}
        {field.validation && (
          <p className="text-xs text-blue-600 mt-1">
            Validation: {field.validation}
          </p>
        )}
      </div>
    );
  };

  const getSelectOptions = (field: InsuranceField) => {
    // Return appropriate options based on field type
    switch (field.fieldName) {
      case 'Gender':
        return [
          { value: 'Male', label: 'Male' },
          { value: 'Female', label: 'Female' },
          { value: 'Other', label: 'Other' }
        ];
      case 'State':
      case 'U.S. State of Birth':
      case 'Issuing State':
      case 'Owner State':
      case 'Secondary State':
        return [
          { value: 'AL', label: 'Alabama' },
          { value: 'AK', label: 'Alaska' },
          { value: 'AZ', label: 'Arizona' },
          { value: 'AR', label: 'Arkansas' },
          { value: 'CA', label: 'California' },
          { value: 'CO', label: 'Colorado' },
          { value: 'CT', label: 'Connecticut' },
          { value: 'DE', label: 'Delaware' },
          { value: 'FL', label: 'Florida' },
          { value: 'GA', label: 'Georgia' },
          { value: 'HI', label: 'Hawaii' },
          { value: 'ID', label: 'Idaho' },
          { value: 'IL', label: 'Illinois' },
          { value: 'IN', label: 'Indiana' },
          { value: 'IA', label: 'Iowa' },
          { value: 'KS', label: 'Kansas' },
          { value: 'KY', label: 'Kentucky' },
          { value: 'LA', label: 'Louisiana' },
          { value: 'ME', label: 'Maine' },
          { value: 'MD', label: 'Maryland' },
          { value: 'MA', label: 'Massachusetts' },
          { value: 'MI', label: 'Michigan' },
          { value: 'MN', label: 'Minnesota' },
          { value: 'MS', label: 'Mississippi' },
          { value: 'MO', label: 'Missouri' },
          { value: 'MT', label: 'Montana' },
          { value: 'NE', label: 'Nebraska' },
          { value: 'NV', label: 'Nevada' },
          { value: 'NH', label: 'New Hampshire' },
          { value: 'NJ', label: 'New Jersey' },
          { value: 'NM', label: 'New Mexico' },
          { value: 'NY', label: 'New York' },
          { value: 'NC', label: 'North Carolina' },
          { value: 'ND', label: 'North Dakota' },
          { value: 'OH', label: 'Ohio' },
          { value: 'OK', label: 'Oklahoma' },
          { value: 'OR', label: 'Oregon' },
          { value: 'PA', label: 'Pennsylvania' },
          { value: 'RI', label: 'Rhode Island' },
          { value: 'SC', label: 'South Carolina' },
          { value: 'SD', label: 'South Dakota' },
          { value: 'TN', label: 'Tennessee' },
          { value: 'TX', label: 'Texas' },
          { value: 'UT', label: 'Utah' },
          { value: 'VT', label: 'Vermont' },
          { value: 'VA', label: 'Virginia' },
          { value: 'WA', label: 'Washington' },
          { value: 'WV', label: 'West Virginia' },
          { value: 'WI', label: 'Wisconsin' },
          { value: 'WY', label: 'Wyoming' }
        ];
      case 'Country':
      case 'Country if born outside the U.S.':
        return [
          { value: 'United States', label: 'United States' },
          { value: 'Canada', label: 'Canada' },
          { value: 'Mexico', label: 'Mexico' },
          { value: 'United Kingdom', label: 'United Kingdom' },
          { value: 'Germany', label: 'Germany' },
          { value: 'France', label: 'France' },
          { value: 'Italy', label: 'Italy' },
          { value: 'Spain', label: 'Spain' },
          { value: 'Japan', label: 'Japan' },
          { value: 'China', label: 'China' },
          { value: 'India', label: 'India' },
          { value: 'Australia', label: 'Australia' },
          { value: 'Brazil', label: 'Brazil' },
          { value: 'Argentina', label: 'Argentina' }
        ];
      case 'Insured Type':
        return [
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'Tertiary', label: 'Tertiary' }
        ];
      case 'Are you currently employed, a full-time student, or a domestic partner?':
        return [
          { value: 'Employed', label: 'Employed' },
          { value: 'Full-time Student', label: 'Full-time Student' },
          { value: 'Domestic Partner', label: 'Domestic Partner' },
          { value: 'Unemployed', label: 'Unemployed' },
          { value: 'Retired', label: 'Retired' }
        ];
      case 'Language of the Application':
        return [
          { value: 'English', label: 'English' },
          { value: 'Spanish', label: 'Spanish' },
          { value: 'French', label: 'French' },
          { value: 'German', label: 'German' },
          { value: 'Chinese', label: 'Chinese' },
          { value: 'Japanese', label: 'Japanese' }
        ];
      case 'Product Type':
        return [
          { value: 'Term Life', label: 'Term Life' },
          { value: 'Whole Life', label: 'Whole Life' },
          { value: 'Universal Life', label: 'Universal Life' },
          { value: 'Variable Life', label: 'Variable Life' }
        ];
      case 'Priority':
        return [
          { value: 'Low', label: 'Low' },
          { value: 'Medium', label: 'Medium' },
          { value: 'High', label: 'High' },
          { value: 'Urgent', label: 'Urgent' }
        ];
      case 'Submission':
        return [
          { value: 'Draft', label: 'Draft' },
          { value: 'Submitted', label: 'Submitted' },
          { value: 'Under Review', label: 'Under Review' },
          { value: 'Complete', label: 'Complete' }
        ];
      case 'Life Insurance Qualification Test':
        return [
          { value: 'CVAT', label: 'CVAT' },
          { value: 'MEC', label: 'MEC' },
          { value: 'GPT', label: 'GPT' },
          { value: 'None', label: 'None' }
        ];
      case 'Rate Class Applied For':
        return [
          { value: 'Preferred Plus', label: 'Preferred Plus' },
          { value: 'Preferred', label: 'Preferred' },
          { value: 'Standard Plus', label: 'Standard Plus' },
          { value: 'Standard', label: 'Standard' },
          { value: 'Substandard', label: 'Substandard' }
        ];
      case 'Insurance Age Basis':
        return [
          { value: 'Nearest Birthday', label: 'Nearest Birthday' },
          { value: 'Last Birthday', label: 'Last Birthday' },
          { value: 'Next Birthday', label: 'Next Birthday' }
        ];
      case 'Primary Beneficiary Relationship':
      case 'Secondary Beneficiary Relationship':
      case 'Owner Relationship to Insured':
      case 'Payor Relationship to Insured':
        return [
          { value: 'Self', label: 'Self' },
          { value: 'Spouse', label: 'Spouse' },
          { value: 'Child', label: 'Child' },
          { value: 'Parent', label: 'Parent' },
          { value: 'Sibling', label: 'Sibling' },
          { value: 'Grandparent', label: 'Grandparent' },
          { value: 'Grandchild', label: 'Grandchild' },
          { value: 'Other', label: 'Other' }
        ];
      case 'Payment Method':
        return [
          { value: 'Bank Draft', label: 'Bank Draft' },
          { value: 'Credit Card', label: 'Credit Card' },
          { value: 'Check', label: 'Check' },
          { value: 'Money Order', label: 'Money Order' }
        ];
      case 'Secondary Address Type':
        return [
          { value: 'Mailing Address', label: 'Mailing Address' },
          { value: 'Work Address', label: 'Work Address' },
          { value: 'Seasonal Address', label: 'Seasonal Address' },
          { value: 'Other', label: 'Other' }
        ];
      case 'Previous Policy Type':
        return [
          { value: 'Term Life', label: 'Term Life' },
          { value: 'Whole Life', label: 'Whole Life' },
          { value: 'Universal Life', label: 'Universal Life' },
          { value: 'Variable Life', label: 'Variable Life' },
          { value: 'Group Life', label: 'Group Life' }
        ];
      case 'Previous Policy Status':
        return [
          { value: 'Active', label: 'Active' },
          { value: 'Lapsed', label: 'Lapsed' },
          { value: 'Surrendered', label: 'Surrendered' },
          { value: 'Matured', label: 'Matured' },
          { value: 'Cancelled', label: 'Cancelled' }
        ];
      case 'Travel Frequency':
        return [
          { value: 'Never', label: 'Never' },
          { value: 'Rarely', label: 'Rarely' },
          { value: 'Occasionally', label: 'Occasionally' },
          { value: 'Frequently', label: 'Frequently' },
          { value: 'Very Frequently', label: 'Very Frequently' }
        ];
      case 'Aviation Activities':
      case 'Military Service':
        return [
          { value: 'Yes', label: 'Yes' },
          { value: 'No', label: 'No' }
        ];
      case 'Military Branch':
        return [
          { value: 'Army', label: 'Army' },
          { value: 'Navy', label: 'Navy' },
          { value: 'Air Force', label: 'Air Force' },
          { value: 'Marines', label: 'Marines' },
          { value: 'Coast Guard', label: 'Coast Guard' },
          { value: 'Space Force', label: 'Space Force' }
        ];
      case 'Blood Type':
        return [
          { value: 'A+', label: 'A+' },
          { value: 'A-', label: 'A-' },
          { value: 'B+', label: 'B+' },
          { value: 'B-', label: 'B-' },
          { value: 'AB+', label: 'AB+' },
          { value: 'AB-', label: 'AB-' },
          { value: 'O+', label: 'O+' },
          { value: 'O-', label: 'O-' }
        ];
      case 'Premium Payment Frequency':
        return [
          { value: 'Monthly', label: 'Monthly' },
          { value: 'Quarterly', label: 'Quarterly' },
          { value: 'Semi-annually', label: 'Semi-annually' },
          { value: 'Annually', label: 'Annually' }
        ];
      case 'Premium Due Date':
        return [
          { value: '1st of month', label: '1st of month' },
          { value: '15th of month', label: '15th of month' },
          { value: 'Last day of month', label: 'Last day of month' }
        ];
      case 'Grace Period':
        return [
          { value: '15 days', label: '15 days' },
          { value: '31 days', label: '31 days' },
          { value: '60 days', label: '60 days' }
        ];
      default:
        return [];
    }
  };

  const maskSSN = (ssn: string) => {
    if (!ssn) return '';
    if (ssn.length < 4) return ssn;
    return `***-**-${ssn.slice(-4)}`;
  };

  const renderSection = (sectionName: string, sectionFields: InsuranceField[]) => {
    const isEditing = editMode[sectionName];
    const sectionData = templateMap[sectionName as keyof typeof templateMap];

    if (typeof sectionData === 'object' && !Array.isArray(sectionData)) {
      // Handle subsections (like Insured)
      return (
        <Card key={sectionName} className="rounded-2xl border bg-white shadow-sm p-5 mb-6">
          <CardHeader className="rounded-t-2xl bg-primary-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold tracking-tight text-white">
                {sectionName}
              </CardTitle>
              {!readOnly && (
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={() => handleEdit(sectionName)}
                      variant="outline"
                      size="sm"
                      className="bg-white text-primary-600 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSave(sectionName)}
                        variant="outline"
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        disabled={isSaving[sectionName]}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving[sectionName] ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={() => handleCancel(sectionName)}
                        variant="outline"
                        size="sm"
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {Object.entries(sectionData).map(([subsectionName, fieldNames]) => (
              <div key={subsectionName} className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                  {subsectionName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fieldNames.map(fieldName => {
                    const field = sectionFields.find(f => f.fieldName === fieldName);
                    if (!field) return null;
                    return renderField(field);
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    } else {
      // Handle simple sections (like Case Setup)
      return (
        <Card key={sectionName} className="rounded-2xl border bg-white shadow-sm p-5 mb-6">
          <CardHeader className="rounded-t-2xl bg-primary-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold tracking-tight text-white">
                {sectionName}
              </CardTitle>
              {!readOnly && (
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={() => handleEdit(sectionName)}
                      variant="outline"
                      size="sm"
                      className="bg-white text-primary-600 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSave(sectionName)}
                        variant="outline"
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        disabled={isSaving[sectionName]}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving[sectionName] ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={() => handleCancel(sectionName)}
                        variant="outline"
                        size="sm"
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sectionFields.map(field => renderField(field))}
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  // Group fields by section
  const fieldsBySection = fields.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = [];
    }
    acc[field.section].push(field);
    return acc;
  }, {} as Record<string, InsuranceField[]>);

  // Sort sections according to template map
  const sortedSections = Object.keys(templateMap).filter(section => 
    fieldsBySection[section]
  );

  return (
    <div className="space-y-6">
      {sortedSections.map(sectionName => 
        renderSection(sectionName, fieldsBySection[sectionName])
      )}
    </div>
  );
};

export default TemplateRenderer;
