import Stripe from 'stripe'

export const useStripe = () => {
    const config = useRuntimeConfig()
    if (!config.stripeSecretKey) {
        throw new Error('Stripe secret key is not configured')
    }
    return new Stripe(config.stripeSecretKey, {
        apiVersion: '2024-12-18.acacia', // Use a pinned version for stability
    })
}
