import { getFirestore } from 'firebase-admin/firestore'

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
