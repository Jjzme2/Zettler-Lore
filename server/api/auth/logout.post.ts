import { APP_CONFIG } from '~/config/app.config'

/**
 * POST /api/auth/logout
 *
 * Session Logout Endpoint.
 *
 * Clears the session cookie, effectively logging the user out from the server's perspective.
 * This should be called in conjunction with the client-side Firebase signOut().
 */
export default defineEventHandler((event) => {
    deleteCookie(event, APP_CONFIG.COOKIE_NAME, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })
    return { success: true }
})
