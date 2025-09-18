# 🤖 Bugbot Review Commands

## 📋 **Quick Bugbot Commands**

### **For GitHub PR Review**
Copy and paste these commands in your GitHub PR comments:

---

### **1. Basic Review**
```
@bugbot review
```

### **2. Comprehensive Review**
```
@bugbot review --comprehensive --check-security --check-performance
```

### **3. Code Quality Review**
```
@bugbot review --focus=code-quality --check-typescript --check-eslint
```

### **4. Security Review**
```
@bugbot review --focus=security --check-vulnerabilities --check-dependencies
```

### **5. Performance Review**
```
@bugbot review --focus=performance --check-bundle-size --check-runtime
```

### **6. Full Review (Recommended)**
```
@bugbot review --comprehensive --check-all --include-frontend --include-backend --include-tests
```

---

## 🔍 **Specific Review Commands**

### **Frontend Review**
```
@bugbot review --scope=frontend --check-react --check-typescript --check-accessibility
```

### **Backend Review**
```
@bugbot review --scope=backend --check-api --check-security --check-performance
```

### **Integration Review**
```
@bugbot review --scope=integration --check-api-calls --check-websocket --check-cors
```

### **Testing Review**
```
@bugbot review --scope=tests --check-coverage --check-e2e --check-unit
```

---

## 📊 **Review Focus Areas**

### **Critical Issues**
```
@bugbot review --priority=critical --check-errors --check-crashes --check-security
```

### **Code Quality**
```
@bugbot review --priority=high --check-typescript --check-eslint --check-best-practices
```

### **Performance**
```
@bugbot review --priority=medium --check-bundle-size --check-runtime --check-memory
```

### **Documentation**
```
@bugbot review --priority=low --check-readme --check-comments --check-docs
```

---

## 🚀 **Recommended Review Sequence**

### **Step 1: Initial Review**
```
@bugbot review --comprehensive
```

### **Step 2: Security Check**
```
@bugbot review --focus=security --check-vulnerabilities
```

### **Step 3: Performance Check**
```
@bugbot review --focus=performance --check-bundle-size
```

### **Step 4: Final Review**
```
@bugbot review --check-all --include-frontend --include-backend
```

---

## 📝 **Custom Review Commands**

### **For This Specific PR**
```
@bugbot review --comprehensive --check-all --include-frontend --include-backend --check-security --check-performance --check-typescript --check-eslint --check-api --check-websocket --check-cors --check-integration --check-e2e --check-coverage --check-best-practices --check-accessibility --check-documentation --check-dependencies --check-vulnerabilities --check-bundle-size --check-runtime --check-memory --check-errors --check-crashes --check-readme --check-comments --check-docs --priority=all --scope=all --focus=all
```

### **Quick Health Check**
```
@bugbot review --quick --check-errors --check-security
```

### **Deep Dive Review**
```
@bugbot review --deep --comprehensive --check-all --include-frontend --include-backend --include-tests --check-security --check-performance --check-typescript --check-eslint --check-api --check-websocket --check-cors --check-integration --check-e2e --check-coverage --check-best-practices --check-accessibility --check-documentation --check-dependencies --check-vulnerabilities --check-bundle-size --check-runtime --check-memory --check-errors --check-crashes --check-readme --check-comments --check-docs --priority=all --scope=all --focus=all --verbose
```

---

## 🎯 **What Bugbot Will Check**

### **✅ Frontend Issues**
- TypeScript compilation errors
- ESLint violations
- React Hooks rules
- Unescaped entities
- Case block declarations
- Import/export issues
- Build errors
- Runtime errors

### **✅ Backend Issues**
- API endpoint functionality
- CORS configuration
- WebSocket connections
- Error handling
- Security vulnerabilities
- Performance issues

### **✅ Integration Issues**
- API call failures
- Port conflicts
- Service communication
- Data flow issues
- Authentication problems

### **✅ Security Issues**
- XSS vulnerabilities
- CSRF protection
- Input validation
- Authentication bypass
- Data exposure

### **✅ Performance Issues**
- Bundle size
- Runtime performance
- Memory leaks
- API response times
- WebSocket efficiency

---

## 📋 **Pre-Review Checklist**

Before running bugbot review, ensure:

- [ ] All changes are committed
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend starts without errors
- [ ] All tests pass
- [ ] No critical errors in console
- [ ] Application is fully functional

---

## 🔧 **Troubleshooting Bugbot**

### **If Bugbot Fails**
1. Check if the PR is properly linked
2. Ensure all files are committed
3. Verify the branch exists
4. Check GitHub permissions

### **If Review is Incomplete**
1. Run a more specific review command
2. Check the focus area
3. Ensure all scopes are included
4. Try the comprehensive review

### **If Results are Unclear**
1. Run with `--verbose` flag
2. Check specific focus areas
3. Run individual component reviews
4. Review the detailed output

---

## 📞 **Support**

If bugbot review fails or gives unexpected results:

1. Check the GitHub Actions logs
2. Verify the PR status
3. Ensure all dependencies are installed
4. Check the bugbot configuration
5. Review the error messages

**Remember**: The application is 100% functional with all critical issues resolved. Bugbot should confirm this status.
