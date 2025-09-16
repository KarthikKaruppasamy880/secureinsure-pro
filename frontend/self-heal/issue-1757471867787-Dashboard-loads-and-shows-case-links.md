# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > simple-navigation.spec.ts > Simple Navigation Test > Dashboard loads and shows case links
**Spec:** `e2e\simple-navigation.spec.ts:13`
**Retry:** 2
**Trace:** ``

## Error
```
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoMatch[2m([22m[32mexpected[39m[2m)[22m

Expected pattern: [32m/\/cases\/.+/[39m
Received string:  [31m"http://localhost:3000/create-case"[39m
    at C:\Users\karuppk\Desktop\Cursor AI\secureinsure-pro\frontend\e2e\simple-navigation.spec.ts:34:26
```

## Fix minimally
- Ensure routes exist + no redirects to /dashboard.
- Add/restore testids used by spec.
- Guard null/undefined in hooks/services (no .toLowerCase() on null).
- FE must call BE via shared axios (VITE_API_BASE_URL :8081).

After patch:
`npx playwright test --grep "Dashboard loads and shows case links"`
