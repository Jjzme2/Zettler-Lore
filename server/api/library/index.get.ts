import { dbAdmin } from '../../utils/firebase'

/**
 * GET /api/library
 *
 * Fetches the main library view: Public shelves and their associated stories.
 * This endpoint is optimized for the public landing page or guest view.
 *
 * Logic:
 * 1. Fetches all 'shelves' marked as public, ordered by 'order'.
 * 2. Fetches all 'stories' with status 'approved' (published), ordered by creation date.
 * 3. Maps stories to their respective shelves in memory.
 *
 * @returns {Promise<Array>} An array of shelf objects, each containing a 'books' array of stories.
 */
export default defineEventHandler(async (event) => {
    const db = dbAdmin

    try {
        // 1. Fetch public shelves
        // We only want shelves that are visible to everyone (isPublic == true)
        const shelvesSnap = await db.collection('shelves')
            .where('isPublic', '==', true)
            .orderBy('order', 'asc')
            .get()

        const shelves = shelvesSnap.docs.map(doc => ({
            slug: doc.id,
            ...doc.data(),
            books: [] as any[]
        })) as any[]

        // 2. Fetch published stories
        // 'approved' is used here as the status for public visibility.
        // In the future, this might be 'published' to match other parts of the system.
        const storiesSnap = await db.collection('stories')
            .where('status', '==', 'approved') // Only approved stories in the public library
            .orderBy('createdAt', 'desc')
            .get()

        const allStories = storiesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[]

        // 3. Map stories to shelves
        // Create a map for O(1) lookup of shelves by slug
        const shelfMap = new Map<string, any>(shelves.map((s: any) => [s.slug, s]))

        for (const story of allStories) {
            const shelf = shelfMap.get(story.shelf)
            if (shelf) {
                shelf.books.push(story)
            } else {
                // Fallback: If a story's shelf doesn't exist (or isn't public),
                // we might want to put it in a default 'community' shelf if available.
                const communityShelf = shelfMap.get('community')
                if (communityShelf) communityShelf.books.push(story)
            }
        }

        // Filter out empty shelves to keep the UI clean
        return shelves.filter(s => s.books.length > 0)

    } catch (e: any) {
        console.error('Library fetch failed', e)
        throw createError({ statusCode: 500, statusMessage: 'Failed to load library' })
    }
})
