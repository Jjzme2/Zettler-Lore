import { dbAdmin } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
    const user = event.context.user

    // Strict Admin Check
    const db = dbAdmin
    const callerSnap = await db.collection('users').doc(user?.uid || 'anon').get()

    if (!callerSnap.exists || callerSnap.data()?.role !== 'super') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Super access required' })
    }

    const { targetUserId, displayName, systemPrompt, styleGuide } = await readBody(event)

    if (!targetUserId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing targetUserId' })
    }

    // Verify Is AI
    const aiSnap = await db.collection('users').doc(targetUserId).get()
    if (!aiSnap.exists || !aiSnap.data()?.isAI) {
        throw createError({ statusCode: 400, statusMessage: 'Target is not an AI user' })
    }

    const currentData = aiSnap.data() || {}
    const currentName = currentData.displayName || 'Unknown AI'

    try {
        const batch = db.batch()

        // 1. Update Core User (Name)
        batch.set(db.collection('users').doc(targetUserId), {
            displayName: displayName || currentName,
            updatedAt: new Date().toISOString()
        }, { merge: true })

        // 2. Update Profile (Subcollection)
        const profileRef = db.collection('users').doc(targetUserId).collection('ai_profile').doc('default')
        batch.set(profileRef, {
            systemPrompt: systemPrompt || null,
            styleGuide: styleGuide || null,
            updatedAt: new Date().toISOString()
        }, { merge: true })

        await batch.commit()

        return { success: true }
    } catch (e: any) {
        console.error("Update AI failed", e)
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
