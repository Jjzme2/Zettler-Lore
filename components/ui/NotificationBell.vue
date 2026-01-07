<script setup lang="ts">
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { user } = useAuth()

const notifications = ref<any[]>([])
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Native Click Outside
const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

let unsubscribe: any = null

onMounted(() => {
    if (!user.value) return

    const q = query(
        collection($db, 'users', user.value.uid, 'notifications'), 
        orderBy('createdAt', 'desc'), 
        limit(10)
    )

    unsubscribe = onSnapshot(q, (snapshot) => {
        notifications.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    })
})

onUnmounted(() => {
    if (unsubscribe) unsubscribe()
})

const markRead = async (notification: any) => {
    if (notification.read) return
    try {
        await updateDoc(doc($db, 'users', user.value.uid, 'notifications', notification.id), {
            read: true
        })
    } catch (e) {
        console.error("Failed to mark read", e)
    }
}

const markAllRead = async () => {
    const unread = notifications.value.filter(n => !n.read)
    unread.forEach(n => markRead(n))
}

const toggle = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        // Optional: Mark all as read when opening? No, usually explicitly clicked.
    }
}
</script>

<template>
    <div ref="dropdownRef" class="relative">
        <!-- Bell Button -->
        <button @click="toggle" class="relative p-2 text-pencil hover:text-ink transition-colors rounded-full hover:bg-stone-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            
            <!-- Badge -->
            <span v-if="unreadCount > 0" class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-bold text-white ring-2 ring-white">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
        </button>

        <!-- Dropdown -->
        <div v-if="isOpen" class="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-sm shadow-xl z-50 overflow-hidden text-left origin-top-right">
            <div class="px-4 py-3 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h3 class="text-xs font-bold uppercase text-stone-500 tracking-wider">Notifications</h3>
                <button v-if="unreadCount > 0" @click="markAllRead" class="text-xs text-shelf hover:underline">Mark all read</button>
            </div>
            
            <div class="max-h-96 overflow-y-auto">
                <div v-if="notifications.length === 0" class="p-6 text-center text-stone-400 text-sm italic">
                    All caught up.
                </div>
                
                <div 
                    v-for="n in notifications" 
                    :key="n.id" 
                    @click="markRead(n)"
                    :class="['p-4 border-b border-stone-100 last:border-0 hover:bg-parchment transition-colors cursor-pointer', !n.read ? 'bg-indigo-50/50' : '']"
                >
                    <div class="flex gap-3">
                        <div class="mt-1">
                            <span v-if="n.type === 'success'" class="text-forest">●</span>
                            <span v-else-if="n.type === 'error'" class="text-rust">●</span>
                            <span v-else class="text-shelf">●</span>
                        </div>
                        <div>
                            <p :class="['text-sm', !n.read ? 'font-semibold text-ink' : 'text-stone-600']">{{ n.title }}</p>
                            <p class="text-xs text-pencil mt-1">{{ n.message }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
