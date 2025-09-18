# Check Existing Pull Request Status
Write-Host "🔍 Checking Existing Pull Request Status..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

$repo = "KarthikKaruppasamy880/secureinsure-pro"

Write-Host ""
Write-Host "📋 Your Repository Information:" -ForegroundColor Cyan
Write-Host "Repository: $repo" -ForegroundColor White
Write-Host "Branch: feat/ExamOne" -ForegroundColor White

Write-Host ""
Write-Host "🔗 Quick Links to Check:" -ForegroundColor Yellow
Write-Host "1. All Pull Requests: https://github.com/$repo/pulls" -ForegroundColor Blue
Write-Host "2. GitHub Actions: https://github.com/$repo/actions" -ForegroundColor Blue
Write-Host "3. Repository Home: https://github.com/$repo" -ForegroundColor Blue

Write-Host ""
Write-Host "🔍 What to Look For:" -ForegroundColor Cyan
Write-Host "1. Open PR from feat/ExamOne to main" -ForegroundColor White
Write-Host "2. PR should have 15+ commits and 800+ files changed" -ForegroundColor White
Write-Host "3. Check 'Conversation' tab for BugBot comments" -ForegroundColor White
Write-Host "4. Check 'Checks' tab for GitHub Actions status" -ForegroundColor White

Write-Host ""
Write-Host "🐛 BugBot Comments Location:" -ForegroundColor Magenta
Write-Host "- PR → Conversation tab: Summary comments" -ForegroundColor White
Write-Host "- PR → Files changed tab: Inline code reviews" -ForegroundColor White
Write-Host "- PR → Checks tab: GitHub Actions status" -ForegroundColor White

Write-Host ""
Write-Host "✅ Expected BugBot Behavior:" -ForegroundColor Green
Write-Host "- Summary analysis in conversation" -ForegroundColor White
Write-Host "- Inline code review comments" -ForegroundColor White
Write-Host "- Security scan results" -ForegroundColor White
Write-Host "- Test coverage reports" -ForegroundColor White

Write-Host ""
Write-Host "🚨 If No BugBot Comments Found:" -ForegroundColor Red
Write-Host "1. Check if GitHub Actions are running" -ForegroundColor White
Write-Host "2. Verify Cursor AI GitHub App is installed" -ForegroundColor White
Write-Host "3. Check if PR is in draft mode" -ForegroundColor White
Write-Host "4. Look for any error messages in Actions" -ForegroundColor White

Write-Host ""
Write-Host "📊 Recent Changes Made:" -ForegroundColor Magenta
Write-Host "- Fixed workflow branch configuration" -ForegroundColor White
Write-Host "- Added feat/* branches to triggers" -ForegroundColor White
Write-Host "- Updated BugBot permissions" -ForegroundColor White
Write-Host "- Fixed backend test failures" -ForegroundColor White
Write-Host "- Fixed frontend ESLint errors" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Visit the PR links above" -ForegroundColor White
Write-Host "2. Check if BugBot has commented" -ForegroundColor White
Write-Host "3. If not, check GitHub Actions status" -ForegroundColor White
Write-Host "4. Report back what you find" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to open GitHub in browser..." -ForegroundColor Gray
Read-Host
