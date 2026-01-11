import { dbAdmin } from '../../../utils/firebase'

/**
 * Retrieves a specific world-building element and its entries.
 *
 * This endpoint fetches the details of a lore element (e.g., character, location) and its associated entries (sub-stories, events).
 * It enforces access control based on publication status and user roles.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ element: object, entries: Array<object> }>} The element details and list of entries.
 * @throws {Error} Throws a 400 error if slug is missing.
 * @throws {Error} Throws a 404 error if element is not found.
 * @throws {Error} Throws a 403 error if the user does not have permission to view the element.
 */
export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

    const db = dbAdmin
    const docRef = db.collection('stories').doc(slug)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
        throw createError({ statusCode: 404, statusMessage: 'Element not found' })
    }

    const elementData = docSnap.data()
    const user = event.context.user

    // Public entries are visible to all
    const isPublic = elementData?.status === 'published' || elementData?.isPublicDomain === true

    // Ownership/Admin check
    let hasAccess = isPublic || (user && (user.uid === elementData?.authorId || ['admin', 'super'].includes(user.role)))

    // Fail-safe: Check DB if cookie says no, in case of stale claims
    if (!hasAccess && user) {
        const userSnap = await db.collection('users').doc(user.uid).get()
        const realRole = userSnap.data()?.role
        if (['admin', 'super'].includes(realRole)) {
            hasAccess = true
        }
    }

    if (!hasAccess) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    // Fetch Entries Subcollection
    const entriesSnap = await docRef.collection('entries').orderBy('date', 'desc').get()
    const entries = entriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    return {
        element: { slug: docSnap.id, ...elementData },
        entries
    }
})
