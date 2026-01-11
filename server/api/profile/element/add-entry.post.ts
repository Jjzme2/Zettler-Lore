import { getFirestore, Timestamp } from 'firebase-admin/firestore'

/**
 * Adds an entry to a world-building element.
 *
 * This endpoint allows authors (or admins) to append details (events, traits) to a 'world_building' or 'element' type story.
 * Entries are stored as a subcollection to keep the main document light.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, slug: string }>} The slug of the new entry.
 * @throws {Error} Throws a 401 error if unauthorized.
 * @throws {Error} Throws a 400 error if required fields are missing.
 * @throws {Error} Throws a 404 error if the parent story is not found.
 * @throws {Error} Throws a 403 error if the user is not the author or an admin.
 */

// Simple slug function (shared)
function createSlug(text: string): string {
    return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')
}

export default defineEventHandler(async (event) => {
    // 1. Auth Check - Must be authenticated
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const { storySlug, title, type, content, date } = await readBody(event)

    if (!storySlug || !title || !content) {
        throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
    }

    const db = getFirestore()
    const storyRef = db.collection('stories').doc(storySlug)
    const storySnap = await storyRef.get()

    // 2. Existence & Ownership Check
    if (!storySnap.exists) {
        throw createError({ statusCode: 404, statusMessage: 'Element not found' })
    }

    // Only author or admin can add entries
    if (storySnap.data()?.authorId !== user.uid && user.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    // 3. Create Entry in Subcollection
    const slug = createSlug(title) + '-' + Date.now().toString().slice(-4)

    await storyRef.collection('entries').doc(slug).set({
        title,
        type: type || 'event', // event, backstory, trait
        content,
        date: date || new Date().toISOString(),
        createdAt: Timestamp.now(),
        slug
    })

    return { success: true, slug }
})
