import { useState } from 'react'
import { useTheme } from '../../../shared/providers/ThemeProvider'

import { Card } from '../../../shared/ui/Card'
import { Tag } from '../../../shared/ui/Tag'
import { ThemeSwitcher } from '../../../shared/ui/ThemeSwitcher'
import { labAuth } from '../data/labAuth'
import { SignInForm } from './SignInForm'

export function SignInPage() {
  const [authUnavailable, setAuthUnavailable] = useState(false)
  const { theme } = useTheme()
  const wordmark = theme === 'dark'
    ? '/images/novadontic_wordmark_dark.png'
    : '/images/novadontic_wordmark.png'

  function handleSignIn() {
    setAuthUnavailable(true)
  }

  return (
    <main className="flex min-h-dvh flex-col bg-canvas">
      <section className="flex min-h-dvh w-full flex-col px-4 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between">
          <a href="/" aria-label="Novadontic home" className="flex items-center gap-2">
            <img src="/images/novadontic_icon.png" alt="" className="size-8" />
            <img src={wordmark} alt="Novadontic" className="h-5 w-auto" />
          </a>
          <div className="ms-auto flex items-center gap-3">
            <ThemeSwitcher />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="grid w-full max-w-md gap-4">
            <Card className="w-full gap-5 p-4 sm:p-6">
              <div className="grid gap-1.5">
                <Tag tone="blue" className="w-fit">{labAuth.labName}</Tag>
                <h2 className="mt-1 text-2xl font-extrabold text-text-primary">Sign in to your lab</h2>
                <p className="text-sm text-text-secondary">Manage cases, production, and clinic communication.</p>
              </div>
              <SignInForm onSubmit={handleSignIn} />
              {authUnavailable && (
                <p className="text-xs text-destructive" role="alert">
                  Sign-in is not available until authentication is connected.
                </p>
              )}
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
