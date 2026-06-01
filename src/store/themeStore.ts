import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  theme: 'dark' | 'light'
  toggle: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', next)
        set({ theme: next })
      },
    }),
    { name: 'k2pbot-theme' },
  ),
)

export function initTheme() {
  try {
    const raw = localStorage.getItem('k2pbot-theme')
    const parsed = raw ? (JSON.parse(raw) as { state?: { theme?: string } }) : {}
    const theme = parsed.state?.theme ?? 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
}
