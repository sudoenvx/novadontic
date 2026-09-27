# File and Folder Naming Conventions

File and folder names MUST communicate their purpose, ownership, and architectural role.

The AI MUST inspect existing project conventions first and preserve them. If the project does not have an established convention, use the rules below.

## General Principle

Name files according to **what they represent**, not merely the technology used to implement them.

Prefer:

```text
EmployeeTable.tsx
CreateEmployeeDialog.tsx
useEmployeeFilters.ts
mapEmployeeResponseToEmployee.ts
employee.types.ts
```

Avoid vague or overly generic names:

```text
component.tsx
helper.ts
utils.ts
common.ts
data.ts
service.ts
manager.ts
misc.ts
```

unless the file genuinely represents that concept.

## React Component Files

React component files SHOULD use PascalCase:

```text
EmployeeTable.tsx
EmployeeForm.tsx
EmployeeStatusBadge.tsx
LeaveRequestDialog.tsx
AttendanceTimeline.tsx
```

The filename should normally match the exported component:

```tsx
// EmployeeTable.tsx
export function EmployeeTable() {}
```

Avoid:

```text
employeeTable.tsx
employee-table.tsx
employee_table.tsx
table.tsx
```

when the project follows PascalCase for React components.

## Hook Files

Custom React hook files SHOULD use camelCase and start with `use`:

```text
useUsers.ts
useEmployeeFilters.ts
useCreateEmployee.ts
useLeaveBalance.ts
useDebounce.ts
```

The filename should normally match the primary exported hook:

```ts
// useEmployeeFilters.ts
export function useEmployeeFilters() {}
```

Do not create vague hook filenames such as:

```text
useData.ts
useCommon.ts
useHelper.ts
useEverything.ts
```

## Domain Files

Domain files should be named after the business concept or operation they contain.

Prefer:

```text
employee.ts
employmentStatus.ts
leaveRequest.ts
canRequestLeave.ts
calculateLeaveBalance.ts
```

Avoid:

```text
domainUtils.ts
businessLogic.ts
helpers.ts
rules.ts
misc.ts
```

unless the file genuinely represents a cohesive collection of that concept.

When a domain operation is important enough to have a meaningful name, prefer a dedicated file:

```text
canRequestLeave.ts
calculateLeaveBalance.ts
isEmployeeEligible.ts
```

rather than:

```text
leaveUtils.ts
```

## API Files

API files should clearly communicate the feature and responsibility.

Prefer:

```text
employeesApi.ts
leaveRequestsApi.ts
attendanceApi.ts
```

or, when the project organizes API code by operation:

```text
getEmployees.ts
createEmployee.ts
updateEmployee.ts
deleteEmployee.ts
```

Follow the existing project convention rather than mixing both approaches arbitrarily.

Avoid generic:

```text
api.ts
requests.ts
client.ts
service.ts
```

inside feature directories when the name does not communicate ownership or responsibility.

## Mapper Files

When mapping between representations, the filename should describe the transformation.

Prefer:

```text
mapEmployeeResponseToEmployee.ts
mapUserResponseToUser.ts
mapEmployeeToEmployeeResponse.ts
```

For a cohesive set of mappings, a feature-level mapper file may be appropriate:

```text
employeeMappers.ts
```

Do not use vague names such as:

```text
mapper.ts
transform.ts
converter.ts
helper.ts
```

when the mapping responsibility can be made explicit.

## Type Files

Type files should communicate what type definitions they contain.

Prefer:

```text
employee.types.ts
leaveRequest.types.ts
pagination.types.ts
api.types.ts
```

when the project uses `.types.ts` suffixes.

Alternatively, if the project convention uses domain files:

```text
employee.ts
leaveRequest.ts
pagination.ts
```

Follow the established convention.

Do not introduce `.types.ts` files everywhere simply because TypeScript types exist.

For example, this may be unnecessary:

```text
Employee.ts
Employee.types.ts
Employee.constants.ts
Employee.utils.ts
Employee.helpers.ts
```

for a small feature.

Prefer fewer cohesive files until separate ownership or responsibility justifies the split.

## Schema Files

Runtime validation schemas SHOULD use a descriptive suffix:

```text
employee.schema.ts
createEmployee.schema.ts
employeeResponse.schema.ts
```

when schemas are separated from other code.

The name should communicate what is being validated.

Avoid:

```text
schema.ts
validation.ts
validator.ts
```

when the ownership is unclear.

## Test Files

Test filenames MUST clearly identify the code or behavior being tested.

Follow the project's established test convention, for example:

```text
EmployeeTable.test.tsx
employee.test.ts
canRequestLeave.test.ts
useEmployeeFilters.test.ts
```

Do not create generic test names such as:

```text
test.ts
tests.ts
component.test.tsx
utils.test.ts
```

when a specific name is available.

## Configuration Files

Configuration filenames should describe the configuration they own:

```text
env.ts
router.tsx
queryClient.ts
auth.ts
```

Avoid:

```text
config.ts
settings.ts
setup.ts
helpers.ts
```

when the configuration has a more precise responsibility.

## Folder Naming

Folders should normally represent **ownership, feature boundaries, or architectural boundaries**.

Prefer:

```text
features/
  employees/
  attendance/
  leave/
  payroll/

shared/
  ui/
  api/
  lib/
  hooks/

app/
  config/
  router/
  layout/
```

Avoid technical dumping-ground folders such as:

```text
helpers/
misc/
stuff/
common/
general/
random/
```

when the contents actually belong to a feature or architectural boundary.

## Feature Folder Naming

Feature folders SHOULD use the business/domain concept:

```text
employees/
attendance/
leave/
payroll/
authentication/
```

Prefer business terminology over UI terminology.

For example:

```text
features/employees/
```

is preferred over:

```text
features/employee-page/
```

because the feature represents the employee capability rather than one specific screen.

## Index Files

Do not create `index.ts` files automatically.

Use an index/barrel file only when it provides a meaningful public API or simplifies intentional module boundaries.

Prefer:

```text
features/employees/index.ts
```

when the feature deliberately exposes a small public surface.

Avoid:

```text
index.ts
```

inside every directory merely for convenience.

Do not use barrels to hide architectural ownership or create circular dependencies.

## One Primary Responsibility Per File

A file should normally have one cohesive responsibility.

Prefer:

```text
EmployeeTable.tsx
EmployeeFilters.tsx
EmployeeActions.tsx
```

when these represent meaningful independent UI responsibilities.

But do not split trivial code merely to satisfy a one-class/one-file rule.

Avoid both extremes:

```text
employeeEverything.ts
```

and:

```text
EmployeeTableHeaderCell.tsx
EmployeeTableHeaderLabel.tsx
EmployeeTableHeaderIcon.tsx
```

when the separation provides no meaningful ownership, reuse, testability, or architectural benefit.

## File Naming Must Follow Ownership

A filename should help answer:

> "Who owns this code and why does this file exist?"

For example:

```text
features/
  leave/
    domain/
      canRequestLeave.ts
    api/
      leaveRequestsApi.ts
    ui/
      LeaveRequestForm.tsx
      LeaveBalanceCard.tsx
```

The file names communicate both the **responsibility** and the **feature ownership**.

Avoid moving feature-specific code into generic filenames:

```text
shared/
  utils/
    leaveHelpers.ts
```

when the code is actually owned by the leave feature.

Prefer:

```text
features/
  leave/
    domain/
      canRequestLeave.ts
```

## Naming Consistency

Do not mix naming conventions within the same architectural area.

Avoid:

```text
EmployeeTable.tsx
employee-form.tsx
leave_request.ts
useEmployeeFilters.ts
```

when the project expects a consistent convention.

Once a convention is established, new files MUST follow it.

When modifying an existing project, do not rename unrelated files solely because the AI prefers another convention.

## Avoid Redundant Names

Do not repeat directory context unnecessarily.

If the file is already inside:

```text
features/employees/
```

prefer:

```text
EmployeeTable.tsx
EmployeeFilters.tsx
```

instead of:

```text
EmployeeEmployeeTable.tsx
EmployeeEmployeeFilters.tsx
```

Likewise:

```text
features/leave/domain/canRequestLeave.ts
```

is preferable to:

```text
features/leave/domain/leaveCanRequestLeave.ts
```

when the directory already provides the context.

## AI File-Naming Decision Rule

Before creating a new file, the AI MUST ask:

```text
1. What responsibility does this file own?
2. Which feature or architectural layer owns it?
3. Does the filename communicate that responsibility?
4. Does an existing file already own this responsibility?
5. What naming convention does the surrounding directory use?
6. Is a new file actually necessary?
7. Am I creating a generic "utils", "helpers", "service", or "manager" file because I have not identified the real responsibility?
```

The AI SHOULD prefer an existing cohesive file when adding a small piece of related logic is reasonable.

The AI SHOULD create a new file when the new responsibility has meaningful:

* ownership
* reuse
* testability
* dependency boundaries
* compositional value
* architectural significance

The AI MUST NOT create files merely to make the folder structure appear more sophisticated.

## Default File Naming Convention

When no project-specific convention exists, use:

```text
React components       → PascalCase.tsx
Hooks                  → camelCase starting with use
Domain operations     → camelCase
API modules            → camelCase
Types                  → *.types.ts when separated
Schemas                → *.schema.ts when separated
Tests                  → *.test.ts / *.test.tsx
Folders                → lowercase semantic names
```

Example:

```text
src/
├── app/
│   ├── config/
│   │   └── env.ts
│   └── router/
│       └── router.tsx
│
├── features/
│   └── employees/
│       ├── api/
│       │   └── employeesApi.ts
│       ├── domain/
│       │   ├── employee.ts
│       │   └── canDeleteEmployee.ts
│       └── ui/
│           ├── EmployeesPage.tsx
│           ├── EmployeeTable.tsx
│           ├── EmployeeFilters.tsx
│           └── CreateEmployeeDialog.tsx
│
├── shared/
│   ├── api/
│   │   └── httpClient.ts
│   ├── hooks/
│   │   └── useDebounce.ts
│   └── ui/
│       ├── Button.tsx
│       └── Dialog.tsx
│
└── main.tsx
```

The objective is not to enforce a particular filename style for its own sake.

The objective is for the file tree to communicate **ownership, responsibility, and architectural boundaries immediately**.
