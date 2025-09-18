# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > navigation.spec.ts > Dashboard Navigation > Application Details edit functionality works
**Spec:** `e2e\navigation.spec.ts:58`
**Retry:** 2
**Trace:** ``

## Error
```
Error: expect.toContainText: Error: strict mode violation: locator('h1') resolved to 2 elements:
    1) <h1 class="text-xl font-semibold text-gray-900 dark:text-white">SecureInsure Pro</h1> aka getByRole('heading', { name: 'SecureInsure Pro' })
    2) <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, Admin!</h1> aka getByRole('heading', { name: 'Welcome back, Admin!' })

Call log:
[2m  - Expect "toContainText" with timeout 5000ms[22m
[2m  - waiting for locator('h1')[22m
[2m    2 × locator resolved to <h1 class="text-xl font-semibold text-gray-900 dark:text-white">SecureInsure Pro</h1>[22m
[2m      - unexpected value "SecureInsure Pro"[22m

    at C:\Users\karuppk\Desktop\Cursor AI\secureinsure-pro\frontend\e2e\navigation.spec.ts:63:38
```

## Fix minimally
- Ensure routes exist + no redirects to /dashboard.
- Add/restore testids used by spec.
- Guard null/undefined in hooks/services (no .toLowerCase() on null).
- FE must call BE via shared axios (VITE_API_BASE_URL :8081).

After patch:
`npx playwright test --grep "Application Details edit functionality works"`
