import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { toast } from 'react-hot-toast';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  completedDate?: string;
  documents: string[];
  comments: string[];
  estimatedHours: number;
  actualHours?: number;
}

interface CaseWorkflowProps {
  caseId: string;
  caseName: string;
  productType: string;
  priority: string;
  status: string;
}

const CaseWorkflow: React.FC<CaseWorkflowProps> = ({ 
  caseId, 
  caseName, 
  productType, 
  priority, 
  status 
}) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);

  // Mock workflow data - in real app this would come from API
  useEffect(() => {
    const mockWorkflowSteps: WorkflowStep[] = [
      {
        id: '1',
        name: 'Application Review',
        description: 'Initial review of application completeness and accuracy',
        status: 'completed',
        assignee: 'Sarah Johnson',
        dueDate: '2024-01-10T00:00:00Z',
        completedDate: '2024-01-08T14:30:00Z',
        documents: ['Application Form', 'ID Documents', 'Financial Statements'],
        comments: ['Application looks complete', 'All required documents received'],
        estimatedHours: 2,
        actualHours: 1.5
      },
      {
        id: '2',
        name: 'Medical Underwriting',
        description: 'Review medical history and conduct medical examination if required',
        status: 'in_progress',
        assignee: 'Dr. Michael Chen',
        dueDate: '2024-01-15T00:00:00Z',
        documents: ['Medical Questionnaire', 'Lab Results', 'Exam Report'],
        comments: ['Medical exam scheduled for 1/12', 'Lab results pending'],
        estimatedHours: 4,
        actualHours: 2
      },
      {
        id: '3',
        name: 'Financial Underwriting',
        description: 'Review financial information and assess risk',
        status: 'pending',
        assignee: 'Lisa Davis',
        dueDate: '2024-01-18T00:00:00Z',
        documents: ['Tax Returns', 'Bank Statements', 'Investment Portfolio'],
        comments: [],
        estimatedHours: 3
      },
      {
        id: '4',
        name: 'Final Review',
        description: 'Final underwriting decision and policy approval',
        status: 'pending',
        assignee: 'Robert Wilson',
        dueDate: '2024-01-20T00:00:00Z',
        documents: ['Underwriting Summary', 'Risk Assessment', 'Policy Documents'],
        comments: [],
        estimatedHours: 2
      },
      {
        id: '5',
        name: 'Policy Issuance',
        description: 'Generate and deliver policy documents',
        status: 'pending',
        assignee: 'Jennifer Brown',
        dueDate: '2024-01-22T00:00:00Z',
        documents: ['Policy Certificate', 'Welcome Letter', 'Payment Schedule'],
        comments: [],
        estimatedHours: 1
      }
    ];

    setWorkflowSteps(mockWorkflowSteps);
    
    // Find current step
    const currentStep = mockWorkflowSteps.findIndex(step => step.status === 'in_progress');
    if (currentStep !== -1) {
      setCurrentStepIndex(currentStep);
    }
  }, [caseId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'blocked':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      'completed': { color: 'bg-green-100 text-green-800', text: 'Completed' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', text: 'In Progress' },
      'pending': { color: 'bg-gray-100 text-gray-800', text: 'Pending' },
      'blocked': { color: 'bg-red-100 text-red-800', text: 'Blocked' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { color: string }> = {
      'low': { color: 'bg-gray-100 text-gray-800' },
      'medium': { color: 'bg-blue-100 text-blue-800' },
      'high': { color: 'bg-orange-100 text-orange-800' },
      'urgent': { color: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority] || { color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={config.color}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const calculateProgress = () => {
    const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / workflowSteps.length) * 100;
  };

  const handleStepAction = (action: string, step: WorkflowStep) => {
    switch (action) {
      case 'start':
        setWorkflowSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, status: 'in_progress' } : s
        ));
        toast.success(`Started step: ${step.name}`);
        break;
      case 'complete':
        setWorkflowSteps(prev => prev.map(s => 
          s.id === step.id ? { 
            ...s, 
            status: 'completed', 
            completedDate: new Date().toISOString() 
          } : s
        ));
        toast.success(`Completed step: ${step.name}`);
        break;
      case 'block':
        setWorkflowSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, status: 'blocked' } : s
        ));
        toast.success(`Blocked step: ${step.name}`);
        break;
      case 'edit':
        setEditingStep(step);
        setShowStepModal(true);
        break;
      default:
        break;
    }
  };

  const handleWorkflowControl = (action: string) => {
    switch (action) {
      case 'start':
        setIsWorkflowRunning(true);
        toast.success('Workflow started');
        break;
      case 'pause':
        setIsWorkflowRunning(false);
        toast.success('Workflow paused');
        break;
      case 'stop':
        setIsWorkflowRunning(false);
        setWorkflowSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
        toast.success('Workflow stopped');
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Workflow</h1>
          <p className="text-gray-600">Manage workflow steps and track progress</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleWorkflowControl('pause')}
            disabled={!isWorkflowRunning}
          >
            <PauseIcon className="h-4 w-4 mr-2" />
            Pause
          </Button>
          <Button
            variant="outline"
            onClick={() => handleWorkflowControl('stop')}
            disabled={!isWorkflowRunning}
          >
            <StopIcon className="h-4 w-4 mr-2" />
            Stop
          </Button>
          <Button
            onClick={() => handleWorkflowControl('start')}
            disabled={isWorkflowRunning}
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Start Workflow
          </Button>
        </div>
      </div>

      {/* Case Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case ID</label>
              <p className="text-lg font-semibold">{caseId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Name</label>
              <p className="text-lg font-semibold">{caseName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
              <p className="text-lg font-semibold">{productType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <div className="mt-1">{getPriorityBadge(priority)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-medium text-gray-900">{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="w-full" />
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{workflowSteps.filter(s => s.status === 'completed').length} of {workflowSteps.length} steps completed</span>
              <span>Estimated completion: {workflowSteps.filter(s => s.status === 'pending').length} days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{step.name}</h3>
                        {getStatusBadge(step.status)}
                        {index === currentStepIndex && step.status === 'in_progress' && (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{step.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Due: {formatDate(step.dueDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {step.actualHours ? `${step.actualHours}/${step.estimatedHours}h` : `${step.estimatedHours}h`}
                          </span>
                        </div>
                      </div>

                      {step.documents.length > 0 && (
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Required Documents</label>
                          <div className="flex flex-wrap gap-2">
                            {step.documents.map((doc, docIndex) => (
                              <Badge key={docIndex} variant="outline" className="text-xs">
                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.comments.length > 0 && (
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                          <div className="space-y-1">
                            {step.comments.map((comment, commentIndex) => (
                              <div key={commentIndex} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {comment}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.completedDate && (
                        <div className="text-sm text-green-600">
                          Completed: {formatDateTime(step.completedDate)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {step.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleStepAction('start', step)}
                        disabled={!isWorkflowRunning}
                      >
                        Start
                      </Button>
                    )}
                    {step.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStepAction('complete', step)}
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStepAction('block', step)}
                        >
                          Block
                        </Button>
                      </>
                    )}
                    {step.status === 'blocked' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStepAction('start', step)}
                      >
                        Resume
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStepAction('edit', step)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Edit Modal Placeholder */}
      {showStepModal && editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Step: {editingStep.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowStepModal(false);
                  setEditingStep(null);
                }}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Update step details, assignee, due date, and other information.
              </p>
              
              {/* Form fields would go here in a real implementation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={editingStep.assignee}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input 
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={editingStep.dueDate.split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input 
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={editingStep.estimatedHours}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="pending" selected={editingStep.status === 'pending'}>Pending</option>
                    <option value="in_progress" selected={editingStep.status === 'in_progress'}>In Progress</option>
                    <option value="completed" selected={editingStep.status === 'completed'}>Completed</option>
                    <option value="blocked" selected={editingStep.status === 'blocked'}>Blocked</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStepModal(false);
                    setEditingStep(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success('Step updated successfully');
                  setShowStepModal(false);
                  setEditingStep(null);
                }}>
                  Update Step
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseWorkflow; 