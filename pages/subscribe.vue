<template>
  <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
        Subscribe to Premium
      </h1>
      <p class="mt-4 text-lg text-gray-500">
        Unlock exclusive content and features.
      </p>
    </div>

    <div class="mt-12 flex justify-center">
      <div class="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white max-w-sm w-full">
        <div class="p-6">
          <h2 class="text-lg leading-6 font-medium text-gray-900">Monthly Membership</h2>
          <p class="mt-4">
            <span class="text-4xl font-extrabold text-gray-900">$5</span>
            <span class="text-base font-medium text-gray-500">/mo</span>
          </p>
          <p class="mt-4 text-sm text-gray-500">
            Access to all member-only stories and shelves.
          </p>
          <button
            @click="handleSubscribe"
            :disabled="loading"
            class="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Processing...' : 'Subscribe Now' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="mt-4 text-center text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { redirectToCheckout } = useStripe()
const loading = ref(false)
const error = ref('')

// This is a placeholder price ID. You should replace it with your actual Stripe Price ID.
// You can also move this to runtime config or fetch it from an API.
const STRIPE_PRICE_ID = 'price_1234567890'

const handleSubscribe = async () => {
  loading.value = true
  error.value = ''
  try {
    await redirectToCheckout(STRIPE_PRICE_ID)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
