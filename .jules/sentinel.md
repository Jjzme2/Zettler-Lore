## 2024-05-22 - Secured Admin Endpoints
**Vulnerability:** Admin endpoints `create-shelf`, `seed-shelves`, and `migrate-data` were unprotected or had commented-out security checks.
**Learning:** Security checks were temporarily disabled during development/setup and not re-enabled, leaving critical administrative functions exposed.
**Prevention:** Always implement `requireAdminUser` or `requireSuperUser` middleware immediately when creating admin endpoints. Use a "fail closed" approach where endpoints deny access by default unless explicitly allowed.
