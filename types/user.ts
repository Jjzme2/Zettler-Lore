import { ROLES } from '~/config/roles'

/**
 * Represents the User profile in the application.
 * Typically stored in the 'users' collection in Firestore.
 */
export interface User {
    uid: string
    email: string
    /**
     * Optional ID linking to an external membership system (e.g. Stripe Customer ID).
     */
    memberId?: string
    /**
     * The user's membership tier/status.
     * Determines access privileges throughout the application.
     */
    membershipStatus: typeof ROLES.FREE | typeof ROLES.MEMBER
    /**
     * Flag indicating if the user has administrative privileges.
     */
    isAdmin?: boolean
}
