import { FieldValue } from 'firebase-admin/firestore'
import { generateWithGemini } from '../../utils/ai'
import { dbAdmin } from '../../utils/firebase'

/**
 * Generates content using AI on behalf of an AI persona.
 *
 * This endpoint allows super-users to trigger AI story generation.
 * It fetches the AI persona's profile (system prompt, style), constructs a full prompt,
 * calls the Gemini API, and saves the result as a new story in Firestore.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, slug: string, title: string, usage: object }>} The generated story details and usage stats.
 * @throws {Error} Throws a 403 error if the caller is not a super-user.
 * @throws {Error} Throws a 400 error if parameters are missing or invalid.
 * @throws {Error} Throws a 500 error on generation failure.
 */
export default defineEventHandler(async (event) => {
    const user = event.context.user

    // Strict DB Check (Avoids stale token 403s)
    const db = dbAdmin
    const callerSnap = await db.collection('users').doc(user?.uid || 'anon').get()

    if (!callerSnap.exists || callerSnap.data()?.role !== 'super') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const { aiUserId, prompt, type, shelf, title, summary, isAnonymous } = await readBody(event)

    if (!aiUserId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing parameters' })
    }

    // const db = getFirestore() // Removed redundant init

    // 1. Get AI User logic context
    const aiUserSnap = await db.collection('users').doc(aiUserId).get()
    const aiUser = aiUserSnap.data()

    if (!aiUser || !aiUser.isAI) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid AI User' })
    }

    // 1.5 Get Profile
    const profileSnap = await db.collection('users').doc(aiUserId).collection('ai_profile').doc('default').get()

    if (!profileSnap.exists) {
        throw createError({ statusCode: 400, statusMessage: 'AI Profile missing: Cannot generate content without persona definitions.' })
    }

    const profile = profileSnap.data()!

    // 2. Construct Prompt
    let taskDescription = `Create a new ${type || 'Story'}.`
    if (title) taskDescription += ` The title MUST be "${title}".`
    if (summary) taskDescription += ` Use this summary as the core plot: "${summary}".`
    if (prompt) taskDescription += ` Additional context/instructions: "${prompt}".`
    else if (!title && !summary) taskDescription += ` Invent a new myth or history for the archive.`

    // Profile MUST provide these or we fail (ensures DB priority)
    const basePersona = profile.systemPrompt
    const styleGuide = profile.styleGuide

    if (!basePersona || !styleGuide) {
        throw createError({ statusCode: 400, statusMessage: 'AI Profile incomplete: systemPrompt and styleGuide are required.' })
    }

    const fullPrompt = `${basePersona}
    Task: ${taskDescription}
    
    Output Format: JSON
    Dictionary keys: "title" (string), "content" (markdown string), "summary" (string).
    
    Style Guide:
    ${styleGuide}
    `

    // 3. Call Gemini
    try {
        const { text, usage } = await generateWithGemini(fullPrompt)

        // Clean JSON
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const data = JSON.parse(jsonStr)

        // 4. Save to Firestore as the AI User
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4)

        const batch = db.batch()

        // Story Doc
        const storyRef = db.collection('stories').doc(slug)
        batch.set(storyRef, {
            title: data.title,
            content: data.content,
            summary: data.summary,
            authorId: aiUserId, // Always track real author ID
            author: isAnonymous ? 'Anonymous' : aiUser.displayName, // Display name logic
            type: type || 'myth',
            shelf: 'ai', // Enforce AI shelf
            status: 'pending', // Pending Admin Approval
            isPublicDomain: true,
            createdAt: new Date().toISOString(),
            slug
        })

        // Stats Tracking (Atomic Increment) - Monthly/Cycle Based
        const statsRef = db.collection('system').doc('ai_usage').collection('cycles').doc('current')
        batch.set(statsRef, {
            totalRequests: FieldValue.increment(1),
            totalTokens: FieldValue.increment(usage.totalTokenCount || 0),
            lastRequest: new Date().toISOString()
        }, { merge: true })

        await batch.commit()

        return { success: true, slug, title: data.title, usage }

    } catch (e: any) {
        console.error("AI Generation failed", e)
        const msg = e.response?.data?.message || e.message || e.statusMessage || String(e)
        throw createError({ statusCode: 500, statusMessage: msg })
    }
})
