import { authAdmin } from '~/server/utils/firebase'
import { APP_CONFIG } from '~/config/app.config'

/**
 * POST /api/auth/session
 *
 * Session Login Endpoint.
 *
 * This endpoint is responsible for "logging in" the user on the server side.
 * It expects a Firebase ID Token (obtained on the client), verifies it, and
 * creates a secure, HTTP-only Session Cookie.
 *
 * This cookie is then used for subsequent server-side rendering (SSR) and API requests.
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const idToken = body.idToken

    if (!idToken) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID token is required'
        })
    }

    // Set session expiration to 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000

    try {
        // Create the session cookie. This will also verify the ID token.
        const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn })

        // Set cookie policy for session cookie
        setCookie(event, APP_CONFIG.COOKIE_NAME, sessionCookie, {
            maxAge: expiresIn / 1000, // Seconds
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax'
        })

        return { status: 'success' }
    } catch (error) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized request',
            cause: error
        })
    }
})
