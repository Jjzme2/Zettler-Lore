import { getFirestore } from 'firebase-admin/firestore'

/**
 * GET /api/library/shelves
 *
 * Fetches the Library structure: Shelves and their stories.
 *
 * Use Cases:
 * - Public: View all public shelves and stories.
 * - Member: View all shelves (including member-only) and stories.
 *
 * This endpoint performs filtering based on the user's authentication state.
 */
export default defineEventHandler(async (event) => {
    const db = getFirestore()

    try {
        // 1. Fetch all shelves and published stories in parallel
        // Optimization: Run independent queries concurrently to reduce latency.
        const [shelvesSnap, storiesSnap] = await Promise.all([
            db.collection('shelves').orderBy('order').get(),
            db.collection('stories').where('status', '==', 'published').get()
        ])

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

        // 2. Process stories
        // Optimization: In a huge app, we'd query per shelf or use Algolia. 
        // For now, fetching all published stories is efficient enough for a start-up library.
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
        // Optimization: Group stories by shelf first to avoid O(N*M) complexity in the next step.
        // This reduces complexity to O(N+M).
        const storiesByShelf: Record<string, typeof allStories> = {}
        for (const story of allStories) {
            if (story.shelf) {
                if (!storiesByShelf[story.shelf]) {
                    storiesByShelf[story.shelf] = []
                }
                storiesByShelf[story.shelf].push(story)
            }
        }

        const populatedShelves = visibleShelves.map(shelf => {
            const shelfStories = storiesByShelf[shelf.id] || []
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
