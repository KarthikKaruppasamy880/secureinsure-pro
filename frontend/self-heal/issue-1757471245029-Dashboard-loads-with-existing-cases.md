# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > basic-verification.spec.ts > Basic Functionality Verification > Dashboard loads with existing cases
**Spec:** `e2e\basic-verification.spec.ts:13`
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
`npx playwright test --grep "Dashboard loads with existing cases"`
