import { getFirestore } from 'firebase-admin/firestore'

/**
 * Creates a new story or world-building element.
 *
 * This endpoint allows authenticated users to submit a new work.
 * Initially, the work is created as a 'draft' and placed in the 'unapproved' shelf.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, slug: string }>} The slug of the newly created story.
 * @throws {Error} Throws a 401 error if unauthorized.
 * @throws {Error} Throws a 400 error if title is missing.
 * @throws {Error} Throws a 500 error on failure.
 */

// Use simple slug function
function createSlug(text: string): string {
    return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')
}

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const { title, content, type, shelf, isPublicDomain } = await readBody(event)

    if (!title) throw createError({ statusCode: 400, statusMessage: 'Title required' })

    const db = getFirestore()
    const slug = createSlug(title) + '-' + Date.now().toString().slice(-4) // Append timestamp for uniqueness

    try {
        const newStory = {
            title,
            slug,
            type,
            content: content || '',
            shelf: 'unapproved', // Send to unapproved shelf (approval workflow)
            author: user.displayName || 'Anonymous',
            authorId: user.uid,
            publishedDate: new Date().toISOString(),
            status: 'draft', // Default to draft
            isPublicDomain: isPublicDomain || false,
            createdAt: new Date().toISOString()
        }

        await db.collection('stories').doc(slug).set(newStory)

        return { success: true, slug }
    } catch (e) {
        console.error("Create story failed", e)
        throw createError({ statusCode: 500, statusMessage: 'Failed to create story' })
    }
})
