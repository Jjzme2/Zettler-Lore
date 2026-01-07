<script setup lang="ts">
defineProps<{
  user: {
    uid: string
    email?: string | null
    displayName?: string | null
    createdAt?: string | number
  }
}>()

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})
</script>

<template>
  <div class="max-w-md mx-auto bg-parchment border-2 border-stone-300 p-8 shadow-sm relative overflow-hidden">
    <!-- Decorative border lines -->
    <div class="absolute top-2 left-2 right-2 bottom-2 border border-stone-200 pointer-events-none"></div>

    <div class="relative z-10 text-center space-y-6">
      <div class="uppercase tracking-[0.2em] text-xs font-bold text-stone-400">
        Zettler Lore Digital Library
      </div>

      <div class="py-4 border-b border-stone-200">
        <h3 class="font-serif text-2xl text-ink">
          {{ user.displayName || 'Reader' }}
        </h3>
        <p class="text-sm text-pencil mt-1 font-mono">
          {{ user.email }}
        </p>
      </div>

      <div class="flex justify-between items-end text-xs text-stone-500 font-mono pt-2">
        <div class="text-left">
          <p class="uppercase tracking-widest text-[10px] text-stone-400 mb-1">Issued</p>
          <p>{{ formattedDate }}</p>
        </div>
        <div class="text-right">
          <p class="uppercase tracking-widest text-[10px] text-stone-400 mb-1">Card No.</p>
          <p>{{ user.libraryCardNumber?.toUpperCase() || 'PENDING' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
