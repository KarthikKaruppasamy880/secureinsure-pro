const express = require('express');
const cors = require('cors');
const app = express();
const port = 8082;

app.use(cors());
app.use(express.json());

// Mock user database
const users = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@secureinsure.com',
        role: 'ADMIN'
    },
    {
        id: 2,
        username: 'user',
        password: 'user123',
        email: 'user@secureinsure.com',
        role: 'USER'
    }
];

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'Auth service is running!' });
});

// Login endpoint
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            token: `demo-token-${Date.now()}`,
            user: userWithoutPassword,
            message: 'Login successful'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

// Register endpoint
app.post('/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    if (users.find(u => u.username === username)) {
        return res.status(400).json({
            success: false,
            message: 'Username already exists'
        });
    }
    
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password,
        role: 'USER'
    };
    
    users.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({
        success: true,
        message: 'Registration successful',
        user: userWithoutPassword
    });
});

// Validate token endpoint
app.get('/auth/validate', (req, res) => {
    // For demo purposes, always return valid
    res.json({
        valid: true,
        user: {
            id: 1,
            username: 'admin',
            email: 'admin@secureinsure.com',
            role: 'ADMIN'
        }
    });
});

app.listen(port, () => {
    console.log(`Mock Auth Service running on port ${port}`);
    console.log('Available credentials:');
    console.log('  - admin/admin123 (ADMIN)');
    console.log('  - user/user123 (USER)');
});
