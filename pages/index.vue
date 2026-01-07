<script setup lang="ts">
const { user } = useAuth()

// Mock data (State)
// Public-facing shelves only
const shelves = ref([
  {
    category: 'Featured',
    description: 'Curated works selected by the archivists.',
    books: [
      { title: 'The Architects of Memory', author: 'J. Zettler', slug: 'architects-of-memory', publishedDate: '2024' },
      { title: 'Silence in the Archives', author: 'A. Vance', slug: 'silence-archives', publishedDate: '2023' }
    ]
  },
  {
    category: 'Public Domain',
    description: 'Timeless works available to all, regardless of membership.',
    books: [
      { title: 'The Scent of Time', author: 'Byung-Chul Han', slug: 'scent-of-time', publishedDate: '2017' },
      { title: 'Meditations', author: 'Marcus Aurelius', slug: 'meditations', publishedDate: '180 AD' }
    ]
  }
])

const searchQuery = ref('')
const selectedSort = ref('newest')

// Computed simplified filter for demo
const filteredShelves = computed(() => {
    if (!searchQuery.value) return shelves.value

    return shelves.value.map(shelf => ({
        ...shelf,
        books: shelf.books.filter(book => 
            book.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
            book.author.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    })).filter(shelf => shelf.books.length > 0)
})
</script>

<template>
  <div>
    <!-- Welcome / Membership Section -->
    <section v-if="user" class="mb-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      <div class="md:col-span-2 pt-4">
        <h1 class="font-serif text-3xl text-ink tracking-tight mb-2">The Collection</h1>
        <p class="text-pencil max-w-lg leading-relaxed text-sm">
          Browse the curated stacks of Zettler Lore.
        </p>

        <!-- Search & Filter Bar -->
        <div class="mt-8 flex flex-col sm:flex-row gap-4">
            <div class="relative flex-grow max-w-md">
                <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Search titles or authors..." 
                    class="w-full bg-white border border-stone-200 px-4 py-2.5 text-sm text-ink placeholder-stone-400 focus:outline-none focus:border-shelf shadow-sm transition-colors rounded-sm"
                />
                <div class="absolute right-3 top-2.5 text-stone-300">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
            
            <div class="flex gap-2">
                 <select v-model="selectedSort" class="bg-white border border-stone-200 px-4 py-2 text-sm text-ink focus:outline-none focus:border-shelf shadow-sm cursor-pointer rounded-sm">
                    <option value="newest">Sort by Newest</option>
                    <option value="oldest">Sort by Oldest</option>
                    <option value="az">Title A-Z</option>
                </select>
                <!-- Filter placeholder -->
                 <button class="px-4 py-2 border border-stone-200 bg-stone-50 text-ink text-sm hover:bg-white transition-colors rounded-sm">
                    Filters
                 </button>
            </div>
        </div>
      </div>
      <div class="md:col-span-1 hidden md:block">
        <LibraryCard :user="user" />
      </div>
    </section>

    <!-- The Stacks -->
    <div class="space-y-4">
      <LibraryShelf 
        v-for="shelf in filteredShelves" 
        :key="shelf.category" 
        :category="shelf.category" 
        :description="shelf.description"
      >
        <BookItem 
          v-for="book in shelf.books" 
          :key="book.slug" 
          v-bind="book"
        />
      </LibraryShelf>
      
      <div v-if="filteredShelves.length === 0" class="py-12 text-center text-stone-400 italic">
        No volumes found matching your query.
      </div>
    </div>
  </div>
</template>
