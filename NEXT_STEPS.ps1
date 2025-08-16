# SecureInsure Pro - Next Steps Script
# This script provides the next steps to continue fixing the application

Write-Host "🚀 SecureInsure Pro - Next Steps Guide" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Current Status
Write-Host "📊 CURRENT STATUS:" -ForegroundColor Yellow
Write-Host "✅ Frontend: Running on http://localhost:3000" -ForegroundColor Green
Write-Host "✅ Database: PostgreSQL running on port 5432" -ForegroundColor Green
Write-Host "✅ Redis: Running on port 6379" -ForegroundColor Green
Write-Host "⚠️  Policy Service: Built but not running" -ForegroundColor Yellow
Write-Host "❌ Other Services: Build failures due to compilation errors" -ForegroundColor Red
Write-Host ""

# Immediate Actions
Write-Host "🔧 IMMEDIATE ACTIONS NEEDED:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Fix Policy Service Database Connection:" -ForegroundColor Cyan
Write-Host "   - Check application.yml configuration" -ForegroundColor White
Write-Host "   - Verify database connection settings" -ForegroundColor White
Write-Host "   - Check if Flyway migrations are running" -ForegroundColor White
Write-Host ""

Write-Host "2. Fix Gateway Service Configuration:" -ForegroundColor Cyan
Write-Host "   - Remove unnecessary database dependencies" -ForegroundColor White
Write-Host "   - Check for conflicting configuration files" -ForegroundColor White
Write-Host ""

Write-Host "3. Test Basic Functionality:" -ForegroundColor Cyan
Write-Host "   - Access frontend at http://localhost:3000" -ForegroundColor White
Write-Host "   - Test Dashboard voice search" -ForegroundColor White
Write-Host "   - Navigate to Application Details" -ForegroundColor White
Write-Host ""

# Commands to Run
Write-Host "💻 COMMANDS TO RUN:" -ForegroundColor Yellow
Write-Host ""

Write-Host "# Check current service status:" -ForegroundColor Cyan
Write-Host "docker-compose ps" -ForegroundColor White
Write-Host ""

Write-Host "# Check Policy Service logs:" -ForegroundColor Cyan
Write-Host "docker-compose logs policy-service --tail=20" -ForegroundColor White
Write-Host ""

Write-Host "# Check Gateway Service logs:" -ForegroundColor Cyan
Write-Host "docker-compose logs gateway-service --tail=20" -ForegroundColor White
Write-Host ""

Write-Host "# Restart Policy Service after fixes:" -ForegroundColor Cyan
Write-Host "docker-compose restart policy-service" -ForegroundColor White
Write-Host ""

Write-Host "# Test Policy Service health:" -ForegroundColor Cyan
Write-Host "Invoke-WebRequest -Uri http://localhost:8082/actuator/health -UseBasicParsing" -ForegroundColor White
Write-Host ""

# Priority Order
Write-Host "🎯 PRIORITY ORDER:" -ForegroundColor Yellow
Write-Host "1. Get Policy Service running (TX1 functionality)" -ForegroundColor White
Write-Host "2. Fix Gateway Service (API routing)" -ForegroundColor White
Write-Host "3. Fix remaining service compilation errors" -ForegroundColor White
Write-Host "4. Test full TX1 → Application Details → Lab Ordering flow" -ForegroundColor White
Write-Host ""

# Success Indicators
Write-Host "✅ SUCCESS INDICATORS:" -ForegroundColor Yellow
Write-Host "- Policy Service responds to health check" -ForegroundColor White
Write-Host "- Gateway Service starts without database errors" -ForegroundColor White
Write-Host "- Frontend can make API calls to backend services" -ForegroundColor White
Write-Host "- TX1 case creation and viewing works" -ForegroundColor White
Write-Host "- Lab ordering button functions properly" -ForegroundColor White
Write-Host ""

Write-Host "📝 NOTE: The frontend is fully functional and ready for testing!" -ForegroundColor Green
Write-Host "   Focus on getting the backend services running to enable full functionality." -ForegroundColor Green
Write-Host ""

Write-Host "🔗 Useful URLs:" -ForegroundColor Yellow
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Policy Service: http://localhost:8082" -ForegroundColor White
Write-Host "- Gateway Service: http://localhost:8080" -ForegroundColor White
Write-Host "- Database: localhost:5432" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
