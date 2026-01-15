## 2024-05-22 - Secured Admin Endpoints
**Vulnerability:** Admin endpoints `create-shelf`, `seed-shelves`, and `migrate-data` were unprotected or had commented-out security checks.
**Learning:** Security checks were temporarily disabled during development/setup and not re-enabled, leaving critical administrative functions exposed.
**Prevention:** Always implement `requireAdminUser` or `requireSuperUser` middleware immediately when creating admin endpoints. Use a "fail closed" approach where endpoints deny access by default unless explicitly allowed.

## 2026-01-15 - Unsecured Subcollection
**Vulnerability:** The `/entries` subcollection in Firestore rules allowed any authenticated user to write to any story's entries, and any user (even unauthenticated) to read them, bypassing application logic.
**Learning:** Firestore subcollections do not inherit security rules from their parent document. A permissive rule (like `read: true`) on a subcollection overrides any restriction on the parent.
**Prevention:** Explicitly define rules for all subcollections. If a subcollection is only managed via Server API, set `allow read, write: if false;` to force all access through the secure API layer.
