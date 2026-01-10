<script setup lang="ts">
import { THEME_CLASSIC, type CardTheme } from '~/config/themes'
import { libraryQuotes } from '~/config/quotes'

/**
 * Card Component
 *
 * Displays a digital library card for a user.
 * It shows the user's name, membership status, and a dynamic daily quote.
 *
 * @prop {object} user - The user object containing profile details.
 * @prop {string} user.uid - The unique Firebase User ID.
 * @prop {string} [user.email] - User's email.
 * @prop {string} [user.displayName] - User's display name.
 * @prop {string|number} [user.createdAt] - Timestamp of account creation.
 * @prop {string} [user.memberId] - External membership ID (e.g., Stripe).
 * @prop {string} [user.libraryCardNumber] - The assigned library card number.
 * @prop {CardTheme} [theme] - The visual theme for the card (defaults to Classic).
 */
const props = withDefaults(defineProps<{
  user: {
    uid: string
    email?: string | null
    displayName?: string | null
    createdAt?: string | number
    memberId?: string | null
    libraryCardNumber?: string | null
  }
  theme?: CardTheme
}>(), {
  theme: () => THEME_CLASSIC
})

const now = ref(new Date())

// Update time every minute
onMounted(() => {
  const timer = setInterval(() => {
    now.value = new Date()
  }, 60000)
  
  onUnmounted(() => {
    clearInterval(timer)
  })
})

// Dynamic greeting based on time of day
const timeOfDay = computed(() => {
  const hour = now.value.getHours()
  if (hour < 5) return 'evening'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
})

// Deterministic quote selection based on the date
const dailyQuote = computed(() => {
  const dateStr = now.value.toDateString()
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % libraryQuotes.length
  return libraryQuotes[index]
})

const formattedDate = computed(() => {
  return now.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})
</script>

<template>
  <div :class="['max-w-md mx-auto p-8 relative overflow-hidden transition-all duration-300 print:shadow-none print:border-2 print:border-black print:bg-white', theme.classes.wrapper, theme.classes.border, theme.name === 'Classic' ? 'border-2' : 'border']">
    
    <!-- Decorative border lines for Classic Theme -->
    <div v-if="theme.name === 'Classic'" class="absolute top-2 left-2 right-2 bottom-2 border border-stone-200 pointer-events-none print:hidden"></div>

    <div class="relative z-10 text-center space-y-6">
      
      <!-- Header / Logo Area -->
      <div :class="['uppercase tracking-[0.2em] text-xs font-bold transition-colors', theme.classes.accent]">
        Zettler Lore Digital Library
      </div>

      <!-- Greeting -->
      <div class="py-2">
        <p :class="['text-sm transition-colors', theme.classes.body]">
          Good {{ timeOfDay }},
        </p>
      </div>

      <!-- User Name -->
      <div :class="['py-4 border-b transition-colors', theme.classes.border]">
        <h3 :class="['text-2xl transition-colors', theme.classes.header]">
          {{ user.displayName || 'Reader' }}
        </h3>

      </div>

      <!-- Quote -->
      <div class="py-2 flex justify-center">
        <div class="max-w-xs">
           <p :class="['text-sm transition-colors', theme.classes.quote]">
            "{{ dailyQuote }}"
          </p>
        </div>
      </div>

      <!-- Footer Info -->
      <div :class="['flex justify-between items-end text-xs pt-2 transition-colors', theme.classes.body]">
        <div class="text-left">
          <p :class="['uppercase tracking-widest text-[10px] mb-1 opacity-70']">Issued</p>
          <p>{{ formattedDate }}</p>
        </div>
        <div class="text-right">
          <p :class="['uppercase tracking-widest text-[10px] mb-1 opacity-70']">Card No.</p>
          <p :class="theme.classes.header">{{ user.libraryCardNumber?.toUpperCase() || 'PENDING' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
