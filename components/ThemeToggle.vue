<script setup lang="ts">
const { theme, setTheme } = useTheme()

const toggle = () => {
    if (theme.value === 'light') setTheme('dark')
    else if (theme.value === 'dark') setTheme('sepia')
    else setTheme('light')
}

// Labels for tooltip/aria
const labels = {
    light: 'Light Mode',
    dark: 'Dark Mode',
    sepia: 'Sepia Mode'
}
</script>

<template>
    <button 
        @click="toggle" 
        class="flex items-center gap-2 px-3 py-1 rounded-full border border-stone-200 bg-parchment hover:bg-stone-200/50 transition-colors duration-200"
        :title="labels[theme]"
        :aria-label="labels[theme]"
    >
        <!-- Icons based on theme -->
        <span v-if="theme === 'light'" class="text-amber-500">☀</span>
        <span v-else-if="theme === 'dark'" class="text-indigo-400">☾</span>
        <span v-else class="text-yellow-700">☕</span>
        
        <span class="text-xs font-medium uppercase tracking-wider text-ink">
            {{ theme }}
        </span>
    </button>
</template>
