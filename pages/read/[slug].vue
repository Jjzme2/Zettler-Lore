<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

definePageMeta({
  layout: 'reader',
})

const { data: story, error } = await useFetch(`/api/profile/story/${slug}`)

if (error.value) {
    console.error('[Reader] Fetch Error:', error.value)
}

if (story.value && story.value.type === 'element') {
    router.replace(`/element/${slug}`)
}
</script>

<template>
  <div v-if="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
          <h1 class="text-2xl font-serif text-rust mb-2">Story Not Found</h1>
          <NuxtLink to="/library" class="text-xs uppercase tracking-widest text-ink hover:underline">Return to Stacks</NuxtLink>
      </div>
  </div>

  <article v-else-if="story" class="max-w-3xl mx-auto pt-12">
    <header class="mb-12 text-center space-y-6">
      <div class="text-xs font-mono text-stone-400 uppercase tracking-widest">
        Reading Room
      </div>
      <h1 class="font-serif text-4xl md:text-5xl text-ink leading-tight">
        {{ story.title }}
      </h1>
      <div class="flex items-center justify-center gap-4 text-sm text-pencil italic font-serif">
        <span>By {{ story.displayName || 'Unknown Author' }}</span>
        <span>•</span>
        <span>{{ story.type === 'poem' ? 'Poetry' : 'Short Story' }}</span>
      </div>
    </header>

    <div class="prose prose-lg prose-stone mx-auto font-sans leading-relaxed text-ink/90 selection:bg-shelf/20">
      <div class="whitespace-pre-wrap">{{ story.content }}</div>
    </div>

    <div class="mt-24 pt-12 border-t border-stone-200/50 flex justify-between items-center">
      <NuxtLink to="/library" class="text-pencil hover:text-ink transition-colors font-serif italic flex items-center gap-2">
        &larr; Return to Shelves
      </NuxtLink>
      <button @click="window.scrollTo({ top: 0, behavior: 'smooth' })" class="text-pencil hover:text-ink transition-colors text-sm uppercase tracking-widest font-medium">
        Top
      </button>
    </div>
  </article>
</template>
