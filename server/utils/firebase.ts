import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

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
export const adminApp = getApps().length === 0
    ? initializeApp({
        credential: cert(firebaseAdminConfig)
    })
    : getApps()[0]

export const authAdmin = getAuth(adminApp)
export const dbAdmin = getFirestore(adminApp)
