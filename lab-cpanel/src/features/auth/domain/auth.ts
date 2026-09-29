export type LabSignInValues = {
  email: string
  password: string
  rememberDevice: boolean
}

export type AuthUser = {
  id: string
  fullName: string
  email: string
  roles: string[]
  permissions: string[]
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
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
