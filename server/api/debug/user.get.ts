import { getFirestore } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
    // Security: Require super user access since this exposes env vars
    await requireSuperUser(event)

    const user = event.context.user
    const db = getFirestore()

    let dbUser = null
    if (user?.uid) {
        const snap = await db.collection('users').doc(user.uid).get()
        if (snap.exists) {
            dbUser = snap.data()
        }
    }

    return {
        sessionUser: user,
        dbUser: dbUser,
        env: {
            projectId: process.env.FIREBASE_PROJECT_ID,
            adminEmail: process.env.FIREBASE_CLIENT_EMAIL?.slice(0, 5) + '...'
        }
    }
})
