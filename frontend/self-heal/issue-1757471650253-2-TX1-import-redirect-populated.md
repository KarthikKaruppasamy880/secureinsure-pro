# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > flows.spec.ts > 2) TX1 import → redirect → populated
**Spec:** `e2e\flows.spec.ts:21`
**Retry:** 0
**Trace:** ``

## Error
```
Error: Console: Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
    at Page.<anonymous> (C:\Users\karuppk\Desktop\Cursor AI\secureinsure-pro\frontend\e2e\flows.spec.ts:7:13)
```

## Fix minimally
- Ensure routes exist + no redirects to /dashboard.
- Add/restore testids used by spec.
- Guard null/undefined in hooks/services (no .toLowerCase() on null).
- FE must call BE via shared axios (VITE_API_BASE_URL :8081).

After patch:
`npx playwright test --grep "2) TX1 import → redirect → populated"`
