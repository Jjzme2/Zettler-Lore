import { dbAdmin } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
    const user = event.context.user

    // Admin Only
    const db = dbAdmin
    const callerSnap = await db.collection('users').doc(user?.uid || 'anon').get()

    if (!callerSnap.exists || callerSnap.data()?.role !== 'super') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const { targetUserId } = getQuery(event) as { targetUserId: string }

    if (!targetUserId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing targetUserId' })
    }

    try {
        const userSnap = await db.collection('users').doc(targetUserId).get()
        const profileSnap = await db.collection('users').doc(targetUserId).collection('ai_profile').doc('default').get()

        if (!userSnap.exists) {
            throw createError({ statusCode: 404, statusMessage: 'User not found' })
        }

        const userData = userSnap.data()!
        const profileData = profileSnap.exists ? profileSnap.data() : { systemPrompt: '', styleGuide: '' }

        return {
            success: true,
            displayName: userData.displayName || 'Unnamed AI',
            profile: profileData
        }
    } catch (e: any) {
        console.error("Get AI Profile failed", e)
        throw createError({ statusCode: e.statusCode || 500, statusMessage: e.message })
    }
})
