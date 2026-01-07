import { authAdmin } from '~/server/utils/firebase'
import { APP_CONFIG } from '~/config/app.config'

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
