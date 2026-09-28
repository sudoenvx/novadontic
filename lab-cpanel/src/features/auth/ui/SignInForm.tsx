import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "../../../shared/ui/Button";
import { Checkbox } from "../../../shared/ui/Checkbox";
import { Input } from "../../../shared/ui/Input";
import { Label } from "../../../shared/ui/Label";
import type { LabSignInValues } from "../domain/auth";
import { validateLabSignIn } from "../domain/auth";

type SignInFormProps = {
  onSubmit: (values: LabSignInValues) => void;
};

const initialValues: LabSignInValues = {
  email: "",
  password: "",
  rememberDevice: true,
};

export function SignInForm({ onSubmit }: SignInFormProps) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function updateValue<Key extends keyof LabSignInValues>(
    key: Key,
    value: LabSignInValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setError(undefined);
    setNotice(undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateLabSignIn(values);

    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit({
      ...values,
      email: values.email.trim().toLowerCase(),
    });
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="sign-in-email">Email</Label>
        <Input
          size="default"
          variant={"outline"}
          id="sign-in-email"
          type="email"
          value={values.email}
          onChange={(event) => updateValue("email", event.currentTarget.value)}
          placeholder="name@yourlab.com"
          autoComplete="email"
          autoFocus
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="sign-in-password">Password</Label>
        <div className="relative">
          <Input
            size="default"
            variant={"outline"}
            id="sign-in-password"
            type={isPasswordVisible ? "text" : "password"}
            value={values.password}
            onChange={(event) =>
              updateValue("password", event.currentTarget.value)
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            className="pr-9"
          />
          <Button
            type="button"
            variant="transparent"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2 text-text-muted hover:text-text"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-secondary">
          <Checkbox
            checked={values.rememberDevice}
            onCheckedChange={(checked) =>
              updateValue("rememberDevice", checked === true)
            }
            aria-label="Remember this device"
          />
          Remember this device
        </label>
        <Button
          type="button"
          variant="link"
          className="normal-case"
          onClick={() => {
            setError(undefined);
            setNotice("Contact your lab administrator to reset your password.");
          }}
        >
          Forgot password?
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="text-xs text-secondary" role="status">
          {notice}
        </p>
      )}

      <Button type="submit" size="md" className="mt-1 w-full">
        Sign in
      </Button>
    </form>
  );
}
