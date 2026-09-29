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
  const options: SegmentedControlOption<Theme>[] = [
    { value: 'light', label: 'Light', ariaLabel: 'Light theme', icon: <Sun size={iconSize} aria-hidden="true" /> },
    { value: 'dark', label: 'Dark', ariaLabel: 'Dark theme', icon: <Moon size={iconSize} aria-hidden="true" /> },
  ]

  return (
    <SegmentedControl
      label="Color theme"
      value={theme}
      options={options}
      onValueChange={setTheme}
      size={size}
      variant={variant}
    />
  )
}