<script setup lang="ts">
// Simple splash page
</script>

<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <h1 class="font-serif text-4xl text-ink mb-4">The Archives are Closed</h1>
    <p class="text-pencil max-w-md mb-8">
        You have successfully signed out of Zettler Lore. Your session has been cleared.
    </p>
    <NuxtLink to="/library" class="text-ink border-b border-ink hover:text-shelf hover:border-shelf transition-colors pb-1">
        Return to the Stacks
    </NuxtLink>
  </div>
</template>
