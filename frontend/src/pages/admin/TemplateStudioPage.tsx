import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  FileSpreadsheet, 
  Upload, 
  Save, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Download, 
  History,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  Copy,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ExcelParserService, Template, NormalizedField } from '../../services/excelParserService';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateVersion {
  id: string;
  version: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  createdBy: string;
  template: Template;
}

interface AuditEntry {
  id: string;
  action: string;
  templateId: string;
  version: string;
  userId: string;
  timestamp: string;
  details: string;
}

const TemplateStudioPage: React.FC = () => {
  const { state } = useAuth();
  const [templates, setTemplates] = useState<TemplateVersion[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [editingField, setEditingField] = useState<NormalizedField | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Load mock templates
    const mockTemplates: TemplateVersion[] = [
      {
        id: '1',
        version: '1.0.0',
        status: 'PUBLISHED',
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin_test',
        template: {
          id: 'template-1',
          name: 'Life Insurance Application',
          description: 'Standard life insurance application form',
          version: '1.0.0',
          status: 'PUBLISHED',
          createdAt: '2024-01-15T10:00:00Z',
          createdBy: 'admin_test',
          fields: []
        }
      }
    ];
    setTemplates(mockTemplates);

    // Load mock audit trail
    const mockAudit: AuditEntry[] = [
      {
        id: '1',
        action: 'TEMPLATE_CREATED',
        templateId: 'template-1',
        version: '1.0.0',
        userId: 'admin_test',
        timestamp: '2024-01-15T10:00:00Z',
        details: 'Created new life insurance application template'
      }
    ];
    setAuditTrail(mockAudit);
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const template = await ExcelParserService.parseExcelWorkbook(file);
      
      // Generate new template version
      const newTemplate: Template = {
        ...template,
        id: `template-${Date.now()}`,
        version: '1.0.0',
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        createdBy: state.user?.username || 'unknown'
      };

      setCurrentTemplate(newTemplate);
      toast.success('Excel template parsed successfully!');
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error('Failed to parse Excel file. Please check the format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate) return;

    setIsSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedTemplate = { ...currentTemplate };
      setCurrentTemplate(updatedTemplate);
      
      // Add to templates list if new
      if (!templates.find(t => t.template.id === updatedTemplate.id)) {
        const newVersion: TemplateVersion = {
          id: Date.now().toString(),
          version: updatedTemplate.version,
          status: updatedTemplate.status,
          createdAt: updatedTemplate.createdAt,
          createdBy: updatedTemplate.createdBy,
          template: updatedTemplate
        };
        setTemplates([...templates, newVersion]);
      }

      // Add audit entry
      const auditEntry: AuditEntry = {
        id: Date.now().toString(),
        action: 'TEMPLATE_SAVED',
        templateId: updatedTemplate.id,
        version: updatedTemplate.version,
        userId: state.user?.username || 'unknown',
        timestamp: new Date().toISOString(),
        details: 'Template saved as draft'
      };
      setAuditTrail([auditEntry, ...auditTrail]);

      toast.success('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishTemplate = async () => {
    if (!currentTemplate) return;

    setIsPublishing(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const publishedTemplate = { 
        ...currentTemplate, 
        status: 'PUBLISHED',
        version: incrementVersion(currentTemplate.version)
      };
      
      setCurrentTemplate(publishedTemplate);
      
      // Update templates list
      const updatedTemplates = templates.map(t => 
        t.template.id === publishedTemplate.id 
          ? { ...t, template: publishedTemplate, status: 'PUBLISHED' }
          : t
      );
      setTemplates(updatedTemplates);

      // Add audit entry
      const auditEntry: AuditEntry = {
        id: Date.now().toString(),
        action: 'TEMPLATE_PUBLISHED',
        templateId: publishedTemplate.id,
        version: publishedTemplate.version,
        userId: state.user?.username || 'unknown',
        timestamp: new Date().toISOString(),
        details: `Template published as version ${publishedTemplate.version}`
      };
      setAuditTrail([auditEntry, ...auditTrail]);

      toast.success('Template published successfully!');
    } catch (error) {
      console.error('Error publishing template:', error);
      toast.error('Failed to publish template.');
    } finally {
      setIsPublishing(false);
    }
  };

  const incrementVersion = (version: string): string => {
    const parts = version.split('.');
    const major = parseInt(parts[0]);
    const minor = parseInt(parts[1]);
    const patch = parseInt(parts[2]);
    return `${major}.${minor}.${patch + 1}`;
  };

  const handleExportTemplate = () => {
    if (!currentTemplate) return;

    const dataStr = JSON.stringify(currentTemplate, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTemplate.name}-v${currentTemplate.version}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Template exported successfully!');
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string);
        setCurrentTemplate(template);
        toast.success('Template imported successfully!');
      } catch (error) {
        toast.error('Invalid template file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleEditField = (field: NormalizedField) => {
    setEditingField(field);
    setShowFieldEditor(true);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!currentTemplate) return;

    const updatedFields = currentTemplate.fields.filter(f => f.id !== fieldId);
    setCurrentTemplate({ ...currentTemplate, fields: updatedFields });
    toast.success('Field deleted successfully!');
  };

  const handleAddField = () => {
    if (!currentTemplate) return;

    const newField: NormalizedField = {
      id: `field-${Date.now()}`,
      key: `new_field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      order: currentTemplate.fields.length + 1,
      path: {
        level1: 'New Section',
        level2: 'New Subsection',
        level3: 'New Group',
        level4: 'New Fieldset'
      },
      validations: [],
      options: undefined,
      rules: undefined,
      format: undefined,
      extensions: {}
    };

    setCurrentTemplate({ ...currentTemplate, fields: [...currentTemplate.fields, newField] });
    setEditingField(newField);
    setShowFieldEditor(true);
  };

  const renderTemplateList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Template Versions</h3>
        <Button onClick={() => setCurrentTemplate(null)} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>
      
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{template.template.name}</h4>
                  <p className="text-sm text-gray-600">{template.template.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={template.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {template.status}
                    </Badge>
                    <span className="text-sm text-gray-500">v{template.version}</span>
                    <span className="text-sm text-gray-500">
                      by {template.createdBy} on {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentTemplate(template.template)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {template.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentTemplate(template.template)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTemplateEditor = () => (
    <div className="space-y-6">
      {!currentTemplate ? (
        <div className="text-center py-12">
          <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
          <p className="text-gray-500 mb-6">Upload an Excel file to create a new template or select an existing one to edit.</p>
          
          <div className="flex justify-center">
            <div className="relative">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="excel-upload"
              />
              <Label htmlFor="excel-upload" className="cursor-pointer">
                <Button disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1" />
                  )}
                  {isUploading ? 'Uploading...' : 'Upload Excel Template'}
                </Button>
              </Label>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{currentTemplate.name}</h3>
              <p className="text-sm text-gray-600">{currentTemplate.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={currentTemplate.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {currentTemplate.status}
                </Badge>
                <span className="text-sm text-gray-500">v{currentTemplate.version}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSaveTemplate}
                disabled={isSaving}
                variant="outline"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Draft
              </Button>
              
              {currentTemplate.status === 'DRAFT' && (
                <Button
                  onClick={handlePublishTemplate}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Publish
                </Button>
              )}
              
              <Button variant="outline" onClick={handleExportTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Template Details</h4>
                <Button size="sm" onClick={handleAddField}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate({
                      ...currentTemplate,
                      name: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={currentTemplate.description}
                    onChange={(e) => setCurrentTemplate({
                      ...currentTemplate,
                      description: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Fields ({currentTemplate.fields.length})</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentTemplate.fields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{field.label}</div>
                      <div className="text-sm text-gray-500">
                        {field.path.level1} → {field.path.level2} → {field.path.level3} → {field.path.level4}
                      </div>
                      <div className="text-xs text-gray-400">
                        Type: {field.type} | Required: {field.required ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditField(field)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderAuditTrail = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Audit Trail</h3>
      <div className="space-y-2">
        {auditTrail.map((entry) => (
          <div key={entry.id} className="p-3 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{entry.action}</div>
                <div className="text-sm text-gray-600">{entry.details}</div>
                <div className="text-xs text-gray-500">
                  Template: {entry.templateId} v{entry.version}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{entry.userId}</div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Template Studio</h1>
        <p className="text-gray-600 mt-2">
          Manage dynamic form templates, create new ones from Excel, and publish them for use in case creation.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Template Versions</TabsTrigger>
          <TabsTrigger value="editor">Template Editor</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {renderTemplateList()}
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          {renderTemplateEditor()}
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {renderAuditTrail()}
        </TabsContent>
      </Tabs>

      {/* Field Editor Dialog */}
      <Dialog open={showFieldEditor} onOpenChange={setShowFieldEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Field' : 'Add New Field'}
            </DialogTitle>
          </DialogHeader>
          
          {editingField && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field-label">Field Label</Label>
                  <Input
                    id="field-label"
                    value={editingField.label}
                    onChange={(e) => setEditingField({
                      ...editingField,
                      label: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="field-type">Field Type</Label>
                  <Select
                    value={editingField.type}
                    onValueChange={(value) => setEditingField({
                      ...editingField,
                      type: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field-required">Required</Label>
                  <Select
                    value={editingField.required ? 'true' : 'false'}
                    onValueChange={(value) => setEditingField({
                      ...editingField,
                      required: value === 'true'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="field-order">Order</Label>
                  <Input
                    id="field-order"
                    type="number"
                    value={editingField.order}
                    onChange={(e) => setEditingField({
                      ...editingField,
                      order: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level1">Section</Label>
                  <Input
                    id="level1"
                    value={editingField.path.level1}
                    onChange={(e) => setEditingField({
                      ...editingField,
                      path: { ...editingField.path, level1: e.target.value }
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="level2">Subsection</Label>
                  <Input
                    id="level2"
                    value={editingField.path.level2}
                    onChange={(e) => setEditingField({
                      ...editingField,
                      path: { ...editingField.path, level2: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level3">Group</Label>
                  <Input
                    id="level3"
                    value={editingField.path.level3}
                    onChange={(e) => setEditingField({
                      ...editingField,
                      path: { ...editingField.path, level3: e.target.value }
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="level4">Fieldset</Label>
                  <Input
                    id="level4"
                    value={editingField.path.level4}
                    onChange={(e) => setEditingField({
                      ...editingField,
                      path: { ...editingField.path, level4: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFieldEditor(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingField && currentTemplate) {
                      const updatedFields = currentTemplate.fields.map(f =>
                        f.id === editingField.id ? editingField : f
                      );
                      setCurrentTemplate({ ...currentTemplate, fields: updatedFields });
                      setShowFieldEditor(false);
                      setEditingField(null);
                      toast.success('Field updated successfully!');
                    }
                  }}
                >
                  Save Field
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateStudioPage;
