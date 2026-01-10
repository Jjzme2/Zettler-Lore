<script setup lang="ts">
/**
 * Shelf Component
 *
 * Displays a collection of items (books/stories) within a specific category.
 * Used on the library landing page.
 *
 * @prop {string} category - The title of the shelf/category.
 * @prop {string} [description] - Optional description of the shelf's contents.
 * @slot - The content of the shelf (typically a list of BookItem or Card components).
 */
defineProps<{
  category: string
  description?: string
}>()
</script>

<template>
  <section class="py-10">
    <header class="mb-8 border-b-2 border-stone-100 pb-2">
      <h2 class="font-serif text-xl font-semibold text-ink inline-block pr-6 bg-parchment relative z-10 -mb-[2px]">
        {{ category }}
      </h2>
      <p v-if="description" class="mt-2 text-sm text-pencil max-w-prose">
        {{ description }}
      </p>
    </header>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <slot />
    </div>
  </section>
</template>
