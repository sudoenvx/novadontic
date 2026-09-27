---
name: clean-react
description: >
  React + TypeScript application skill for applying clean-code and
  clean-architecture principles to component design, feature organization,
  server/client state, API boundaries, hooks, forms, routing, accessibility,
  and scalable frontend architecture.
---

# Clean React Skill

## Mission

Apply clean-code and clean-architecture principles specifically to React + TypeScript applications.

This skill assumes the general rules from:

- `clean-code`
- `clean-architecture`
- `react-files-naming-convention`

This skill adds React-specific implementation guidance. It should not redefine general clean-code or architecture principles unnecessarily.

Optimize for:

- readable components
- feature ownership
- explicit data flow
- correct dependency direction
- framework-independent business rules
- appropriate server/client state separation
- stable API boundaries
- testability
- accessibility
- progressive complexity

---

# 1. React Architecture Default

For a substantial React + TypeScript application, prefer:

```text
src/
├── app/
├── features/
├── shared/
└── main.tsx
```

A mature feature may look like:

```text
feature/
├── api/
├── domain/
└── ui/
```

Introduce `application/` or additional infrastructure boundaries only when complexity justifies them.

For a small feature, fewer files are preferable:

```text
feature/
├── api.ts
├── types.ts
├── Page.tsx
└── Table.tsx
```

This is a default, not a law.

---

# 2. Dependency Direction in React

Mandatory defaults:

- `shared` MUST NOT depend on `features`.
- domain code MUST NOT depend on React.
- domain code MUST NOT depend on React Router.
- domain code MUST NOT depend on TanStack Query.
- domain code MUST NOT depend on Axios/fetch.
- domain code MUST NOT depend on browser APIs.
- UI SHOULD NOT call HTTP directly.
- UI SHOULD consume application/domain-friendly models rather than raw backend DTOs.
- API/infrastructure MAY depend on domain/application abstractions.
- `app` MAY compose feature modules.
- feature modules SHOULD expose deliberate public APIs.
- domain code SHOULD remain framework-independent whenever practical.

---

# 3. App Layer

`app` is the composition layer.

It may own:

- application entry composition
- router setup
- global providers
- environment/configuration wiring
- global styles
- global layouts
- authentication bootstrap
- application-wide error boundaries
- top-level dependency composition

It should not become a business-logic dump.

`main.tsx` should be intentionally boring:

```tsx
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './app/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

---

# 4. Feature-First Organization

Organize primary React application code around business capabilities:

```text
features/
  auth/
  employees/
  attendance/
  leave/
  payroll/
```

A feature should own its business-specific:

- API models
- request/response mapping
- domain rules
- queries
- mutations
- hooks
- pages
- components
- feature utilities
- tests

Technical organization should remain subordinate to semantic ownership.

---

# 5. Shared React Code

`shared` is not a garbage dump.

Good examples:

```text
shared/ui/Button
shared/ui/Dialog
shared/ui/Table
shared/api/httpClient
shared/api/apiError
shared/lib/date/formatDate
shared/hooks/useDebounce
shared/types/pagination
```

Bad examples:

```text
shared/lib/calculateEmployeeOvertime
shared/lib/isEmployeeEligibleForLeave
shared/components/EmployeeTable
```

Do not move something into `shared` merely because two features currently use it.

---

# 6. Domain Layer in React

The domain should express business concepts and rules using plain TypeScript where practical.

Example:

```ts
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  employmentStatus: EmploymentStatus;
};

export function isActiveUser(user: User): boolean {
  return user.employmentStatus === 'active';
}
```

Domain code should be testable without:

- React
- a browser
- HTTP
- TanStack Query
- React Router
- global application state

Classes are optional.

Do not create classes merely to make a React project look enterprise-oriented.

---

# 7. Business Rules vs JSX

Move meaningful business rules out of JSX.

Avoid:

```tsx
<Button
  disabled={
    employee.status !== 'active' &&
    leaveBalance < requestedDays
  }
/>
```

when the condition represents a real business rule.

Prefer:

```ts
export function canRequestLeave(
  requestedDays: number,
  availableDays: number,
): boolean {
  return requestedDays > 0 && requestedDays <= availableDays;
}
```

Then:

```tsx
<Button
  disabled={!canRequestLeave(requestedDays, employee.leaveBalance)}
/>
```

Use the question:

> Would this rule still exist if there were no React UI?

If yes, it probably belongs in domain/application code.

---

# 8. API Boundaries and DTOs

Treat backend responses as external representations.

Example:

```ts
export type UserResponse = {
  id: number;
  first_name: string;
  last_name: string;
  employment_status: string;
};
```

Internal domain model:

```ts
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  employmentStatus: EmploymentStatus;
};
```

Mapper:

```ts
export function mapUserResponseToUser(
  response: UserResponse,
): User {
  return {
    id: response.id,
    firstName: response.first_name,
    lastName: response.last_name,
    employmentStatus: mapEmploymentStatus(
      response.employment_status,
    ),
  };
}
```

The UI should consume `User`, not `UserResponse`, when the representations differ meaningfully.

Do not let backend `snake_case` dictate internal React domain naming.

---

# 9. Runtime Validation

TypeScript provides compile-time checking, not runtime trust.

Consider runtime validation at untrusted boundaries:

- API responses
- URL parameters
- environment variables
- local storage
- external integrations
- complex user-controlled structured input

Zod or another schema validator may be used.

Example:

```ts
const UserResponseSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  employment_status: z.string(),
});
```

Parse external data before treating it as trusted when reliability warrants it.

Do not add runtime schemas to every internal TypeScript object without a reason.

---

# 10. Request, Response, Domain, and View Models

Distinguish models when ownership or reasons to change differ:

```text
UserRequest
UserResponse
User
UserRowViewModel
```

Separate models when:

- API naming differs
- API shape is unstable
- transport metadata should not leak inward
- backend serialization is awkward
- UI needs a different representation
- domain rules benefit from a stable internal model

Do not create separate models merely because an architecture diagram contains separate boxes.

If representations are intentionally identical and there is no boundary to protect, reuse can be acceptable.

---

# 11. API Flow

A typical React API flow:

```text
React component
      ↓
feature query/mutation hook
      ↓
API function
      ↓
shared HTTP client
      ↓
backend
```

Example:

```ts
export async function getUsers(): Promise<User[]> {
  const response =
    await httpClient.get<UserResponse[]>('/users');

  return response.data.map(mapUserResponseToUser);
}
```

Then:

```ts
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
}
```

The query hook should focus on server-state orchestration.

---

# 12. TanStack Query and Server State

Treat server state and client state as different categories.

Server state includes:

- users
- employees
- attendance records
- leaves
- payroll data
- server-provided permissions

Use TanStack Query or the established server-state library for:

- fetching
- caching
- synchronization
- invalidation
- refetching
- pagination
- mutations
- optimistic updates where appropriate

Do not duplicate server state into arbitrary React state without a clear reason.

Avoid:

```tsx
const [users, setUsers] = useState([]);

useEffect(() => {
  // fetch users
}, []);
```

when the data is clearly server state.

Do not put business logic into a query hook merely because the hook has access to query data.

---

# 13. Client State

Client state includes:

- modal open/closed
- selected tab
- sidebar state
- wizard step
- temporary UI selection
- local draft state

Use the smallest appropriate owner:

1. local `useState`
2. local `useReducer`
3. Context for a subtree
4. dedicated client-state library when shared state is substantial
5. URL state when state naturally belongs to navigation/filtering

Do not create global state simply because global state is available.

Before adding a global store, ask whether the state is:

- server state
- URL state
- local state
- subtree-shared state
- genuinely cross-cutting client state

---

# 14. Derived State

Store facts; derive conclusions.

Avoid:

```tsx
const [users, setUsers] = useState<User[]>([]);
const [activeUsers, setActiveUsers] = useState<User[]>([]);
```

Prefer:

```tsx
const activeUsers = users.filter(isActiveUser);
```

Avoid redundant state unless the computation is genuinely expensive and there is a measured reason to cache it.

---

# 15. React Components

Components should primarily describe UI composition and interaction.

A page may coordinate data fetching and pass data downward, but should not simultaneously become:

- a repository
- a domain service
- a form engine
- a router
- a notification manager
- a giant state container

Prefer:

```tsx
export function EmployeesPage() {
  const employeesQuery = useEmployees();

  return (
    <Page>
      <PageHeader title="Employees" />
      <EmployeeFilters />
      <EmployeeTable
        employees={employeesQuery.data ?? []}
        isLoading={employeesQuery.isPending}
      />
    </Page>
  );
}
```

A component should be readable as a description of the screen.

---

# 16. Component Decomposition

Split a component when the split creates meaningful:

- ownership
- compositional clarity
- reuse
- state isolation
- testability
- rendering boundaries

Good candidates include:

- forms
- tables
- row renderers
- feature actions
- dialogs
- complex sections
- reusable feature widgets

Do not split trivial JSX into dozens of one-line components without benefit.

Component decomposition is not a substitute for application architecture.

Do not split solely because a component reached an arbitrary line count.

---

# 17. Hooks

Hooks represent reusable React behavior.

Good examples:

```text
useUsers
useCreateUser
useEmployeeFilters
useDebounce
useMediaQuery
```

Avoid mega-hooks:

```text
useEmployeeEverything
```

A hook should have a coherent responsibility.

The `use` prefix does not automatically make a module a clean business layer.

Do not hide substantial domain logic inside a hook merely because the hook can access React state.

---

# 18. useEffect

Do not use `useEffect` as a general-purpose application architecture mechanism.

Reserve effects for genuine synchronization with:

- external systems
- subscriptions
- imperative APIs
- browser APIs
- other external side effects

Do not automatically use effects for:

- fetching standard server state when a query abstraction exists
- deriving values from props/state
- sequencing ordinary business logic
- maintaining redundant state

Prefer:

- direct derivation
- event handlers
- TanStack Query
- explicit application actions

where appropriate.

---

# 19. Forms

Treat complex forms as their own feature boundaries.

Separate:

- form state
- validation
- submission orchestration
- domain rules
- UI rendering

A useful structure:

```text
CreateEmployeeDialog
      ↓
useCreateEmployeeForm
      ↓
validation + submission
      ↓
createEmployee mutation
```

Do not allow the form layer to become a hidden domain layer.

Keep business rules reusable outside the form when they have business semantics.

---

# 20. Navigation and Routing

Global router composition belongs in `app`.

Features should expose pages/components.

`app` decides how they are wired into the application route tree.

Feature-specific navigation helpers may remain inside the feature when their ownership is local.

Avoid scattering route literals and route construction rules throughout unrelated components.

---

# 21. Layouts

Application-wide layouts belong in `app`:

```text
app/
  layout/
    AppLayout.tsx
    AppSidebar.tsx
    AppHeader.tsx
```

Feature-specific layouts belong to the feature.

Ownership determines placement.

---

# 22. Configuration

Centralize environment and application configuration.

Prefer:

```text
app/config/env.ts
```

over repeating raw environment-variable access throughout the codebase.

Normalize and validate configuration at the edge.

Avoid leaking Vite-specific or build-tool-specific mechanisms deep into domain/application code.

---

# 23. HTTP Infrastructure

Centralize shared HTTP concerns, for example:

```text
shared/api/httpClient.ts
shared/api/apiError.ts
```

Possible responsibilities:

- base URL
- authentication headers
- request headers
- response normalization
- transport error normalization
- retry policy where justified
- interceptors where justified

Do not let each feature independently configure Axios/fetch unless there is a specific reason.

Do not expose Axios-specific response types to domain code.

Prefer application-friendly errors:

```ts
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
  }
}
```

---

# 24. Pages

Pages are composition points.

A page should usually assemble:

- feature queries
- feature components
- layout
- page-level state
- route-specific concerns

Avoid embedding complete domain implementations inside page files.

Pages should read like screen descriptions.

---

# 25. View Models and Presentation Formatting

When UI needs a representation optimized for rendering, use a deliberate view model when it provides meaningful isolation.

Example:

```ts
const row = {
  id: employee.id,
  displayName: `${employee.firstName} ${employee.lastName}`,
  statusLabel: getEmploymentStatusLabel(
    employee.employmentStatus,
  ),
};
```

Keep presentation-only concerns in UI/application-facing code:

- currency formatting
- date display formatting
- status labels
- human-readable text
- table-specific derived columns

Do not put locale-specific presentation formatting into the domain merely because a UI currently needs it.

Do not create a view-model abstraction for trivial rendering without a meaningful benefit.

---

# 26. Error Handling in React

Separate:

- transport errors
- validation errors
- authorization errors
- domain/business errors
- UI presentation errors

Normalize external error shapes where practical.

Do not make every component understand Axios/fetch-specific errors.

Do not use `try/catch` everywhere simply to rethrow the same error.

Catch errors when the layer can:

- recover
- translate
- add meaningful context
- present a user-facing outcome
- perform cleanup

---

# 27. Loading, Empty, Error, and Pending States

A production React feature should deliberately handle:

- loading
- success
- empty
- failure
- partial states when relevant
- mutation pending state

Keep server-state lifecycle handling close to query/mutation usage.

Keep presentation components reusable by expressing lifecycle state through explicit props when appropriate.

Do not allow every component to invent inconsistent async-state behavior.

---

# 28. Permissions and Authorization

Do not scatter raw permission comparisons throughout the UI when permission semantics are important.

Avoid:

```ts
user.permissions.includes('employee.delete')
```

everywhere.

Prefer a semantic abstraction such as:

```ts
canDeleteEmployee(user)
```

or a capability helper.

Frontend authorization is for UX and capability presentation.

The backend remains authoritative for:

- authorization
- permissions
- role enforcement
- data ownership
- sensitive business constraints

Never treat frontend checks as a security boundary.

---

# 29. Accessibility

Clean React code includes accessible UI behavior.

Prefer:

- semantic HTML
- accessible names
- keyboard support
- proper labels
- correct button/link semantics
- focus management
- screen-reader-friendly states

Shared UI primitives should establish strong accessibility defaults.

Do not hide accessibility concerns under visual component abstractions.

---

# 30. CSS and Design-System Boundaries

Keep visual primitives in `shared/ui` when they are genuinely generic.

Examples:

```text
Button
Input
Dialog
Select
Tabs
Table
Tooltip
```

Feature UI is business-aware:

```text
EmployeeTable
EmployeeStatusBadge
LeaveRequestForm
AttendanceTimeline
PayrollSummary
```

Do not put business-specific UI into `shared/ui` merely because it looks reusable.

Visual reuse and semantic ownership are different concepts.

Prefer semantic design tokens over arbitrary one-off values.

---

# 31. State and Performance

Do not optimize React rendering based on habit.

Avoid unnecessary:

- `useMemo`
- `useCallback`
- memoization
- duplicated state
- giant context values
- accidental refetch cascades

Measure or reason from actual bottlenecks.

Use component boundaries that correspond to meaningful ownership or rendering boundaries.

If performance concerns influence architecture, document the reason.

---

# 32. React Rendering Boundaries

Use component boundaries that correspond to meaningful:

- responsibility
- ownership
- reuse
- state ownership
- testability
- rendering optimization

Do not split components merely because they are long.

Do split when the parent becomes difficult to reason about or a section has independent responsibility.

---

# 33. Testing Strategy

Test by responsibility and boundary.

### Domain unit tests

Test pure business rules without React or HTTP.

```ts
describe('canRequestLeave', () => {
  it('allows requests within the available balance', () => {
    expect(canRequestLeave(3, 5)).toBe(true);
  });
});
```

### API/integration tests

Test:

- request behavior
- response mapping
- boundary validation
- API behavior

### Component tests

Test important:

- rendering behavior
- user interactions
- state transitions
- accessibility behavior

### End-to-end tests

Test major user workflows across real application boundaries.

Do not use E2E tests as a substitute for unit-testing stable pure business logic.

---

# 34. Feature Data-Flow Review Checklist

Whenever adding a React feature, verify:

```text
Where does the data originate?
What is its external representation?
Where is it validated?
Where is it mapped?
What model does the rest of the application consume?
Which layer owns the business rules?
Which layer owns UI presentation?
Where does server state live?
Where does client state live?
Where does URL state live?
What is derived rather than stored?
```

If these answers are unclear, the feature boundary is probably underdesigned.

---

# 35. React Anti-Patterns

Watch for:

## Global technical folders

```text
components/
hooks/
services/
utils/
types/
```

used as the primary organizational model for all business code.

## God component

One page knows API, business rules, forms, navigation, notifications, state, and rendering.

## God hook

A hook owns everything related to a feature.

## Shared garbage drawer

Everything goes into `shared`, `utils`, or `common`.

## DTO leakage

Backend `snake_case` objects are consumed directly throughout React.

## Business rules in JSX

Important policies exist only as inline expressions.

## API calls in components

UI directly calls Axios/fetch.

## Server-state duplication

Query data is copied into local/global state without reason.

## Derived-state duplication

Both source and derived state are stored.

## Premature repository architecture

Many interfaces and classes exist for trivial HTTP CRUD.

## Barrel explosion

`index.ts` exports every implementation detail.

## Generic service abstraction

Everything is called a service regardless of responsibility.

## Utils graveyard

Business concepts are hidden in unrelated helpers.

## Effect-driven architecture

Multiple `useEffect` blocks orchestrate ordinary application logic.

## Framework leakage

Domain code imports React, TanStack Query, router APIs, or browser APIs unnecessarily.

---

# 36. AI Implementation Rules for React

When implementing a React feature:

1. Inspect the existing architecture first.
2. Follow established conventions unless they clearly violate a core boundary.
3. Identify the owning feature.
4. Keep business-specific code inside that feature.
5. Keep generic UI inside `shared/ui` only when genuinely generic.
6. Keep API-specific shapes inside the API boundary.
7. Map external data before exposing it broadly when representations differ materially.
8. Keep domain logic  framework-independent.
9. Use TanStack Query for server state when it is the project standard.
10. Use local state for local UI concerns.
11. Use URL state when navigation/filtering naturally owns the state.
12. Avoid global stores unless state is genuinely cross-cutting.
13. Avoid `useEffect` for derived state or ordinary server fetching when a query abstraction exists.
14. Extract business rules from JSX when they have domain meaning.
15. Keep pages focused on composition.
16. Keep hooks coherent.
17. Handle loading, empty, error, and pending states deliberately.
18. Preserve existing naming and styling conventions.
19. Add tests for extracted domain rules and important workflows.
20. Do not perform broad unrelated refactors during focused feature work.

---

# 37. AI Code Review Procedure for React

Review in this order:

### Correctness

- Does the UI behave correctly?
- Are async states correct?
- Are edge cases handled?

### Responsibility

- Does each component have a coherent responsibility?
- Does each hook have a coherent responsibility?

### Dependencies

- Is infrastructure leaking into domain code?
- Are dependencies pointing in the correct direction?

### Ownership

- Is code in the correct feature?
- Is `shared` genuinely shared?

### State

- Is server state handled as server state?
- Is derived state unnecessarily stored?
- Is global state justified?

### Data boundaries

- Are API DTOs leaking inward?
- Are external values validated when necessary?
- Are mappers at the correct boundary?

### React behavior

- Is `useEffect` genuinely needed?
- Are hooks focused?
- Are component boundaries meaningful?

### Naming

- Can intent be understood without comments?

### Abstraction

- Is the code over-engineered?
- Is a missing boundary causing coupling?

### Testability

- Can business rules be tested independently?

### Accessibility and UX

- Are shared primitives accessible?
- Are loading, empty, error, and disabled states deliberate?

---

# 38. Default Recommendation

For most serious React + TypeScript SaaS applications:

```text
src/
├── app/
├── features/
├── shared/
└── main.tsx
```

For meaningful features:

```text
feature/
├── api/
├── domain/
└── ui/
```


If the feature becomes significantly larger, the UI can evolve without changing the architectural ownership:

employees/
└── ui/
    ├── pages/
    │   ├── EmployeesPage.tsx
    │   └── EmployeeDetailsPage.tsx
    │
    └── components/
        ├── EmployeeTable.tsx
        ├── EmployeeFilters.tsx
        ├── EmployeeForm.tsx
        └── EmployeeStatusBadge.tsx

The guiding principle is progressive structure:

Start with the simplest naming and folder structure that clearly communicates responsibility. Introduce additional files or folders when complexity, ownership, or navigation justifies them.

Add `application/`, repositories, ports, adapters, or additional layers only when business complexity or dependency volatility justifies them.

The goal is not to make a React codebase look like Clean Architecture.

The goal is to make it behave like a well-designed system.
