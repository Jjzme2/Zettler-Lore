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

let privateKey = config.firebaseAdminPrivateKey
if (privateKey) {
    // Remove wrapping quotes if accidentally included
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1)
    }
    // Handle escaped newlines (common in .env) vs literal newlines
    privateKey = privateKey.replace(/\\n/g, '\n')
}

// Debug logging (safe)
if (privateKey) {
    console.log(`[Firebase] Private Key loaded. Length: ${privateKey.length}`)
    console.log(`[Firebase] First 20 chars: ${JSON.stringify(privateKey.slice(0, 20))}`)
    // Check for common issues
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error('[Firebase] Error: Private key is missing standard header')
    }
} else {
    console.error('[Firebase] Error: Private key is undefined')
}

const firebaseAdminConfig = {
    projectId: config.firebaseAdminProjectId,
    clientEmail: config.firebaseAdminClientEmail,
    privateKey: privateKey,
}

if (!firebaseAdminConfig.projectId || !firebaseAdminConfig.clientEmail || !firebaseAdminConfig.privateKey) {
    console.error('Missing Firebase Admin configuration. Please check your .env file.')
}

// Initialize Firebase Admin only once
/**
 * The initialized Firebase Admin application instance.
 */
export const adminApp = getApps().length === 0
    ? initializeApp({
        credential: cert(firebaseAdminConfig)
    })
    : getApps()[0]

/**
 * The Firebase Auth Admin service instance.
 */
export const authAdmin = getAuth(adminApp)

/**
 * The Firebase Firestore Admin service instance.
 */
export const dbAdmin = getFirestore(adminApp)
