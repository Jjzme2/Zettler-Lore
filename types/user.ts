import { ROLES } from '~/config/roles'

/**
 * Represents the User profile in the application.
 * This interface corresponds to the data stored in the `users` collection in Firestore.
 */
export interface User {
    /** Unique Firebase User ID (UID). Matches the Auth UID. */
    uid: string
    /** User's primary email address. */
    email: string
    /**
     * Optional ID linking to an external membership system (e.g. Stripe Customer ID).
     * Used to sync payments and subscriptions.
     */
    memberId?: string
    /**
     * The user's membership tier/status.
     * Determines access privileges (e.g., what shelves they can see).
     * - `FREE`: Basic access.
     * - `MEMBER`: Full access.
     */
    membershipStatus: typeof ROLES.FREE | typeof ROLES.MEMBER
    /**
     * Flag indicating if the user has administrative privileges.
     * Admins can typically edit content and manage users.
     */
    isAdmin?: boolean
}
