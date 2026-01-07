<script setup lang="ts">
const { user } = useAuth()
const { data: loreData, refresh } = await useFetch('/api/profile/stories')

const activeTab = ref('drafts')

const myStories = computed(() => loreData.value?.stories || [])

const drafts = computed(() => myStories.value.filter((s:any) => s.status === 'draft'))
const published = computed(() => myStories.value.filter((s:any) => s.status === 'published'))
const archived = computed(() => myStories.value.filter((s:any) => s.status === 'archived'))

const currentList = computed(() => {
    if (activeTab.value === 'drafts') return drafts.value
    if (activeTab.value === 'published') return published.value
    return archived.value
})
</script>

<template>
  <div class="max-w-5xl mx-auto py-12 px-4">
    
    <!-- Profile Header -->
    <div class="mb-16 grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        <!-- Identity Card -->
        <div class="md:col-span-1">
            <h2 class="font-serif text-xl text-ink mb-6">Identity</h2>
            <LibraryCard v-if="user" :user="user" class="w-full shadow-lg" />
            <div class="mt-4 text-center">
                 <NuxtLink to="/profile/settings" class="text-xs text-pencil hover:text-ink underline">Manage Account</NuxtLink>
            </div>
        </div>

        <!-- Dashboard / Stats (Placeholder for now) -->
        <div class="md:col-span-2 space-y-8">
             <div class="bg-white p-8 rounded-sm border border-stone-200 shadow-sm">
                <h2 class="font-serif text-2xl text-ink mb-2">Welcome, {{ user?.displayName }}</h2>
                <p class="text-pencil text-sm max-w-lg mb-6">
                    You are a registered member of the Zettler Lore archives. Your contributions help expand the known worlds.
                </p>
                <div class="flex gap-8 text-sm">
                    <div>
                        <div class="font-bold text-2xl text-shelf">{{ published.length }}</div>
                        <div class="text-stone-400 uppercase tracking-widest text-[10px]">Published</div>
                    </div>
                    <div>
                        <div class="font-bold text-2xl text-pencil">{{ drafts.length }}</div>
                        <div class="text-stone-400 uppercase tracking-widest text-[10px]">Drafts</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- My Lore Section -->
    <section>
        <div class="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
            <h2 class="font-serif text-3xl text-ink">My Lore</h2>
            <NuxtLink to="/profile/create" class="bg-ink text-parchment px-4 py-2 text-sm font-medium rounded-sm hover:bg-shelf transition-colors">
                + Create New Entry
            </NuxtLink>
        </div>

        <!-- Tabs -->
        <div class="flex gap-6 mb-8">
            <button @click="activeTab = 'drafts'" :class="['text-sm font-medium transition-colors', activeTab === 'drafts' ? 'text-shelf underline underline-offset-4' : 'text-stone-400 hover:text-ink']">Drafts</button>
            <button @click="activeTab = 'published'" :class="['text-sm font-medium transition-colors', activeTab === 'published' ? 'text-shelf underline underline-offset-4' : 'text-stone-400 hover:text-ink']">Published</button>
            <button @click="activeTab = 'archived'" :class="['text-sm font-medium transition-colors', activeTab === 'archived' ? 'text-shelf underline underline-offset-4' : 'text-stone-400 hover:text-ink']">Archived</button>
        </div>

        <!-- List -->
        <div class="space-y-4">
            <div v-if="currentList.length === 0" class="py-12 bg-stone-50 border border-stone-100 rounded-sm text-center">
                <p class="text-stone-400 italic text-sm">No {{ activeTab }} found.</p>
                <p v-if="activeTab === 'drafts'" class="mt-2 text-xs text-shelf cursor-pointer hover:underline">Start writing something new?</p>
            </div>

            <div v-for="story in currentList" :key="story.slug" class="bg-white p-6 border-l-4 border-stone-200 hover:border-shelf transition-all shadow-sm rounded-r-sm group">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-serif text-lg text-ink group-hover:text-shelf transition-colors mb-1">{{ story.title }}</h3>
                        <p class="text-xs text-pencil uppercase tracking-wider mb-3">{{ story.type || 'Story' }} • {{ new Date(story.publishedDate).toLocaleDateString() }}</p>
                        <p class="text-sm text-stone-500 line-clamp-2">{{ story.content?.substring(0, 150) }}...</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <NuxtLink :to="`/profile/edit/${story.slug}`" class="text-xs font-bold text-pencil hover:text-ink px-3 py-1 border border-stone-200 rounded-sm hover:bg-stone-50 text-center">Edit</NuxtLink>
                        <NuxtLink v-if="activeTab === 'published'" :to="`/read/${story.slug}`" class="text-xs text-shelf hover:underline text-center">View</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </section>

  </div>
</template>
