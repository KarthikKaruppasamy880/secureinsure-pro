# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > simple-navigation.spec.ts > Simple Navigation Test > Dashboard loads and shows case links
**Spec:** `e2e\simple-navigation.spec.ts:13`
**Retry:** 0
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
`npx playwright test --grep "Dashboard loads and shows case links"`
