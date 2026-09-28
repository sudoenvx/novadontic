import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'

import { Button } from '../../../shared/ui/Button'
import { Checkbox } from '../../../shared/ui/Checkbox'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import type { LabSignInValues } from '../domain/auth'
import { validateLabSignIn } from '../domain/auth'

type SignInFormProps = {
  onSubmit: (values: LabSignInValues) => void;
}

const initialValues: LabSignInValues = {
  email: "",
  password: "",
  rememberDevice: true,
}

export function SignInForm({ onSubmit }: SignInFormProps) {
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState<string>()
  const [notice, setNotice] = useState<string>()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const emailId = useId()
  const passwordId = useId()
  const rememberDeviceId = useId()

  function updateValue<Key extends keyof LabSignInValues>(
    key: Key,
    value: LabSignInValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setError(undefined)
    setNotice(undefined)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateLabSignIn(values)

    if (validationError) {
      setError(validationError)
      return
    }

    onSubmit({
      ...values,
      email: values.email.trim().toLowerCase(),
    })
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          type="email"
          value={values.email}
          onChange={(event) => updateValue('email', event.currentTarget.value)}
          placeholder="name@yourlab.com"
          autoComplete="email"
          autoFocus
          aria-invalid={Boolean(error)}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={passwordId}>Password</Label>
        <div className="relative">
          <Input
            id={passwordId}
            type={isPasswordVisible ? "text" : "password"}
            value={values.password}
            onChange={(event) =>
              updateValue('password', event.currentTarget.value)
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            className="pe-10"
            aria-invalid={Boolean(error)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute end-1 top-1/2 -translate-y-1/2"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={rememberDeviceId} className="cursor-pointer gap-2 text-xs font-medium text-text-secondary">
          <Checkbox
            id={rememberDeviceId}
            checked={values.rememberDevice}
            onCheckedChange={(checked) =>
              updateValue('rememberDevice', checked === true)
            }
          />
          Remember this device
        </Label>
        <Button
          type="button"
          variant="link"
          className="normal-case"
          onClick={() => {
            setError(undefined)
            setNotice('Contact your lab administrator to reset your password.')
          }}
        >
          Forgot password?
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      {notice && (
        <p className="text-xs text-text-secondary" role="status" aria-live="polite">
          {notice}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-1 w-full">
        Sign in
      </Button>
    </form>
  )
}
