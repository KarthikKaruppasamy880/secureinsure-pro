# AI-Assisted PR Review — Team Playbook

## Branch → PR → Review — Standard Flow
1. Update main: `git checkout main && git pull origin main`
2. Create branch: `git checkout -b feat/ai-assisted-review`
3. Make changes. Keep commits small and descriptive.
4. Local checks: `npm run lint && npm run build && npm test`
5. Push: `git push origin feat/ai-assisted-review`
6. Open PR to `main` in GitHub with:
   - Title: concise summary
   - Body: what changed, why, risks, test evidence, checklist
7. Wait for:
   - **CI** (lint/build/tests) → must be green
   - **BugBot** summary + inline comments
8. Address comments:
   - Blocking: must fix
   - Important: should fix or justify with reasoning in PR
9. Re-push, ensure green CI
10. Human review/approval → Merge

## PR Checklist (paste into PR body)
- [ ] Lint/build/tests pass locally and in CI
- [ ] No secrets in code, `.env.example` updated
- [ ] API inputs validated (Zod/schema)
- [ ] Error envelope consistent
- [ ] Types strict; no implicit `any`
- [ ] Tests updated/added
- [ ] README updated if behaviour/commands changed

## Where to see AI feedback
- PR **Conversation**: BugBot summary comment
- **Files changed**: inline review comments by BugBot
- **Actions**: "BugBot Review" workflow logs

## Typical next steps after BugBot
- Fix blocking items → push
- For suggestions you decline: reply why (trade-off, context)
- Request human review
- Merge when approvals & checks are complete
