const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');

console.log('🚀 SECUREINSURE-PRO COMPLETE DEPLOYMENT SCRIPT');
console.log('===============================================');

// Kill any existing processes on ports 3000 and 8081
async function killExistingProcesses() {
  console.log('🔄 Killing existing processes...');
  
  return new Promise((resolve) => {
    // Kill processes on port 8081 (backend)
    exec('netstat -ano | findstr :8081', (error, stdout) => {
      if (stdout) {
        const lines = stdout.trim().split('\n');
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            exec(`taskkill /PID ${pid} /F`, () => {});
          }
        });
      }
    });
    
    // Kill processes on port 3000 (frontend)
    exec('netstat -ano | findstr :3000', (error, stdout) => {
      if (stdout) {
        const lines = stdout.trim().split('\n');
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            exec(`taskkill /PID ${pid} /F`, () => {});
          }
        });
      }
    });
    
    setTimeout(resolve, 3000); // Wait 3 seconds for processes to be killed
  });
}

// Check if a service is running
function checkService(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ ${name} is running on port ${port}`);
      resolve(true);
    });
    
    req.on('error', () => {
      console.log(`❌ ${name} is not running on port ${port}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${name} check timed out on port ${port}`);
      resolve(false);
    });
  });
}

// Start backend server
function startBackend() {
  console.log('🟦 Starting Backend Server...');
  const backend = spawn('node', ['mock-auth-server.js'], {
    stdio: 'pipe',
    cwd: process.cwd()
  });
  
  backend.stdout.on('data', (data) => {
    console.log(`[BACKEND] ${data.toString().trim()}`);
  });
  
  backend.stderr.on('data', (data) => {
    console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
  });
  
  return backend;
}

// Start frontend server
function startFrontend() {
  console.log('🟨 Starting Frontend Server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    cwd: path.join(process.cwd(), 'frontend'),
    shell: true
  });
  
  frontend.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[FRONTEND] ${output}`);
    
    // Check if Vite dev server is ready
    if (output.includes('Local:') && output.includes('3000')) {
      console.log('✅ Frontend server is ready!');
    }
  });
  
  frontend.stderr.on('data', (data) => {
    console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
  });
  
  return frontend;
}

// Main deployment function
async function deploy() {
  try {
    // Step 1: Kill existing processes
    await killExistingProcesses();
    
    // Step 2: Start backend
    const backendProcess = startBackend();
    
    // Wait for backend to be ready
    console.log('⏳ Waiting for backend to be ready...');
    let backendReady = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      backendReady = await checkService(8081, 'Backend');
      if (backendReady) break;
    }
    
    if (!backendReady) {
      console.error('❌ Backend failed to start');
      process.exit(1);
    }
    
    // Step 3: Start frontend
    const frontendProcess = startFrontend();
    
    // Wait for frontend to be ready
    console.log('⏳ Waiting for frontend to be ready...');
    let frontendReady = false;
    for (let i = 0; i < 15; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      frontendReady = await checkService(3000, 'Frontend');
      if (frontendReady) break;
    }
    
    if (!frontendReady) {
      console.error('❌ Frontend failed to start');
      process.exit(1);
    }
    
    // Step 4: Final verification
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('========================');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 Backend:  http://localhost:8081');
    console.log('');
    console.log('📋 Available Screens:');
    console.log('  • Dashboard: http://localhost:3000/dashboard');
    console.log('  • Search: http://localhost:3000/search');
    console.log('  • Chatbot: http://localhost:3000/chatbot');
    console.log('  • Profile: http://localhost:3000/profile');
    console.log('  • Notifications: http://localhost:3000/notifications');
    console.log('  • Create Case: http://localhost:3000/create-case');
    console.log('  • Admin Panel: http://localhost:3000/admin');
    console.log('  • Policies: http://localhost:3000/policies');
    console.log('  • Claims: http://localhost:3000/claims');
    console.log('');
    console.log('🧪 To run Playwright tests:');
    console.log('  cd frontend && npm run e2e');
    console.log('');
    console.log('⚡ Application is ready for use!');
    
    // Keep processes running
    process.on('SIGINT', () => {
      console.log('\\n🛑 Shutting down servers...');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });
    
    // Keep the script running
    setInterval(() => {}, 1000);
    
  } catch (error) {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
deploy();




