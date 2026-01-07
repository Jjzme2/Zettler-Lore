import { APP_CONFIG } from '~/config/app.config'

export default defineEventHandler((event) => {
    deleteCookie(event, APP_CONFIG.COOKIE_NAME, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })
    return { success: true }
})
