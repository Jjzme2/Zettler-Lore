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

    // Security: Input Validation
    if (!title || typeof title !== 'string') {
        throw createError({ statusCode: 400, statusMessage: 'Title required' })
    }
    if (title.length < 3 || title.length > 100) {
        throw createError({ statusCode: 400, statusMessage: 'Title must be between 3 and 100 characters' })
    }
    if (content && typeof content === 'string' && content.length > 50000) {
        throw createError({ statusCode: 400, statusMessage: 'Content exceeds maximum length (50,000 characters)' })
    }

    const db = getFirestore()

    // Security: Improved entropy to prevent collision
    // Using 6 random characters gives ~2 billion combinations per millisecond timestamp
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const slug = createSlug(title) + '-' + randomSuffix

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

        // Security: Use create() instead of set() to fail if document exists
        // This prevents accidental or malicious overwrites of existing stories
        await db.collection('stories').doc(slug).create(newStory)

        return { success: true, slug }
    } catch (e: any) {
        console.error("Create story failed", e)
        // Check for specific Firestore error code for 'already exists' if needed (code 6)
        if (e.code === 6) { // ALREADY_EXISTS
             throw createError({ statusCode: 409, statusMessage: 'Story slug collision. Please try again.' })
        }
        throw createError({ statusCode: 500, statusMessage: 'Failed to create story' })
    }
})
