import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import { ThemeSwitcher } from '../../../shared/ui/ThemeSwitcher'
import { labAuth } from '../data/labAuth'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const emailId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError('Enter your email address.')
      return
    }
    if (!emailPattern.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    setEmail(normalizedEmail)
    setError(undefined)
    setIsSubmitted(true)
  }

  return (
    <main className="flex min-h-dvh flex-col bg-canvas px-4 py-5 sm:px-8 sm:py-7">
      <header className="flex items-center justify-between">
        <Link to="/sign-in" aria-label="Back to sign in" className="flex items-center gap-2">
          <img src="/images/novadontic_icon.png" alt="" className="size-8" />
          <img src="/images/novadontic_wordmark.png" alt="Novadontic" className="h-5 w-auto" />
        </Link>
        <ThemeSwitcher />
      </header>

      <div className="flex flex-1 items-center justify-center py-8">
        <Card className="w-full max-w-md gap-5 p-4 sm:p-6">
          <div className="grid gap-3">
            <Link to="/sign-in" className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary">
              <ArrowLeft size={14} aria-hidden="true" />
              Back to sign in
            </Link>
            <span className="grid size-10 place-items-center rounded-sm bg-primary-soft text-primary-soft-foreground">
              {isSubmitted ? <CheckCircle2 size={20} aria-hidden="true" /> : <ShieldCheck size={20} aria-hidden="true" />}
            </span>
            <div className="grid gap-1.5">
              <h1 className="text-2xl font-extrabold text-text-primary">
                {isSubmitted ? 'Contact support to reset access' : 'Reset your password'}
              </h1>
              <p className="text-sm text-text-secondary">
                {isSubmitted
                  ? `Email recovery is not connected yet. Contact ${labAuth.supportEmail} for help with your account.`
                  : 'Enter the email address associated with your lab account.'}
              </p>
            </div>
          </div>

          {isSubmitted ? (
            <div className="grid gap-4">
              <p className="flex items-start gap-2 rounded-sm border border-success-soft-foreground/20 bg-success-soft px-3 py-2.5 text-xs text-success-soft-foreground" role="status" aria-live="polite">
                <Mail size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>Your address was validated, but this demo cannot send password reset emails yet.</span>
              </p>
              <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                Try another email
              </Button>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-1.5">
                <Label htmlFor={emailId}>Email</Label>
                <Input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.currentTarget.value)
                    setError(undefined)
                  }}
                  placeholder="name@yourlab.com"
                  autoComplete="email"
                  autoFocus
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${emailId}-error` : undefined}
                />
                {error && <p id={`${emailId}-error`} className="text-xs text-destructive" role="alert">{error}</p>}
              </div>
              <Button type="submit" size="lg" className="w-full">
                Send reset instructions
              </Button>
            </form>
          )}
        </Card>
      </div>

      <footer className="flex justify-center text-xs text-text-faint">
        <Link to="/policies" className="transition-colors hover:text-text-primary hover:underline hover:underline-offset-4">Privacy &amp; terms</Link>
      </footer>
    </main>
  )
}