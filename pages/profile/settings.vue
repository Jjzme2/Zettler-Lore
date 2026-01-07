<script setup lang="ts">
const { user, refreshUser } = useAuth()
const loading = ref(false)
const message = ref('')

const form = ref({
    displayName: user.value?.displayName || ''
})

const updateProfile = async () => {
    loading.value = true
    message.value = ''
    try {
        await $fetch('/api/profile/update', {
            method: 'PUT',
            body: form.value
        })
        
        await refreshUser()
        message.value = 'Profile updated successfully.'
    } catch (e) {
        message.value = 'Failed to update profile.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="max-w-2xl mx-auto py-12 px-4">
    <h1 class="font-serif text-3xl text-ink mb-8">Account Settings</h1>

    <div class="bg-white p-8 border border-stone-200 rounded-sm shadow-sm">
        <form @submit.prevent="updateProfile" class="space-y-6">
            <div>
                <label class="block text-sm font-medium text-pencil mb-1">Display Name</label>
                <input v-model="form.displayName" type="text" class="w-full border border-stone-300 p-2 rounded-sm text-ink focus:ring-shelf focus:border-shelf" required />
                <p class="text-xs text-stone-400 mt-1">This is how you will be known in the archives.</p>
            </div>

            <div v-if="message" :class="['text-sm p-3 rounded-sm', message.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-stone-50 text-pencil']">
                {{ message }}
            </div>

            <div class="flex justify-between items-center pt-4">
                <NuxtLink to="/profile" class="text-sm text-pencil hover:text-ink">Cancel</NuxtLink>
                <button type="submit" :disabled="loading" class="bg-ink text-white px-6 py-2 text-sm uppercase tracking-widest hover:bg-shelf transition-colors disabled:opacity-50">
                    {{ loading ? 'Saving...' : 'Save Changes' }}
                </button>
            </div>
        </form>
    </div>
  </div>
</template>
