# Novadontic API

The backend is a TypeScript modular monolith. Business capabilities live under `src/modules`; each module owns its routes and, as it grows, its application workflows, domain rules, and persistence adapters. `src/app` is the composition root. `src/shared` is reserved for genuinely cross-cutting infrastructure, not business features.

## Run locally

Use Node.js 22 or newer and pnpm from this directory:

```sh
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Set `DATABASE_URL` to a PostgreSQL database before starting. The API listens on port 3000 by default. No business or health routes are registered yet; add endpoints through their owning modules.

Prisma 7 loads the root datasource/generator from `prisma/schema.prisma` and model definitions from `prisma/models/*.prisma`. `prisma.config.ts` points the CLI at the full `prisma` directory and configures its connection and migration path. The generated client is written to `src/generated/prisma` during install. After changing the schema, run `pnpm prisma:generate` and `pnpm prisma:migrate:dev`.

Useful commands:

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm prisma:validate
pnpm start
```

## Structure and module boundaries

Business capabilities live in `src/modules`. Each module owns its routes, controllers, schemas, types, repository, service, and public `index.ts`. The flat layout keeps small capabilities easy to navigate; split a file or introduce deeper folders only when its responsibilities become substantial. Modules should not import another module's private files; cross-module use goes through the owning module's public API.

`src/app` is the composition root. `src/config` validates environment configuration and configures logging. `src/infrastructure` contains replaceable technical adapters such as Prisma. `src/shared` is reserved for cross-cutting HTTP and error primitives, not business features. Authentication, authorization, and business endpoints are intentionally not stubbed; they need real identity and permission rules before exposure.

## Product capability map

Create a module when its first real use case is implemented. The current product suggests these ownership boundaries:

- `identity`: sign-in, sessions, lab staff, portal identities, memberships, roles, and permissions.
- `tenants`: lab provisioning, settings, branding, branches, plans, and per-tenant feature overrides.
- `directory`: clinics, doctors, patients, and their lab relationships.
- `cases`: case intake, appliance-specific values, approvals, lifecycle, and case timeline.
- `production`: workflow templates/stages, assignments, QC, reworks, scan imports, devices, and print jobs.
- `files`: uploads, archive batches, file versions, and storage-provider integration.
- `shipping`, `inventory`, and `billing`: each owns its operational records and workflows; platform subscription billing remains separate from lab-to-clinic billing.
- `communications`: notification delivery and tenant-specific templates.
- `integrations`: tenant API credentials, webhook subscriptions, signing, and delivery retries.
- `platform-ops`: internal staff, support operations, impersonation, CRM leads, and platform announcements. Keep its authentication and database role separate from tenant-facing requests.

These are capability boundaries, not required folder templates. A module can start small and gain `domain`, `application`, `infrastructure`, and `presentation` areas only when those responsibilities actually exist. Cross-module workflows should call a module's public application API; they should not reach into its tables or private files directly.

## Tenant isolation

Tenant context must be derived from a verified staff or portal identity and its authorized membership. Never accept a tenant ID directly from an untrusted request header, query parameter, or body as authorization.

When adding tenant-owned persistence, design the Prisma transaction and PostgreSQL RLS boundary together so tenant context is transaction-local and cannot leak across pooled connections. Do not use a `BYPASSRLS` role in tenant-facing API code. Platform operations that need cross-tenant access belong behind a separately authenticated internal boundary and a separately configured database role.

## Schema status

The SQL files under `../dev` are design drafts, not an applied or unified migration history. Before relying on them, consolidate them into ordered, repeatable migrations and validate them against PostgreSQL. One concrete mismatch to resolve: `support_ticket_messages` is included in migration 003's tenant-stamping/RLS loop, but the table definition has no `tenant_id` column for `trg_stamp_tenant()` or the policy to use. More broadly, enforce tenant consistency across foreign-key relationships (including child tables) in the database; RLS alone does not prevent cross-tenant foreign-key references.
