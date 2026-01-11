import { useStripe } from '~/server/utils/stripe'

/**
 * Stripe Webhook Handler.
 *
 * This endpoint receives and verifies webhook events from Stripe.
 * It handles successful payments and subscription updates.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ received: boolean }>} Confirmation of receipt.
 * @throws {Error} Throws a 400 error if signature is invalid or missing.
 */
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const stripe = useStripe()
    const signature = getHeader(event, 'stripe-signature')

    if (!config.stripeWebhookSecret || !signature) {
        throw createError({ statusCode: 400, statusMessage: 'Webhook secret or signature missing' })
    }

    const rawBody = await readRawBody(event)
    if (!rawBody) {
        throw createError({ statusCode: 400, statusMessage: 'No body' })
    }

    let stripeEvent

    try {
        stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret)
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message)
        throw createError({ statusCode: 400, statusMessage: 'Webhook Error: ' + err.message })
    }

    // Handle the event
    switch (stripeEvent.type) {
        case 'checkout.session.completed':
            const session = stripeEvent.data.object
            console.log('Payment successful for session:', session.id)
            // Provision the subscription here
            // e.g., updateUserRole(session.metadata.userId, ROLES.MEMBER)
            break
        case 'invoice.payment_succeeded':
            // Continue provision
            break
        case 'invoice.payment_failed':
            // Handle failed payment (e.g. notify user, downgrade access)
            break
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${stripeEvent.type}`)
    }

    return { received: true }
})
