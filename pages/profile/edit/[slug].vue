<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string
const loading = ref(false)
const saving = ref(false)

const form = ref({
    title: '',
    type: 'short_story',
    content: '',
    isPublicDomain: false,
    status: 'draft'
})

const loreTypes = [
    { value: 'world_building', label: 'World-Building' },
    { value: 'short_story', label: 'Short Story' },
    { value: 'element', label: 'Element (Char/Env)' },
    { value: 'creative_writing', label: 'Creative Writing' },
    { value: 'poem', label: 'Poem' },
    { value: 'micro', label: 'Micro-Lore' }
]

// Hydrate form
onMounted(async () => {
    loading.value = true
    try {
        const { data, error } = await useFetch(`/api/profile/story/${slug}`)
        if (error.value) throw error.value
        
        const story = data.value.story
        form.value = {
            title: story.title,
            type: story.type,
            content: story.content,
            isPublicDomain: story.isPublicDomain,
            status: story.status,
            shelf: story.shelf || 'community'
        }
    } catch (e) {
        console.error("Fetch failed", e)
        alert("Could not load story.")
        router.push('/profile')
    } finally {
        loading.value = false
    }
})

const updateLore = async () => {
    saving.value = true
    try {
        const { error } = await useFetch(`/api/profile/story/${slug}`, {
            method: 'PUT',
            body: form.value
        })

        if (error.value) throw error.value
        router.push('/profile')
    } catch (e) {
        console.error("Failed to update", e)
        alert("Failed to save changes.")
    } finally {
        saving.value = false
    }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-12 px-4">
    <div class="mb-8 flex justify-between items-end">
        <div>
            <NuxtLink to="/profile" class="text-xs text-pencil hover:text-ink mb-2 block">&larr; Back to Profile</NuxtLink>
            <h1 class="font-serif text-3xl text-ink">Edit Entry</h1>
        </div>
        <div class="text-xs text-pencil font-mono">{{ slug }}</div>
    </div>

    <div v-if="loading" class="text-center py-12 text-pencil italic">Loading manuscript...</div>

    <form v-else @submit.prevent="updateLore" class="bg-white p-8 rounded-sm border border-stone-200 shadow-sm space-y-6">
        
        <!-- Title -->
        <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-pencil mb-2">Title</label>
            <input 
                v-model="form.title" 
                type="text" 
                class="w-full border-b-2 border-stone-200 bg-transparent py-2 text-xl font-serif text-ink focus:border-shelf focus:outline-none placeholder-stone-300 transition-colors"
                required
            />
        </div>

        <!-- Type -->
        <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-pencil mb-2">Category</label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label 
                    v-for="type in loreTypes" 
                    :key="type.value"
                    :class="['cursor-pointer border px-4 py-3 text-sm rounded-sm text-center transition-all', form.type === type.value ? 'bg-ink text-parchment border-ink' : 'bg-white text-pencil border-stone-200 hover:border-shelf']"
                >
                    <input type="radio" v-model="form.type" :value="type.value" class="hidden" />
                    {{ type.label }}
                </label>
            </div>
        </div>

        <!-- Content -->
        <div>
             <label class="block text-xs font-bold uppercase tracking-widest text-pencil mb-2">Content (Markdown)</label>
             <textarea 
                v-model="form.content"
                rows="12"
                class="w-full bg-stone-50 border border-stone-200 p-4 text-ink font-serif text-sm focus:outline-none focus:border-shelf rounded-sm"
             ></textarea>
        </div>

        <!-- Settings (Status, Shelf, Public Domain) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-stone-100">
             <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-pencil mb-2">Library Shelf</label>
                 <select v-model="form.shelf" class="w-full bg-stone-50 border border-stone-200 p-2 text-sm text-ink focus:outline-none focus:border-shelf rounded-sm">
                    <option v-for="s in shelves" :key="s.slug" :value="s.slug">{{ s.title }}</option>
                </select>
            </div>

            <div class="space-y-4">
                 <div class="flex items-center gap-4">
                    <label class="text-xs font-bold text-pencil uppercase tracking-widest w-16">Status:</label>
                    <select v-model="form.status" class="bg-stone-50 border border-stone-200 text-sm px-2 py-1 rounded-sm focus:ring-1 focus:ring-shelf outline-none flex-grow">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                
                 <label class="flex items-center gap-3 cursor-pointer group">
                     <input type="checkbox" v-model="form.isPublicDomain" class="w-4 h-4 text-shelf border-stone-300 rounded focus:ring-shelf" />
                     <span class="text-sm text-ink group-hover:text-shelf transition-colors">Public Domain</span>
                </label>
            </div>
        </div>

        <!-- Actions -->
        <div class="pt-6 border-t border-stone-100 flex justify-end gap-4">
             <NuxtLink to="/profile" class="px-6 py-2 text-sm text-pencil hover:text-ink transition-colors">Cancel</NuxtLink>
             <button 
                type="submit" 
                :disabled="saving"
                class="bg-shelf text-white px-8 py-2 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-opacity-90 transition-opacity disabled:opacity-50"
            >
                {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
        </div>

    </form>
  </div>
</template>
