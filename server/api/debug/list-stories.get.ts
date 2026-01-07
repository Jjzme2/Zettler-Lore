import { dbAdmin } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
    const db = dbAdmin
    const snapshot = await db.collection('stories').get()

    return {
        count: snapshot.size,
        stories: snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    }
})
