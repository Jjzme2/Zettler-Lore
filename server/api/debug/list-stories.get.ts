import { dbAdmin } from '../../utils/firebase'
import { requireSuperUser } from '../../utils/auth'

/**
 * Debug: List all stories.
 *
 * Retrieves a raw list of all stories in the database.
 * Restricted to super-users.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ count: number, stories: Array<object> }>} The list of stories and count.
 * @throws {Error} Throws a 403 error if the user is not a super-user.
 */
export default defineEventHandler(async (event) => {
    // Security: Require super user access
    await requireSuperUser(event)

    const db = dbAdmin
    const snapshot = await db.collection('stories').get()

    return {
        count: snapshot.size,
        stories: snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    }
})
