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
Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` and, if required,
`VITE_API_KEY`. `VITE_REALTIME_URL` optionally overrides the realtime endpoint;
otherwise it uses `VITE_API_BASE_URL`. The socket stays disconnected when neither
URL is set. Use `useRealtimeQueryInvalidation(eventName, queryKey)` in a feature
to refresh its TanStack Query data when the server emits the corresponding event.
Vite exposes `VITE_` values in the browser bundle, so never put private or
server-side secrets in them.

The app layout requires an auth session. `AuthProvider` currently starts
unauthenticated and does not persist a fabricated identity; connect a backend
auth flow before enabling protected routes. `useAuth` exposes the in-memory
session boundary, while `useAuthorization`, `PermissionGate`, and `RoleGate`
provide reusable UI checks based on the assigned role. A denied gate renders
nothing by default and accepts an optional fallback. These checks only control
frontend presentation; the backend must enforce authorization. An unauthenticated
redirect stores the attempted path in router state as `from` for the eventual
successful sign-in flow.

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
