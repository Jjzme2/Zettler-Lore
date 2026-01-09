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
        const profileSnap = await db.collection('users').doc(targetUserId).collection('ai_profile').doc('default').get()

        if (profileSnap.exists) {
            return { success: true, profile: profileSnap.data() }
        } else {
            // Return empty/defaults if not found (legacy support)
            return { success: true, profile: { systemPrompt: '', styleGuide: '' } }
        }
    } catch (e: any) {
        console.error("Get AI Profile failed", e)
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
