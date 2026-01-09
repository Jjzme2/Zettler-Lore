export interface CardTheme {
    name: string
    classes: {
        wrapper: string
        border: string
        header: string
        body: string
        accent: string
        quote: string
    }
}

export const THEME_CLASSIC: CardTheme = {
    name: 'Classic',
    classes: {
        wrapper: 'bg-parchment shadow-sm',
        border: 'border-stone-300',
        header: 'font-serif text-ink',
        body: 'font-mono text-pencil',
        accent: 'text-stone-400',
        quote: 'font-mono italic text-pencil'
    }
}

export const THEME_MODERN: CardTheme = {
    name: 'Modern',
    classes: {
        wrapper: 'bg-white shadow-xl shadow-stone-200/50 rounded-xl',
        border: 'border-stone-100',
        header: 'font-sans font-bold tracking-tight text-slate-800',
        body: 'font-sans text-slate-500',
        accent: 'text-indigo-500 font-semibold',
        quote: 'font-serif italic text-slate-600 border-l-2 border-indigo-100 pl-4 py-1'
    }
}

export const THEME_DARK: CardTheme = {
    name: 'Midnight',
    classes: {
        wrapper: 'bg-slate-900 shadow-2xl shadow-black/50 rounded-xl',
        border: 'border-slate-800',
        header: 'font-sans font-bold tracking-tight text-white',
        body: 'font-sans text-slate-400',
        accent: 'text-sky-400 font-medium',
        quote: 'font-serif italic text-slate-300 border-l-2 border-sky-900 pl-4 py-1'
    }
}
