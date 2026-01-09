import { getFirestore } from 'firebase-admin/firestore'

/**
 * GET /api/library/shelves-list
 *
 * Fetches a lightweight list of all shelves.
 * Returns only essential data (slug, title) needed for navigation menus or dropdowns.
 *
 * This is an optimization to avoid fetching heavy content when only a list is needed.
 */
export default defineEventHandler(async (event) => {
    const db = getFirestore()
    // Simple fetch of all shelves for the dropdown
    const snapshot = await db.collection('shelves').orderBy('order').get()
    return snapshot.docs.map(doc => ({
        slug: doc.id,
        title: doc.data().title
    }))
})
