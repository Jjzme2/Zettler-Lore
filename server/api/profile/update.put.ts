import { getFirestore } from 'firebase-admin/firestore'

/**
 * Updates the user's profile information.
 *
 * This endpoint allows users to change their display name.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean }>} A success indicator.
 * @throws {Error} Throws a 401 error if unauthorized.
 * @throws {Error} Throws a 400 error if display name is invalid.
 * @throws {Error} Throws a 500 error on failure.
 */
export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { displayName } = body

    if (!displayName || displayName.trim().length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Display Name is required' })
    }

    const db = getFirestore()

    try {
        await db.collection('users').doc(user.uid).update({
            displayName: displayName.trim()
        })

        return { success: true }
    } catch (e) {
        console.error("Profile update failed", e)
        throw createError({ statusCode: 500, statusMessage: 'Failed to update profile' })
    }
})
