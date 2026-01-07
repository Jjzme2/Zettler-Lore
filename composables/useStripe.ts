import { loadStripe } from '@stripe/stripe-js'

export const useStripe = () => {
    const config = useRuntimeConfig()

    // Lazy load Stripe
    const stripePromise = config.public.stripePublishableKey
        ? loadStripe(config.public.stripePublishableKey)
        : null

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
