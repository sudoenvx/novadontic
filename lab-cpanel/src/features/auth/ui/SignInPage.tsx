import { ShieldCheck, Workflow } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Card } from '../../../shared/ui/Card'
import { Tag } from '../../../shared/ui/Tag'
import { labTenantAuth } from '../data/labTenantAuth'
import { SignInForm } from './SignInForm'

export function SignInPage() {
  const navigate = useNavigate()

  function handleSignIn() {
    navigate('/')
  }

  return (
    <main className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(28rem,0.9fr)]">
      <section className="hidden min-h-dvh flex-col justify-between border-e border-border bg-primary-soft-light px-8 py-7 lg:flex xl:px-12">
        <a href="/" aria-label="Novadontic home" className="flex w-fit items-center gap-3">
          <img src="/images/novadontic_icon.png" alt="" className="size-9" />
          <img src="/images/novadontic_wordmark.png" alt="Novadontic" className="h-6 w-auto" />
        </a>

        <div className="max-w-xl py-12">
          <Tag tone="blue">Lab operations workspace</Tag>
          <h1 className="mt-5 max-w-[15ch] text-3xl font-extrabold leading-tight text-text-primary xl:text-4xl">
            Your lab, ready for the next case.
          </h1>
          <p className="mt-3 max-w-md text-base text-text-secondary">
            Keep cases, production work, and clinic communication together from intake to delivery.
          </p>
          <div className="mt-8 grid gap-4 border-t border-border-active pt-5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-surface text-primary shadow-card">
                <Workflow size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-text-primary">Production at a glance</p>
                <p className="mt-0.5 text-sm text-text-secondary">See each case move through your lab.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-surface text-success shadow-card">
                <ShieldCheck size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-text-primary">A workspace for your lab</p>
                <p className="mt-0.5 text-sm text-text-secondary">Staff and clinic access stays organized.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs font-medium text-text-secondary">Powered by Novadontic</p>
      </section>

      <section className="flex min-h-dvh flex-col px-4 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between">
          <a href="/" aria-label="Novadontic home" className="flex items-center gap-2 lg:hidden">
            <img src="/images/novadontic_icon.png" alt="" className="size-8" />
            <img src="/images/novadontic_wordmark.png" alt="Novadontic" className="h-5 w-auto" />
          </a>
          <span className="ms-auto text-sm font-medium text-text-secondary">Secure lab workspace</span>
        </header>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="grid w-full max-w-md gap-4">
            <Card className="w-full gap-5 p-4 sm:p-6">
              <div className="grid gap-1.5">
                <Tag tone="blue" className="w-fit">{labTenantAuth.workspace}</Tag>
                <h2 className="mt-1 text-2xl font-extrabold text-text-primary">Welcome back</h2>
                <p className="text-sm text-text-secondary">Sign in to continue to your lab workspace.</p>
              </div>
              <SignInForm onSubmit={handleSignIn} />
            </Card>
            <p className="text-center text-xs text-text-secondary">
              Need access? Contact your lab administrator.
            </p>
          </div>
        </div>

        <footer className="flex justify-center gap-4 text-xs text-text-faint">
          <span>Privacy</span>
          <span aria-hidden="true">·</span>
          <span>Terms</span>
          <span aria-hidden="true">·</span>
          <span>Help</span>
        </footer>
      </section>
    </main>
  )
}
