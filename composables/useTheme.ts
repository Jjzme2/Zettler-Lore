export type Theme = 'light' | 'dark' | 'sepia'

export const useTheme = () => {
    const theme = useState<Theme>('theme', () => 'light')

    const setTheme = (newTheme: Theme) => {
        theme.value = newTheme
        if (process.client) {
            document.documentElement.setAttribute('data-theme', newTheme)
            localStorage.setItem('user-theme', newTheme)
        }
    }

    const initTheme = () => {
        if (process.client) {
            const saved = localStorage.getItem('user-theme') as Theme
            if (saved && ['light', 'dark', 'sepia'].includes(saved)) {
                setTheme(saved)
            } else {
                setTheme('light')
            }
        }
    }

    // Initialize on mount (client-side only)
    onMounted(() => {
        initTheme()
    })

    return {
        theme,
        setTheme
    }
}
