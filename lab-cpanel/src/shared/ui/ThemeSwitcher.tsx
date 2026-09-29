import { Moon, Sun } from 'lucide-react'

import { useTheme, type Theme } from '../providers/ThemeProvider'
import { SegmentedControl, type SegmentedControlOption } from './SegmentedControl'

type ThemeSwitcherProps = {
  size?: 'default' | 'compact'
  variant?: 'surface' | 'dark'
}

export function ThemeSwitcher({ size = 'default', variant = 'surface' }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  const iconSize = size === 'compact' ? 12 : 14
  const toggleSize = size === 'compact' ? 'min-h-6 gap-1 px-2 text-2xs' : 'min-h-8 gap-1.5 px-3 text-xs'
  const options: SegmentedControlOption<Theme>[] = [
    { value: 'light', label: 'Light', ariaLabel: 'Light theme', icon: <Sun size={iconSize} aria-hidden="true" /> },
    { value: 'dark', label: 'Dark', ariaLabel: 'Dark theme', icon: <Moon size={iconSize} aria-hidden="true" /> },
  ]
  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
  const ToggleIcon = nextTheme === 'dark' ? Moon : Sun

  return (
    <>
      <div className="max-sm:hidden">
        <SegmentedControl
          label="Color theme"
          value={theme}
          options={options}
          onValueChange={setTheme}
          size={size}
          variant={variant}
        />
      </div>
      <button
        type="button"
        data-variant={variant}
        className={`theme-switcher-toggle hidden shrink-0 items-center justify-center rounded-full border font-bold transition-colors max-sm:inline-flex ${toggleSize}`}
        onClick={() => setTheme(nextTheme)}
        aria-label={`Switch to ${nextTheme} theme`}
        aria-pressed={theme === 'dark'}
        title={`Switch to ${nextTheme} theme`}
      >
        <ToggleIcon size={iconSize} aria-hidden="true" />
        <span>{nextTheme === 'dark' ? 'Dark' : 'Light'}</span>
      </button>
    </>
  )
}