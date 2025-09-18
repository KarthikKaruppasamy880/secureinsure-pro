# Frontend (Vite) — Dev Setup and Voice Agent

## Requirements
- Node 20
- `.env.local` in `frontend/` with:

```
VITE_API_BASE_URL=http://localhost:8081
VITE_VOICE_ENABLED=true
```

## Run
- Backend mock (repo root):
  - `npm run start` → http://localhost:8081 (CORS enabled for http://localhost:5173)
- Frontend (from `frontend/`):
  - `npm run start` → http://localhost:5173

On startup (DEV), the app logs:
```
[ENV] <VITE_VOICE_ENABLED> <VITE_API_BASE_URL>
```

## Voice Agent
- On Dashboard, a “Voice ON” badge appears when the flag is enabled.
- Mic widget shows when `VITE_VOICE_ENABLED=true`.
- First run: allow the microphone permission in the browser.
- Use the “Test mic” button to verify microphone access.

Sample queries:
- “Show all open cases” → sets status filter to open
- “Find policy 12345” → sets policy filter
- “Clear filters” → resets all filters

If the mic is unsupported/denied, a toast explains the issue and the mic button disables.
