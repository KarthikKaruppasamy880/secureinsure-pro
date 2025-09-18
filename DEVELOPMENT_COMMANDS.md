# 🚀 SecureInsure Pro - Development Commands & Runbook

## 📋 Quick Reference Commands

### 🔄 **Daily Development Workflow**

```bash
# 1. Get latest changes and switch to your branch
git pull origin main
git checkout feat/ExamOne
git pull origin feat/ExamOne

# 2. Start both services (Backend + Frontend)
.\start-all-services.ps1

# 3. Test everything is working
.\test-complete-functionality.ps1

# 4. Commit your changes
git add .
git commit -m "feat: your commit message here"
git push origin feat/ExamOne
```

---

## 🛠️ **Service Management Commands**

### **Start Services**
```bash
# Start both backend and frontend
.\start-all-services.ps1

# Start only backend (port 8082)
node mock-auth-server.js

# Start only frontend (port 5173)
cd frontend
npm run dev -- --port 5173 --host
```

### **Stop Services**
```bash
# Kill all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Or use Ctrl+C in each terminal
```

### **Restart Services**
```bash
# Kill and restart everything
.\start-all-services.ps1
```

---

## 🧪 **Testing Commands**

### **Comprehensive Testing**
```bash
# Test all functionality
.\test-complete-functionality.ps1

# Test critical fixes only
.\test-critical-fixes.ps1

# Test specific screens
.\verify-all-screens.ps1
```

### **Frontend Testing**
```bash
cd frontend

# Run linting
npm run lint

# Run build
npm run build

# Run development server
npm run dev

# Run Playwright E2E tests
npm run e2e
npm run e2e:headed
```

### **Backend Testing**
```bash
# Test backend health
curl http://localhost:8082/health

# Test login
curl -X POST http://localhost:8082/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'

# Test cases API
curl http://localhost:8082/api/v1/cases
```

---

## 🔧 **Git Workflow Commands**

### **Branch Management**
```bash
# Switch to main and pull latest
git checkout main
git pull origin main

# Switch to your feature branch
git checkout feat/ExamOne
git pull origin feat/ExamOne

# Create new branch
git checkout -b feat/new-feature
```

### **Commit & Push**
```bash
# Stage all changes
git add .

# Commit with message
git commit -m "feat: add new feature"
git commit -m "fix: resolve issue with navigation"
git commit -m "docs: update documentation"

# Push to remote
git push origin feat/ExamOne

# Push new branch
git push -u origin feat/new-feature
```

### **Merge & Cleanup**
```bash
# Merge main into your branch
git checkout feat/ExamOne
git merge main

# Delete local branch after merge
git branch -d feat/old-feature

# Delete remote branch
git push origin --delete feat/old-feature
```

---

## 🐛 **Bug Fixing Commands**

### **Common Issues & Fixes**

#### **Port Conflicts**
```bash
# Kill all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Check what's using port 8082
netstat -ano | findstr :8082

# Check what's using port 5173
netstat -ano | findstr :5173
```

#### **Frontend Build Issues**
```bash
cd frontend

# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Clear Vite cache
Remove-Item -Recurse -Force .vite
npm run dev
```

#### **Backend Issues**
```bash
# Check if backend is running
curl http://localhost:8082/health

# Restart backend
node mock-auth-server.js
```

#### **CORS Issues**
```bash
# Check CORS configuration in mock-auth-server.js
# Ensure your IP is in the CORS origins list
```

---

## 🚀 **VS Code Run Configuration (Ctrl+F5)**

### **Launch Configuration**
The `.vscode/launch.json` file is configured with:

1. **"Start Backend"** - Runs `node mock-auth-server.js`
2. **"Start Frontend"** - Runs `npm run dev` in frontend folder
3. **"Start Both Services"** - Runs the PowerShell script

### **How to Use**
1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select:
   - "Start Backend" - for backend only
   - "Start Frontend" - for frontend only  
   - "Start Both Services" - for both

### **Debug Mode**
- Press `F5` to start debugging
- Set breakpoints in your code
- Use the debug console

---

## 📊 **Application URLs**

### **Frontend**
- **Local**: http://localhost:5173
- **Network**: http://10.0.0.27:5173 (or your IP)

### **Backend API**
- **Base URL**: http://localhost:8082
- **Health**: http://localhost:8082/health
- **WebSocket**: ws://localhost:8082/ws

### **Key Endpoints**
- Login: `POST /api/v1/auth/login`
- Cases: `GET /api/v1/cases`
- Application Details: `GET /api/v1/cases/:id/application`
- TX1 Import: `POST /api/v1/tx1/import`
- Lab PiQ Order: `POST /api/v1/vendor/examone/labpiq/order`

---

## 🔍 **Troubleshooting Guide**

### **"Connection Refused" Errors**
1. Check if backend is running: `curl http://localhost:8082/health`
2. Restart backend: `node mock-auth-server.js`
3. Check port conflicts: `netstat -ano | findstr :8082`

### **Frontend Not Loading**
1. Check if frontend is running: Open http://localhost:5173
2. Restart frontend: `cd frontend && npm run dev`
3. Clear browser cache: Ctrl+Shift+R

### **API Calls Failing**
1. Check CORS configuration
2. Verify API endpoints are correct
3. Check network tab in browser dev tools

### **Build Errors**
1. Run `npm run lint` to see linting errors
2. Fix TypeScript errors
3. Clear node_modules and reinstall

---

## 📝 **Commit Message Guidelines**

### **Format**
```
type(scope): description

[optional body]

[optional footer]
```

### **Types**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### **Examples**
```bash
git commit -m "feat(dashboard): add case navigation to application details"
git commit -m "fix(api): resolve ExamOne Lab PiQ 500 error"
git commit -m "docs(readme): update development setup instructions"
git commit -m "refactor(components): extract reusable form components"
```

---

## 🎯 **Quick Start Checklist**

### **First Time Setup**
- [ ] Clone repository
- [ ] Run `npm install` in frontend folder
- [ ] Run `.\start-all-services.ps1`
- [ ] Open http://localhost:5173
- [ ] Login with admin/admin123

### **Daily Development**
- [ ] `git pull origin feat/ExamOne`
- [ ] `.\start-all-services.ps1`
- [ ] Make changes
- [ ] `.\test-complete-functionality.ps1`
- [ ] `git add . && git commit -m "your message"`
- [ ] `git push origin feat/ExamOne`

### **Before Committing**
- [ ] All tests pass
- [ ] No linting errors
- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] All functionality verified

---

## 🆘 **Emergency Commands**

### **Reset Everything**
```bash
# Kill all processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Reset to clean state
git stash
git checkout main
git pull origin main
git checkout feat/ExamOne
git merge main

# Reinstall dependencies
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Start fresh
cd ..
.\start-all-services.ps1
```

### **Quick Health Check**
```bash
# Backend health
curl http://localhost:8082/health

# Frontend accessibility
curl http://localhost:5173

# Test login
curl -X POST http://localhost:8082/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
```

---

## 📞 **Support**

If you encounter issues not covered in this guide:

1. Check the terminal output for error messages
2. Run `.\test-complete-functionality.ps1` to identify issues
3. Check browser console for frontend errors
4. Verify all services are running on correct ports
5. Review this document for common solutions

**Remember**: The application is fully functional with all screens working. If something breaks, use the reset commands above to get back to a working state.
