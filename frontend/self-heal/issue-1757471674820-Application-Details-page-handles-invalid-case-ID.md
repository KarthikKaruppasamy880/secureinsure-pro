# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > simple-application-details.spec.ts > Application Details - Direct Navigation > Application Details page handles invalid case ID
**Spec:** `e2e\simple-application-details.spec.ts:17`
**Retry:** 0
**Trace:** ``

## Error
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('[role="alert"]')
Expected: visible
Received: <element(s) not found>
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('[role="alert"]')[22m

    at C:\Users\karuppk\Desktop\Cursor AI\secureinsure-pro\frontend\e2e\simple-application-details.spec.ts:22:50
```

## Fix minimally
- Ensure routes exist + no redirects to /dashboard.
- Add/restore testids used by spec.
- Guard null/undefined in hooks/services (no .toLowerCase() on null).
- FE must call BE via shared axios (VITE_API_BASE_URL :8081).

After patch:
`npx playwright test --grep "Application Details page handles invalid case ID"`
