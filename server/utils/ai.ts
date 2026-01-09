import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Generates text using Google Gemini AI models with a fallback strategy.
 *
 * This function attempts to generate content using 'gemini-2.5-flash' first.
 * If that fails, it falls back to 'gemini-2.5-flash-lite'.
 * It also handles error parsing for rate limits and configuration issues.
 *
 * @param {string} prompt - The text prompt to send to the AI model.
 * @returns {Promise<{ text: string, usage: any }>} A promise that resolves to an object containing the generated text and usage metadata.
 * @throws {Error} Throws a 500 error if the API key is missing.
 * @throws {Error} Throws a 503 error if all models fail, with a user-friendly message for rate limits or configuration errors.
 */
export const generateWithGemini = async (prompt: string): Promise<{ text: string, usage: any }> => {
    const config = useRuntimeConfig()
    const apiKey = config.geminiApiKey as string

    if (!apiKey) {
        throw createError({ statusCode: 500, statusMessage: 'Gemini API Key is missing in server config.' })
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    try {
        console.log('[AI] Attempting generation with Flash (2.5)...')
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
        const result = await model.generateContent(prompt)
        return {
            text: result.response.text(),
            usage: result.response.usageMetadata || { totalTokenCount: 0 }
        }
    } catch (error: any) {
        console.warn(`[AI] Flash generation failed: ${error.message}. Falling back to Lite...`)

        try {
            // Fallback to Flash Lite (2.5)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
            const result = await model.generateContent(prompt)
            return {
                text: result.response.text(),
                usage: result.response.usageMetadata || { totalTokenCount: 0 }
            }
        } catch (fallbackError: any) {
            console.error('[AI] All models failed:', fallbackError)

            let message = 'AI Service Unavailable'
            const errStr = (fallbackError.message || '') + (error.message || '')

            if (errStr.includes('429')) {
                if (errStr.includes('PerDay')) {
                    message = 'Daily Rate Limit Exceeded. You have used all free generations for today.'
                } else {
                    // Try to extract exact time
                    const match = errStr.match(/retry in (\d+(\.\d+)?)s/) // e.g. "retry in 11.7s"
                    const waitTime = match ? `${Math.ceil(parseFloat(match[1]))} seconds` : 'a moment'
                    message = `Rate Limit Exceeded. Please wait ${waitTime} and try again.`
                }
            } else if (errStr.includes('API key expired') || errStr.includes('API key not valid')) {
                message = 'AI Configuration Error: API Key Expired or Invalid.'
            } else {
                message = `AI Usage Error. Flash: [${error.message}] | Lite: [${fallbackError.message}]`
            }

            throw createError({
                statusCode: 503,
                statusMessage: message
            })
        }
    }
}
