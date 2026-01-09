export type Theme = 'light' | 'dark' | 'sepia'

/**
 * Composable for managing the application theme (Light, Dark, Sepia).
 *
 * This composable handles:
 * - Reactive state for the current theme.
 * - Persistence using `localStorage`.
 * - Applying the theme to the document element (for CSS variables/Tailwind).
 * - Automatic initialization on client-side mount.
 *
 * @returns {object} An object containing the current theme state and a setter function.
 */
export const useTheme = () => {
    /**
     * The current theme state ('light', 'dark', or 'sepia').
     */
    const theme = useState<Theme>('theme', () => 'light')

    /**
     * Updates the theme and persists it to local storage.
     * Also updates the `data-theme` attribute on the `<html>` element.
     *
     * @param {Theme} newTheme - The new theme to apply.
     */
    const setTheme = (newTheme: Theme) => {
        theme.value = newTheme
        if (process.client) {
            document.documentElement.setAttribute('data-theme', newTheme)
            localStorage.setItem('user-theme', newTheme)
        }
    }

    /**
     * Initializes the theme from local storage.
     * Defaults to 'light' if no preference is found.
     */
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
