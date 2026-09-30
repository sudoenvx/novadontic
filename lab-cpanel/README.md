# Novadontic Control Panel

The frontend for the Novadontic Orthodontic Lab Management System.

## Structure

```text
src/
├── app/
│   ├── config/                # Application constants and query defaults
│   ├── layout/                # Top-level workspace shell
│   ├── providers/             # Application-wide React providers
│   └── styles/                # Tokens, reset, utilities, and component CSS
├── features/
│   └── dashboard/             # Dashboard-owned cases and screen UI
├── shared/
│   ├── api/                   # Shared Axios client and API configuration
│   ├── lib/                   # Small framework-neutral helpers
│   ├── realtime/              # Socket.IO connection and query invalidation
│   └── ui/                    # Hand-built Base UI primitives
└── main.tsx                   # Browser entry point
```

TanStack Query is provided application-wide by `src/app/providers/QueryProvider.tsx`.
Use the shared Axios instance from `src/shared/api/httpClient.ts` for API requests.
Use `useGetQuery` and `useMutationAction` from `src/shared/api/queryHooks.ts`
for typed TanStack Query hooks. Define feature hooks with the query function and
optional response transformation:

```ts
export const useUsers = () =>
  useGetQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    select: mapUsers,
  })

export const useCreateUser = () =>
  useMutationAction({
    mutationFn: createUser,
  })
```

`useMutationAction` preserves typed mutation variables, return values, and
callbacks. Feature API functions use the shared client and the backend's
`{ data: ... }` / `{ error: ... }` response envelopes.

Copy `.env.example` to `.env.local` when configuring a custom backend URL.
Without `VITE_API_BASE_URL`, API requests use `/api/v1` and the Vite development
server proxies them to `http://localhost:3000`. When setting
`VITE_API_BASE_URL`, include `/api/v1` (for example
`http://localhost:3000/api/v1`). Set `VITE_API_KEY` only when the deployment
requires it. `VITE_REALTIME_URL` optionally overrides
the realtime endpoint; otherwise the `/api/v1` suffix is removed from
`VITE_API_BASE_URL` for the Socket.IO server root. The socket stays disconnected
when neither URL is set. Use
`useRealtimeQueryInvalidation(eventName, queryKey)` in a feature to refresh its
TanStack Query data when the server emits the corresponding event. Vite exposes
`VITE_` values in the browser bundle, so never put private or server-side secrets
in them.

`AuthProvider` signs in through `POST /auth/sessions`, restores sessions by
rotating the refresh token at `POST /auth/sessions/refresh`, renews access tokens
before expiry, and signs out through `DELETE /auth/sessions/current`. The backend
expects the access token unchanged in the `Authorization` header, without a
`Bearer` prefix. Access tokens stay in memory; refresh tokens are stored in
`sessionStorage` unless “Remember this device” is selected, in which case the
refresh token is stored in `localStorage`. Browser storage is accessible to
same-origin JavaScript; production deployments should mitigate XSS and consider
an HttpOnly-cookie session design if the backend supports it.

The app layout is protected by `RequireAuth`, which waits for session restoration
before redirecting unauthenticated users. `useAuth` exposes the session and auth
actions, while `useAuthorization`, `PermissionGate`, and `RoleGate` use backend
role and permission assignments for presentation. A denied gate renders nothing
by default and accepts an optional fallback. These checks are only for frontend
UX; the backend must enforce authorization. An unauthenticated redirect stores
the attempted path in router state as `from` and sign-in returns to that path.

The visual system is deliberately flat: a neutral canvas, white surfaces,
compact spacing, no card borders, and rounded corners capped at `rounded-lg`.
The UI primitives are built on Base UI where behavior is useful, while all
visual styling lives in `src/app/styles/`.

## Commands

```bash
pnpm dev       # Start the Vite development server
pnpm lint      # Check source files with ESLint
pnpm build     # Type-check and create a production build
pnpm preview   # Preview the production build locally
```
