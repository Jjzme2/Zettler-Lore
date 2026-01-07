import { getFirestore } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
    const db = getFirestore()

    try {
        // 1. Fetch all shelves
        const shelvesSnap = await db.collection('shelves').orderBy('order').get()
        const shelves = shelvesSnap.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                order: data.order,
                isPublic: data.isPublic
            }
        })

        // 1.5 Filter for guests
        const user = event.context.user
        const visibleShelves = shelves.filter(s => {
            // If user is logged in, they see all shelves (or maybe logic varies)
            // Request: "non signed in users can only view public shelves"
            if (!user) return s.isPublic === true
            return true
        })

        // 2. Fetch all published stories
        // Optimization: In a huge app, we'd query per shelf or use Algolia. 
        // For now, fetching all published stories is efficient enough for a start-up library.
        const storiesSnap = await db.collection('stories')
            .where('status', '==', 'published')
            .get()

        const allStories = storiesSnap.docs.map(doc => {
            const data = doc.data()
            return {
                title: data.title,
                author: data.author,
                slug: doc.id,
                publishedDate: data.publishedDate,
                shelf: data.shelf, // Linkage
                type: data.type
            }
        })

        // 3. Map stories to shelves
        const populatedShelves = visibleShelves.map(shelf => {
            const shelfStories = allStories.filter(story => story.shelf === shelf.id)
            return {
                category: shelf.title,
                slug: shelf.id,
                description: shelf.description,
                books: shelfStories
            }
        })

        return {
            shelves: populatedShelves
        }

    } catch (error) {
        console.error("Error fetching library data:", error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch library shelves.'
        })
    }
})
