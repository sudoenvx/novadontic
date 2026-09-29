import { useState } from 'react'

import { SegmentedControl, type SegmentedControlOption } from './SegmentedControl'

type Language = 'en' | 'ar'

type LanguageSwitcherProps = {
  size?: 'default' | 'compact'
  variant?: 'surface' | 'dark'
}

const LANGUAGE_STORAGE_KEY = 'novadontic-language'

function getCurrentLanguage(): Language {
  return document.documentElement.lang === 'ar' ? 'ar' : 'en'
}

function applyLanguage(language: Language) {
  const root = document.documentElement
  root.lang = language
  root.dir = language === 'ar' ? 'rtl' : 'ltr'

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Language direction still applies for this page view when storage is unavailable.
  }
}

export function LanguageSwitcher({ size = 'default', variant = 'surface' }: LanguageSwitcherProps) {
  const [language, setLanguage] = useState(getCurrentLanguage)
  const options: SegmentedControlOption<Language>[] = [
    { value: 'en', label: size === 'compact' ? 'EN' : 'English', ariaLabel: 'English' },
    { value: 'ar', label: size === 'compact' ? 'عربي' : 'العربية', ariaLabel: 'Arabic' },
  ]

  function selectLanguage(nextLanguage: Language) {
    applyLanguage(nextLanguage)
    setLanguage(nextLanguage)
  }

  return (
    <SegmentedControl
      label="Language"
      value={language}
      options={options}
      onValueChange={selectLanguage}
      size={size}
      variant={variant}
    />
  )
}