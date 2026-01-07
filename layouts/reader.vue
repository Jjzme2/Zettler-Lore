<template>
  <div class="min-h-screen bg-parchment text-ink font-sans selection:bg-shelf/20 selection:text-ink flex flex-col justify-center">
    <main class="w-full">
      <slot />
    </main>
    
    <footer class="py-12 text-center">
      <p class="text-[10px] text-stone-300 uppercase tracking-widest">Zettler Lore Archive</p>
    </footer>
  </div>
</template>
