import { dbAdmin } from '~/server/utils/firebase'
import { Timestamp } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
    // 1. Auth Check
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // 2. Admin Check
    const adminDoc = await dbAdmin.collection('users').doc(user.uid).get()
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
    }

    const body = await readBody(event)
    const { targetUserId, branch } = body

    if (!targetUserId || !branch) {
        throw createError({ statusCode: 400, statusMessage: 'Missing targetUserId or branch' })
    }

    // 3. Sequential ID Generation Transaction
    try {
        const result = await dbAdmin.runTransaction(async (t) => {
            const userRef = dbAdmin.collection('users').doc(targetUserId)
            const userSnap = await t.get(userRef)

            if (!userSnap.exists) {
                throw new Error('Target user not found')
            }

            const userData = userSnap.data()
            if (userData?.libraryCardNumber && userData?.status === 'approved') {
                throw new Error('User already has an approved library card')
            }

            const year = new Date().getFullYear().toString().slice(-2)
            const counterRef = dbAdmin.collection('counters').doc(`${year}-${branch}`)
            const counterSnap = await t.get(counterRef)

            let currentCount = 0
            if (counterSnap.exists) {
                currentCount = counterSnap.data()?.count || 0
            }

            const newCount = currentCount + 1
            const paddedCount = newCount.toString().padStart(4, '0')

            // Format: ZL-YY-BBBB-NNNN
            const newCardId = `ZL-${year}-${branch}-${paddedCount}`

            // Update Counter
            t.set(counterRef, { count: newCount }, { merge: true })

            // Update User
            t.update(userRef, {
                libraryCardNumber: newCardId,
                status: 'approved',
                branch: branch,
                approvedAt: Timestamp.now(),
                approvedBy: user.uid
            })

            return newCardId
        })

        return { success: true, cardId: result }

    } catch (error: any) {
        console.error('Card generation failed:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Internal Server Error'
        })
    }
})
