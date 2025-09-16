# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > flows.spec.ts > 1) Dashboard → Case click → Application Details with data
**Spec:** `e2e\flows.spec.ts:9`
**Retry:** 0
**Trace:** ``

## Error
```
Error: Console: CORS Warning: Frontend origin http://localhost:3000 may not be in backend ALLOWED_ORIGINS
    at Page.<anonymous> (C:\Users\karuppk\Desktop\Cursor AI\secureinsure-pro\frontend\e2e\flows.spec.ts:5:57)
```

## Fix minimally
- Ensure routes exist + no redirects to /dashboard.
- Add/restore testids used by spec.
- Guard null/undefined in hooks/services (no .toLowerCase() on null).
- FE must call BE via shared axios (VITE_API_BASE_URL :8081).

After patch:
`npx playwright test --grep "1) Dashboard → Case click → Application Details with data"`
