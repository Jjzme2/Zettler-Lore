import { authAdmin } from '~/server/utils/firebase'
import { APP_CONFIG } from '~/config/app.config'

/**
 * Server Middleware: User Context Population
 *
 * This middleware runs on every request to the server. Its primary responsibility is to:
 * 1.  Read the session cookie (`__session`) from the incoming request.
 * 2.  Verify the cookie's validity using the Firebase Admin SDK.
 * 3.  Attach the decoded user claims (uid, email, etc.) to `event.context.user`.
 *
 * This allows subsequent API handlers to access the authenticated user via `event.context.user`
 * without needing to re-verify tokens.
 */
export default defineEventHandler(async (event) => {
    const sessionCookie = getCookie(event, APP_CONFIG.COOKIE_NAME)

    if (!sessionCookie) {
        event.context.user = null
        return
    }

    try {
        const claims = await authAdmin.verifySessionCookie(sessionCookie, true)
        event.context.user = claims
    } catch (error) {
        // Session verification failed - clear context
        event.context.user = null
    }
})
