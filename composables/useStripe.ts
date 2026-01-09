import { loadStripe } from '@stripe/stripe-js'

/**
 * Composable for Client-Side Stripe integration.
 *
 * This composable handles loading the Stripe.js library and initiating the checkout process.
 * It interacts with the server-side API to create a Checkout Session.
 *
 * @returns {object} An object containing the `redirectToCheckout` method.
 */
export const useStripe = () => {
    const config = useRuntimeConfig()

    // Lazy load Stripe
    const stripePromise = config.public.stripePublishableKey
        ? loadStripe(config.public.stripePublishableKey)
        : null

    /**
     * Redirects the user to the Stripe Checkout page for a specific subscription plan.
     *
     * @param {string} priceId - The Stripe Price ID of the product/subscription.
     */
    const redirectToCheckout = async (priceId: string) => {
        if (!stripePromise) {
            console.error('Stripe is not configured')
            return
        }

        try {
            const { data, error } = await useFetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                body: { priceId }
            })

            if (error.value) {
                console.error('Error creating checkout session:', error.value)
                alert('Failed to start subscription process.')
                return
            }

            if (data.value?.url) {
                window.location.href = data.value.url
            }

        } catch (e) {
            console.error('Error during checkout redirection:', e)
        }
    }

    return {
        redirectToCheckout
    }
}
