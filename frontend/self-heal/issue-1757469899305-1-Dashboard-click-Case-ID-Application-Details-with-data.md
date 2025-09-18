# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > consolidated-tests.spec.ts > 1. Dashboard ➜ click Case ID ➜ Application Details with data
**Spec:** `e2e\consolidated-tests.spec.ts:3`
**Retry:** 2
**Trace:** ``

## Error
```
[31mTest timeout of 90000ms exceeded.[39m
```

## Fix minimally
- Ensure routes exist + no redirects to /dashboard.
- Add/restore testids used by spec.
- Guard null/undefined in hooks/services (no .toLowerCase() on null).
- FE must call BE via shared axios (VITE_API_BASE_URL :8081).

After patch:
`npx playwright test --grep "1. Dashboard ➜ click Case ID ➜ Application Details with data"`
