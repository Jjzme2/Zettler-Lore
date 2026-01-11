import { dbAdmin } from '../../utils/firebase'

/**
 * Creates a new shelf in the library.
 *
 * This endpoint allows admins (temporarily open) to create a new category (shelf) for stories.
 * It automatically generates a URL-friendly slug from the title and ensures uniqueness.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, slug: string }>} A promise that resolves to the success status and the generated slug.
 * @throws {Error} Throws a 400 error if title is missing.
 * @throws {Error} Throws a 409 error if a shelf with the generated slug already exists.
 * @throws {Error} Throws a 500 error for server-side failures.
 */

// Simple slug function to avoid external dependency issues
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

export default defineEventHandler(async (event) => {
    // Admin check temporarily disabled for setup
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

        // Get max order to append
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
