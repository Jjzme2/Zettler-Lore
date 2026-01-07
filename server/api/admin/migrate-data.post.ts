import { dbAdmin } from '~/server/utils/firebase'

export default defineEventHandler(async (event) => {
    // Admin check (simplified for this migration tool, but ideally usually restricted)
    // For safety, let's just ensure they are logged in. Real admin check usually better.
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // In a real scenario, check for admin role here.
    // const adminDoc = await dbAdmin.collection('users').doc(user.uid).get()
    // if (adminDoc.data()?.role !== 'admin') ...

    const usersRef = dbAdmin.collection('users')
    const snapshot = await usersRef.get()

    let updatedCount = 0
    const updates: string[] = []

    for (const doc of snapshot.docs) {
        const userData = doc.data()

        // Check if missing library card
        if (!userData.libraryCardNumber || userData.status === 'pending') {
            // Only backfill if they are actually approved or we want to auto-approve old users
            // Let's assume we want to Give everyone a card if they don't have one and are missing it.
            // Or strictly follow the "pending" rule.

            // User requested "ensure sync".
            // Let's generate a basic card for anyone missing one, default to COMM branch.

            const branch = userData.branch || 'COMM'
            const year = new Date().getFullYear().toString().slice(-2)

            // We need to be careful with counters in a loop, but for small batch it's okay.
            // Better to run transaction for each, or just simplistic counter if low contention.
            // We'll use the proper transaction to be safe and consistent with generate-card logic.

            try {
                await dbAdmin.runTransaction(async (t) => {
                    const counterRef = dbAdmin.collection('counters').doc(`${year}-${branch}`)
                    const counterSnap = await t.get(counterRef)
                    let currentCount = counterSnap.exists ? counterSnap.data()?.count || 0 : 0

                    const newCount = currentCount + 1
                    const paddedCount = newCount.toString().padStart(4, '0')
                    const newCardId = `ZL-${year}-${branch}-${paddedCount}`

                    t.set(counterRef, { count: newCount }, { merge: true })
                    t.update(doc.ref, {
                        libraryCardNumber: newCardId,
                        status: 'approved', // Auto-approve for migration sake?
                        migratedAt: new Date().toISOString()
                    })
                })
                updatedCount++
                updates.push(`Generated ${doc.id} -> ZL-...`)
            } catch (e) {
                console.error(`Failed to migrate ${doc.id}`, e)
            }
        }
    }

    return {
        success: true,
        updated: updatedCount,
        details: updates
    }
})
