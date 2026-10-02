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

## Development seed data

After applying migrations, set `SEED_OWNER_PASSWORD`, `SEED_ADMINISTRATOR_PASSWORD`,
and `SEED_TECHNICIAN_PASSWORD` in `.env` to unique values of at least 12 characters,
then run `pnpm db:seed`. The default demo account emails are
`owner@example.test`, `administrator@example.test`, and `technician@example.test`;
their email variables can be overridden in `.env`. The seeder refuses to run when
`NODE_ENV=production` and never supplies or prints passwords.

Existing local environments may continue using `SEED_DEVELOPER_EMAIL` and
`SEED_DEVELOPER_PASSWORD`; these are accepted as fallbacks for the technician
seed account.

Seeding is safe to rerun: it upserts the three seed accounts and their role
assignments, system roles and permissions, the initial system appliance types
and their groups/fields, default production workflows for the Aligner and
Retainer appliance types, clinic/doctor fixtures and links, and the seven
operations/notification settings used by the lab settings screen. The seeded
workflows use the ordered stages STL DESIGN, PRINTING, ASSEMBLING, FINISHING,
PACKAGING, and DELIVERED. Rerunning the seed restores these workflows and
recreates their stages in the configured order. For the named demo accounts, a
rerun resets the password to the configured seed password and replaces their
role assignment. The selectable system roles are Administrator, Technician,
and Quality Controller; the protected Owner role remains reserved for the
account owner.

## Clinics

Clinic endpoints require the raw staff access token in the `Authorization` header, without a `Bearer` prefix, and the corresponding `clinics:view`, `clinics:create`, `clinics:update`, or `clinics:delete` permission. `GET /api/v1/clinics` supports `search`, `isActive`, `limit` (1-100), and `cursor` query parameters. Create clinics with `POST /api/v1/clinics`; read one with `GET /api/v1/clinics/:clinicId`; update fields or replace its doctor associations with `PATCH /api/v1/clinics/:clinicId`. Supply `doctorIds` as an array of existing doctor IDs when creating or updating associations. `DELETE /api/v1/clinics/:clinicId` deactivates the clinic instead of removing its data.

## Doctors

Doctor endpoints require a staff access token and the corresponding `doctors:view`, `doctors:create`, `doctors:update`, or `doctors:delete` permission. `GET /api/v1/doctors` supports `search`, `isActive`, `clinicId`, `limit` (1-100), and `cursor`. Create with `POST /api/v1/doctors`, read with `GET /api/v1/doctors/:doctorId`, update with `PATCH /api/v1/doctors/:doctorId`, and delete with `DELETE /api/v1/doctors/:doctorId`. Doctor payloads support `fullName`, `email`, `phone`, `address`, `country`, `specialty`, `notes`, `source` (`clinic` or `portal`), `isActive`, and `clinicIds`. Updating `clinicIds` replaces all clinic links; portal-source doctors cannot have clinic links.

## Staff management

Staff endpoints require the raw staff access token and action-specific `staff:view`, `staff:create`, `staff:update`, `staff:suspend`, or `staff:delete` permission. `GET /api/v1/staff` lists accounts with optional `search`, `isActive`, `limit` (1-100), and `cursor`; `GET /api/v1/staff/:staffId` reads one account. Create with `POST /api/v1/staff` using `fullName`, `email`, an initial `password` of at least 12 characters, optional `phone`, and one or more existing `roleIds`. Update profile fields and replace roles with `PATCH /api/v1/staff/:staffId`. Suspend or reactivate through `PATCH /api/v1/staff/:staffId/status` using `{ "isActive": false }`; suspending revokes the member's active sessions. `DELETE /api/v1/staff/:staffId` permanently removes the member and their sessions. The owner account is protected from staff-management edits, suspension, and deletion; staff cannot suspend or delete their own account. The owner role cannot be assigned through this API. Password hashes are never returned.

## Appliances

Appliance endpoints use the raw staff access token in the `Authorization` header. Type operations require the matching `appliances:view`, `appliances:create`, `appliances:update`, `appliances:delete`, or `appliances:activate` permission; field groups and fields use the `appliance_fields:*` permissions. `GET /api/v1/appliances` supports `search`, `isActive`, `limit` (1-100), and `cursor`. Create types with `POST /api/v1/appliances` using `name` and optional `color`; read and update with `GET` and `PATCH /api/v1/appliances/:applianceTypeId`. Toggle active state with `PATCH /api/v1/appliances/:applianceTypeId/activation` using `{ "isActive": true }`. `DELETE /api/v1/appliances/:applianceTypeId` deletes the appliance type. Responses include `source` (`Platform default` for the built-in `aligner` and `retainer` codes, otherwise `Custom type`) and ordered `fieldGroups`.

Field groups are listed with `GET /api/v1/appliances/:applianceTypeId/field-groups`, created with `POST` at the same path, renamed/reordered with `PATCH /api/v1/appliances/:applianceTypeId/field-groups/:groupId`, and removed with `DELETE` there. Removing a group also removes its fields unless a field in it is a dependency of a field in another group. Fields are listed through the group response, created with `POST /api/v1/appliances/:applianceTypeId/field-groups/:groupId/fields`, updated with `PATCH` at that path plus `/:fieldId`, and removed with `DELETE` at that path plus `/:fieldId`. Field payloads support `key`, `label`, `type` (`text`, `number`, `select`, `multiselect`, `textarea`, `date`, `checkbox`, `file`, or `image`), `options` (`[{ "label": "...", "value": "..." }]`), `defaultValue`, `dependsOn`, `dependsOnValue`, `required`, `helpText`, and `sortOrder`. Field keys are unique within an appliance type; dependencies must point to another field in that type, cannot form a cycle, and a field in use as a dependency cannot be deleted. Appliance case-use counts are not returned until case records are part of the database model.

## Workflow templates

Workflow endpoints require a staff access token and the matching `workflows:view`, `workflows:create`, `workflows:update`, or `workflows:delete` permission. `GET /api/v1/workflows` lists templates and their ordered stages; optionally filter by `applianceTypeId`. Read one with `GET /api/v1/workflows/:workflowId`. Create with `POST /api/v1/workflows` using `{ "applianceTypeId": "1", "name": "Standard production", "isDefault": true }`; `applianceTypeId` may be `null` for an unassigned template, and `isDefault` defaults to `false`. Appliance IDs must refer to an existing appliance type. Template names are unique. Setting a template as default clears the previous default for that appliance type.

Update template fields with `PATCH /api/v1/workflows/:workflowId` and delete with `DELETE /api/v1/workflows/:workflowId`. Workflow stages are included in template responses and use the persisted schema fields `name`, `sortOrder`, `slaHours`, `requiresApproval`, and `allowedFileKinds`. Create, update, and delete stages at `/api/v1/workflows/:workflowId/stages` using the corresponding `workflow_steps:create`, `workflow_steps:update`, and `workflow_steps:delete` permissions. `allowedFileKinds` accepts unique values from `stl`, `photo`, `pdf`, and `doc`; it defaults to all four kinds. `slaHours` is a positive integer or `null`. Reorder all stages with `PUT /api/v1/workflows/:workflowId/stages/order`, sending `{ "stageIds": ["3", "1", "2"] }` and requiring `workflow_steps:reorder`. The supplied IDs must contain every stage in the template exactly once.

## Cases

Case endpoints require a staff access token and `cases:view`, `cases:create`, `cases:update`, or `cases:move` as appropriate. `GET /api/v1/cases` supports `search`, `applianceTypeId`, `clinicId`, `priority`, `stage`, `limit` (1-100), and `cursor`; read one with `GET /api/v1/cases/:caseNumber`. Create with `POST /api/v1/cases` using `patientName`, `doctorId`, `applianceTypeId`, and `workflowTemplateId`; optional fields include `patientCode`, `clinicId`, `categoryId`, `categoryName`, `dueDate` (`YYYY-MM-DD` or `null`), `priority` (`Normal` or `Rush`), `priceRule`, `billable`, `originalCaseNumber`, `remakeReason`, and appliance `caseFieldValues`. Doctors and appliances must be active; when a clinic is selected, the doctor must be linked to it. The selected workflow must be unassigned or configured for that appliance.

Case responses contain case-specific stage rows copied from the chosen workflow template at creation time, including each stage name, order, SLA, approval requirement, and allowed file kinds. Existing cases never read their production stages back from the workflow template, so later template edits or deletion do not change existing cases. Update `priority`, `dueDate`, or `caseFieldValues` with `PATCH /api/v1/cases/:caseNumber`. Update progress with `PATCH /api/v1/cases/:caseNumber/stages/:stageId/status`, sending `{ "status": "active" }` or `{ "status": "completed" }`; completing a stage activates the next incomplete stage.

Case file metadata is stored in MySQL and contents are stored under
`CASE_FILES_STORAGE_DIR` (default `./var/case-files`, resolved from the backend
working directory). Mount this directory on persistent storage in deployments;
the API does not store uploaded file contents in the database. Uploads are
limited to 250 MB and supported CAD models, images, PDFs, and office/text documents.

Case-scoped file routes use `case_files:view`, `case_files:upload`,
`case_files:update`, `case_files:download`, and `case_files:delete` respectively:
`GET /api/v1/cases/:caseNumber/files?kind=model|image|document` lists files,
`POST /api/v1/cases/:caseNumber/files` accepts multipart fields `file` and an
optional `stageId`, `GET /api/v1/cases/:caseNumber/files/:fileId/download`
downloads the contents, `PATCH /api/v1/cases/:caseNumber/files/:fileId` renames
the display name without changing its extension, and `DELETE` removes the file.
Stage uploads are checked against the stage's allowed file kinds.

`GET /api/v1/cases/:caseNumber/activity` requires `case_activity:view` and returns
chronological system events and comments. `POST` at the same endpoint requires
`case_activity:add_note` and accepts `{ "message": "..." }`. Case creation,
stage transitions, and file changes are recorded with comments in the same timeline.

## Roles and permissions

All endpoints require a staff access token and role-management permissions. `GET /api/v1/roles/permissions` lists the seeded permission catalog (optionally filter with `module`); `GET /api/v1/roles` lists roles, and `GET /api/v1/roles/:roleId` reads one role. Create roles with `POST /api/v1/roles` using `name` and `description`; update either with `PATCH /api/v1/roles/:roleId`. Replace assignments with `PUT /api/v1/roles/:roleId/permissions` using `{ "permissionCodes": ["doctors:view"] }`. Delete with `DELETE /api/v1/roles/:roleId`. System roles cannot be deleted, the owner role's permissions cannot be changed, and roles assigned to staff cannot be deleted. Permission definitions are maintained in the seed catalog rather than created through the API.

## Settings

Settings endpoints require the raw staff access token in the `Authorization` header, without a `Bearer` prefix, and `lab_settings:view` for reads or `lab_settings:update` for writes. `GET /api/v1/settings` lists settings alphabetically by key and optionally filters by `group`; `GET /api/v1/settings/:key` reads one setting. `PUT /api/v1/settings/:key` creates or updates a setting using `{ "value": "...", "group": "..." }`. Omit `group` on update to keep its current value, or set it to `null` to clear it. `DELETE /api/v1/settings/:key` removes the setting.

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
