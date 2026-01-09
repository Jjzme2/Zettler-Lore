<template>
  <div class="flex flex-col items-center justify-center p-8 space-y-4">
    <div class="relative w-12 h-12">
      <div class="absolute inset-0 border-4 border-stone-200 rounded-full"></div>
      <div class="absolute inset-0 border-4 border-shelf rounded-full border-t-transparent animate-spin"></div>
    </div>
    <div v-if="text" class="text-xs uppercase tracking-widest text-stone-400 font-medium animate-pulse">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LoadingSpinner Component
 *
 * Displays a centered loading indicator with a spinning animation.
 * Can optionally display a text label below the spinner.
 *
 * Usage:
 * <UiLoadingSpinner text="Loading Data..." />
 */
defineProps<{
  /** Optional text to display below the spinner */
  text?: string
}>()
</script>
