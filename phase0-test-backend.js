const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  const response = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'gateway-service',
    version: '1.0.0',
    uptime: process.uptime() * 1000,
    memory: {
      total: process.memoryUsage().heapTotal,
      free: process.memoryUsage().heapUsed,
      used: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed,
      max: process.memoryUsage().heapTotal
    },
    disk: {
      available: 'N/A',
      total: 'N/A',
      used: 'N/A'
    }
  };
  res.json(response);
});

// Ready endpoint
app.get('/ready', (req, res) => {
  const response = {
    status: 'READY',
    timestamp: new Date().toISOString(),
    service: 'gateway-service',
    version: '1.0.0',
    ready: true,
    checks: {
      database: 'UP',
      redis: 'UP',
      external_apis: 'UP'
    }
  };
  res.json(response);
});

// Version endpoint
app.get('/version', (req, res) => {
  const response = {
    version: '1.0.0',
    service: 'gateway-service',
    timestamp: new Date().toISOString(),
    build: {
      version: '1.0.0',
      buildTime: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform
    }
  };
  res.json(response);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SecureInsure Pro - PHASE 0 Test Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      ready: '/ready',
      version: '/version'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PHASE 0 Test Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health endpoint: http://localhost:${PORT}/health`);
  console.log(`✅ Ready endpoint: http://localhost:${PORT}/ready`);
  console.log(`📋 Version endpoint: http://localhost:${PORT}/version`);
  console.log(`\n🌐 Frontend should be accessible at: http://localhost:3000`);
  console.log(`\nPress Ctrl+C to stop the server`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down PHASE 0 Test Backend...');
  process.exit(0);
});
