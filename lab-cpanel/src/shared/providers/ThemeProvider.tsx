import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type PropsWithChildren,
} from 'react'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const THEME_STORAGE_KEY = 'novadontic-theme'
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getInitialTheme(): Theme {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  } catch {
    // Use the system preference when browser storage is unavailable.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useLayoutEffect(() => {
    const root = document.documentElement
    const shouldAnimate = root.dataset.theme !== undefined && root.dataset.theme !== theme

    if (shouldAnimate) root.classList.add('theme-transitioning')
    root.dataset.theme = theme

    if (!shouldAnimate) return

    const timeout = window.setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 160)

    return () => {
      window.clearTimeout(timeout)
      root.classList.remove('theme-transitioning')
    }
  }, [theme])

  function setTheme(nextTheme: Theme) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // The theme still applies for the current page view.
    }

    setThemeState(nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}