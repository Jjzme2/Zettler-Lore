import { dbAdmin } from '../../utils/firebase'
import { requireSuperUser } from '../../utils/auth'

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
