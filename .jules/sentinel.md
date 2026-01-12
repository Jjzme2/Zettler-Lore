## 2024-05-22 - Secured Admin Endpoints
**Vulnerability:** Admin endpoints `create-shelf`, `seed-shelves`, and `migrate-data` were unprotected or had commented-out security checks.
**Learning:** Security checks were temporarily disabled during development/setup and not re-enabled, leaving critical administrative functions exposed.
**Prevention:** Always implement `requireAdminUser` or `requireSuperUser` middleware immediately when creating admin endpoints. Use a "fail closed" approach where endpoints deny access by default unless explicitly allowed.

## 2025-05-22 - Fixed Insecure Admin Shelf Creation
**Vulnerability:** `server/api/admin/create-shelf.post.ts` had a commented-out admin check and leaked stack traces on error.
**Learning:** Temporary "dev hacks" like commenting out auth often get forgotten and deployed. Stack traces in API errors help attackers map internal logic.
**Prevention:** Never comment out security checks in source control; use a local `.env` flag if absolutely necessary for dev. Use a centralized error handler that sanitizes production errors.
