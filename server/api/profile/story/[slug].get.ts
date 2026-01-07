import { dbAdmin } from '../../../utils/firebase'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

    const db = dbAdmin
    const docRef = db.collection('stories').doc(slug)
    const doc = await docRef.get()

    console.log(`[StoryAccess] Slug: ${slug} | User: ${user.uid} (${user.role}) | Exists: ${doc.exists}`)

    if (!doc.exists) {
        throw createError({ statusCode: 404, statusMessage: 'Story not found' })
    }

    const data = doc.data()

    // Ownership check (or admin/super)
    let hasAccess = data?.authorId === user.uid || ['admin', 'super'].includes(user.role)

    // Fail-safe: Check DB if cookie says no, in case of stale claims
    if (!hasAccess) {
        const userSnap = await db.collection('users').doc(user.uid).get()
        const realRole = userSnap.data()?.role
        if (['admin', 'super'].includes(realRole)) {
            hasAccess = true
        }
    }

    if (!hasAccess) {
        console.log(`[StoryAccess] Denied. Owner: ${data?.authorId} | Requestor: ${user.uid}`)
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    return { slug: doc.id, ...data }
})
