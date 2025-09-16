import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X,
  FileSpreadsheet,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ExcelFormService, ExcelFormTemplate, ExcelField } from '../../services/excelFormService';

interface TemplateStudioProps {
  className?: string;
}

export const TemplateStudio: React.FC<TemplateStudioProps> = ({ className = "" }) => {
  const [templates, setTemplates] = useState<ExcelFormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ExcelFormTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<ExcelField | null>(null);
  const [activeTab, setActiveTab] = useState('templates');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for development
  React.useEffect(() => {
    const mockTemplate: ExcelFormTemplate = {
      id: 'template_1',
      name: 'Life Insurance Application',
      description: 'Standard life insurance application form',
      version: '1.0.0',
      fields: [
        {
          key: 'insured_name',
          label: 'Insured Name',
          type: 'text',
          required: true,
          section: 'Insured',
          order: 1,
          description: 'Full name of the insured person'
        },
        {
          key: 'insured_dob',
          label: 'Date of Birth',
          type: 'date',
          required: true,
          section: 'Insured',
          order: 2,
          description: 'Date of birth of the insured person'
        }
      ],
      sections: ['Insured'],
      metadata: {
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        totalFields: 2,
        requiredFields: 2
      }
    };
    setTemplates([mockTemplate]);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await ExcelFormService.processExcelFile(file);
      
      if (result.success && result.template) {
        setTemplates(prev => [result.template!, ...prev]);
        setSelectedTemplate(result.template);
        setActiveTab('editor');
        toast.success(`Template "${result.template.name}" imported successfully!`);
      } else {
        toast.error(`Import failed: ${result.errors?.join(', ')}`);
      }
    } catch (error) {
      toast.error('Failed to process Excel file');
      console.error('File processing error:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportTemplate = async (template: ExcelFormTemplate) => {
    try {
      const blob = await ExcelFormService.exportTemplateToExcel(template);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}_template.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Template exported successfully!');
    } catch (error) {
      toast.error('Failed to export template');
      console.error('Export error:', error);
    }
  };

  const handleCreateTemplate = () => {
    const newTemplate: ExcelFormTemplate = {
      id: `template_${Date.now()}`,
      name: 'New Template',
      description: 'New form template',
      version: '1.0.0',
      fields: [],
      sections: [],
      metadata: {
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        totalFields: 0,
        requiredFields: 0
      }
    };
    
    setTemplates(prev => [newTemplate, ...prev]);
    setSelectedTemplate(newTemplate);
    setIsEditing(true);
    setActiveTab('editor');
  };

  const handleEditTemplate = (template: ExcelFormTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(false);
    setActiveTab('editor');
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
    toast.success('Template deleted successfully!');
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    const validation = ExcelFormService.validateTemplate(selectedTemplate);
    
    if (!validation.isValid) {
      toast.error(`Template validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    setTemplates(prev => 
      prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t)
    );
    setIsEditing(false);
    toast.success('Template saved successfully!');
  };

  const handleAddField = () => {
    if (!selectedTemplate) return;

    const newField: ExcelField = {
      key: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      section: 'General',
      order: selectedTemplate.fields.length + 1,
      description: ''
    };

    const updatedTemplate = {
      ...selectedTemplate,
      fields: [...selectedTemplate.fields, newField],
      sections: Array.from(new Set([...selectedTemplate.sections, 'General'])).sort()
    };

    setSelectedTemplate(updatedTemplate);
    setEditingField(newField);
  };

  const handleEditField = (field: ExcelField) => {
    setEditingField(field);
  };

  const handleSaveField = () => {
    if (!editingField || !selectedTemplate) return;

    const updatedFields = selectedTemplate.fields.map(f => 
      f.key === editingField.key ? editingField : f
    );

    const updatedTemplate = {
      ...selectedTemplate,
      fields: updatedFields,
      sections: Array.from(new Set(updatedFields.map(f => f.section))).sort()
    };

    setSelectedTemplate(updatedTemplate);
    setEditingField(null);
    toast.success('Field updated successfully!');
  };

  const handleDeleteField = (fieldKey: string) => {
    if (!selectedTemplate) return;

    const updatedFields = selectedTemplate.fields.filter(f => f.key !== fieldKey);
    const updatedTemplate = {
      ...selectedTemplate,
      fields: updatedFields,
      sections: Array.from(new Set(updatedFields.map(f => f.section))).sort()
    };

    setSelectedTemplate(updatedTemplate);
    toast.success('Field deleted successfully!');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Studio</h1>
          <p className="text-gray-600 mt-2">Create and manage dynamic form templates from Excel files</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
          <Button
            onClick={handleCreateTemplate}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportTemplate(template)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Version {template.version}</span>
                    <span>{template.fields.length} fields</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.sections.map((section) => (
                      <Badge key={section} variant="secondary" className="text-xs">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          {selectedTemplate ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedTemplate.name}</h2>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSaveTemplate} className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        Save Template
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      Edit Template
                    </Button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Input
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        name: e.target.value
                      })}
                      placeholder="Template name"
                      className="max-w-md"
                    />
                    <Input
                      value={selectedTemplate.description}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        description: e.target.value
                      })}
                      placeholder="Template description"
                      className="max-w-md"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Fields</h3>
                    <Button onClick={handleAddField} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedTemplate.fields.map((field) => (
                      <Card key={field.key} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Input
                              value={field.label}
                              onChange={(e) => {
                                const updatedFields = selectedTemplate.fields.map(f =>
                                  f.key === field.key ? { ...f, label: e.target.value } : f
                                );
                                setSelectedTemplate({ ...selectedTemplate, fields: updatedFields });
                              }}
                              placeholder="Field label"
                            />
                            <select
                              value={field.type}
                              onChange={(e) => {
                                const updatedFields = selectedTemplate.fields.map(f =>
                                  f.key === field.key ? { ...f, type: e.target.value as ExcelField['type'] } : f
                                );
                                setSelectedTemplate({ ...selectedTemplate, fields: updatedFields });
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="select">Select</option>
                              <option value="textarea">Textarea</option>
                              <option value="checkbox">Checkbox</option>
                              <option value="radio">Radio</option>
                            </select>
                            <Input
                              value={field.section}
                              onChange={(e) => {
                                const updatedFields = selectedTemplate.fields.map(f =>
                                  f.key === field.key ? { ...f, section: e.target.value } : f
                                );
                                setSelectedTemplate({ ...selectedTemplate, fields: updatedFields });
                              }}
                              placeholder="Section"
                            />
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => {
                                  const updatedFields = selectedTemplate.fields.map(f =>
                                    f.key === field.key ? { ...f, required: e.target.checked } : f
                                  );
                                  setSelectedTemplate({ ...selectedTemplate, fields: updatedFields });
                                }}
                                className="h-4 w-4"
                              />
                              <span className="text-sm">Required</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditField(field)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteField(field.key)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!isEditing && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Template Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTemplate.fields.map((field) => (
                      <Card key={field.key} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{field.label}</h4>
                          <Badge variant={field.required ? "default" : "secondary"}>
                            {field.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Type:</strong> {field.type}</p>
                          <p><strong>Section:</strong> {field.section}</p>
                          {field.description && <p><strong>Description:</strong> {field.description}</p>}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
              <p className="text-gray-600 mb-4">Choose a template from the Templates tab or create a new one</p>
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {selectedTemplate ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Form Preview</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{selectedTemplate.fields.length} fields</Badge>
                  <Badge variant="outline">{selectedTemplate.sections.length} sections</Badge>
                </div>
              </div>

              <div className="space-y-6">
                {selectedTemplate.sections.map((section) => (
                  <Card key={section}>
                    <CardHeader>
                      <CardTitle className="text-lg">{section}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTemplate.fields
                        .filter(field => field.section === section)
                        .sort((a, b) => a.order - b.order)
                        .map((field) => (
                          <div key={field.key} className="space-y-2">
                            <label className="text-sm font-medium">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {field.type === 'text' && (
                              <Input placeholder={`Enter ${field.label.toLowerCase()}`} />
                            )}
                            {field.type === 'number' && (
                              <Input type="number" placeholder={`Enter ${field.label.toLowerCase()}`} />
                            )}
                            {field.type === 'date' && (
                              <Input type="date" />
                            )}
                            {field.type === 'select' && (
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="">Select {field.label.toLowerCase()}</option>
                                {field.validation?.options?.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            )}
                            {field.type === 'textarea' && (
                              <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={3}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                              />
                            )}
                            {field.type === 'checkbox' && (
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" className="h-4 w-4" />
                                <span className="text-sm text-gray-600">Check this box</span>
                              </div>
                            )}
                            {field.type === 'radio' && (
                              <div className="space-y-2">
                                {field.validation?.options?.map((option) => (
                                  <div key={option} className="flex items-center space-x-2">
                                    <input type="radio" name={field.key} value={option} className="h-4 w-4" />
                                    <span className="text-sm text-gray-600">{option}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {field.description && (
                              <p className="text-xs text-gray-500">{field.description}</p>
                            )}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Template to Preview</h3>
              <p className="text-gray-600">Select a template from the Templates tab to see a preview</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
