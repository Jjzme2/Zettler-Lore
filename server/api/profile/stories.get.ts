import { getFirestore } from 'firebase-admin/firestore'

/**
 * Retrieves all stories authored by the current user.
 *
 * This endpoint allows users to view their own portfolio of works, regardless of status (draft, published, etc.).
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ stories: Array<object> }>} An array of the user's stories.
 * @throws {Error} Throws a 401 error if unauthorized.
 */
export default defineEventHandler(async (event) => {
    // Basic session check (middleware usually handles context, but good to be safe)
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const db = getFirestore()

    try {
        const storiesSnap = await db.collection('stories')
            .where('authorId', '==', user.uid)
            .orderBy('publishedDate', 'desc')
            .get()

        const stories = storiesSnap.docs.map(doc => ({
            slug: doc.id,
            ...doc.data()
        }))

        return { stories }

    } catch (error) {
        console.error("Error fetching user stories:", error)
        return { stories: [] } // Fail gracefully for now
    }
})
