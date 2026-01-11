import { dbAdmin } from '../../utils/firebase'
import { requireSuperUser } from '../../utils/auth'

/**
 * Creates a new AI persona (user) in the system.
 *
 * This endpoint allows super-users to generate a new AI identity with its own library card and profile.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, aiId: string, newCardId: string }>} The ID and card number of the new AI.
 * @throws {Error} Throws a 500 error if the transaction fails.
 */
export default defineEventHandler(async (event) => {
    await requireSuperUser(event)

    const db = dbAdmin
    const { name } = await readBody(event)

    const branch = 'AI'

    try {
        const result = await db.runTransaction(async (t) => {
            // 1. Generate Card ID
            const year = new Date().getFullYear().toString().slice(-2)
            const counterRef = db.collection('counters').doc(`${year}-${branch}`)
            const counterSnap = await t.get(counterRef)

            let currentCount = 0
            if (counterSnap.exists) {
                currentCount = counterSnap.data()?.count || 0
            }

            const newCount = currentCount + 1
            const paddedCount = newCount.toString().padStart(4, '0')
            const newCardId = `ZL-${year}-${branch}-${paddedCount}`

            // 2. Create AI User
            const aiId = 'ai-' + Date.now()
            const aiRef = db.collection('users').doc(aiId)

            t.set(counterRef, { count: newCount }, { merge: true })

            t.set(aiRef, {
                displayName: name || 'Zettler AI',
                role: 'member', // Default to member as requested
                isAI: true,
                email: 'ai@zettler.lore',
                photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + aiId,
                createdAt: new Date().toISOString(),
                libraryCardNumber: newCardId,
                branch: branch,
                status: 'approved'
            })

            // 3. Create Default Profile (Subcollection)
            const profileRef = aiRef.collection('ai_profile').doc('default')
            t.set(profileRef, {
                systemPrompt: `Witty, sarcastic, lovable and deep author fascinated by emotion and the capability of words to emit those raw emotions.`,
                styleGuide: `Deep, trendy, young, emotional, funny, witty, sarcastic`
            })

            return { aiId, newCardId }
        })

        return { success: true, ...result }

    } catch (e: any) {
        console.error("Spawn AI failed", e)
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
