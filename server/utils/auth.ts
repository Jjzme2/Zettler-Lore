import { dbAdmin } from './firebase'
import { H3Event } from 'h3'

/**
 * Middleware utility to enforce super-user (admin) privileges on an API route.
 *
 * This function checks if the user is authenticated and if their role in the `users` Firestore collection is 'super'.
 * It relies on `event.context.user` being populated by the user-context middleware.
 *
 * @param {H3Event} event - The H3 event object representing the request.
 * @returns {Promise<any>} A promise that resolves to the user object if authorized.
 * @throws {Error} Throws a 401 error if the user is not authenticated.
 * @throws {Error} Throws a 403 error if the user does not have 'super' role.
 */
export const requireSuperUser = async (event: H3Event) => {
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const snap = await dbAdmin.collection('users').doc(user.uid).get()

    if (!snap.exists || snap.data()?.role !== 'super') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Super access required' })
    }

    return user
}

/**
 * Middleware utility to enforce admin privileges on an API route.
 *
 * This function checks if the user is authenticated and if their role in the `users` Firestore collection is 'admin' or 'super'.
 *
 * @param {H3Event} event - The H3 event object representing the request.
 * @returns {Promise<any>} A promise that resolves to the user object if authorized.
 */
export const requireAdminUser = async (event: H3Event) => {
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const snap = await dbAdmin.collection('users').doc(user.uid).get()
    const role = snap.data()?.role

    if (!snap.exists || (role !== 'admin' && role !== 'super')) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
    }

    return user
}
