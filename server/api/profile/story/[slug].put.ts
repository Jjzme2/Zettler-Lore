import { dbAdmin } from '../../../utils/firebase'

/**
 * Updates an existing story.
 *
 * This endpoint handles updates to story content and metadata.
 * Access control is nuanced:
 * - Owners/Super Admins can edit almost everything (title, content, shelf).
 * - Admins can only update status (approve/reject) and featured status.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean }>} A success indicator.
 * @throws {Error} Throws a 401 error if unauthorized.
 * @throws {Error} Throws a 400 error if slug is missing.
 * @throws {Error} Throws a 404 error if story is not found.
 * @throws {Error} Throws a 403 error if permission is denied.
 * @throws {Error} Throws a 500 error on failure.
 */
export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

    const body = await readBody(event)
    const { title, type, content, isPublicDomain, status, shelf } = body

    const db = dbAdmin
    const docRef = db.collection('stories').doc(slug)

    // Verify existence & ownership first
    const doc = await docRef.get()
    if (!doc.exists) throw createError({ statusCode: 404, statusMessage: 'Not found' })

    const currentData = doc.data()

    // Initial Check
    let isOwner = currentData?.authorId === user.uid
    let isSuper = user.role === 'super'
    let isAdmin = user.role === 'admin'
    let hasAccess = isOwner || isAdmin || isSuper

    // Fail-safe: Check DB if cookie says no
    if (!hasAccess) {
        const userSnap = await db.collection('users').doc(user.uid).get()
        const realRole = userSnap.data()?.role

        if (realRole === 'super') {
            isSuper = true
            hasAccess = true
        } else if (realRole === 'admin') {
            isAdmin = true
            hasAccess = true
        }
    }

    if (!hasAccess) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    // Define what can be updated
    let updateData: any = {}

    // Helper to remove undefined keys
    const clean = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined))

    if (isOwner || isSuper) {
        // Full access
        updateData = clean({
            title,
            type,
            content,
            isPublicDomain,
            shelf: shelf || currentData?.shelf,
            status: status || currentData?.status || 'draft',
            isFeatured: typeof body.isFeatured === 'boolean' ? body.isFeatured : currentData?.isFeatured,
            updatedAt: new Date().toISOString()
        })
    } else if (isAdmin) {
        // Restricted access: Status & Featured
        updateData = clean({
            status: status || currentData?.status,
            isFeatured: typeof body.isFeatured === 'boolean' ? body.isFeatured : currentData?.isFeatured,
        })
    }

    try {
        await docRef.update(updateData)

        return { success: true }
    } catch (e) {
        console.error("[StoryUpdate] Update failed:", e)
        throw createError({ statusCode: 500, statusMessage: `Update failed: ${(e as any).message}` })
    }
})
