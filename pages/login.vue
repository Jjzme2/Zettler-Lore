<script setup lang="ts">
const { signInWithEmail, registerWithEmail, user } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const isRegistering = ref(false)
const errorMsg = ref('')
const isLoading = ref(false)

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    router.push('/library')
  }
})

const handleSubmit = async () => {
  errorMsg.value = ''
  isLoading.value = true
  
  if (!email.value || !password.value) {
    errorMsg.value = 'Please enter both email and password'
    isLoading.value = false
    return
  }

  try {
    if (isRegistering.value) {
      await registerWithEmail(email.value, password.value)
    } else {
      await signInWithEmail(email.value, password.value)
    }
    // Redirect handled by watchEffect
  } catch (e: any) {
    console.error(e)
    if (e.code === 'auth/invalid-credential') {
      errorMsg.value = 'Invalid email or password'
    } else if (e.code === 'auth/email-already-in-use') {
      errorMsg.value = 'Email already in use'
    } else if (e.code === 'auth/weak-password') {
      errorMsg.value = 'Password should be at least 6 characters'
    } else {
      errorMsg.value = e.message || 'An error occurred'
    }
  } finally {
    isLoading.value = false
  }
}

const toggleMode = () => {
  isRegistering.value = !isRegistering.value
  errorMsg.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-parchment text-ink font-sans">
    <div class="max-w-md w-full space-y-8 p-8 md:p-12 border border-stone-200 bg-white/50 backdrop-blur-sm shadow-sm rounded-sm">
      <div class="text-center space-y-2">
        <h2 class="font-serif text-3xl font-semibold text-ink">
          {{ isRegistering ? 'Join the Library' : 'Member Login' }}
        </h2>
        <p class="text-sm text-pencil">
          {{ isRegistering ? 'Begin your journey.' : 'Welcome back to the stacks.' }}
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-sm -space-y-px">
          <div class="mb-4">
            <label for="email-address" class="block text-xs uppercase tracking-widest text-stone-400 mb-1">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-3 border-b border-stone-300 bg-transparent placeholder-stone-400 text-ink focus:outline-none focus:border-shelf focus:ring-0 sm:text-sm transition-colors"
              placeholder="e.g. reader@example.com"
            />
          </div>
          <div class="mb-4">
            <label for="password" class="block text-xs uppercase tracking-widest text-stone-400 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-3 border-b border-stone-300 bg-transparent placeholder-stone-400 text-ink focus:outline-none focus:border-shelf focus:ring-0 sm:text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="errorMsg" role="alert" aria-live="assertive" class="flex items-center justify-center gap-2 p-3 rounded-sm bg-rust/5 border border-rust/10 text-rust text-sm text-center font-serif italic">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ errorMsg }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-stone-300 text-sm font-medium rounded-sm text-ink bg-white hover:bg-stone-50 hover:text-shelf focus:outline-none transition-all duration-300 disabled:opacity-50"
          >
            <span v-if="isLoading" class="font-serif italic text-stone-400">Consulting records...</span>
            <span v-else class="uppercase tracking-widest text-xs">{{ isRegistering ? 'Issue Card' : 'Enter Library' }}</span>
          </button>
        </div>

        <div class="text-center mt-4">
          <button type="button" @click="toggleMode" class="text-xs text-pencil hover:text-ink hover:underline decoration-stone-300 underline-offset-4 transition-colors">
             {{ isRegistering ? 'Already have a card? Log in' : 'New here? Apply for membership' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
