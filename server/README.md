# Server Documentation

This directory contains the server-side logic for the Nuxt 3 application. It leverages [Nitro](https://nitro.unjs.io/), the underlying server engine for Nuxt, to provide API endpoints, middleware, and server-side utilities.

The backend is heavily integrated with **Firebase** (Firestore, Auth, Admin SDK) and **Stripe**.

## Directory Structure

*   `api/`: Defines the API routes that the frontend calls. These map to URL endpoints (e.g., `api/auth/me.get.ts` becomes `/api/auth/me`).
*   `middleware/`: Server middleware that runs on every request. Used primarily for establishing user context.
*   `utils/`: Shared utility functions and singletons (e.g., Firebase Admin initialization, Stripe client).
*   `plugins/`: Nitro plugins (if any) to extend server behavior at startup.

## Key Concepts

### 1. Authentication & Session Management
We use a hybrid approach combining Firebase Client SDK and Server-Side Session Cookies.

*   **Client Side:** Users sign in using the Firebase Web SDK (`signInWithEmailAndPassword`). This yields a short-lived ID Token.
*   **Session Creation:** The client sends this ID Token to `/api/auth/session` (POST).
*   **Server Verification:** The server verifies the ID Token using the Firebase Admin SDK and mints a long-lived **Session Cookie** (`__session`).
*   **Persistence:** This cookie is HTTP-only and secure, allowing the server to recognize the user on subsequent requests (SSR or API calls).
*   **Context:** The `server/middleware/user-context.ts` middleware reads this cookie on *every* request, verifies it, and attaches the user's claims to `event.context.user`.

### 2. Database Access (Firestore)
*   All server-side database operations use the `firebase-admin` SDK (privileged environment).
*   **Security:** Unlike client-side queries restricted by Security Rules, server-side code has full access. Therefore, authorization checks (e.g., `requireSuperUser`) must be performed manually in the code before sensitive actions.

### 3. AI Integration
*   The `server/utils/ai.ts` module handles interactions with Google Gemini.
*   It implements a fallback strategy: attempting the `flash` model first, then falling back to `flash-lite` for reliability and cost management.

## API Endpoints

### Auth (`/api/auth/`)
*   `session.post.ts`: Exchanges a Firebase ID Token for a Session Cookie.
*   `logout.post.ts`: Clears the Session Cookie.
*   `me.get.ts`: Returns the current user's profile, merging Auth claims with Firestore profile data.

### Library (`/api/library/`)
*   `shelves.get.ts`: Fetches all public shelves and stories. Filters content based on the user's authentication status (Guest vs. Member).
*   `shelves-list.get.ts`: A lightweight endpoint returning just the list of shelf names/slugs (useful for dropdowns).

## Utilities (`server/utils/`)

*   `firebase.ts`: Initializes the Firebase Admin SDK. **Critical:** Handles parsing of the Private Key from environment variables, including correcting formatting issues like escaped newlines.
*   `auth.ts`: Helper for checking roles (e.g., `requireSuperUser`).
*   `stripe.ts`: Initializes the Stripe Node.js client.

## Development Notes

*   **Secrets:** All sensitive keys (Firebase Private Key, Stripe Secret) must be kept in `.env` and never committed.
*   **Type Safety:** Use `defineEventHandler` and TypeScript interfaces to ensure request/response bodies are typed correctly.
