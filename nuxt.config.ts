// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss'],

    compatibilityDate: '2026-01-06',

    // Global Loading Bar
    loadingIndicator: {
        name: 'folding-cube',
        color: '#A65D57', // shelf color
        background: '#F5F5F4' // stone-100
    },

    // SSR is enabled by default in Nuxt 3, but being explicit as requested
    ssr: true,

    runtimeConfig: {
        // Private keys (server-side only)
        firebaseAdminProjectId: '',
        firebaseAdminClientEmail: '',
        firebaseAdminPrivateKey: '',
        geminiApiKey: '',
        stripeSecretKey: '',
        stripeWebhookSecret: '',

        // Public keys (client-side)
        public: {
            stripePublishableKey: '',
            firebaseApiKey: '',
            firebaseAuthDomain: '',
            firebaseProjectId: '',
            firebaseStorageBucket: '',
            firebaseMessagingSenderId: '',
            firebaseAppId: ''
        }
    },

    // Tailwind configuration
    css: ['~/assets/css/main.css'],

    nitro: {
        // Preset for firebase-functions if needed later, but default 'node-server' or auto is fine for now.
    },

    app: {
        head: {
            link: [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap' }
            ]
        }
    }
})
