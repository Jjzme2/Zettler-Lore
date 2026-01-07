<script setup lang="ts">
const { user } = useAuth()

// Data fetching
const { data: libraryData, pending, error } = await useFetch('/api/library/shelves')

const shelves = computed(() => libraryData.value?.shelves || [])

const searchQuery = ref('')
const selectedSort = ref('newest')

// Computed simplified filter
const filteredShelves = computed(() => {
    let result = shelves.value

    if (searchQuery.value) {
        result = result.map(shelf => ({
            ...shelf,
            books: shelf.books.filter((book: any) => 
                book.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                book.author.toLowerCase().includes(searchQuery.value.toLowerCase())
            )
        })).filter(shelf => shelf.books.length > 0)
    }
    return result
})

const featuredShelf = computed(() => filteredShelves.value.find(s => s.slug === 'featured'))
const standardShelves = computed(() => filteredShelves.value.filter(s => s.slug !== 'featured'))
</script>

<template>
  <div>
    <!-- Hero / Featured Section (Special Design) -->
    <section v-if="featuredShelf" class="mb-16 relative bg-ink text-parchment rounded-sm overflow-hidden shadow-lg">
      <div class="absolute inset-0 bg-shelf/10 mix-blend-overlay"></div>
      <div class="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
        <div class="flex-grow space-y-4">
            <div class="uppercase tracking-widest text-xs font-bold text-shelf">Featured Collection</div>
            <h2 class="font-serif text-4xl md:text-5xl leading-tight">
                {{ featuredShelf.books[0]?.title || 'The Archives' }}
            </h2>
            <p class="text-stone-300 max-w-xl text-lg">
                {{ featuredShelf.books[0]?.author || 'Curator Selection' }}
            </p>
            <div class="pt-4">
                <NuxtLink :to="`/read/${featuredShelf.books[0]?.slug}`" class="inline-block bg-parchment text-ink px-6 py-3 font-medium rounded-sm hover:bg-white transition-colors shadow-sm">
                    Start Reading
                </NuxtLink>
            </div>
        </div>
        <!-- Simple cover preview for hero -->
        <div class="w-32 md:w-48 aspect-[2/3] bg-stone-100 shadow-2xl skew-y-3 -rotate-3 border-4 border-white/10 hidden md:block"></div>
      </div>
    </section>

    <!-- Header & Search (Public) -->
    <section class="mb-12">
        <div class="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-stone-200 pb-8">
            <div>
                <h1 class="font-serif text-3xl text-ink tracking-tight mb-2">The Stacks</h1>
                <p class="text-pencil max-w-lg leading-relaxed text-sm">
                   {{ user ? `Welcome back, ${user.displayName || 'Traveler'}.` : 'Explore the full Zettler Lore collection.' }}
                </p>
            </div>
            
             <!-- Search & Filter Bar -->
            <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div class="relative flex-grow md:w-64">
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="Search..." 
                        class="w-full bg-white border border-stone-200 px-4 py-2.5 text-sm text-ink placeholder-stone-400 focus:outline-none focus:border-shelf shadow-sm transition-colors rounded-sm"
                    />
                    <div class="absolute right-3 top-2.5 text-stone-300">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
                
                <div class="flex gap-2">
                     <select v-model="selectedSort" class="bg-white border border-stone-200 px-4 py-2 text-sm text-ink focus:outline-none focus:border-shelf shadow-sm cursor-pointer rounded-sm">
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="az">A-Z</option>
                    </select>
                </div>
            </div>
        </div>
    </section>

    <!-- The Stacks -->
    <div class="space-y-12">
      <div v-if="pending" class="py-24">
         <LoadingSpinner text="Consulting the Archives..." />
      </div>

      <template v-else>
        <LibraryShelf 
            v-for="shelf in standardShelves" 
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
        
        <div v-if="standardShelves.length === 0" class="py-12 text-center text-stone-400 italic">
            No volumes found matching your query.
        </div>
      </template>
    </div>
  </div>
</template>
