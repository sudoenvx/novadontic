import { ArrowRight, ShieldCheck, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card } from "../../../shared/ui/Card";
import { labTenantAuth } from "../data/labTenantAuth";
import { SignInForm } from "./SignInForm";

export function SignInPage() {
  const navigate = useNavigate();

  function handleSignIn() {
    navigate("/");
  }

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,0.8fr)_minmax(28rem,0.92fr)]">
      <section className="relative hidden overflow-hidden bg-brand-gradient p-6 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="inline-flex w-fit items-center rounded-sm bg-neutral-300 px-3 py-2">
          <img
            src="/images/novadontic_wordmark.png"
            alt="Novadontic"
            className="h-6 w-auto"
          />
        </div>

        <div className="relative z-10 max-w-xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary-foreground/75">
            Lab operations workspace
          </p>
          <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Cases, production, and clinic work — together.
          </h1>
          <p className="max-w-md text-base text-primary-foreground/80">
            Keep your team aligned from the first case request to the final
            delivery.
          </p>
          <div className="flex flex-wrap gap-2 pt-2 text-xs text-primary-foreground/90">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-surface/10 px-2 py-1 font-medium uppercase text-surface/80">
              <Workflow className="size-3.5" /> Production workflows
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-surface/10 px-2 py-1 font-medium uppercase text-surface/80">
              <ShieldCheck className="size-3.5" /> Controlled access
            </span>
          </div>
        </div>

        <p className="text-sm uppercase text-primary-foreground/80 font-medium">
          Powered by Novadontic
        </p>
        <div className="pointer-events-none absolute -right-24 -bottom-32 size-[28rem] rounded-full border-[3rem] border-primary-foreground/10" />
        <div className="pointer-events-none absolute -right-8 -bottom-16 size-48 rounded-full border-[1.5rem] border-primary-foreground/10" />
      </section>

      <section className="flex min-h-screen flex-col justify-between p-3 sm:p-6">
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-1 rounded-md bg-surface p-1 text-xs text-secondary shadow-card">
            <span className="rounded-sm bg-primary px-2 py-1 font-medium text-primary-foreground">
              EN
            </span>
            <span className="px-2 py-1">العربية</span>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-md gap-3">
          <div className="flex items-center gap-2 px-1 lg:hidden">
            <img src="/images/novadontic_icon.png" alt="" className="size-7" />
            <span className="text-lg font-semibold text-text">Novadontic</span>
          </div>
          <Card className="w-full gap-4 p-3 sm:p-4">
            <div className="grid gap-1">
              <h2 className="text-lg uppercase font-semibold tracking-tight text-primary">
                Sign in to your lab
              </h2>
              <p className="text-sm text-text-muted">
                Enter your account details to continue.
              </p>
            </div>
            <SignInForm onSubmit={handleSignIn} />
            
          </Card>
          <p className="text-center flex items-center gap-2 justify-center text-sm text-text-muted">
            <span className="font-medium text-text-secondary upp">
              {labTenantAuth.workspace}
            </span>{" "}
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium text-primary-hover hover:underline"
              onClick={() => navigate("/sign-in")}
            >
              Not your lab? <ArrowRight className="size-3" />
            </button>
          </p>
        </div>

        <footer className="flex justify-center gap-4 text-xs text-text-muted">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Help</span>
        </footer>
      </section>
    </main>
  );
}
