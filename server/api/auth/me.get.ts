import { dbAdmin } from '~/server/utils/firebase'

/**
 * GET /api/auth/me
 *
 * Retrieves the current authenticated user's profile.
 *
 * It combines data from two sources:
 * 1.  The User Context (from the session cookie), providing basic Auth claims (uid, email).
 * 2.  The Firestore `users` collection, providing application-specific profile data (role, status, etc.).
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ user: User | null }>} The user profile object, or null if not authenticated.
 */
export default defineEventHandler(async (event) => {
    const userContext = event.context.user
    // If no user context (no valid session cookie), return null immediately.
    if (!userContext) return { user: null }

    try {
        const docSnap = await dbAdmin.collection('users').doc(userContext.uid).get()
        if (docSnap.exists) {
            // Return merged data: claims + firestore data
            return {
                user: {
                    ...userContext,
                    ...docSnap.data()
                }
            }
        }
    } catch (e) {
        console.error('Failed to fetch user profile', e)
    }

    return { user: userContext }
})
