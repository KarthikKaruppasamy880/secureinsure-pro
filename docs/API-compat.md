# FE ↔ BE API Compatibility

Base URL: `VITE_API_BASE_URL` or `http://localhost:8081` (mock)

- Auth
  - POST /auth/login → mock maps to /api/v1/auth/login
  - GET /auth/user → mock maps to /api/v1/auth/user
  - POST /auth/register → mock maps to /api/v1/auth/register
  - POST /auth/refresh → not present in mock (frontend refresh falls back to login)

- Application/ExamOne
  - POST /api/v1/examone/lab-request (mock implemented)

- Search
  - POST /api/search → expects array of SearchResult (mock not implemented)
  - GET /api/search/popular → expects array of strings (mock not implemented)

- Cases (examples in mock)
  - GET /api/v1/cases
  - GET /api/v1/cases/:id
  - POST /api/v1/cases
  - GET/POST /api/v1/cases/:id/documents

Notes
- Frontend axios instance: `src/services/api.ts` and `src/services/authService.ts` use `VITE_API_BASE_URL`.
- Ensure gateway routes align to these paths or add proxy/mappings.










