import { dbAdmin } from './firebase'
import { Timestamp } from 'firebase-admin/firestore'

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
