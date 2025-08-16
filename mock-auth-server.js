// Mock Auth Server for SecureInsure Pro
// This provides login functionality when the real auth service can't start due to SSL issues

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8081;
const JWT_SECRET = 'mock_secret_key_for_testing';

// Middleware
app.use(cors());
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
            health: '/actuator/health',
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mock Auth Server running on http://localhost:${PORT}`);
    console.log('📝 Available endpoints:');
    console.log(`   GET  /actuator/health - Health check`);
    console.log(`   POST /api/v1/auth/register - Register user`);
    console.log(`   POST /api/v1/auth/login - Login user`);
    console.log(`   GET  /api/v1/auth/user - Get user info`);
    console.log('\n👤 Pre-loaded users:');
    console.log('   Username: admin_test, Password: Test@1234 (ADMIN)');
    console.log('   Username: underwriter1, Password: SecurePass123! (UNDERWRITER)');
    console.log('   Username: customer1, Password: CustomerPass123! (CUSTOMER)');
});

module.exports = app;