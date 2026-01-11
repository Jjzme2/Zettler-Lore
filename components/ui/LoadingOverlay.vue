<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-paper/80 backdrop-blur-sm transition-opacity">
    <div class="bg-white p-8 rounded-sm shadow-xl border border-stone-200 flex flex-col items-center max-w-sm text-center">
      <UiLoadingSpinner />
      <h3 v-if="title" class="font-serif text-xl text-ink mt-2">{{ title }}</h3>
      <p v-if="message" class="text-sm text-pencil mt-1">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LoadingOverlay Component
 *
 * A modal overlay that blocks interaction while a process is running.
 * Uses a backdrop blur and displays a title/message to the user.
 *
 * Props:
 * @property {boolean} show - Whether the overlay is visible.
 * @property {string} [title] - Optional title text.
 * @property {string} [message] - Optional explanatory message.
 */
defineProps<{
  show: boolean
  title?: string
  message?: string
}>()
</script>
