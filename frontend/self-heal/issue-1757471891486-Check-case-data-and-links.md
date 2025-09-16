# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > verify-data.spec.ts > Verify Data Structure > Check case data and links
**Spec:** `e2e\verify-data.spec.ts:13`
**Retry:** 1
**Trace:** `test-results\verify-data-Verify-Data-Structure-Check-case-data-and-links-retry1\trace.zip`

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
`npx playwright test --grep "Check case data and links"`
