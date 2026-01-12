import { dbAdmin } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
    const db = dbAdmin

    try {
        // 1. Fetch public shelves and approved stories in parallel
        // Optimization: Run independent queries concurrently
        const [shelvesSnap, storiesSnap] = await Promise.all([
            db.collection('shelves')
                .where('isPublic', '==', true)
                .orderBy('order', 'asc')
                .get(),
            db.collection('stories')
                .where('status', '==', 'approved') // Only approved stories in the public library
                .orderBy('createdAt', 'desc')
                .get()
        ])

        const shelves = shelvesSnap.docs.map(doc => ({
            slug: doc.id,
            ...doc.data(),
            books: [] as any[]
        })) as any[]

        const allStories = storiesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[]

        // 3. Map stories to shelves
        // Stories that don't match a shelf slug or have generic 'ai' shelf
        const shelfMap = new Map<string, any>(shelves.map((s: any) => [s.slug, s]))

        for (const story of allStories) {
            const shelf = shelfMap.get(story.shelf)
            if (shelf) {
                shelf.books.push(story)
            } else {
                // Fallback to community or special handling if needed
                const communityShelf = shelfMap.get('community')
                if (communityShelf) communityShelf.books.push(story)
            }
        }

        return shelves.filter(s => s.books.length > 0)

    } catch (e: any) {
        console.error('Library fetch failed', e)
        throw createError({ statusCode: 500, statusMessage: 'Failed to load library' })
    }
})
