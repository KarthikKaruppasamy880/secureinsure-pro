# 🛠️ Self-Heal Prompt (paste in Cursor)
**Failing test:**  >  > navigation.spec.ts > Dashboard Navigation > Application Details edit functionality works
**Spec:** `e2e\navigation.spec.ts:58`
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
`npx playwright test --grep "Application Details edit functionality works"`
