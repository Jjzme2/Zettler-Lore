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
        // 1. Fetch shelves and stories in parallel
        // Optimization: Run independent queries in parallel to reduce total latency.
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

        // 2. Map stories to shelves
        // Optimization: Group stories by shelf first to avoid O(N*M) complexity in the next step.
        // This reduces complexity to O(N+M).
        // Fusion: Combine mapping and grouping into a single pass over the snapshot to avoid creating an intermediate array.

        type Story = {
            title: any;
            author: any;
            slug: string;
            publishedDate: any;
            shelf: any;
            type: any;
        }

        const storiesByShelf: Record<string, Story[]> = {}

        for (const doc of storiesSnap.docs) {
            const data = doc.data()
            const story: Story = {
                title: data.title,
                author: data.author,
                slug: doc.id,
                publishedDate: data.publishedDate,
                shelf: data.shelf, // Linkage
                type: data.type
            }

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
