import { z } from 'zod'

import { httpClient } from '../../../shared/api/httpClient'
import type { AuthSession, AuthUser, LabSignInValues } from '../domain/auth'

const authUserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
})

const authSessionResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
  user: authUserResponseSchema,
})

const authEnvelopeSchema = z.object({
  data: authSessionResponseSchema,
})

const currentUserEnvelopeSchema = z.object({
  data: authUserResponseSchema,
})

const pendingRefreshes = new Map<string, Promise<AuthSession>>()

function mapAuthUser(user: z.infer<typeof authUserResponseSchema>): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    permissions: user.permissions,
  }
}

function mapAuthSession(
  response: z.infer<typeof authSessionResponseSchema>,
): AuthSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresIn: response.expiresIn,
    user: mapAuthUser(response.user),
  }
}

export async function signIn(
  values: Pick<LabSignInValues, 'email' | 'password'>,
): Promise<AuthSession> {
  const response = await httpClient.post('/auth/sessions', values)
  const parsedResponse = authEnvelopeSchema.parse(response.data)

  return mapAuthSession(parsedResponse.data)
}

export function refreshAuthSession(
  refreshToken: string,
): Promise<AuthSession> {
  const pendingRefresh = pendingRefreshes.get(refreshToken)
  if (pendingRefresh) return pendingRefresh

  const refreshRequest = httpClient
    .post('/auth/sessions/refresh', { refreshToken })
    .then(({ data }) => {
      const parsedResponse = authEnvelopeSchema.parse(data)
      return mapAuthSession(parsedResponse.data)
    })
    .finally(() => pendingRefreshes.delete(refreshToken))

  pendingRefreshes.set(refreshToken, refreshRequest)
  return refreshRequest
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await httpClient.get('/auth/me')
  const parsedResponse = currentUserEnvelopeSchema.parse(response.data)

  return mapAuthUser(parsedResponse.data)
}

export async function signOut(): Promise<void> {
  await httpClient.delete('/auth/sessions/current')
}
