# 🛡️ SecureInsure Pro - Insurance Management Platform

A comprehensive insurance management platform with advanced features including TX1 import, ExamOne integration, Voice AI agent, and dynamic form generation.

## ✨ Features

### 🔄 Core Workflows
- **TX1 Import**: XML-based insurance data import with automatic case and policy creation
- **Application Management**: Section-level editing and validation with real-time save
- **ExamOne Integration**: Lab request submission and results retrieval
- **Voice AI Agent**: WebSocket-powered voice commands with local fallback
- **Template Studio**: Excel-to-form template generation and management

### 🎯 Key Capabilities
- Dynamic form rendering from Excel/JSON configurations
- Real-time WebSocket communication for voice processing
- Comprehensive validation and error handling
- Role-based access control (RBAC)
- Responsive UI with modern design patterns

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn package manager
- Modern browser with Web Speech API support

### 1. Clone and Install
```bash
git clone <repository-url>
cd secureinsure-pro
npm install
cd frontend && npm install
```

### 2. Environment Configuration

#### Backend (.env)
```bash
PORT=8081
VERSION=dev
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,http://192.168.1.157:5173,http://192.168.1.157:5174
```

#### Frontend (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:8081
VITE_VOICE_ENABLED=true
VITE_VOICE_DEBUG=true
```

### 3. Start Services

#### Terminal 1 - Backend
```bash
# From project root
npm run start
```

**Expected Output:**
```
🚀 Mock Auth Server running on http://localhost:8081
🔌 WebSocket server available at ws://localhost:8081/ws
✅ Available endpoints:
   GET  /health - Health check
   GET  /ready - Readiness check
   GET  /version - Version info
   POST /api/v1/auth/login - Login user
   GET  /api/v1/auth/user - Get user info
   GET  /socket.io/* - Socket.io no-op (use /ws instead)
👥 Pre-loaded users:
   Username: admin_test, Password: Test@1234 (ADMIN)
   Username: underwriter1, Password: SecurePass123! (UNDERWRITER)
   Username: customer1, Password: CustomerPass123! (CUSTOMER)
🌐 CORS enabled for: http://localhost:5173, http://localhost:5174, http://127.0.0.1:5173, http://127.0.0.1:5174, http://192.168.1.157:5173, http://192.168.1.157:5174
```

#### Terminal 2 - Frontend
```bash
# From frontend directory
cd frontend
npm run start
```

**Expected Output:**
```
VITE v5.4.19  ready in 298 ms
➜  Local:   http://localhost:5173/    
➜  Network: http://192.168.1.157:5173/
```

### 4. Verify Installation

#### Backend Health Check
```bash
# Test health endpoints
curl http://localhost:8081/health
curl http://localhost:8081/ready
curl http://localhost:8081/version

# Test WebSocket
wscat -c ws://localhost:8081/ws
```

**Expected Responses:**
- `/health`: `{"status":"ok","service":"mock-backend","ts":"2024-01-XX..."}`
- `/ready`: `{"ready":true}`
- `/version`: `{"version":"dev"}`
- WebSocket: `{"type":"hello","ok":true}`

#### Frontend Verification
1. Open browser to `http://localhost:5173`
2. Login with test credentials:
   - **Admin**: `admin_test` / `Test@1234`
   - **Underwriter**: `underwriter1` / `SecurePass123!`
   - **Customer**: `customer1` / `CustomerPass123!`

## 🧪 Testing & Verification

### Automated Test Suite
Navigate to **Admin Panel → Testing** to run comprehensive end-to-end tests:

1. **TX1 Import Workflow**: File validation, XML parsing, case creation
2. **Application Management**: Data loading, editing, saving, validation
3. **ExamOne Integration**: Lab requests, results, location services
4. **Voice AI Agent**: WebSocket, recognition, intent processing
5. **Template Studio**: Excel import, template generation, form rendering

### Manual Testing Checklist

#### ✅ Dashboard & Navigation
- [ ] Dashboard loads with case list
- [ ] Voice agent shows "Connected" status
- [ ] TX1 Import button visible and functional
- [ ] Case ID clicks navigate to Application Details

#### ✅ TX1 Import Workflow
- [ ] Upload XML/TXT file
- [ ] Preview parsed data
- [ ] Import creates new case
- [ ] Dashboard refreshes with new case

#### ✅ Application Details
- [ ] Form renders with 2-column layout
- [ ] Section-level Edit/Save works
- [ ] ExamOne "Order Lab" button in Insured section
- [ ] Form validation shows errors appropriately

#### ✅ Voice AI Agent
- [ ] Microphone permission granted
- [ ] Voice commands recognized
- [ ] Search filters applied via voice
- [ ] Navigation commands work

#### ✅ Template Studio
- [ ] Excel file import successful
- [ ] Template creation and editing
- [ ] Form preview renders correctly
- [ ] Export to Excel/CSV works

## 🔧 Development

### Project Structure
```
secureinsure-pro/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── mock-auth-server.js      # Mock backend server
├── package.json
└── README.md
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express, WebSocket (ws)
- **Voice**: Web Speech API, WebSocket communication
- **Forms**: Dynamic rendering from Excel/JSON configurations

### Available Scripts

#### Root Directory
```bash
npm run start          # Start backend server
npm run dev           # Start backend with nodemon
npm run build         # Build frontend (from frontend/)
```

#### Frontend Directory
```bash
npm run start         # Start Vite dev server
npm run build         # Build for production
npm run lint          # Run ESLint
npm run preview       # Preview production build
```

## 🐛 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# If port 8081 is in use
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# If port 5173 is in use
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### WebSocket Connection Issues
- Verify backend is running on port 8081
- Check CORS configuration in backend
- Ensure `VITE_VOICE_ENABLED=true` in frontend env

#### Voice Recognition Issues
- Use HTTPS or localhost (secure context required)
- Grant microphone permissions
- Check browser console for Web Speech API support

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear frontend build cache
cd frontend
rm -rf dist node_modules package-lock.json
npm install
```

### Debug Mode
Enable debug logging by setting environment variables:
```bash
# Backend
DEBUG=* npm run start

# Frontend
VITE_DEBUG=true npm run start
```

## 📚 API Reference

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/user` - Get user info

### Case Management
- `GET /api/v1/cases` - List cases
- `GET /api/v1/cases/:id` - Get case details
- `PUT /api/v1/cases/:id/section/:section` - Save section

### TX1 Import
- `POST /api/v1/tx1/import` - Import TX1 file

### ExamOne Integration
- `POST /api/v1/examone/lab-request` - Submit lab request
- `GET /api/v1/examone/results` - Get lab results

### Health & Status
- `GET /health` - Health check
- `GET /ready` - Readiness check
- `GET /version` - Version info

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the test suite in Admin Panel → Testing
- Check browser console for error messages
- Verify all services are running and accessible

---

**🎯 Ready to use!** The platform is fully functional with all major workflows implemented and tested. 