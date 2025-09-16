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
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
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
  } else if (origin && origin.match(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d{4}$/)) {
    // Allow any LAN IP on ports 5173/5174
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());

// Mock user database
const users = [
    {
        id: 1,
        username: 'admin_test',
        email: 'admin_test@secureinsure.com',
        password: '$2a$10$eygRE2lG7/nc5aQisfAR3u.8y.kNUxqzvngpkHrfMGibFzcGqvWhW', // Test@1234
        firstName: 'Admin',
        lastName: 'Test',
        userType: 'ADMIN',
        roles: ['ADMIN', 'USER'],
        permissions: ['ALL_PERMISSIONS', 'USER_MANAGEMENT', 'SYSTEM_CONFIG'],
        status: 'ACTIVE',
        mfaEnabled: false,
        biometricEnabled: false
    },
    {
        id: 2,
        username: 'underwriter1',
        email: 'underwriter@secureinsure.com',
        password: '$2a$10$7eqBHjDfzL9H2OKrGOXLluBrn85jQ1KPnBNw5E5zDpK7zV4j9.VhO', // SecurePass123!
        firstName: 'John',
        lastName: 'Underwriter',
        userType: 'UNDERWRITER',
        roles: ['UNDERWRITER', 'USER'],
        permissions: ['REVIEW_POLICIES', 'APPROVE_POLICIES', 'VIEW_REPORTS'],
        status: 'ACTIVE',
        mfaEnabled: false,
        biometricEnabled: false
    },
    {
        id: 3,
        username: 'customer1',
        email: 'customer@secureinsure.com',
        password: '$2a$10$7eqBHjDfzL9H2OKrGOXLluBrn85jQ1KPnBNw5E5zDpK7zV4j9.VhO', // CustomerPass123!
        firstName: 'Bob',
        lastName: 'Customer',
        userType: 'CUSTOMER',
        roles: ['USER'],
        permissions: ['VIEW_OWN_POLICIES', 'SUBMIT_CLAIMS', 'VIEW_OWN_CLAIMS'],
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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'SecureInsure Pro Mock Auth Server',
        status: 'RUNNING',
        endpoints: {
            health: '/health',
            ready: '/ready',
            version: '/version',
            register: '/api/v1/auth/register',
            login: '/api/v1/auth/login',
            user: '/api/v1/auth/user'
        }
    });
});

// Health check endpoint
app.get('/actuator/health', (req, res) => {
    res.json({
        status: 'UP',
        components: {
            db: { status: 'UP' },
            redis: { status: 'UP' }
        }
    });
});

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        service: 'mock-backend',
        ts: new Date().toISOString()
    });
});

// Ready endpoint for Kubernetes readiness probe
app.get('/ready', (req, res) => {
    res.json({
        ready: true,
        service: 'mock-backend',
        ts: new Date().toISOString()
    });
});

// Version endpoint
app.get('/version', (req, res) => {
    res.json({
        version: process.env.VERSION || 'dev',
        service: 'mock-backend',
        ts: new Date().toISOString()
    });
});

// Register endpoint
app.post('/api/v1/auth/register', (req, res) => {
    const { username, email, password, firstName, lastName, userType } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
        return res.status(409).json({
            timestamp: new Date().toISOString(),
            status: 409,
            error: 'Conflict',
            message: 'User already exists',
            path: '/api/v1/auth/register'
        });
    }
    
    // Create new user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        userType: userType || 'CUSTOMER',
        roles: userType === 'ADMIN' ? ['ADMIN', 'USER'] : 
               userType === 'UNDERWRITER' ? ['UNDERWRITER', 'USER'] : ['USER'],
        permissions: userType === 'ADMIN' ? ['ALL_PERMISSIONS'] : 
                    userType === 'UNDERWRITER' ? ['REVIEW_POLICIES'] : ['VIEW_OWN_POLICIES'],
        status: 'ACTIVE',
        mfaEnabled: false,
        biometricEnabled: false
    };
    
    users.push(newUser);
    
    // Return user without password
    const { password: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
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
    
    // Check password
    const isValidPassword = bcrypt.compareSync(password, user.password);
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

// Shallow aliases for auth routes expected by frontend
app.post('/auth/register', (req, res, next) => { req.url = '/api/v1/auth/register'; next(); });
app.post('/auth/login', (req, res, next) => { req.url = '/api/v1/auth/login'; next(); });
app.get('/auth/user', (req, res, next) => { req.url = '/api/v1/auth/user'; next(); });
app.post('/auth/refresh', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const refreshToken = bearer || req.body?.refreshToken;
    if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });
    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id) || users[0];
        const accessToken = generateToken(user);
        const newRefreshToken = generateToken({ ...user, type: 'refresh' });
        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (e) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
});
app.get('/auth/validate', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });
    try {
        jwt.verify(token, JWT_SECRET);
        res.json(true);
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Get user info endpoint
app.get('/api/v1/auth/user', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const { password: _, ...userResponse } = user;
        res.json(userResponse);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Additional API endpoints for frontend compatibility
app.get('/api/v1/cases', (req, res) => {
  res.json([
    {
      id: '1',
      policyNumber: 'POL-001',
      insuredName: 'John Doe',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    }
  ]);
});

app.get('/api/v1/cases/:id', (req, res) => {
  res.json({
    id: req.params.id,
    policyNumber: 'POL-001',
    insuredName: 'John Doe',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  });
});

app.post('/api/v1/cases', (req, res) => {
  res.json({
    id: '2',
    policyNumber: 'POL-002',
    ...req.body,
    status: 'CREATED',
    createdAt: new Date().toISOString()
  });
});

app.put('/api/v1/product/:id', (req, res) => {
  res.json({ success: true, message: 'Product updated successfully' });
});

app.put('/api/v1/party-info/:id', (req, res) => {
  res.json({ success: true, message: 'Party info updated successfully' });
});

app.put('/api/v1/beneficiary/:id', (req, res) => {
  res.json({ success: true, message: 'Beneficiary updated successfully' });
});

app.put('/api/v1/owner/:id', (req, res) => {
  res.json({ success: true, message: 'Owner updated successfully' });
});

app.put('/api/v1/payor/:id', (req, res) => {
  res.json({ success: true, message: 'Payor updated successfully' });
});

app.put('/api/v1/medical/:id', (req, res) => {
  res.json({ success: true, message: 'Medical info updated successfully' });
});

app.put('/api/v1/premium/:id', (req, res) => {
  res.json({ success: true, message: 'Premium updated successfully' });
});

app.post('/api/v1/examone/lab-request', (req, res) => {
  res.json({ 
    success: true, 
    requestId: 'LAB-' + Date.now(),
    message: 'Lab request submitted successfully' 
  });
});

app.get('/api/v1/cases/:id/documents', (req, res) => {
  res.json([]);
});

app.post('/api/v1/cases/:id/documents', (req, res) => {
  res.json({ 
    success: true, 
    documentId: 'DOC-' + Date.now(),
    message: 'Document uploaded successfully' 
  });
});

// Socket.io no-op route to prevent 404s
app.get('/socket.io/*', (req, res) => {
  res.status(501).json({ 
    error: 'Socket.io not implemented', 
    message: 'Use WebSocket at /ws instead',
    wsUrl: `ws://${req.headers.host}/ws`
  });
});

// Additional socket.io routes to prevent 404s
app.post('/socket.io/*', (req, res) => {
  res.status(501).json({ 
    error: 'Socket.io not implemented', 
    message: 'Use WebSocket at /ws instead',
    wsUrl: `ws://${req.headers.host}/ws`
  });
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
    const authHeader = req.headers.authorization;
    
    console.log('WebSocket client connected from:', origin);
    
    // Send hello message on connect
    ws.send(JSON.stringify({ type: 'hello', ok: true }));
    
    // Parse Authorization header if present
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.substring(7);
            // Simple token parsing for dev (don't validate deeply)
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            console.log('WebSocket auth - user:', payload.sub || payload.username || 'unknown');
        } catch (error) {
            console.log('WebSocket auth - invalid token format');
        }
    }
    
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
    console.log(`   GET  /actuator/health - Legacy health check`);
    console.log(`   POST /api/v1/auth/register - Register user`);
    console.log(`   POST /api/v1/auth/login - Login user`);
    console.log(`   GET  /api/v1/auth/user - Get user info`);
    console.log(`   GET  /socket.io/* - Socket.io no-op (use /ws instead)`);
    console.log('\n👥 Pre-loaded users:');
    console.log('   Username: admin_test, Password: Test@1234 (ADMIN)');
    console.log('   Username: underwriter1, Password: SecurePass123! (UNDERWRITER)');
    console.log('   Username: customer1, Password: CustomerPass123! (CUSTOMER)');
    console.log('\n🌐 CORS enabled for:');
    console.log(`   ${allowedOrigins.join(', ')}`);
    if (process.env.LAN_ORIGIN) {
        console.log(`   + LAN_ORIGIN: ${process.env.LAN_ORIGIN}`);
    }
});

module.exports = app;
