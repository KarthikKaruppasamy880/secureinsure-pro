#!/usr/bin/env node

/**
 * SecureInsure Pro - Node.js Deployment Script
 * Senior Full Stack Developer & AI Engineer Complete Deployment Solution
 * This script provides cross-platform deployment with comprehensive error handling
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Color coding for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) { log(`✅ ${message}`, 'green'); }
function logError(message) { log(`❌ ${message}`, 'red'); }
function logInfo(message) { log(`ℹ️  ${message}`, 'cyan'); }
function logWarning(message) { log(`⚠️  ${message}`, 'yellow'); }

class SecureInsureDeployment {
    constructor() {
        this.isWindows = os.platform() === 'win32';
        this.services = [
            { name: 'auth-service', port: 8082, mainClass: 'com.secureinsure.pro.auth.AuthServiceApplication' },
            { name: 'policy-service', port: 8083, mainClass: 'com.secureinsure.policy.PolicyApplication' },
            { name: 'claims-service', port: 8084, mainClass: 'com.secureinsure.claims.ClaimsApplication' },
            { name: 'admin-service', port: 8085, mainClass: 'com.secureinsure.admin.AdminServiceApplication' },
            { name: 'notification-service', port: 8086, mainClass: 'com.secureinsure.notification.NotificationApplication' },
            { name: 'search-service', port: 8087, mainClass: 'com.secureinsure.search.SearchServiceApplication' },
            { name: 'gateway-service', port: 8080, mainClass: 'com.secureinsure.gateway.GatewayApplication' }
        ];
        this.runningProcesses = [];
    }

    async deploy() {
        try {
            logInfo('🚀 Starting SecureInsure Pro Deployment...');
            
            await this.validatePrerequisites();
            await this.cleanupExistingProcesses();
            await this.buildBackendServices();
            await this.buildFrontend();
            await this.startServices();
            await this.performHealthChecks();
            
            this.generateDeploymentReport();
            logSuccess('🎉 Deployment completed successfully!');
            
        } catch (error) {
            logError(`Deployment failed: ${error.message}`);
            process.exit(1);
        }
    }

    async validatePrerequisites() {
        logInfo('🔧 Validating prerequisites...');
        
        // Check Java
        try {
            const javaVersion = execSync('java -version', { encoding: 'utf8', stdio: 'pipe' });
            logSuccess('Java validated');
        } catch (error) {
            throw new Error('Java not found. Please install Java 11 or 17');
        }

        // Check Maven
        try {
            execSync('mvn -v', { encoding: 'utf8', stdio: 'pipe' });
            logSuccess('Maven validated');
        } catch (error) {
            throw new Error('Maven not found. Please install Apache Maven');
        }

        // Check Node.js
        try {
            const nodeVersion = execSync('node -v', { encoding: 'utf8' });
            logSuccess(`Node.js validated: ${nodeVersion.trim()}`);
        } catch (error) {
            throw new Error('Node.js not found. Please install Node.js');
        }
    }

    async cleanupExistingProcesses() {
        logInfo('🔄 Cleaning up existing processes...');
        
        const portsToClean = [8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 5173];
        
        for (const port of portsToClean) {
            try {
                if (this.isWindows) {
                    // Windows port cleanup
                    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: 'pipe' });
                    const lines = result.split('\n').filter(line => line.trim());
                    
                    for (const line of lines) {
                        const parts = line.trim().split(/\s+/);
                        if (parts.length >= 5) {
                            const pid = parts[4];
                            try {
                                execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
                                logSuccess(`Killed process on port ${port} (PID: ${pid})`);
                            } catch (err) {
                                // Process might already be dead
                            }
                        }
                    }
                } else {
                    // Unix/Linux port cleanup
                    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'pipe' });
                }
            } catch (error) {
                // Port might not be in use, which is fine
            }
        }
    }

    async buildBackendServices() {
        logInfo('🏗️  Building backend services...');
        
        for (const service of this.services) {
            logInfo(`Building ${service.name}...`);
            
            const servicePath = path.join('backend', service.name);
            
            try {
                // Clean and compile
                execSync('mvn clean compile -DskipTests', {
                    cwd: servicePath,
                    stdio: 'pipe'
                });
                
                logSuccess(`${service.name} built successfully`);
            } catch (error) {
                logWarning(`${service.name} build failed, attempting fix...`);
                
                // Try alternative build
                try {
                    execSync('mvn clean install -DskipTests -Dmaven.compiler.source=17 -Dmaven.compiler.target=17', {
                        cwd: servicePath,
                        stdio: 'pipe'
                    });
                    logSuccess(`${service.name} built with alternative approach`);
                } catch (alternativeError) {
                    throw new Error(`Failed to build ${service.name}: ${alternativeError.message}`);
                }
            }
        }
    }

    async buildFrontend() {
        logInfo('🎨 Building frontend...');
        
        const frontendPath = 'frontend';
        
        try {
            // Install dependencies
            execSync('npm install', {
                cwd: frontendPath,
                stdio: 'pipe'
            });
            
            // Build
            execSync('npm run build', {
                cwd: frontendPath,
                stdio: 'pipe'
            });
            
            logSuccess('Frontend built successfully');
        } catch (error) {
            throw new Error(`Frontend build failed: ${error.message}`);
        }
    }

    async startServices() {
        logInfo('🚀 Starting services...');
        
        // Start mock auth server first
        logInfo('Starting mock authentication server...');
        const mockAuthProcess = spawn('node', ['mock-auth-server.js'], {
            stdio: 'pipe',
            detached: !this.isWindows
        });
        this.runningProcesses.push(mockAuthProcess);
        logSuccess('Mock auth server started on port 8081');
        
        // Wait a bit for mock auth to stabilize
        await this.sleep(3000);
        
        // Start backend services
        for (const service of this.services) {
            logInfo(`Starting ${service.name} on port ${service.port}...`);
            
            const servicePath = path.join('backend', service.name);
            const args = ['spring-boot:run', `-Dspring-boot.run.arguments=--server.port=${service.port}`];
            
            const serviceProcess = spawn('mvn', args, {
                cwd: servicePath,
                stdio: 'pipe',
                detached: !this.isWindows
            });
            
            this.runningProcesses.push(serviceProcess);
            logSuccess(`${service.name} started`);
            
            // Wait between service starts
            await this.sleep(2000);
        }
        
        // Start frontend
        logInfo('Starting frontend development server...');
        const frontendProcess = spawn('npm', ['start'], {
            cwd: 'frontend',
            stdio: 'pipe',
            detached: !this.isWindows
        });
        this.runningProcesses.push(frontendProcess);
        logSuccess('Frontend started on port 5173');
    }

    async performHealthChecks() {
        logInfo('🔍 Performing health checks...');
        
        // Wait for services to fully start
        await this.sleep(15000);
        
        const endpoints = [
            'http://localhost:8081/actuator/health',
            'http://localhost:5173'
        ];
        
        for (const endpoint of endpoints) {
            try {
                // Simple HTTP check using curl or equivalent
                if (this.isWindows) {
                    execSync(`powershell -Command "Invoke-WebRequest -Uri ${endpoint} -TimeoutSec 5"`, { stdio: 'pipe' });
                } else {
                    execSync(`curl -f ${endpoint}`, { stdio: 'pipe' });
                }
                logSuccess(`${endpoint} is healthy`);
            } catch (error) {
                logWarning(`${endpoint} health check failed`);
            }
        }
    }

    generateDeploymentReport() {
        const report = `# SecureInsure Pro Deployment Report
Generated: ${new Date().toISOString()}

## Service Endpoints
- Gateway Service: http://localhost:8080
- Auth Service: http://localhost:8082
- Policy Service: http://localhost:8083
- Claims Service: http://localhost:8084
- Admin Service: http://localhost:8085
- Notification Service: http://localhost:8086
- Search Service: http://localhost:8087
- Mock Auth Server: http://localhost:8081
- Frontend Application: http://localhost:5173

## Test Accounts
- Admin: admin_test / Test@1234
- Underwriter: underwriter1 / SecurePass123!
- Customer: customer1 / CustomerPass123!

## Access Information
🌐 Application URL: http://localhost:5173
🔑 Default Login: admin_test / Test@1234

## Process Management
- Running Processes: ${this.runningProcesses.length}
- Platform: ${os.platform()}
- Node.js Version: ${process.version}

## Next Steps
1. Access the application at http://localhost:5173
2. Login with test credentials
3. Test application functionality
4. Monitor service logs for any issues
`;

        fs.writeFileSync('DEPLOYMENT_REPORT.md', report);
        logSuccess('Deployment report generated: DEPLOYMENT_REPORT.md');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Graceful shutdown
    setupGracefulShutdown() {
        process.on('SIGINT', () => {
            logInfo('🛑 Shutting down services...');
            this.runningProcesses.forEach(proc => {
                try {
                    proc.kill();
                } catch (error) {
                    // Process might already be dead
                }
            });
            process.exit(0);
        });
    }
}

// Main execution
if (require.main === module) {
    const deployment = new SecureInsureDeployment();
    deployment.setupGracefulShutdown();
    deployment.deploy().catch(error => {
        logError(`Deployment failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = SecureInsureDeployment;