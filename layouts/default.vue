<script setup lang="ts">
const { user, signOut } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-parchment text-ink font-sans selection:bg-shelf/20 selection:text-ink">
    <div class="max-w-5xl mx-auto px-6 sm:px-8">
      <LibraryHeader />
      
      <main class="min-h-[60vh] pb-24">
        <slot />
      </main>

      <footer class="py-12 border-t border-stone-200/50 text-center">
        <p class="text-xs text-pencil font-serif italic">
          &copy; {{ new Date().getFullYear() }} Zettler Lore. Quietly confident.
        </p>
      </footer>
    </div>
    <UiNotificationToast />
  </div>
</template>
