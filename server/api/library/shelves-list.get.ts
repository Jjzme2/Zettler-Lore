import { getFirestore } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
    const db = getFirestore()
    // Simple fetch of all shelves for the dropdown
    const snapshot = await db.collection('shelves').orderBy('order').get()
    return snapshot.docs.map(doc => ({
        slug: doc.id,
        title: doc.data().title
    }))
})
