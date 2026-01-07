<script setup lang="ts">
// Middleware handled globally

const router = useRouter()
const loading = ref(false)

// Fetch shelves for dropdown
const { data: shelves } = await useFetch('/api/library/shelves-list')

const form = ref({
    title: '',
    type: 'short_story',
    content: '',
    shelf: 'community', // Default to Community
    isPublicDomain: false
})

const loreTypes = [
    { value: 'world_building', label: 'World-Building' },
    { value: 'short_story', label: 'Short Story' },
    { value: 'element', label: 'Element (Char/Env)' },
    { value: 'creative_writing', label: 'Creative Writing' },
    { value: 'poem', label: 'Poem' },
    { value: 'micro', label: 'Micro-Lore' }
]

const createLore = async () => {
    if (!form.value.title) return

    loading.value = true
    try {
        const { data, error } = await useFetch('/api/profile/create-story', {
            method: 'POST',
            body: form.value
        })

        if (error.value) throw error.value

        // Redirect to profile or edit page
        // For now, back to profile to see it in drafts
         router.push('/profile')
    } catch (e) {
        console.error("Failed to create", e)
        alert("Failed to create entry.")
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-12 px-4">
    <div class="mb-8">
        <NuxtLink to="/profile" class="text-xs text-pencil hover:text-ink mb-2 block">&larr; Back to Profile</NuxtLink>
        <h1 class="font-serif text-3xl text-ink">New Entry</h1>
    </div>

    <form @submit.prevent="createLore" class="bg-white p-8 rounded-sm border border-stone-200 shadow-sm space-y-6">
        
        <!-- Title -->
        <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-pencil mb-2">Title</label>
            <input 
                v-model="form.title" 
                type="text" 
                class="w-full border-b-2 border-stone-200 bg-transparent py-2 text-xl font-serif text-ink focus:border-shelf focus:outline-none placeholder-stone-300 transition-colors"
                placeholder="The Chronicles of..."
                required
            />
        </div>

        <!-- Type & Shelf -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-pencil mb-2">Category</label>
                <div class="grid grid-cols-2 gap-2">
                    <label 
                        v-for="type in loreTypes" 
                        :key="type.value"
                        :class="['cursor-pointer border px-2 py-2 text-xs rounded-sm text-center transition-all', form.type === type.value ? 'bg-ink text-parchment border-ink' : 'bg-white text-pencil border-stone-200 hover:border-shelf']"
                    >
                        <input type="radio" v-model="form.type" :value="type.value" class="hidden" />
                        {{ type.label }}
                    </label>
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-pencil mb-2">Library Shelf</label>
                 <select v-model="form.shelf" class="w-full bg-stone-50 border border-stone-200 p-2.5 text-sm text-ink focus:outline-none focus:border-shelf rounded-sm">
                    <option v-for="s in shelves" :key="s.slug" :value="s.slug">{{ s.title }}</option>
                </select>
            </div>
        </div>

        <!-- Content (Draft) -->
        <div>
             <label class="block text-xs font-bold uppercase tracking-widest text-pencil mb-2">Initial Draft (Optional)</label>
             <textarea 
                v-model="form.content"
                rows="8"
                class="w-full bg-stone-50 border border-stone-200 p-4 text-ink font-serif text-sm focus:outline-none focus:border-shelf rounded-sm"
                placeholder="Start writing..."
             ></textarea>
        </div>

        <!-- Public Domain -->
         <!-- Simple Toggle for now -->
        <label class="flex items-center gap-3 cursor-pointer group">
             <input type="checkbox" v-model="form.isPublicDomain" class="w-4 h-4 text-shelf border-stone-300 rounded focus:ring-shelf" />
             <span class="text-sm text-ink group-hover:text-shelf transition-colors">Mark as Public Domain</span>
        </label>

        <!-- Actions -->
        <div class="pt-6 border-t border-stone-100 flex justify-end gap-4">
             <NuxtLink to="/profile" class="px-6 py-2 text-sm text-pencil hover:text-ink transition-colors">Cancel</NuxtLink>
             <button 
                type="submit" 
                :disabled="loading"
                class="bg-shelf text-white px-8 py-2 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-opacity-90 transition-opacity disabled:opacity-50"
            >
                {{ loading ? 'Creating...' : 'Create Draft' }}
            </button>
        </div>

    </form>
  </div>
</template>
