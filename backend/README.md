# Novadontic API

The backend is a single-client TypeScript modular monolith. It exposes a lab staff authentication API and shares one database, user directory, role catalog, appliance catalog, and production workflow configuration. There is no tenant provisioning, tenant selection, or platform-operator authentication.

## Run locally

Use Node.js 22 or newer and pnpm from this directory:

```powershell
pnpm install
Copy-Item .env.example .env
pnpm prisma:migrate:dev
pnpm dev
```

Set `DATABASE_URL` and `AUTH_JWT_SECRET` in `.env` before starting. The API listens on port 3000 by default and mounts routes under `/api/v1`.

Staff sign in with `POST /api/v1/auth/sessions` using `{ "email", "password" }`. Send the returned `accessToken` unchanged as the `Authorization` header value (without a `Bearer` prefix) for `GET /api/v1/auth/me`, `DELETE /api/v1/auth/sessions/current`, and other protected endpoints. Rotate refresh tokens through `POST /api/v1/auth/sessions/refresh`.

## Clinics

Clinic endpoints require the raw staff access token in the `Authorization` header, without a `Bearer` prefix. `GET /api/v1/clinics` supports `search`, `isActive`, `limit` (1-100), and `cursor` query parameters. Create clinics with `POST /api/v1/clinics`; read one with `GET /api/v1/clinics/:clinicId`; update fields or replace its doctor associations with `PATCH /api/v1/clinics/:clinicId`. Supply `doctorIds` as an array of existing doctor IDs when creating or updating associations. `DELETE /api/v1/clinics/:clinicId` deactivates the clinic instead of removing its data.

The server accepts Socket.IO connections on the same port at the default `/socket.io` path. Socket.IO shares `CORS_ORIGIN` with the HTTP API. Socket connections are not authenticated yet; do not broadcast private data until socket authentication and authorization are implemented.

Prisma 7 loads the root datasource/generator from `prisma/schema.prisma` and model definitions from `prisma/models/*.prisma`. `prisma.config.ts` configures the connection, migration path, and seeder. The generated client is written to `src/generated/prisma`. Lab settings are stored as individual `key`/`value` rows in `settings`, with an optional nullable `group` for organization. After schema changes, run:

```powershell
pnpm prisma:generate
pnpm prisma:validate
pnpm prisma:migrate:dev
```

This is an initial single-client schema. If a local database was created with the previous tenant-based migration, back up any required records and recreate that development database before applying the new initial migration; the old tenant/platform identity layout is intentionally not migrated forward.

Useful commands:

```powershell
pnpm typecheck
pnpm test
pnpm build
pnpm prisma:validate
pnpm start
```

## Structure

`src/app` composes the server and HTTP routes. `src/modules/auth` owns staff sign-in, access tokens, and sessions; its service accesses Prisma directly because this application has one database implementation and does not need a repository abstraction. `src/infrastructure/database/mysql.client.ts` creates the MySQL-backed Prisma client. `src/shared` contains cross-cutting errors, HTTP, security, and realtime infrastructure.
