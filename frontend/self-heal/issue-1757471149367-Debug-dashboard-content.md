# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > debug-dashboard.spec.ts > Debug Dashboard > Debug dashboard content
**Spec:** `e2e\debug-dashboard.spec.ts:13`
**Retry:** 1
**Trace:** `test-results\debug-dashboard-Debug-Dashboard-Debug-dashboard-content-retry1\trace.zip`

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
`npx playwright test --grep "Debug dashboard content"`
