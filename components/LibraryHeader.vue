<script setup lang="ts">
const { user, signOut } = useAuth()
</script>

<template>
  <header class="py-12 mb-8 border-b border-stone-200/50">
    <div class="flex flex-col md:flex-row justify-between items-baseline gap-4">
      <div class="flex items-baseline gap-6">
        <NuxtLink to="/library" class="font-serif text-2xl font-semibold tracking-tight text-ink hover:text-shelf transition-colors duration-300">
          Zettler Lore
        </NuxtLink>
        <span class="hidden md:inline text-xs mt-1 uppercase tracking-widest text-pencil font-medium">Public Archive</span>
      </div>

      <nav>
        <div v-if="user" class="flex gap-6 items-center">
            <template v-if="['admin', 'super'].includes(user.role)">
                 <NuxtLink to="/admin" class="text-sm font-medium text-rust hover:text-ink transition-colors">
                    Admin
                </NuxtLink>
                <div class="h-4 w-px bg-stone-300"></div>
            </template>
            
            <!-- Notification Bell -->
            <NotificationBell />
            <div class="h-4 w-px bg-stone-300"></div>
            
            <NuxtLink to="/library" class="text-sm font-medium text-pencil hover:text-ink transition-colors">
                The Stacks
            </NuxtLink>
            
            <NuxtLink to="/profile" class="text-sm font-medium text-pencil hover:text-ink transition-colors">
                {{ user.displayName || 'Member' }}
            </NuxtLink>
            
            <button @click="signOut" class="text-sm font-medium text-pencil hover:text-rust transition-colors">
                Leave
            </button>
        </div>
        <div v-else class="flex gap-6">
           <NuxtLink to="/library" class="text-sm font-medium text-pencil hover:text-ink transition-colors">
                The Stacks
            </NuxtLink>
          <NuxtLink to="/login" class="text-sm font-medium text-pencil hover:text-ink transition-colors">
            Member Login
          </NuxtLink>
        </div>
        
        <!-- Theme Toggle (Always visible) -->
        <div class="h-4 w-px bg-stone-300 mx-2"></div>
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>
