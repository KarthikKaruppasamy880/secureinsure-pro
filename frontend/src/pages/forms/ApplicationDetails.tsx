import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Edit, 
  Save, 
  X, 
  User, 
  FileText, 
  Shield, 
  Heart,
  MapPin,
  History,
  Stethoscope,
  DollarSign,
  Bot
} from 'lucide-react';

import { AIAssistPanel } from '../../components/ai/AIAssistPanel';
import { useAccessControl } from '../../hooks/useAccessControl';
import { toast } from 'react-hot-toast';
import templateMap from '../../config/templateMap.json';

interface ApplicationData {
  [key: string]: any;
}

// Mock application data with all sections
const mockApplicationData: ApplicationData = {
  // Case Setup
  "Language of the Application": "English",
  "Policy Number": "POL-001-2024",
  "Application State of Signing": "CA",
  "Application Signing Date": "2024-01-15",
  "Date Received": "2024-01-16",
  "Product Type": "IUL",
  "Plan Name": "Indexed Universal Life",
  "Amount of coverage applied for": "$500,000",
  "Restricted View": "No",
  "Zinnia Case ID": "ZC-001-2024",
  "Priority": "Normal",
  "Submission": "Complete",
  "Death Benefit": "$500,000",
  "Life Insurance Qualification Test": "Passed",
  "Rate Class Applied For": "Preferred Plus",
  "Insurance Age Basis": "Nearest",
  "Insurance Age Effective Date": "2024-01-15",
  "Group": "Individual",
  
  // Insured Information
  "Insured Type": "Primary",
  "Name": "John Smith",
  "Date of Birth": "1985-06-15",
  "Age": "38",
  "Country if born outside the U.S.": "No",
  "U.S. State of Birth": "CA",
  "Gender": "Male",
  "SSN": "123-45-6789",
  "Driver's License Number": "CA1234567",
  "Issuing State": "CA",
  "U.S. Passport Number": "N/A",
  "State Issued ID Number": "N/A",
  "State": "CA",
  "Street Address 1": "123 Main Street",
  "Street Address 2": "Apt 4B",
  "Country": "USA",
  "City": "Anytown",
  "Zip": "90210",
  "Are you currently employed, a full-time student, or a domestic partner?": "Employed",
  "Occupation": "Software Engineer",
  "Annual Household Income": "$85,000",
  "Personal Annual Income": "$85,000",
  "Mobile Phone": "(555) 123-4567",
  "Email Address": "john.smith@email.com",
  
  // Owner Information
  "Owner Name": "John Smith",
  "Owner Relationship to Insured": "Self",
  "Owner Date of Birth": "1985-06-15",
  "Owner SSN": "123-45-6789",
  "Owner Address": "123 Main Street",
  "Owner City": "Anytown",
  "Owner State": "CA",
  "Owner ZIP": "90210",
  
  // Payor Information
  "Payor Name": "John Smith",
  "Payor Relationship to Insured": "Self",
  "Payor Date of Birth": "1985-06-15",
  "Payor SSN": "123-45-6789",
  "Payment Method": "Bank Draft",
  "Bank Account Number": "****1234",
  "Bank Routing Number": "****5678",
  
  // Beneficiary Information
  "Primary Beneficiary Name": "Jane Smith",
  "Primary Beneficiary Relationship": "Spouse",
  "Primary Beneficiary Percentage": "100",
  "Primary Beneficiary Date of Birth": "1987-03-20",
  "Primary Beneficiary SSN": "987-65-4321",
  
  // Secondary Address
  "Secondary Address Type": "Business",
  "Secondary Street Address 1": "456 Business Ave",
  "Secondary Street Address 2": "Suite 100",
  "Secondary City": "Business City",
  "Secondary State": "CA",
  "Secondary ZIP": "90211",
  "Secondary Address Purpose": "Work",
  
  // Life Insurance History
  "Previous Life Insurance Company": "None",
  "Previous Policy Number": "N/A",
  "Previous Coverage Amount": "N/A",
  "Previous Policy Type": "N/A",
  "Previous Policy Status": "N/A",
  "Previous Policy Term": "N/A",
  "Reason for Change": "First time applicant",
  
  // Non-Medical Information
  "Hobbies and Activities": "Reading, Hiking",
  "Travel Frequency": "Occasional",
  "Travel Destinations": "Domestic",
  "Aviation Activities": "None",
  "Military Service": "No",
  "Military Branch": "N/A",
  "Military Service Dates": "N/A",
  
  // Medical Information
  "Height": "5'10\"",
  "Weight": "175 lbs",
  "Blood Type": "O+",
  "Current Medications": "None",
  "Medical Conditions": "None",
  "Family Medical History": "None",
  "Last Physical Exam": "2023-12-01",
  "Physician Name": "Dr. Smith",
  
  // Premium Mode
  "Premium Payment Frequency": "Monthly",
  "Premium Amount": "$150.00",
  "Premium Start Date": "2024-01-15",
  "Premium Due Date": "15th of each month",
  "Grace Period": "31 days",
  "Automatic Payment": "Yes"
};

export default function ApplicationDetails() {
  const [applicationData, setApplicationData] = useState<ApplicationData>(mockApplicationData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<ApplicationData>({});
  const [activeTab, setActiveTab] = useState('case-setup');
  const [showAIAssist, setShowAIAssist] = useState(false);
  const { canManageUsers } = useAccessControl();

  const caseId = applicationData["Zinnia Case ID"] || "ZC-001-2024";

  const handleEdit = (section: string) => {
    if (!canManageUsers()) {
      toast.error('You do not have permission to edit this application');
      return;
    }
    
    setIsEditMode(true);
    setEditedData({ ...applicationData });
    toast.success(`Editing ${section} section`);
  };

  const handleSave = async (section: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update application data
      setApplicationData(prev => ({
        ...prev,
        ...editedData
      }));
      
      setIsEditMode(false);
      setEditedData({});
      toast.success(`${section} section saved successfully`);
    } catch (error) {
      toast.error(`Failed to save ${section} section`);
      console.error('Save error:', error);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedData({});
    toast('Changes cancelled');
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleOrderLab = async () => {
    try {
      // Create lab request data
      const labRequestData = {
        caseNumber: caseId,
        zinniaCaseId: applicationData["Zinnia Case ID"],
        policyNumber: applicationData["Policy Number"],
        insuredFirstName: applicationData["Name"]?.split(' ')[0] || '',
        insuredLastName: applicationData["Name"]?.split(' ')[1] || '',
        insuredDateOfBirth: applicationData["Date of Birth"],
        insuredAge: applicationData["Age"],
        insuredGender: applicationData["Gender"],
        insuredSsn: applicationData["SSN"],
        insuredEmail: applicationData["Email Address"],
        insuredPhone: applicationData["Mobile Phone"],
        insuredAddress: applicationData["Street Address 1"],
        insuredCity: applicationData["City"],
        insuredState: applicationData["State"],
        insuredZip: applicationData["Zip"],
        labType: "Comprehensive Blood Panel",
        urgency: "Standard",
        specialInstructions: "Standard life insurance application",
        physicianName: applicationData["Physician Name"] || "Dr. Smith",
        physicianPhone: "(555) 123-4567",
        physicianEmail: "dr.smith@clinic.com"
      };

      // Make API call to ExamOne
      const response = await fetch('/api/v1/examone/lab-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(labRequestData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Lab request submitted successfully. Request ID: ${result.requestId}`);
      } else {
        toast.error('Failed to submit lab request');
      }
    } catch (error) {
      console.error('Error submitting lab request:', error);
      toast.error('Error submitting lab request');
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'case-setup':
        return <FileText className="h-5 w-5" />;
      case 'insured':
        return <User className="h-5 w-5" />;
      case 'owner':
        return <Shield className="h-5 w-5" />;
      case 'payor':
        return <DollarSign className="h-5 w-5" />;
      case 'beneficiary':
        return <Heart className="h-5 w-5" />;
      case 'Secondary Address':
        return <MapPin className="h-5 w-5" />;
      case 'Life Insurance History':
        return <History className="h-5 w-5" />;
      case 'Non Medical Information':
        return <Shield className="h-5 w-5" />;
      case 'Medical Information':
        return <Stethoscope className="h-5 w-5" />;
      case 'Premium Mode':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };



  const renderSection = (sectionKey: string, sectionTitle: string) => {
    const isEditing = isEditMode && editedData[sectionKey];
    
    // Get fields from templateMap based on section key
    const getFieldsForSection = (key: string) => {
      // Map component section keys to templateMap keys
      const keyMapping: { [key: string]: string } = {
        'case-setup': 'Case Setup',
        'insured': 'Insured',
        'owner': 'Owner',
        'payor': 'Payor',
        'beneficiary': 'Beneficiary',
        'Secondary Address': 'Secondary Address',
        'Life Insurance History': 'Life Insurance History',
        'Non-Medical Information': 'Non Medical Information',
        'Medical Information': 'Medical Information',
        'Premium Mode': 'Premium Mode'
      };
      
      const templateKey = keyMapping[key] || key;
      const sectionData = templateMap[templateKey as keyof typeof templateMap];
      
      if (typeof sectionData === 'object' && !Array.isArray(sectionData)) {
        // Handle subsections - flatten all fields
        return Object.values(sectionData).flat();
      } else if (Array.isArray(sectionData)) {
        // Handle simple sections
        return sectionData;
      }
      return [];
    };
    
    const fields = getFieldsForSection(sectionKey);
    
    const renderField = (fieldName: string) => {
      const value = isEditing ? editedData[fieldName] : applicationData[fieldName] || '';
      
      return (
        <div key={fieldName} className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {fieldName}
          </label>
          {isEditing ? (
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${fieldName}`}
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {value || 'Not provided'}
            </div>
          )}
        </div>
      );
    };
    
    return (
      <Card key={sectionKey} className="card-premium">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getSectionIcon(sectionKey)}
            <span>{sectionTitle}</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {/* Order Lab button for Medical Information section */}
            {sectionKey === 'Medical Information' && (
              <Button
                onClick={() => handleOrderLab()}
                variant="outline"
                size="sm"
                className="btn-secondary"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Order Lab
              </Button>
            )}
            
            {canManageUsers() && (
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <Button
                    onClick={() => handleEdit(sectionTitle)}
                    variant="outline"
                    size="sm"
                    className="btn-secondary"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => handleSave(sectionTitle)}
                      size="sm"
                      className="btn-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="btn-secondary"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
                        )}
          </div>
        </CardHeader>
        
        <CardContent>
          {fields.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(renderField)}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No fields available for this section
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
          <p className="text-gray-600">
            Case: {caseId} - {applicationData["Name"]}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowAIAssist(!showAIAssist)}
            variant="outline"
            className="btn-secondary"
          >
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
          
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="btn-secondary"
          >
            <FileText className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAIAssist && (
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIAssistPanel
              caseId={caseId}
              applicationData={applicationData}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="case-setup">Case Setup</TabsTrigger>
          <TabsTrigger value="insured">Insured</TabsTrigger>
          <TabsTrigger value="owner">Owner</TabsTrigger>
          <TabsTrigger value="payor">Payor</TabsTrigger>
          <TabsTrigger value="beneficiary">Beneficiary</TabsTrigger>
        </TabsList>

        <TabsContent value="case-setup" className="space-y-4">
          {renderSection('case-setup', 'Case Setup')}
        </TabsContent>

        <TabsContent value="insured" className="space-y-4">
          {renderSection('insured', 'Insured Information')}
        </TabsContent>

        <TabsContent value="owner" className="space-y-4">
          {renderSection('owner', 'Owner Information')}
        </TabsContent>

        <TabsContent value="payor" className="space-y-4">
          {renderSection('payor', 'Payor Information')}
        </TabsContent>

        <TabsContent value="beneficiary" className="space-y-4">
          {renderSection('beneficiary', 'Beneficiary Information')}
        </TabsContent>
      </Tabs>

      {/* Additional Sections */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSection('Secondary Address', 'Secondary Address')}
          {renderSection('Life Insurance History', 'Life Insurance History')}
          {renderSection('Non-Medical Information', 'Non-Medical Information')}
          {renderSection('Medical Information', 'Medical Information')}
          {renderSection('Premium Mode', 'Premium Mode')}
        </div>
      </div>

      {/* Status Summary */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {applicationData["Amount of coverage applied for"] || "$500,000"}
              </div>
              <div className="text-sm text-green-800">Face Amount</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {applicationData["Premium Amount"] || "$150.00"}
              </div>
              <div className="text-sm text-blue-800">Monthly Premium</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {applicationData["Age"] || "38"}
              </div>
              <div className="text-sm text-purple-800">Insured Age</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 