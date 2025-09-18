# BUGBOT Rules — AI-Assisted PR Reviews

## Blocking (must fix before merge)
- Secrets: No keys/tokens/credentials in code or git history.
- Validation: All API inputs validated (Zod or equivalent).
- Security: No raw SQL string interpolation; use Prisma/parameterization.
- Errors: Use `{ code, message, details? }` envelope and proper HTTP status.
- AuthZ: Enforce authorization checks on protected routes/actions.
- Types: No implicit `any`; strict TypeScript must pass.

## Important (should fix)
- Tests: Provide/adjust unit or smoke tests for new behavior.
- Contracts: Keep client/server DTO types in sync; fail fast if mismatched.
- Logging: No sensitive data in logs; use structured logs where possible.
- Accessibility: Frontend components use semantic elements and accessible labels.

## Suggestions (nice-to-have)
- Naming: Descriptive function/var names; avoid abbreviations.
- Comments: Explain non-obvious logic and edge-cases.
- Perf: Highlight N+1 queries or expensive loops; propose simple optimizations.

## Ignore / Non-issues
- Build artifacts: `/dist`, `/build`, `node_modules/`, `coverage/`.
- Generated code & migrations.

## Project Context
- Node: 20+, React 18+, TypeScript strict.
- Linting: ESLint + Prettier required; CI must pass.
- CI: GitHub Actions runs lint, build, tests, and BugBot review.
