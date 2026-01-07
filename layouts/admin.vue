<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
    <aside class="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 class="text-xl font-bold mb-6">Admin</h2>
      <nav class="space-y-2">
        <NuxtLink to="/admin" class="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</NuxtLink>
        <NuxtLink to="/admin/stories" class="block py-2 px-4 rounded hover:bg-gray-700">Stories</NuxtLink>
        <NuxtLink to="/library" class="block py-2 px-4 rounded hover:bg-gray-700 text-gray-400 text-sm mt-8">← App</NuxtLink>
      </nav>
    </aside>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
