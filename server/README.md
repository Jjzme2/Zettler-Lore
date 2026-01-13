# Server Documentation

This directory contains the server-side logic for the application, powered by [Nitro](https://nitro.unjs.io/) (the underlying server engine for Nuxt 3).

## Directory Structure

*   **`api/`**: Contains the API route handlers. These are auto-mapped to `/api/*` endpoints.
*   **`middleware/`**: Server middleware that runs on every request (e.g., User Context).
*   **`utils/`**: Shared utility functions and services (Firebase Admin, Auth, AI, Stripe).

## Authentication Flow

The application uses a hybrid authentication model:

1.  **Client-Side**: Uses the Firebase Client SDK to sign in (handled in `composables/useAuth.ts`).
2.  **Session Creation**: Upon successful client sign-in, the ID token is sent to `/api/auth/session` to create a secure, HTTP-only session cookie.
3.  **Server Verification**: The `server/middleware/user-context.ts` middleware verifies this session cookie on every request and populates `event.context.user`.
4.  **Role-Based Access**: Utilities in `server/utils/auth.ts` (`requireAdminUser`, `requireSuperUser`) enforce permissions within API handlers.

## Key Utilities

### Firebase (`server/utils/firebase.ts`)
Initializes the Firebase Admin SDK. It handles the parsing of the private key from environment variables, ensuring compatibility across different deployment environments.

**Usage:**
```typescript
import { dbAdmin, authAdmin } from './firebase'
```

### Auth (`server/utils/auth.ts`)
Provides helpers to enforce security policies.

**Usage:**
```typescript
import { requireAdminUser } from './auth'

export default defineEventHandler(async (event) => {
    const user = await requireAdminUser(event)
    // ... proceed with admin-only logic
})
```

## API Structure

The API is organized by domain:

*   `api/auth/`: Session management (login, logout, session creation).
*   `api/library/`: Public and member-facing content retrieval (Stories, Shelves).
*   `api/admin/`: Administrative actions (User management, Content approval).
*   `api/stripe/`: Payment processing and webhook handling.
*   `api/ai/`: Integration with Generative AI services.

## Security Best Practices

*   **Never trust the client**: Always verify permissions server-side using `event.context.user` and the `require*` utilities.
*   **Environment Variables**: Secrets (Private Keys, API Secrets) are accessed via `process.env` or `useRuntimeConfig()` and must **never** be hardcoded.
