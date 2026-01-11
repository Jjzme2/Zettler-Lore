import { ROLES } from '~/config/roles'
import { useStripe } from '~/server/utils/stripe'

/**
 * Creates a Stripe Checkout Session.
 *
 * This endpoint initiates the payment flow for a subscription.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ url: string }>} The Stripe Checkout URL.
 * @throws {Error} Throws a 400 error if priceId is missing.
 * @throws {Error} Throws a 500 error if Stripe session creation fails.
 */
export default defineEventHandler(async (event) => {
    // In a real app, you would verify the user here
    // const user = await getUserFromContext(event)
    // if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const body = await readBody(event)
    const { priceId, successUrl, cancelUrl } = body

    if (!priceId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing priceId' })
    }

    const stripe = useStripe()
    const config = useRuntimeConfig()

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${config.public.appUrl || 'http://localhost:3000'}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${config.public.appUrl || 'http://localhost:3000'}/subscribe`,
            // customer: user.stripeCustomerId, // If you have it
            metadata: {
                // userId: user.uid,
                role: ROLES.MEMBER
            }
        })

        return { url: session.url }
    } catch (e: any) {
        console.error('Stripe Checkout Error:', e)
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
