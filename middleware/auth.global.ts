import { APP_CONFIG } from '~/config/app.config'

export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip middleware on server for static assets or if handled elsewhere, but Nuxt handles this.
    const { user, refreshUser } = useAuth()

    // Fetch user state if not already present (hydration)
    if (!user.value) {
        await refreshUser()
    }

    // Public pages
    const publicRoutes = [
        APP_CONFIG.ROUTES.LOGIN,
        APP_CONFIG.ROUTES.HOME,
        APP_CONFIG.ROUTES.LIBRARY,
        '/logout' // Make sure logout page is accessible
    ]
    if (publicRoutes.some(route => to.path === route || to.path.startsWith(route + '/'))) {
        // If user is logged in and tries to access login page, redirect to library
        if (user.value && to.path === APP_CONFIG.ROUTES.LOGIN) {
            return navigateTo(APP_CONFIG.ROUTES.LIBRARY)
        }
        return
    }

    // Protected pages
    if (!user.value) {
        return navigateTo(APP_CONFIG.ROUTES.LOGIN)
    }
})
