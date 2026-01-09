import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Initializes and exports Firebase Admin SDK instances.
 *
 * This module handles the initialization of the Firebase Admin app using environment variables.
 * It ensures that the app is initialized only once (singleton pattern).
 * It also parses the private key to handle common formatting issues (escaped newlines, wrapping quotes).
 */

const config = useRuntimeConfig()

// Helper to get from runtimeConfig or raw environment
const getEnv = (key: string, nuxtKey: string) => {
    return config[nuxtKey] || process.env[key] || process.env[`NUXT_${key}`]
}

const projectId = getEnv('FIREBASE_ADMIN_PROJECT_ID', 'firebaseAdminProjectId')
const clientEmail = getEnv('FIREBASE_ADMIN_CLIENT_EMAIL', 'firebaseAdminClientEmail')
let privateKey = getEnv('FIREBASE_ADMIN_PRIVATE_KEY', 'firebaseAdminPrivateKey')

if (privateKey) {
    // Remove wrapping quotes if accidentally included
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1)
    }
    // Handle escaped newlines (common in .env) vs literal newlines
    privateKey = privateKey.replace(/\\n/g, '\n')
}

// Validation & Selective Logging
if (!projectId || !clientEmail || !privateKey) {
    const missing = []
    if (!projectId) missing.push('projectId')
    if (!clientEmail) missing.push('clientEmail')
    if (!privateKey) missing.push('privateKey')

    console.error(`[Firebase] Missing Configuration: ${missing.join(', ')}. Check environment variables.`)
} else {
    console.log(`[Firebase] Configuration loaded for project: ${projectId}`)
    if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.log(`[Firebase] Private Key validated (Header present). Length: ${privateKey.length}`)
    } else {
        console.error('[Firebase] Private Key Error: Missing header standard format.')
    }
}

const firebaseAdminConfig = {
    projectId,
    clientEmail,
    privateKey,
}

// Initialize Firebase Admin only once
export const adminApp = getApps().length === 0
    ? initializeApp({
        credential: cert(firebaseAdminConfig)
    })
    : getApps()[0]

export const authAdmin = getAuth(adminApp)
export const dbAdmin = getFirestore(adminApp)
