import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../../shared/providers/ThemeProvider'

import { Card } from '../../../shared/ui/Card'
import { getApiErrorMessage } from '../../../shared/api/apiError'
import { useAuth } from '../hooks/useAuth'
import { Tag } from '../../../shared/ui/Tag'
import { ThemeSwitcher } from '../../../shared/ui/ThemeSwitcher'
import { labAuth } from '../data/labAuth'
import { SignInForm } from './SignInForm'

export function SignInPage() {
  const [isPending, setIsPending] = useState(false)
  const [submitError, setSubmitError] = useState<string>()
  const { theme } = useTheme()
  const { signIn, session, isRestoring, authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const wordmark = theme === 'dark'
    ? '/images/novadontic_wordmark_dark.png'
    : '/images/novadontic_wordmark.png'

  const locationState = location.state as { from?: unknown; authError?: unknown } | null
  const returnTo = typeof locationState?.from === 'string'
    && locationState.from.startsWith('/')
    && !locationState.from.startsWith('//')
    ? locationState.from
    : '/'
  const navigationError = typeof locationState?.authError === 'string'
    ? locationState.authError
    : undefined

  useEffect(() => {
    if (!isRestoring && session) {
      navigate(returnTo, { replace: true })
    }
  }, [isRestoring, navigate, returnTo, session])

  async function handleSignIn(values: Parameters<typeof signIn>[0]) {
    setIsPending(true)
    setSubmitError(undefined)
    try {
      await signIn(values)
      navigate(returnTo, { replace: true })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Unable to sign in. Please try again.'))
    } finally {
      setIsPending(false)
    }
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
              <SignInForm
                onSubmit={handleSignIn}
                isPending={isPending || isRestoring}
                submitError={submitError ?? navigationError ?? authError ?? undefined}
              />
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
