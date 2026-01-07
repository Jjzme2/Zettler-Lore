import { getFirestore } from 'firebase-admin/firestore'

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
