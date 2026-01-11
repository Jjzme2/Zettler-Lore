import { getFirestore } from 'firebase-admin/firestore'
import { requireSuperUser } from '../../utils/auth'

/**
 * Debug: Get User Info.
 *
 * Retrieves raw user data and environment info for debugging.
 * Restricted to super-users.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ sessionUser: any, dbUser: any, env: any }>} Debug information.
 * @throws {Error} Throws a 403 error if the user is not a super-user.
 */
export default defineEventHandler(async (event) => {
    // Security: Require super user access since this exposes env vars
    await requireSuperUser(event)

    const user = event.context.user
    const db = getFirestore()

    let dbUser = null
    if (user?.uid) {
        const snap = await db.collection('users').doc(user.uid).get()
        if (snap.exists) {
            dbUser = snap.data()
        }
    }

    return {
        sessionUser: user,
        dbUser: dbUser,
        env: {
            projectId: process.env.FIREBASE_PROJECT_ID,
            adminEmail: process.env.FIREBASE_CLIENT_EMAIL?.slice(0, 5) + '...'
        }
    }
})
