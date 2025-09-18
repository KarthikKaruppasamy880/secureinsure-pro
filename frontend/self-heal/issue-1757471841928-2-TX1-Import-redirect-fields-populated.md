# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > consolidated-tests.spec.ts > 2. TX1 Import ➜ redirect ➜ fields populated
**Spec:** `e2e\consolidated-tests.spec.ts:13`
**Retry:** 1
**Trace:** `test-results\consolidated-tests-2-TX1-I-e155b-redirect-➜-fields-populated-retry1\trace.zip`

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
`npx playwright test --grep "2. TX1 Import ➜ redirect ➜ fields populated"`
