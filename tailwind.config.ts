import type { Config } from 'tailwindcss'

export default <Config>{
    content: [],
    theme: {
        extend: {
            colors: {
                parchment: 'var(--color-parchment)',
                ink: 'var(--color-ink)',
                pencil: 'var(--color-pencil)',
                shelf: 'var(--color-shelf)',
                forest: 'var(--color-forest)',
                rust: 'var(--color-rust)',
            },
            fontFamily: {
                serif: ['Lora', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
