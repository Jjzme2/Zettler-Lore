# Verification Guide

## Security Issue: Admin Shelf Creation Bypass
A critical vulnerability allowed unauthenticated users to create shelves via the `/api/admin/create-shelf` endpoint. This has been fixed by enforcing a `requireSuperUser` check.

## Verification Steps

### 1. Automated Unit Test
A new unit test has been added to `tests/unit_create_shelf.test.ts` which verifies that the endpoint rejects unauthenticated requests with a 401 Unauthorized error.

To run this test:
```bash
npx vitest tests/unit_create_shelf.test.ts
```

**Expected Output:**
```
✓ tests/unit_create_shelf.test.ts (1 test)
```
The test explicitly checks that `statusCode` is 401 when no user context is provided.

### 2. Manual Verification (Optional)
If you wish to verify manually against a running server (requires valid Firebase credentials):

1. Start the server:
   ```bash
   pnpm dev
   ```
2. Send a request without authentication:
   ```bash
   curl -v -X POST http://localhost:3000/api/admin/create-shelf \
     -H "Content-Type: application/json" \
     -d '{"title": "Hacked Shelf"}'
   ```
3. **Expected Result:**
   - Status Code: `401 Unauthorized` (or `403` if authenticated but not super admin)
   - The shelf should NOT be created in Firestore.

## Fix Details
The file `server/api/admin/create-shelf.post.ts` was modified to include:
```typescript
import { requireSuperUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireSuperUser(event)
        // ...
```
This ensures that only users with the `super` role can access this endpoint.
