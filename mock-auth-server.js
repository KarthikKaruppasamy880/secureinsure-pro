// Mock Auth Server for SecureInsure Pro - Fixed Version
// This provides login functionality when the real auth service can't start due to SSL issues

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = 8081;
const JWT_SECRET = 'mock_secret_key_for_testing';

// CORS configuration with environment variable support
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://192.168.1.157:3000',
      'http://192.168.1.157:5173',
      'http://192.168.1.157:5174'
    ];

// Add LAN_ORIGIN support for dynamic CORS
if (process.env.LAN_ORIGIN) {
  allowedOrigins.push(process.env.LAN_ORIGIN);
}

// Dynamic CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (origin && origin.match(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:(3000|5173|5174)$/)) {
    // Allow any LAN IP on ports 3000, 5173, 5174
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handling middleware for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON parsing error:', error.message);
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }
  next();
});

// Mock cases database with proper structure
const cases = [
  {
    id: '1',
    caseId: 'CS-2024-001',
    caseNumber: 'APP-2024-001',
    insuredName: 'Jane Doe',
    status: 'Under Review',
    policyType: 'IUL',
    coverageAmount: '$500,000',
    faceAmount: 500000,
    premium: 150.00,
    agent: 'John Smith',
    zinniaCaseId: 'ZC-001-2024',
    templateId: 'template-1',
    applicationDate: '2024-01-15',
    createdAt: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-15T14:20:00Z',
    priority: 'high',
    formData: {
      insured_name: 'Jane Doe',
      insured_dob: '1985-03-15',
      insured_ssn: '123-45-6789'
    }
  },
  {
    id: '2',
    caseId: 'CS-2024-002',
    caseNumber: 'APP-2024-002',
    insuredName: 'Michael Johnson',
    status: 'Pending Documents',
    policyType: 'Term Life',
    coverageAmount: '$250,000',
    faceAmount: 250000,
    premium: 75.00,
    agent: 'Sarah Wilson',
    zinniaCaseId: 'ZC-002-2024',
    templateId: 'template-1',
    applicationDate: '2024-01-14',
    createdAt: '2024-01-14T09:15:00Z',
    lastUpdated: '2024-01-15T11:45:00Z',
    priority: 'medium',
    formData: {
      insured_name: 'Michael Johnson',
      insured_dob: '1978-07-22',
      insured_ssn: '987-65-4321'
    }
  }
];

// Mock applications database
const applications = {
  'CS-2024-001': {
    caseId: 'CS-2024-001',
    sections: {
      insured: {
        fields: {
          fullName: 'Jane Doe',
          dateOfBirth: '1985-03-15',
          ssn: '123-45-6789',
          address: '123 Main St, Anytown, USA',
          phone: '(555) 123-4567',
          email: 'jane.doe@email.com'
        }
      },
      policy: {
        fields: {
          productCode: 'IUL',
          faceAmount: 500000,
          premium: 150.00,
          policyNumber: 'POL-001-2024'
        }
      },
      beneficiary: {
        fields: {
          primaryBeneficiary: 'John Doe (Spouse)',
          relationship: 'Spouse',
          percentage: '100%'
        }
      }
    }
  },
  'CS-2024-002': {
    caseId: 'CS-2024-002',
    sections: {
      insured: {
        fields: {
          fullName: 'Michael Johnson',
          dateOfBirth: '1978-07-22',
          ssn: '987-65-4321',
          address: '456 Oak Ave, Somewhere, USA',
          phone: '(555) 987-6543',
          email: 'michael.johnson@email.com'
        }
      },
      policy: {
        fields: {
          productCode: 'TERM',
          faceAmount: 250000,
          premium: 75.00,
          policyNumber: 'POL-002-2024'
        }
      },
      beneficiary: {
        fields: {
          primaryBeneficiary: 'Sarah Johnson (Spouse)',
          relationship: 'Spouse',
          percentage: '100%'
        }
      }
    }
  }
};

// Mock user database
const users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@secureinsure.com',
        password: 'admin123', // Plain text for testing
        firstName: 'Admin',
        lastName: 'User',
        userType: 'ADMIN',
        roles: ['ADMIN', 'USER'],
        permissions: ['ALL_PERMISSIONS', 'USER_MANAGEMENT', 'SYSTEM_CONFIG'],
        status: 'ACTIVE',
        mfaEnabled: false,
        biometricEnabled: false
    }
];

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            userType: user.userType,
            roles: user.roles
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// Health endpoints
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        service: 'mock-backend',
        ts: new Date().toISOString()
    });
});

// Face API endpoints
app.get('/face-api/face/status', (req, res) => {
    res.json({
        status: 'available',
        features: ['face_detection', 'face_recognition'],
        version: '1.0.0'
    });
});

// Voice API endpoints
app.get('/voice-api/voice/status', (req, res) => {
    res.json({
        status: 'available',
        features: ['speech_recognition', 'text_to_speech'],
        version: '1.0.0'
    });
});

// Auth validation endpoint
app.get('/api/v1/auth/validate', (req, res) => {
    res.json({ 
        id: 'admin', 
        name: 'Admin', 
        email: 'admin@example.com', 
        roles: ['ADMIN'], 
        scopes: ['voice:use', 'policy:read'] 
    });
});

// Auth logout (prevent 404 spam)
app.post('/api/v1/auth/logout', (_req, res) => res.json({ ok: true }));

app.get('/ready', (req, res) => {
    res.json({
        ready: true,
        service: 'mock-backend',
        ts: new Date().toISOString()
    });
});

app.get('/version', (req, res) => {
    res.json({
        version: process.env.VERSION || 'dev',
        service: 'mock-backend',
        ts: new Date().toISOString()
    });
});

// Login endpoint
app.post('/api/v1/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // Find user
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
        return res.status(401).json({
            timestamp: new Date().toISOString(),
            status: 401,
            error: 'Unauthorized',
            message: 'Invalid username or password',
            path: '/api/v1/auth/login'
        });
    }
    
    // Check password (simple comparison for testing)
    const isValidPassword = password === user.password;
    if (!isValidPassword) {
        return res.status(401).json({
            timestamp: new Date().toISOString(),
            status: 401,
            error: 'Unauthorized',
            message: 'Invalid username or password',
            path: '/api/v1/auth/login'
        });
    }
    
    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateToken({ ...user, type: 'refresh' });
    
    // Return login response
    res.json({
        accessToken,
        refreshToken,
        userId: user.id,
        username: user.username,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        userType: user.userType,
        roles: user.roles,
        permissions: user.permissions,
        mfaEnabled: user.mfaEnabled,
        biometricEnabled: user.biometricEnabled,
        lastLogin: new Date().toISOString()
    });
});

// Get all cases
app.get('/api/v1/cases', (req, res) => {
    try {
        // Return cases in the format expected by frontend
        res.json(cases);
    } catch (error) {
        console.error('Error retrieving cases:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve cases'
        });
    }
});

// Get case by ID
app.get('/api/v1/cases/:caseId', (req, res) => {
    try {
        const { caseId } = req.params;
        const caseData = cases.find(c => c.caseId === caseId || c.id === caseId);
        
        if (!caseData) {
            return res.status(404).json({
                success: false,
                error: 'Case not found'
            });
        }
        
        res.json({
            success: true,
            data: caseData,
            message: 'Case retrieved successfully'
        });
    } catch (error) {
        console.error('Error retrieving case:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve case'
        });
    }
});

// Get case application data
app.get('/api/v1/cases/:caseId/application', (req, res) => {
    try {
        const { caseId } = req.params;
        const applicationData = applications[caseId];
        
        if (!applicationData) {
            // Return empty application data if not found
            return res.json({
                caseId: caseId,
                sections: {
                    insured: { fields: {} },
                    policy: { fields: {} },
                    beneficiary: { fields: {} }
                }
            });
        }
        
        res.json(applicationData);
    } catch (error) {
        console.error('Error retrieving application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve application'
        });
    }
});

// Create case application
app.post('/api/v1/cases/:caseId/application', (req, res) => {
    try {
        const { caseId } = req.params;
        const { sections } = req.body;
        
        // Initialize application if it doesn't exist
        if (!applications[caseId]) {
            applications[caseId] = {
                caseId: caseId,
                sections: sections || {}
            };
        } else {
            // Merge with existing sections
            applications[caseId].sections = { ...applications[caseId].sections, ...sections };
        }
        
        res.json({
            success: true,
            data: applications[caseId]
        });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create application'
        });
    }
});

// Update case application section
app.patch('/api/v1/cases/:caseId/application/:section', (req, res) => {
    try {
        const { caseId, section } = req.params;
        const { fields } = req.body;
        
        // Initialize application if it doesn't exist
        if (!applications[caseId]) {
            applications[caseId] = {
                caseId: caseId,
                sections: {}
            };
        }
        
        // Update the section
        applications[caseId].sections[section] = {
            fields: { ...applications[caseId].sections[section]?.fields, ...fields }
        };
        
        res.json({
            success: true,
            message: `${section} section updated successfully`,
            caseId: caseId,
            section: section
        });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update application'
        });
    }
});

// Create new case
app.post('/api/v1/cases', (req, res) => {
    try {
        const caseData = req.body;
        const newCase = {
            id: String(cases.length + 1),
            caseId: `CS-${Date.now()}`,
            caseNumber: `APP-2024-${String(Date.now()).slice(-6)}`,
            insuredName: caseData.insuredName || 'Unknown',
            status: 'draft',
            policyType: caseData.policyType || 'Term Life',
            coverageAmount: caseData.coverageAmount || '$250,000',
            faceAmount: caseData.faceAmount || 250000,
            premium: caseData.premium || 75.00,
            agent: caseData.agent || 'System',
            zinniaCaseId: `ZC-${String(Date.now()).slice(-6)}-2024`,
            templateId: caseData.templateId || 'template-1',
            applicationDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            priority: 'medium',
            formData: caseData.formData || {}
        };
        
        cases.push(newCase);
        
        res.json({
            success: true,
            data: newCase,
            message: 'Case created successfully'
        });
    } catch (error) {
        console.error('Error creating case:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create case'
        });
    }
});

// Templates endpoint
app.get('/api/v1/auth/templates', (req, res) => {
    try {
        res.json({
            total: 1,
            devBypass: true,
            items: [{
                createdAt: Date.now(),
                isDefault: true,
                description: "Default template for development",
                name: "Default Term Life v0",
                id: "tmpl-dev-term-v0"
            }]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch templates'
        });
    }
});

// Chatbot endpoints
app.post('/api/v1/chatbot/session/start', (req, res) => {
    try {
        const sessionId = `chat-${Date.now()}`;
        
        res.json({
            success: true,
            data: {
                sessionId,
                message: 'Chatbot session started'
            }
        });
    } catch (error) {
        console.error('Error starting chatbot session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start chatbot session'
        });
    }
});

app.post('/api/v1/chatbot/session/:sessionId/message', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;
        
        res.json({
            success: true,
            sessionId: sessionId,
            response: `I received your message: "${message}". How can I help you further?`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing chatbot message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message'
        });
    }
});

// Search endpoint
app.post('/api/search', (req, res) => {
    try {
        const { q } = req.query;
        
        const searchResults = cases.filter(caseItem => 
            caseItem.insuredName.toLowerCase().includes((q || '').toLowerCase()) ||
            caseItem.caseId.toLowerCase().includes((q || '').toLowerCase()) ||
            caseItem.caseNumber.toLowerCase().includes((q || '').toLowerCase())
        );
        
        res.json({
            success: true,
            query: q,
            results: searchResults,
            totalResults: searchResults.length
        });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search'
        });
    }
});

// TX1 Import endpoint
app.post('/api/v1/tx1/import', (req, res) => {
    try {
        const xmlContent = req.body;
        console.log('TX1 Import - Received XML content length:', xmlContent?.length || 0);
        
        // Parse XML content to extract data
        let parsedData = {
            insuredName: 'TX1 Imported Customer',
            policyType: 'Term Life',
            faceAmount: 750000,
            premium: 200.00,
            effectiveDate: new Date().toISOString().split('T')[0],
            agent: 'TX1 System',
            ssn: '999-99-9999',
            dob: '1980-01-01',
            address: '123 TX1 Import St, TX1 City, TX1',
            phone: '(555) TX1-0000',
            email: 'tx1.imported@example.com'
        };
        
        // Try to parse XML if it's a string
        if (typeof xmlContent === 'string' && xmlContent.includes('<')) {
            try {
                // Simple XML parsing for common TX1 fields
                const nameMatch = xmlContent.match(/<Name[^>]*>([^<]+)<\/Name>/i);
                if (nameMatch) parsedData.insuredName = nameMatch[1];
                
                const policyMatch = xmlContent.match(/<PolicyType[^>]*>([^<]+)<\/PolicyType>/i);
                if (policyMatch) parsedData.policyType = policyMatch[1];
                
                const amountMatch = xmlContent.match(/<FaceAmount[^>]*>([^<]+)<\/FaceAmount>/i);
                if (amountMatch) parsedData.faceAmount = parseInt(amountMatch[1].replace(/[^0-9]/g, '')) || 750000;
                
                const premiumMatch = xmlContent.match(/<Premium[^>]*>([^<]+)<\/Premium>/i);
                if (premiumMatch) parsedData.premium = parseFloat(premiumMatch[1].replace(/[^0-9.]/g, '')) || 200.00;
                
                const ssnMatch = xmlContent.match(/<SSN[^>]*>([^<]+)<\/SSN>/i);
                if (ssnMatch) parsedData.ssn = ssnMatch[1];
                
                const dobMatch = xmlContent.match(/<DateOfBirth[^>]*>([^<]+)<\/DateOfBirth>/i);
                if (dobMatch) parsedData.dob = dobMatch[1];
                
                console.log('TX1 Parsed data:', parsedData);
            } catch (parseError) {
                console.log('XML parsing failed, using default data:', parseError.message);
            }
        }
        
        const mockCaseId = `CS-TX1-${Date.now()}`;
        const mockPolicyId = `POL-TX1-${Date.now()}`;
        
        // Add to cases
        const newCase = {
            id: String(cases.length + 1),
            caseId: mockCaseId,
            caseNumber: `TX1-${String(Date.now()).slice(-6)}`,
            insuredName: parsedData.insuredName,
            status: 'Under Review',
            policyType: parsedData.policyType,
            coverageAmount: `$${parsedData.faceAmount.toLocaleString()}`,
            faceAmount: parsedData.faceAmount,
            premium: parsedData.premium,
            agent: parsedData.agent,
            zinniaCaseId: `TX1-${String(Date.now()).slice(-6)}-2024`,
            templateId: 'template-1',
            applicationDate: parsedData.effectiveDate,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            priority: 'high',
            formData: {
                insured_name: parsedData.insuredName,
                insured_dob: parsedData.dob,
                insured_ssn: parsedData.ssn
            }
        };
        
        cases.push(newCase);
        
        // Create application data for the imported case
        applications[mockCaseId] = {
            caseId: mockCaseId,
            sections: {
                insured: {
                    fields: {
                        fullName: parsedData.insuredName,
                        dateOfBirth: parsedData.dob,
                        ssn: parsedData.ssn,
                        address: parsedData.address,
                        phone: parsedData.phone,
                        email: parsedData.email
                    }
                },
                policy: {
                    fields: {
                        policyType: parsedData.policyType,
                        faceAmount: parsedData.faceAmount,
                        premium: parsedData.premium,
                        effectiveDate: parsedData.effectiveDate
                    }
                },
                agent: {
                    fields: {
                        agentName: parsedData.agent,
                        agentCode: 'TX1-AGENT',
                        agencyName: 'TX1 Agency'
                    }
                }
            }
        };
        
        console.log('TX1 Import successful - Case ID:', mockCaseId);
        
        res.json({
            success: true,
            caseId: mockCaseId,
            policyId: mockPolicyId,
            message: 'TX1 XML imported successfully',
            importedAt: new Date().toISOString(),
            fileName: 'imported.tx1',
            recordCount: 1
        });
    } catch (error) {
        console.error('Error importing TX1:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to import TX1 XML'
        });
    }
});

// ExamOne locations endpoint
app.get('/api/v1/examone/locations', (req, res) => {
    try {
        const zip = (req.query.zipCode || '').toString();
        res.json({
            zip,
            items: [
                { id: 'LOC-001', name: 'Quest Diagnostics – Main', address: '123 Main St', city: 'Los Angeles', state: 'CA', zip: '90210' },
                { id: 'LOC-002', name: 'LabCorp – Beverly', address: '200 Beverly Dr', city: 'Beverly Hills', state: 'CA', zip: '90210' },
            ]
        });
    } catch (error) {
        console.error('Error retrieving locations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve locations'
        });
    }
});

// ExamOne endpoints
app.post('/api/v1/examone/lab-request', (req, res) => {
    try {
        const { caseId, caseNumber, zinniaCaseId, policyNumber, insuredFirstName, insuredLastName, insuredDateOfBirth, insuredAge, insuredGender, insuredSsn, insuredEmail, insuredPhone, insuredAddress, insuredCity, insuredState, insuredZip, labType, urgency, specialInstructions, physicianName, physicianPhone, physicianEmail } = req.body;
        
        const orderId = `EX-${Date.now()}`;
        
        // Create lab request record
        const labRequest = {
            orderId: orderId,
            caseId: caseId,
            caseNumber: caseNumber,
            zinniaCaseId: zinniaCaseId,
            policyNumber: policyNumber,
            insuredFirstName: insuredFirstName,
            insuredLastName: insuredLastName,
            insuredDateOfBirth: insuredDateOfBirth,
            insuredAge: insuredAge,
            insuredGender: insuredGender,
            insuredSsn: insuredSsn,
            insuredEmail: insuredEmail,
            insuredPhone: insuredPhone,
            insuredAddress: insuredAddress,
            insuredCity: insuredCity,
            insuredState: insuredState,
            insuredZip: insuredZip,
            labType: labType,
            urgency: urgency,
            specialInstructions: specialInstructions,
            physicianName: physicianName,
            physicianPhone: physicianPhone,
            physicianEmail: physicianEmail,
            status: 'PENDING',
            submittedAt: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            labLocation: 'ExamOne Lab Center'
        };
        
        // Store lab request in applications database
        if (!applications[caseId]) {
            applications[caseId] = { caseId: caseId, sections: {} };
        }
        
        if (!applications[caseId].sections.labRequests) {
            applications[caseId].sections.labRequests = { fields: {} };
        }
        
        applications[caseId].sections.labRequests.fields[orderId] = labRequest;
        
        console.log('Lab request submitted for case:', caseId, 'Order ID:', orderId);
        
        res.status(202).json({
            success: true,
            requestId: orderId,
            message: 'Lab request submitted successfully',
            estimatedCompletion: labRequest.estimatedCompletion,
            labLocation: labRequest.labLocation
        });
    } catch (error) {
        console.error('Error requesting lab:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to request lab'
        });
    }
});

app.get('/api/v1/examone/results', (req, res) => {
    try {
        const { caseId } = req.query;
        
        // Check if we have lab requests for this case
        let labResults = [];
        if (applications[caseId] && applications[caseId].sections.labRequests) {
            const labRequests = applications[caseId].sections.labRequests.fields;
            
            // Generate mock results for each lab request
            Object.values(labRequests).forEach((request, index) => {
                labResults.push({
                    testName: request.labType || 'Comprehensive Blood Panel',
                    status: 'COMPLETED',
                    collectedAt: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
                    completedAt: new Date().toISOString(),
                    highlights: [
                        'Cholesterol: 180 mg/dL (Normal)',
                        'Glucose: 95 mg/dL (Normal)',
                        'Blood Pressure: 120/80 (Normal)',
                        'BMI: 24.2 (Normal)',
                        'Liver Function: Normal',
                        'Kidney Function: Normal'
                    ],
                    notes: 'All values within normal range. No medical concerns detected. Patient is in good health.',
                    physician: request.physicianName || 'Dr. Smith',
                    labLocation: request.labLocation || 'ExamOne Lab Center',
                    orderId: request.orderId
                });
            });
        }
        
        // If no lab requests found, return default results
        if (labResults.length === 0) {
            labResults = [
                {
                    testName: 'Comprehensive Blood Panel',
                    status: 'COMPLETED',
                    collectedAt: new Date(Date.now() - 86400000).toISOString(),
                    completedAt: new Date().toISOString(),
                    highlights: [
                        'Cholesterol: 180 mg/dL (Normal)',
                        'Glucose: 95 mg/dL (Normal)',
                        'Blood Pressure: 120/80 (Normal)',
                        'BMI: 24.2 (Normal)'
                    ],
                    notes: 'All values within normal range. No medical concerns detected.',
                    physician: 'Dr. Smith',
                    labLocation: 'ExamOne Lab Center'
                }
            ];
        }
        
        // Store results in applications database
        if (applications[caseId]) {
            if (!applications[caseId].sections.labResults) {
                applications[caseId].sections.labResults = { fields: {} };
            }
            applications[caseId].sections.labResults.fields = {
                results: labResults,
                lastUpdated: new Date().toISOString()
            };
        }
        
        console.log('Lab results retrieved for case:', caseId, 'Results count:', labResults.length);
        
        res.json({
            success: true,
            caseId: caseId,
            results: labResults,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error retrieving results:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve results'
        });
    }
});

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// WebSocket server for voice agent
const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
});

wss.on('connection', (ws, req) => {
    const origin = req.headers.origin;
    
    console.log('WebSocket client connected from:', origin);
    
    // Send hello message on connect
    ws.send(JSON.stringify({ type: 'hello', ok: true }));
    
    // Set up heartbeat
    const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', ts: new Date().toISOString() }));
        }
    }, 10000);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('WebSocket message received:', data.type);
            
            // Echo back for testing
            ws.send(JSON.stringify({
                type: 'echo',
                timestamp: new Date().toISOString(),
                data: data
            }));
        } catch (error) {
            console.error('WebSocket message parse error:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected from:', origin);
        clearInterval(heartbeat);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clearInterval(heartbeat);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Mock Auth Server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server available at ws://localhost:${PORT}/ws`);
    console.log('✅ Available endpoints:');
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /ready - Readiness check`);
    console.log(`   GET  /version - Version info`);
    console.log(`   POST /api/v1/auth/login - Login user`);
    console.log(`   GET  /api/v1/cases - List all cases`);
    console.log(`   GET  /api/v1/cases/:caseId - Get case by ID`);
    console.log(`   GET  /api/v1/cases/:caseId/application - Get case application`);
    console.log(`   PATCH /api/v1/cases/:caseId/application/:section - Update section`);
    console.log(`   POST /api/v1/cases - Create new case`);
    console.log(`   GET  /api/v1/auth/templates - List templates`);
    console.log(`   POST /api/v1/chatbot/session/start - Start chatbot session`);
    console.log(`   POST /api/v1/chatbot/session/:id/message - Send message`);
    console.log(`   POST /api/search - Search cases`);
    console.log(`   POST /api/v1/tx1/import - Import TX1 XML`);
    console.log(`   POST /api/v1/examone/lab-request - ExamOne lab request`);
    console.log(`   GET  /api/v1/examone/results - ExamOne results`);
    console.log('\n👥 Pre-loaded users:');
    console.log('   Username: admin, Password: admin123 (ADMIN)');
    console.log('\n🌐 CORS enabled for:');
    console.log(`   ${allowedOrigins.join(', ')}`);
});

module.exports = app;