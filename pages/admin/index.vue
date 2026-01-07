<script setup lang="ts">
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, limit } from 'firebase/firestore'

const { $db } = useNuxtApp()
const { user } = useAuth()
const activeTab = ref('members')
const pendingUsers = ref<any[]>([])
const allUsers = ref<any[]>([])
const loading = ref(false)
const processingId = ref<string | null>(null)

// Computed for branches dropdown
const branches = ['COMM', 'STOR', 'FOUND']

const shelves = ref<any[]>([])
const books = ref<any[]>([])
const aiStats = ref<any>(null)

// Modal State
const showShelfModal = ref(false)
const newShelf = ref({ title: '', description: '', isPublic: true })

const createShelf = async () => {
    if (!newShelf.value.title) return
    
    try {
        if ((newShelf.value as any).isEditing) {
             // Use the ID we stored when opening the modal
             const { title, description, isPublic, id } = newShelf.value as any
             
             if (!id) throw new Error("Missing shelf ID for update")
             
             if (!id) throw new Error("Missing shelf ID for update")
             
             // Sanitize data (Firestore hates undefined)
             const safeUpdate = {
                 title: title || 'Untitled',
                 description: description || '',
                 isPublic: isPublic === true // Force boolean
             }

             console.log(`[Admin] Updating shelf ${id} with:`, safeUpdate)
             
             await updateDoc(doc($db, 'shelves', id), safeUpdate)
        } else {
            await $fetch('/api/admin/create-shelf', {
                method: 'POST',
                body: newShelf.value
            })
        }
        
        showShelfModal.value = false
        resetShelfForm()
        await fetchUsers() 
    } catch (e: any) {
        console.error(e)
        alert(`Failed to save shelf: ${e.message || e.statusMessage || 'Unknown error'}`)
    }
}

const resetShelfForm = () => {
    newShelf.value = { title: '', description: '', isPublic: true }
    ;(newShelf.value as any).isEditing = false
}

const openEditShelf = (shelf: any) => {
    // important: pass 'id' (from firestore doc id) not just 'slug' (from data)
    newShelf.value = { 
        ...shelf, 
        isEditing: true, 
        id: shelf.id,
        isPublic: !!shelf.isPublic // Ensure boolean
    }
    showShelfModal.value = true
}

const archiveShelf = async (id: string) => {
    if(!id) {
        alert("Error: Invalid shelf ID")
        return
    }
    if(!confirm(`Archive shelf? It will be hidden from the main library.`)) return
    try {
        console.log(`[Admin] Archiving shelf ${id}`)
        await updateDoc(doc($db, 'shelves', id), {
            isArchived: true,
            isPublic: false
        })
        await fetchUsers()
    } catch (e: any) {
        console.error(e)
        alert(`Archive failed: ${e.message}`)
    }
}

// ... deleteBook ...
const updateBookStatus = async (id: string, newStatus: string) => {
    try {
        await $fetch(`/api/profile/story/${id}`, {
            method: 'PUT',
            body: { status: newStatus }
        })
        // Optimistic update
        const book = books.value.find(b => b.id === id)
        if (book) book.status = newStatus
    } catch (e) {
        console.error("Status update failed", e)
        alert("Failed to update status")
    }
}

const fetchUsers = async () => {
    loading.value = true
    try {
        // ... pending ...
        const pendingQuery = query(collection($db, 'users'), where('status', '==', 'pending'))
        const pendingSnap = await getDocs(pendingQuery)
        pendingUsers.value = pendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), selectedBranch: 'COMM' }))

        // ... all users ...
        const allQuery = query(collection($db, 'users'), limit(100))
        const allSnap = await getDocs(allQuery)
        allUsers.value = allSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        console.log('Fetched users:', allUsers.value)

        // Fetch Content (Shelves & Books)
        // Ensure we map ID correctly and fallback slug to ID if missing
        const shelfsRef = await getDocs(collection($db, 'shelves'))
        shelves.value = shelfsRef.docs.map(d => {
            const data = d.data()
            return {
                id: d.id, 
                ...data,
                slug: data.slug || d.id // Guarantee slug exists for display
            }
        })

        // ... books ...
        const booksRef = await getDocs(query(collection($db, 'stories'), limit(50)))
        books.value = booksRef.docs.map(d => ({id: d.id, ...d.data()}))
        
        // Fetch AI Stats
        if (user.value?.role === 'super') {
            const statsSnap = await getDocs(collection($db, 'system'))
            const usageDoc = statsSnap.docs.find(d => d.id === 'ai_usage')
            
            // Set stats or defaults
            aiStats.value = usageDoc ? usageDoc.data() : { totalRequests: 0, totalTokens: 0 }
        }

    } catch (e) {
        console.error("Error fetching admin data", e)
    } finally {
        loading.value = false
    }
}

const approveMember = async (user: any) => {
    processingId.value = user.id
    try {
        const { data, error } = await useFetch('/api/admin/generate-card', {
            method: 'POST',
            body: {
                targetUserId: user.id,
                branch: user.selectedBranch
            }
        })

        if (error.value) throw error.value

        // Refresh list
        await fetchUsers()
    } catch (e) {
        console.error("Approval failed", e)
        alert("Failed to approve member. Check console.")
    } finally {
        processingId.value = null
    }
}

const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return
    
    try {
        await deleteDoc(doc($db, 'users', userId))
        await fetchUsers()
    } catch (e) {
        console.error("Delete failed", e)
    }
}

// AI Logic
const spawnAI = async () => {
    const name = prompt("Name your AI Archivist:")
    if (!name) return

    try {
        await $fetch('/api/admin/spawn-ai', {
            method: 'POST',
            body: { name }
        })
        await fetchUsers()
    } catch (e) {
        alert("Failed to spawn AI")
    }
}

const updateUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`Change this user's role to ${newRole}?`)) return
    try {
        await $fetch('/api/admin/update-role', {
            method: 'POST',
            body: { targetUserId: userId, newRole }
        })
        // Optimistic update
        const u = allUsers.value.find(u => u.id === userId)
        if (u) u.role = newRole
        alert(`User role updated to ${newRole}`)
    } catch (e) {
        console.error("Role update failed", e)
        alert("Failed to update role")
    }
}

const generatePrompt = ref('')
const generateTitle = ref('')
const generateType = ref('short_story')
const generateShelf = ref('community')
const generateSummary = ref('')

const statusFilter = ref('all')

const filteredBooks = computed(() => {
    if (statusFilter.value === 'all') return books.value
    return books.value.filter(b => b.status === statusFilter.value)
})

const selectedAI = ref('')
const showGenModal = ref(false)

const openGenerator = (aiId: string) => {
    selectedAI.value = aiId
    generateTitle.value = ''
    generateType.value = 'short_story'
    generateShelf.value = 'community'
    generateSummary.value = ''
    generatePrompt.value = ''
    showGenModal.value = true
}

const runGeneration = async () => {
    loading.value = true
    showGenModal.value = false // close immediately
    try {
        const res = await $fetch('/api/ai/generate', {
            method: 'POST',
            body: {
                aiUserId: selectedAI.value,
                prompt: generatePrompt.value,
                title: generateTitle.value,
                type: generateType.value,
                shelf: generateShelf.value,
                summary: generateSummary.value
            }
        })
        alert(`Generated: ${res.title}`)
        await fetchUsers() 
    } catch (e: any) {
        console.error(e)
        alert(`Generation failed: ${e.statusMessage}`)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchUsers()
})
</script>

<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <div class="mb-8 flex justify-between items-center">
      <h1 class="font-serif text-3xl text-ink">Administration</h1>
      <div class="text-sm text-pencil">
        Restricted Access
      </div>
    </div>

    <!-- AI Cost Estimator (Super Only) -->
    <div v-if="user?.role === 'super' && aiStats" class="mb-6 bg-stone-900 text-stone-300 p-4 rounded-sm flex items-center justify-between text-xs font-mono shadow-inner border border-stone-700">
        <div class="flex gap-4">
             <span>STATISTICS:</span>
             <span class="text-white">{{ aiStats.totalRequests || 0 }} REQUESTS</span>
             <span class="text-white">{{ (aiStats.totalTokens || 0).toLocaleString() }} TOKENS</span>
        </div>
        <div class="flex gap-2 items-center">
             <span>EST. COST:</span>
             <!-- Assuming mostly Flash usage @ $0.35 per 1M tokens -->
             <span class="text-forest font-bold text-sm">${{ ((aiStats.totalTokens || 0) / 1000000 * 0.35).toFixed(4) }}</span>
        </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-8 border-b border-stone-200 mb-12">
      <button 
        @click="activeTab = 'members'"
        :class="['pb-4 text-sm font-medium transition-colors', activeTab === 'members' ? 'text-shelf border-b-2 border-shelf' : 'text-stone-400 hover:text-ink']"
      >
        Members & Approvals
      </button>
      <button 
        @click="activeTab = 'content'"
        :class="['pb-4 text-sm font-medium transition-colors', activeTab === 'content' ? 'text-shelf border-b-2 border-shelf' : 'text-stone-400 hover:text-ink']"
      >
        Shelves & Books
      </button>
    </div>

    <!-- Members Tab -->
    <div v-if="activeTab === 'members'" class="space-y-12">
      
      <!-- Pending Queue -->
      <section>
        <h2 class="font-serif text-xl mb-4 text-ink flex items-center gap-2">
            Pending Approvals 
            <span class="text-xs bg-shelf text-white px-2 py-0.5 rounded-full font-sans">{{ pendingUsers.length }}</span>
        </h2>
        
        <div v-if="loading" class="py-12"><LoadingSpinner text="Checking credentials..." /></div>
        <div v-else-if="pendingUsers.length === 0" class="p-8 bg-stone-50 border border-stone-100 rounded-sm text-center text-stone-400 text-sm">
            No pending applications.
        </div>
        
        <div v-else class="bg-white border border-stone-200 rounded-sm overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 font-medium">
                    <tr>
                        <th class="px-6 py-3 border-b border-stone-200">Applicant</th>
                        <th class="px-6 py-3 border-b border-stone-200">Email</th>
                        <th class="px-6 py-3 border-b border-stone-200">Branch Assignment</th>
                        <th class="px-6 py-3 border-b border-stone-200 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-stone-100">
                    <tr v-for="user in pendingUsers" :key="user.id" class="hover:bg-parchment transition-colors">
                        <td class="px-6 py-4 font-medium text-ink">{{ user.displayName || 'Unknown' }}</td>
                        <td class="px-6 py-4 text-pencil font-mono text-xs">{{ user.email }}</td>
                        <td class="px-6 py-4">
                            <select v-model="user.selectedBranch" class="bg-stone-50 border border-stone-200 text-xs rounded-sm px-2 py-1 focus:ring-1 focus:ring-shelf outline-none cursor-pointer text-ink">
                                <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
                            </select>
                        </td>
                        <td class="px-6 py-4 text-right space-x-2">
                             <button 
                                @click="approveMember(user)" 
                                :disabled="processingId === user.id"
                                class="text-xs uppercase tracking-widest font-bold text-forest hover:text-green-700 disabled:opacity-50"
                            >
                                {{ processingId === user.id ? 'Minting...' : 'Approve & Mint' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </section>

      <!-- Active Members -->
      <section>
        <h2 class="font-serif text-xl mb-4 text-ink">Official Members</h2>
        <div class="bg-white border border-stone-200 rounded-sm overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 font-medium">
                    <tr>
                        <th class="px-6 py-3 border-b border-stone-200">Card No.</th>
                        <th class="px-6 py-3 border-b border-stone-200">Name</th>
                        <th class="px-6 py-3 border-b border-stone-200">Role</th>
                        <th class="px-6 py-3 border-b border-stone-200 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-stone-100">
                    <tr v-for="u in allUsers" :key="u.id" class="hover:bg-parchment transition-colors">
                        <td class="px-6 py-4 font-mono text-xs text-shelf">{{ u.libraryCardNumber || 'LEGACY' }}</td>
                        <td class="px-6 py-4 text-ink">{{ u.displayName }}</td>
                        <td class="px-6 py-4 text-xs uppercase text-stone-400">
                            <!-- Super Admin: Dropdown to change roles -->
                            <select 
                                v-if="user?.role === 'super' && user.uid !== u.id" 
                                @change="updateUserRole(u.id, ($event.target as HTMLSelectElement).value)"
                                :value="u.role"
                                class="bg-transparent border border-stone-200 rounded px-2 py-1 cursor-pointer hover:border-shelf focus:border-shelf outline-none"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                <option value="super">Super</option>
                            </select>
                            <span v-else>{{ u.role }}</span>
                        </td>
                        <td class="px-6 py-4 text-right flex justify-end gap-2 items-center">
                             <button v-if="u.isAI && user?.role === 'super'" @click="openGenerator(u.id)" class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold hover:bg-indigo-200">
                                ✨ Generate
                             </button>
                             <button @click="deleteUser(u.id)" class="text-xs text-rust hover:underline">Revoke</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </section>

    </div>

    <!-- Content Tab -->
    <div v-if="activeTab === 'content'" class="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        <!-- Shelves Management -->
        <section>
            <div class="flex justify-between items-center mb-6">
                <h2 class="font-serif text-xl text-ink">Shelves</h2>
                <div class="space-x-2">
                    <button @click="showShelfModal = true" class="text-xs font-bold uppercase tracking-widest text-shelf border border-shelf px-3 py-1 rounded-sm hover:bg-shelf hover:text-white transition-colors">
                        + New Shelf
                    </button>
                </div>
            </div>
            
            <div v-if="loading" class="py-12"><LoadingSpinner text="Organizing shelves..." /></div>

            <div class="bg-white border border-stone-200 rounded-sm">
                <ul class="divide-y divide-stone-100">
                    <li v-for="shelf in shelves" :key="shelf.id" :class="['p-4 flex justify-between items-center text-sm group hover:bg-parchment transition-colors', shelf.isArchived ? 'opacity-50 bg-stone-50' : '']">
                        <div>
                            <span class="font-medium text-ink">{{ shelf.title }}</span>
                            <span v-if="shelf.isArchived" class="ml-2 text-[10px] uppercase tracking-widest bg-stone-200 px-2 py-0.5 rounded-full">Archived</span>
                            <span class="block text-[10px] text-pencil uppercase">{{ shelf.slug }}</span>
                        </div>
                        <div class="space-x-3 text-pencil text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                             <button @click="openEditShelf(shelf)" class="hover:text-ink">Edit</button>
                             <button v-if="!shelf.isArchived" @click="archiveShelf(shelf.id)" class="hover:text-rust">Archive</button>
                        </div>
                    </li>
                    <li v-if="shelves.length === 0" class="p-4 text-center text-stone-400 text-xs italic">
                        No shelves defined.
                    </li>
                </ul>
            </div>
        </section>

        <!-- Books Management -->
        <section>
            <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-serif text-ink">Admin Dashboard</h1>
            <div class="flex gap-2">
                 <button v-if="user?.role === 'super'" @click="spawnAI" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-bold shadow-sm flex items-center gap-2">
                    <span>⚡</span> Spawn AI
                </button>
                <button @click="showShelfModal = true; resetShelfForm()" class="bg-rust text-white px-4 py-2 rounded hover:bg-rust/90 transition-colors text-sm font-medium shadow-sm">
                    New Volume
                </button>
            </div>
        </div>
            
            <div v-if="loading" class="py-12"><LoadingSpinner text="Gatthering tomes..." /></div>

            <div class="bg-white border border-stone-200 rounded-sm h-96 overflow-y-auto">
                <!-- Filter Bar -->
                <div class="mb-4 flex items-center gap-2">
                    <span class="text-xs uppercase font-bold text-pencil">Filter:</span>
                    <select v-model="statusFilter" class="bg-white border border-stone-200 text-xs rounded-sm px-2 py-1 outline-none focus:border-shelf cursor-pointer">
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="draft">Drafts</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <ul class="divide-y divide-stone-100">
                     <li v-for="book in filteredBooks" :key="book.id" class="p-4 flex justify-between items-center text-sm group hover:bg-parchment transition-colors">
                        <div>
                            <div class="font-serif text-ink">{{ book.title }}</div>
                            <div class="text-xs text-pencil">{{ book.author || 'Unknown' }} • 
                                <span :class="{
                                    'text-amber-500 font-bold': book.status === 'pending',
                                    'text-forest font-bold': book.status === 'published',
                                    'text-stone-400': book.status === 'draft'
                                }">{{ book.status }}</span>
                            </div>
                        </div>
                        <div class="space-x-3 text-pencil text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                             <!-- Admin: Review (Read) -->
                             <NuxtLink :to="`/read/${book.id}`" target="_blank" class="hover:text-ink">Review</NuxtLink>
                             
                             <!-- Super: Full Edit Access -->
                             <NuxtLink v-if="user?.role === 'super'" :to="`/profile/edit/${book.id}`" class="text-shelf hover:text-ink font-bold">Edit</NuxtLink>

                             <!-- Featured Toggle -->
                             <button @click="toggleFeatured(book)" :class="book.isFeatured ? 'text-amber-500 font-bold' : 'text-stone-300 hover:text-amber-500'">
                                {{ book.isFeatured ? '★ Featured' : '☆ Feature' }}
                             </button>

                             <!-- Approve Button -->
                             <button @click="toggleFeatured(book)" :class="book.isFeatured ? 'text-amber-500 font-bold' : 'text-stone-300 hover:text-amber-500'">
                                {{ book.isFeatured ? '★ Featured' : '☆ Feature' }}
                             </button>

                             <!-- Approve Button -->
                             <button v-if="book.status !== 'published'" @click="updateBookStatus(book.id, 'published')" class="text-forest hover:underline">Publish</button>
                             <button v-else @click="updateBookStatus(book.id, 'draft')" class="text-rust hover:underline">Unpublish</button>

                             <button @click="deleteBook(book.id, book.title)" class="hover:text-rust">Delete</button>
                        </div>
                    </li>
                    <li v-if="filteredBooks.length === 0" class="p-4 text-center text-stone-400 text-xs italic bg-stone-50">
                        No books match this filter.
                    </li>
                </ul>
            </div>
        </section>

    </div>

    <!-- Modals -->
    <div v-if="showShelfModal" class="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-sm shadow-xl p-8 max-w-sm w-full space-y-4">
            <h3 class="font-serif text-xl text-ink">{{ (newShelf as any).isEditing ? 'Edit Shelf' : 'Create New Shelf' }}</h3>
            <input v-model="newShelf.title" type="text" placeholder="Title (e.g. Community)" class="w-full border border-stone-200 p-2 text-sm rounded-sm" />
            <textarea v-model="newShelf.description" placeholder="Description..." rows="3" class="w-full border border-stone-200 p-2 text-sm rounded-sm"></textarea>
            
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="newShelf.isPublic" class="w-4 h-4 text-shelf border-stone-300 rounded focus:ring-shelf" />
                <span class="text-sm text-ink">Publicly Visible</span>
            </label>

            <div class="flex justify-end gap-3 pt-2">
                <button @click="showShelfModal = false" class="text-xs font-bold uppercase tracking-widest text-pencil hover:text-ink">Cancel</button>
                <button @click="createShelf" class="text-xs font-bold uppercase tracking-widest text-shelf border border-shelf px-4 py-2 rounded-sm hover:bg-shelf hover:text-white transition-colors">
                    {{ (newShelf as any).isEditing ? 'Save' : 'Create' }}
                </button>
            </div>
        </div>
    </div>

  </div>
    <!-- AI Generation Modal -->
    <div v-if="showGenModal" class="fixed inset-0 bg-ink/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-parchment p-8 rounded shadow-xl w-full max-w-lg border border-stone-200 relative overflow-y-auto max-h-[90vh]">
             <h2 class="text-xl font-serif mb-4 text-ink">Summon Knowledge</h2>
             
             <div class="space-y-4 mb-4">
                 <!-- Title -->
                 <div>
                     <label class="block text-xs font-bold uppercase text-pencil mb-1">Title (Optional)</label>
                     <input v-model="generateTitle" type="text" placeholder="e.g. The Great Fire" class="w-full border border-stone-200 p-2 text-sm rounded-sm text-ink outline-none focus:border-shelf" />
                 </div>

                 <div class="grid grid-cols-2 gap-4">
                     <!-- Type -->
                     <div>
                         <label class="block text-xs font-bold uppercase text-pencil mb-1">Category</label>
                         <select v-model="generateType" class="w-full border border-stone-200 p-2 text-sm rounded-sm text-ink outline-none focus:border-shelf bg-white">
                             <option value="world_building">World-Building</option>
                             <option value="short_story">Short Story</option>
                             <option value="element">Element (Char/Env)</option>
                             <option value="creative_writing">Creative Writing</option>
                             <option value="poem">Poem</option>
                             <option value="micro">Micro-Lore</option>
                         </select>
                     </div>
                     <!-- Shelf -->
                     <div>
                         <label class="block text-xs font-bold uppercase text-pencil mb-1">Shelf</label>
                         <select v-model="generateShelf" class="w-full border border-stone-200 p-2 text-sm rounded-sm text-ink outline-none focus:border-shelf bg-white">
                             <option value="community">Community</option>
                             <option v-for="s in shelves" :key="s.id" :value="s.slug">{{ s.title }}</option>
                         </select>
                     </div>
                 </div>

                 <!-- Summary -->
                 <div>
                     <label class="block text-xs font-bold uppercase text-pencil mb-1">Summary / Abstract (Optional)</label>
                     <textarea v-model="generateSummary" rows="2" placeholder="Brief overview..." class="w-full border border-stone-200 p-2 text-sm rounded-sm text-ink outline-none focus:border-shelf"></textarea>
                 </div>

                 <!-- Context -->
                 <div>
                     <label class="block text-xs font-bold uppercase text-pencil mb-1">Additional Context / Prompt</label>
                     <textarea v-model="generatePrompt" class="w-full h-24 p-2 bg-white border border-stone-200 rounded text-ink placeholder-pencil/50 focus:border-shelf outline-none" placeholder="Describe the tone, specific details, or hidden secrets..."></textarea>
                 </div>
             </div>

             <div class="flex justify-end gap-3">
                 <button @click="showGenModal = false" class="text-pencil hover:text-ink">Cancel</button>
                 <button @click="runGeneration" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow-sm font-medium">Generate</button>
             </div>
        </div>
    </div>
</template>
