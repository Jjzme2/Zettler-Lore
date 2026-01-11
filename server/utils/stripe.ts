import Stripe from 'stripe'

/**
 * Initializes and returns a Stripe client instance.
 *
 * This utility function creates a new Stripe instance using the secret key from the runtime configuration.
 * It enforces a specific API version for stability.
 *
 * @returns {Stripe} A configured Stripe client instance.
 * @throws {Error} Throws an error if the Stripe secret key is missing in the configuration.
 */
export const useStripe = () => {
    const config = useRuntimeConfig()
    if (!config.stripeSecretKey) {
        throw new Error('Stripe secret key is not configured')
    }
    return new Stripe(config.stripeSecretKey, {
        apiVersion: '2025-12-15.clover', // Corrected to match the latest/expected version
    })
}
