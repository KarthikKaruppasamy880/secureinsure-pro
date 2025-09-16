# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > navigation.spec.ts > Dashboard Navigation > Dashboard → Application Details navigation works
**Spec:** `e2e\navigation.spec.ts:4`
**Retry:** 0
**Trace:** ``

## Error
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('text=Case:')
Expected: visible
Received: <element(s) not found>
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('text=Case:')[22m

    at C:\Users\karuppk\Desktop\Cursor AI\secureinsure-pro\frontend\e2e\navigation.spec.ts:30:46
```

## Fix minimally
- Ensure routes exist + no redirects to /dashboard.
- Add/restore testids used by spec.
- Guard null/undefined in hooks/services (no .toLowerCase() on null).
- FE must call BE via shared axios (VITE_API_BASE_URL :8081).

After patch:
`npx playwright test --grep "Dashboard → Application Details navigation works"`
