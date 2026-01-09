import { dbAdmin } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
    const user = event.context.user

    // Admin Only
    const db = dbAdmin
    const callerSnap = await db.collection('users').doc(user?.uid || 'anon').get()

    if (!callerSnap.exists || callerSnap.data()?.role !== 'super') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    try {
        const statsRef = db.collection('system').doc('ai_usage').collection('cycles').doc('current')
        const statsSnap = await statsRef.get()

        if (!statsSnap.exists) {
            return { success: true, message: 'No active cycle found.' }
        }

        const data = statsSnap.data()!
        const timestamp = new Date().toISOString()
        const historyId = timestamp.replace(/[:.]/g, '-')

        // 1. Move to history
        await db.collection('system').doc('ai_usage').collection('history').doc(historyId).set({
            ...data,
            archivedAt: timestamp
        })

        // 2. Reset current
        await statsRef.set({
            totalRequests: 0,
            totalTokens: 0,
            lastRefreshAt: timestamp,
            refreshedBy: user.uid
        })

        return { success: true }
    } catch (e: any) {
        console.error("Refresh AI Stats failed", e)
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
