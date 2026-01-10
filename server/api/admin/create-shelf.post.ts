import { dbAdmin } from '../../utils/firebase'

/**
 * Helper to create a URL-friendly slug from a string.
 * e.g. "Science Fiction" -> "science-fiction"
 */
function createSlug(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start
        .replace(/-+$/, '')       // Trim - from end
}

/**
 * POST /api/admin/create-shelf
 *
 * Creates a new shelf (category) in the library.
 *
 * @param {string} title - The display title of the shelf.
 * @param {string} [description] - Optional description.
 * @param {boolean} [isPublic] - Whether the shelf is visible to guests. Defaults to true.
 *
 * @returns {Promise<{ success: boolean, slug: string }>} Result of the operation.
 */
export default defineEventHandler(async (event) => {
    // FIXME: SECURITY WARNING
    // Admin check is currently disabled for initial setup/seeding purposes.
    // MUST be re-enabled before production deployment.
    // usage: await requireAdminUser(event)
    try {
        // const user = event.context.user
        // ...

        const body = await readBody(event)
        console.log('[API] Create Shelf Body:', body)

        const { title, description, isPublic } = body

        if (!title) throw createError({ statusCode: 400, statusMessage: 'Title required' })

        // Ensure dbAdmin is ready
        if (!dbAdmin) {
            console.error('[API] dbAdmin is undefined!')
            throw createError({ statusCode: 500, statusMessage: 'Database not initialized' })
        }

        const db = dbAdmin

        // Use custom slug function
        const slug = createSlug(title)
        console.log('[API] Generated Slug:', slug)

        // Check if exists
        const docRef = db.collection('shelves').doc(slug)
        const docSnap = await docRef.get()

        if (docSnap.exists) {
            throw createError({ statusCode: 409, statusMessage: 'Shelf exists' })
        }

        // Get max order to append the new shelf at the end
        const lastSnap = await db.collection('shelves').orderBy('order', 'desc').limit(1).get()
        let order = 0
        if (!lastSnap.empty) {
            order = (lastSnap.docs[0].data().order || 0) + 1
        }

        await docRef.set({
            title,
            description: description || '',
            slug,
            order,
            isPublic: isPublic !== undefined ? isPublic : true, // Default to true
            createdAt: new Date().toISOString()
        })

        return { success: true, slug }
    } catch (e: any) {
        console.error('[API] Shelf Creation Crash:', e)
        // Return a clean error to the client
        throw createError({
            statusCode: 500,
            statusMessage: `Server Crash: ${e.message}`,
            data: { stack: e.stack }
        })
    }
})
