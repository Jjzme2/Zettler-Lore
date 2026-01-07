import { dbAdmin } from '~/server/utils/firebase'

export default defineEventHandler(async (event) => {
    const userContext = event.context.user
    if (!userContext) return { user: null }

    try {
        const docSnap = await dbAdmin.collection('users').doc(userContext.uid).get()
        if (docSnap.exists) {
            // Return merged data: claims + firestore data
            return {
                user: {
                    ...userContext,
                    ...docSnap.data()
                }
            }
        }
    } catch (e) {
        console.error('Failed to fetch user profile', e)
    }

    return { user: userContext }
})
