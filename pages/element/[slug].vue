<script setup lang="ts">
const route = useRoute()
const { user } = useAuth()
const slug = route.params.slug as string

const { data, refresh, error } = await useFetch(`/api/library/element/${slug}`)

const element = computed(() => data.value?.element)
const entries = computed(() => data.value?.entries || [])

const isOwner = computed(() => user.value && user.value.uid === element.value?.authorId)
const isAdmin = computed(() => user.value?.role === 'admin')
const canEdit = computed(() => isOwner.value || isAdmin.value)

const showAddForm = ref(false)

const onEntryAdded = () => {
    refresh()
    showAddForm.value = false
}
</script>

<template>
  <div v-if="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
          <h1 class="text-2xl font-serif text-rust mb-2">Restricted Access</h1>
          <p class="text-pencil text-sm">This element is sealed or does not exist.</p>
          <NuxtLink to="/library" class="block mt-6 text-xs uppercase tracking-widest text-ink hover:underline">Return to Stacks</NuxtLink>
      </div>
  </div>

  <div v-else-if="element" class="max-w-4xl mx-auto py-12 px-6">
    
    <!-- Element Header -->
    <header class="mb-12 border-b border-stone-200 pb-8">
        <div class="flex justify-between items-start mb-4">
            <div>
                <span class="inline-block px-2 py-1 bg-stone-100 text-[10px] uppercase tracking-widest text-pencil rounded-sm mb-3">
                    {{ element.type }}
                </span>
                <h1 class="font-serif text-4xl text-ink leading-tight">{{ element.title }}</h1>
            </div>
            <div v-if="canEdit">
                <NuxtLink :to="`/profile/edit/${element.slug}`" class="text-xs font-bold text-pencil hover:text-ink border border-stone-200 px-4 py-2 rounded-sm bg-white hover:bg-stone-50 transition-colors">
                    Manage Identity
                </NuxtLink>
            </div>
        </div>
        
        <div class="prose prose-stone prose-sm max-w-none text-pencil font-serif leading-relaxed">
             <!-- Render basic description -->
             <div class="whitespace-pre-wrap">{{ element.content }}</div>
        </div>
    </header>

    <!-- Timeline / Archives -->
    <section>
        <div class="flex justify-between items-center mb-8">
            <h2 class="font-serif text-2xl text-ink">Archives & Events</h2>
            <button v-if="canEdit" @click="showAddForm = !showAddForm" class="text-xs uppercase tracking-widest font-bold text-shelf hover:text-ink transition-colors">
                {{ showAddForm ? 'Cancel Entry' : '+ Add Record' }}
            </button>
        </div>

        <div v-if="showAddForm" class="mb-12 animate-fade-in">
            <ElementEntryForm :elementSlug="slug" @entry-added="onEntryAdded" />
        </div>

        <div class="relative border-l border-stone-200 ml-3 space-y-12 pb-12">
            <div v-if="entries.length === 0" class="pl-8 text-sm text-stone-400 italic">
                No history recorded yet.
            </div>

            <div v-for="entry in entries" :key="entry.id" class="relative pl-8 group">
                <!-- Timeline Dot -->
                <div class="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-stone-100 bg-white group-hover:border-shelf group-hover:bg-shelf transition-colors"></div>
                
                <div class="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
                    <h3 class="font-serif text-lg text-ink font-semibold">{{ entry.title }}</h3>
                    <span class="text-xs font-mono text-stone-400 uppercase">{{ entry.date }} • {{ entry.type }}</span>
                </div>
                
                <div class="text-sm text-pencil font-serif leading-relaxed bg-stone-50/50 p-4 rounded-sm border border-stone-100 group-hover:border-stone-200 transition-colors">
                    <p class="whitespace-pre-wrap">{{ entry.content }}</p>
                </div>
            </div>
        </div>
    </section>

  </div>
</template>
