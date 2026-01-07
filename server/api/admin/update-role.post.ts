import { dbAdmin } from '../../utils/firebase'
import { createNotification } from '../../utils/notifications'

export default defineEventHandler(async (event) => {
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const { targetUserId, newRole } = await readBody(event)

    if (!targetUserId || !['member', 'admin', 'super'].includes(newRole)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid request' })
    }

    const db = dbAdmin

    // Strict DB Check: Fetch the caller's fresh role from Firestore
    // This circumvents stale session tokens
    const callerSnap = await db.collection('users').doc(user.uid).get()

    // AI users are also super, so we check for 'super' role
    if (!callerSnap.exists || callerSnap.data()?.role !== 'super') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Super access required' })
    }

    try {
        await db.collection('users').doc(targetUserId).update({
            role: newRole
        })

        // Notify User
        await createNotification(
            targetUserId,
            'Role Updated',
            `Your role has been updated to ${newRole.toUpperCase()}. Please refresh to see changes.`,
            'info'
        )

        return { success: true }
    } catch (e) {
        console.error("Role update failed", e)
        throw createError({ statusCode: 500, statusMessage: 'Failed to update role' })
    }
})
