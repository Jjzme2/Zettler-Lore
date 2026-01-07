import { dbAdmin } from './firebase'
import { H3Event } from 'h3'

export const requireSuperUser = async (event: H3Event) => {
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const snap = await dbAdmin.collection('users').doc(user.uid).get()

    if (!snap.exists || snap.data()?.role !== 'super') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Super access required' })
    }

    return user
}
