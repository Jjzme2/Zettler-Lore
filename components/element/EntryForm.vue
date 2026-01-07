<script setup lang="ts">
const props = defineProps<{
  elementSlug: string
}>()

const emit = defineEmits(['entry-added'])

const loading = ref(false)
const form = ref({
    title: '',
    type: 'event',
    date: '', // String for flexibility "Era 4, Year 200"
    content: ''
})

const submitEntry = async () => {
    if (!form.value.title || !form.value.content) return
    loading.value = true

    try {
        await $fetch('/api/profile/element/add-entry', {
            method: 'POST',
            body: {
                storySlug: props.elementSlug,
                ...form.value
            }
        })
        
        // Reset and emit
        form.value = { title: '', type: 'event', date: '', content: '' }
        emit('entry-added')
    } catch (e) {
        console.error(e)
        alert("Failed to add entry")
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="bg-stone-50 border border-stone-200 p-6 rounded-sm">
    <h3 class="font-serif text-lg text-ink mb-4">Add to Registry</h3>
    <form @submit.prevent="submitEntry" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-xs uppercase text-pencil mb-1">Title</label>
                <input v-model="form.title" type="text" class="w-full border border-stone-300 p-2 text-sm rounded-sm" placeholder="The Great Fire" required />
            </div>
             <div>
                <label class="block text-xs uppercase text-pencil mb-1">Timeline / Date</label>
                <input v-model="form.date" type="text" class="w-full border border-stone-300 p-2 text-sm rounded-sm" placeholder="Year 302..." />
            </div>
        </div>

        <div>
            <label class="block text-xs uppercase text-pencil mb-1">Type</label>
            <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.type" value="event" class="text-shelf focus:ring-shelf" />
                    <span class="text-sm">Event</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.type" value="backstory" class="text-shelf focus:ring-shelf" />
                    <span class="text-sm">Backstory</span>
                </label>
                 <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.type" value="trait" class="text-shelf focus:ring-shelf" />
                    <span class="text-sm">Trait</span>
                </label>
            </div>
        </div>

        <div>
             <label class="block text-xs uppercase text-pencil mb-1">Description</label>
             <textarea v-model="form.content" rows="3" class="w-full border border-stone-300 p-2 text-sm rounded-sm" required></textarea>
        </div>

        <div class="text-right">
            <button type="submit" :disabled="loading" class="bg-ink text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-shelf transition-colors disabled:opacity-50">
                {{ loading ? 'Recording...' : 'Append Record' }}
            </button>
        </div>
    </form>
  </div>
</template>
