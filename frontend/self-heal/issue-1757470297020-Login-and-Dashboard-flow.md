# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > auth-dashboard.spec.ts > Login and Dashboard flow
**Spec:** `e2e\auth-dashboard.spec.ts:3`
**Retry:** 0
**Trace:** ``

## Error
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('h1')
Expected string: [32m"Welcome back"[39m
Received: <element(s) not found>
Timeout: 5000ms

Call log:
[2m  - Expect "toContainText" with timeout 5000ms[22m
[2m  - waiting for locator('h1')[22m

    at C:\Users\karuppk\Desktop\Cursor AI\secureinsure-pro\frontend\e2e\auth-dashboard.spec.ts:30:36
```

## Fix minimally
- Ensure routes exist + no redirects to /dashboard.
- Add/restore testids used by spec.
- Guard null/undefined in hooks/services (no .toLowerCase() on null).
- FE must call BE via shared axios (VITE_API_BASE_URL :8081).

After patch:
`npx playwright test --grep "Login and Dashboard flow"`
