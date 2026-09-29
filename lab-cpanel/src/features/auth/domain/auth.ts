import type { Role } from '../../roles-permissions/domain/role'

export type LabSignInValues = {
  email: string
  password: string
  rememberDevice: boolean
}

export type AuthSession = {
  user: {
    id: string
    name: string
    email: string
    role: Role
  }
}

export function validateLabSignIn(values: LabSignInValues): string | undefined {
  if (!values.email.trim()) {
    return 'Enter your email address.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    return 'Enter a valid email address.'
  }

  if (!values.password) {
    return 'Enter your password.'
  }
}
