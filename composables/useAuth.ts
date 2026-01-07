import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onIdTokenChanged, type User as FirebaseUser } from 'firebase/auth'
import { APP_CONFIG } from '~/config/app.config'

export const useAuth = () => {
    const { $auth } = useNuxtApp()
    const user = useState<FirebaseUser | null>('user', () => null)

    // Initialize user state from server if available (during SSR)
    const refreshUser = async () => {
        try {
            const { data } = await useFetch<{ user: any }>('/api/auth/me')
            if (data.value && data.value.user) {
                user.value = data.value.user
            }
        } catch (e) {
            user.value = null
        }
    }

    // Call refresh immediately if we don't have a user (client-side hydration)
    if (!user.value) {
        refreshUser()
    }

    const setSessionCookie = async (user: FirebaseUser) => {
        const idToken = await user.getIdToken()
        // Send token to server to create session cookie
        await $fetch('/api/auth/session', {
            method: 'POST',
            body: { idToken }
        })
        // Reload to ensure all server-side props are re-fetched with new permissions
        window.location.reload()
    }

    const signInWithEmail = async (email: string, pass: string) => {
        try {
            const result = await signInWithEmailAndPassword($auth, email, pass)
            await setSessionCookie(result.user)
        } catch (error) {
            console.error('Login failed', error)
            throw error
        }
    }

    const registerWithEmail = async (email: string, pass: string) => {
        try {
            const { $db } = useNuxtApp()
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')

            const result = await createUserWithEmailAndPassword($auth, email, pass)

            // Create user document in Firestore
            await setDoc(doc($db, 'users', result.user.uid), {
                email: email,
                uid: result.user.uid,
                role: 'member', // Default role
                libraryCardNumber: null, // Pending approval
                status: 'pending', // Pending approval
                branch: 'COMM', // Default branch
                createdAt: serverTimestamp(),
                displayName: 'Reader'
            })

            await setSessionCookie(result.user)
        } catch (error) {
            console.error('Registration failed', error)
            throw error
        }
    }

    const signOut = async () => {
        try {
            await firebaseSignOut($auth)
            // Call server to clear session cookie
            await $fetch('/api/auth/logout', { method: 'POST' })

            // Redirect to logout page
            const router = useRouter()
            router.push('/logout')

            // Clear local state
            user.value = null
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    return {
        user,
        signInWithEmail,
        registerWithEmail,
        signOut,
        refreshUser
    }
}
