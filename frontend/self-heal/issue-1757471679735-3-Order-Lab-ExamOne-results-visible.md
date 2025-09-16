# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > flows.spec.ts > 3) Order Lab → ExamOne results visible
**Spec:** `e2e\flows.spec.ts:32`
**Retry:** 0
**Trace:** ``

## Error
```
Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveURL[2m([22m[32mexpected[39m[2m)[22m failed

Expected pattern: [32m/\/examone$/[39m
Received string:  [31m"http://localhost:3000/cases/CS-TX1-1757444260432"[39m
Timeout: 5000ms

Call log:
[2m  - Expect "toHaveURL" with timeout 5000ms[22m
[2m    9 × unexpected value "http://localhost:3000/cases/CS-TX1-1757444260432"[22m

    at C:\Users\karuppk\Desktop\Cursor AI\secureinsure-pro\frontend\e2e\flows.spec.ts:36:22
```

## Fix minimally
- Ensure routes exist + no redirects to /dashboard.
- Add/restore testids used by spec.
- Guard null/undefined in hooks/services (no .toLowerCase() on null).
- FE must call BE via shared axios (VITE_API_BASE_URL :8081).

After patch:
`npx playwright test --grep "3) Order Lab → ExamOne results visible"`
