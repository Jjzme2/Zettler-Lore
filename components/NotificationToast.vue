<script setup lang="ts">
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { user } = useAuth()
const notifications = ref<any[]>([])
const showToast = ref(false)
const latestNotification = ref<any>(null)

let unsubscribe: any = null

onMounted(() => {
    if (!user.value) return

    const q = query(
        collection($db, 'users', user.value.uid, 'notifications'), 
        orderBy('createdAt', 'desc'), 
        limit(5)
    )

    unsubscribe = onSnapshot(q, (snapshot) => {
        const changes = snapshot.docChanges()
        
        changes.forEach((change) => {
            if (change.type === 'added') {
                const notif = { id: change.doc.id, ...change.doc.data() }
                notifications.value.unshift(notif)
                
                // Show toast for new notifications (if less than 10 seconds old to avoid blast on load)
                const isRecent = (Date.now() - (notif.createdAt?.toMillis() || 0)) < 10000
                if (isRecent) {
                    latestNotification.value = notif
                    showToast.value = true
                    setTimeout(() => showToast.value = false, 5000)
                }
            }
        })
    })
})

const markAsRead = async (id: string) => {
    if (!user.value) return
    await updateDoc(doc($db, 'users', user.value.uid, 'notifications', id), { read: true })
}
</script>

<template>
    <div class="fixed top-4 right-4 z-[9999] pointer-events-none">
        
        <!-- Toast Notification -->
        <Transition
            enter-active-class="transform ease-out duration-300 transition"
            enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="showToast && latestNotification" class="max-w-sm w-full bg-white border border-stone-200 shadow-lg rounded-sm pointer-events-auto p-4 flex gap-4">
               <div :class="{
                   'text-forest': latestNotification.type === 'success',
                   'text-rust': latestNotification.type === 'error',
                   'text-shelf': latestNotification.type === 'info',
                   'text-amber-500': latestNotification.type === 'warning'
               }" class="text-xl">
                    ●
               </div>
               <div>
                   <h4 class="font-serif text-ink text-sm font-bold">{{ latestNotification.title }}</h4>
                   <p class="text-xs text-pencil mt-1">{{ latestNotification.message }}</p>
               </div>
               <button @click="showToast = false" class="ml-auto text-stone-400 hover:text-ink">×</button>
            </div>
        </Transition>

    </div>
</template>
