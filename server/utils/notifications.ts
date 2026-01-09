import { dbAdmin } from './firebase'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * Creates a notification for a specific user in Firestore.
 *
 * This function adds a document to the `notifications` subcollection of the specified user.
 * It is used to inform users about events, status updates, or errors.
 *
 * @param {string} userId - The UID of the user to receive the notification.
 * @param {string} title - The title of the notification.
 * @param {string} message - The body text of the notification.
 * @param {'info' | 'success' | 'warning' | 'error'} [type='info'] - The type of notification, affecting its display style.
 * @returns {Promise<void>} A promise that resolves when the notification is added.
 */
export const createNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    try {
        await dbAdmin.collection('users').doc(userId).collection('notifications').add({
            title,
            message,
            type,
            read: false,
            createdAt: Timestamp.now()
        })
    } catch (e) {
        console.error("Failed to send notification", e)
    }
}
