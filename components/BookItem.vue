<script setup lang="ts">
defineProps<{
  title: string
  author?: string
  slug: string
  publishedDate?: string
}>()
</script>

<template>
  <NuxtLink :to="`/read/${slug}`" class="group block h-full">
    <article class="h-full p-6 bg-white border border-stone-200 shadow-sm transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-stone-300 flex flex-col justify-between rounded-sm">
      <div class="space-y-4">
        <div class="space-y-2">
          <h3 class="font-serif text-lg leading-snug text-ink group-hover:text-shelf transition-colors duration-300">
            {{ title }}
          </h3>
          <p v-if="author" class="text-sm font-medium text-pencil uppercase tracking-wider">
            {{ author }}
          </p>
        </div>
      </div>
      
      <div class="mt-8 pt-4 border-t border-stone-100 flex justify-between items-center text-xs text-stone-400 font-mono">
        <span v-if="publishedDate">{{ publishedDate }}</span>
        <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
          Read &rarr;
        </span>
      </div>
    </article>
  </NuxtLink>
</template>
