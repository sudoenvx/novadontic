---
name: clean-architecture
version: 1.0.0
description: >
  Technology-independent architectural skill for designing, reviewing, and
  evolving systems around ownership, dependency direction, boundaries,
  replaceability, testability, and progressive complexity.
---

# Clean Architecture Skill

## Mission

Design systems so that business concepts remain understandable and protected from accidental coupling to replaceable implementation details.

Architecture exists to make change cheaper and more predictable.

Optimize for:

- explicit ownership
- high cohesion
- low coupling
- predictable dependency direction
- replaceability of infrastructure
- stable business concepts
- testability
- clear boundaries
- progressive complexity

Do not optimize for:

- maximum number of layers
- maximum number of abstractions
- maximum number of folders
- architectural ceremony
- theoretical purity at the expense of practical maintainability

Every abstraction should protect a real boundary or remove meaningful complexity.

---

# 1. Central Architectural Rule

> Inner business concepts must not depend on outer implementation details.

Business/domain logic should not directly depend on replaceable concerns such as:

- HTTP clients
- databases
- storage implementations
- UI frameworks
- routers
- browser APIs
- message brokers
- cloud SDKs
- specific serialization formats
- infrastructure vendors

The exact technologies vary by system. The architectural rule does not.

Outer layers may depend inward toward stable business/application concepts.

---

# 2. Architectural Mental Model

Use this conceptual flow:

```text
External world
      ↓
Infrastructure / external boundary
      ↓
Application workflows
      ↓
Domain models + business rules
```

Presentation consumes application/domain-friendly data and invokes application capabilities.

The exact number of layers is not fixed.

A small system may need only:

```text
presentation
business logic
infrastructure
```

A complex system may justify:

```text
presentation
application
domain
infrastructure
```

Add layers when they protect meaningful boundaries.

---

# 3. Ownership

For every behavior ask:

> Who owns this concept?

Possible owners include:

- a business capability
- the domain
- an application workflow
- infrastructure
- presentation
- application composition
- genuinely shared infrastructure

Ownership should be semantic, not based only on technical similarity.

Code that changes together should usually live together.

---

# 4. Feature and Capability Boundaries

Organize primary application code around business capabilities when the system has meaningful business domains.

For example:

```text
employees/
attendance/
leave/
payroll/
billing/
notifications/
```

This is generally more useful than organizing the entire application primarily as:

```text
components/
services/
utils/
types/
controllers/
```

Technical concerns can still exist, but their placement should respect ownership.

A business capability should remain locally understandable.

---

# 5. Dependency Direction

Dependencies should point toward stable concepts.

Typical direction:

```text
presentation → application → domain
infrastructure → application/domain
composition → everything it must compose
```

The important rule is not the exact diagram; it is that stable business concepts do not become coupled to unstable outer implementation details.

Avoid dependency cycles.

If two modules need each other, reconsider their responsibilities or introduce a stable abstraction at the correct boundary.

---

# 6. Public Module Boundaries

Modules should expose deliberate public APIs.

Prefer:

```text
feature/
  index
  internal implementation
```

Consumers should depend on concepts the module intentionally exposes rather than importing internal implementation details.

Do not expose every file through a barrel/public API.

A public API should contain only concepts that other modules are allowed to know about.

---

# 7. Data Boundaries

Treat external representations as external.

An external representation may be:

- HTTP DTO
- database row
- serialized message
- vendor SDK object
- file format
- environment configuration
- third-party API response

Do not automatically make an external representation your internal business model.

A boundary may look like:

```text
External DTO
    ↓ validate
    ↓ map
Internal model
    ↓
Business logic
```

The internal model should be shaped around the application's concepts, not around awkward external serialization.

---

# 8. Validation vs Business Rules

Keep structural validation separate from business rules.

Structural validation answers:

```text
Is the input shaped correctly?
Is the email valid?
Is the required field present?
Is the date parseable?
```

Business rules answer:

```text
Can this employee request this leave?
Can this order be cancelled?
Can this account perform this action?
```

Validation establishes structural trust.

Domain/application logic establishes business correctness.

One is not a substitute for the other.

---

# 9. Mapping

Mappings belong at boundaries.

Examples:

```text
UserResponse → User
DatabaseRow → Customer
VendorEvent → DomainEvent
ConfigFile → ApplicationConfig
```

The mapping layer should understand both representations.

The domain should not need to know the transport or persistence representation.

Do not create mapping layers mechanically when the two representations are intentionally identical and no boundary needs protection.

Use explicit mapping when:

- naming differs
- external shape is unstable
- transport metadata should not leak inward
- serialization is awkward
- the internal model needs a stable contract
- presentation needs a separate representation

---

# 10. Application / Use-Case Layer

An application layer is useful when operations become meaningful workflows that orchestrate multiple domain or infrastructure actions.

Example:

```text
validate request
      ↓
create employee
      ↓
upload documents
      ↓
assign role
      ↓
send invitation
```

An application function can coordinate these steps.

Do not create one use-case class per endpoint by default.

A simple CRUD operation may not need a dedicated application layer.

Introduce it when orchestration, transaction boundaries, policy coordination, or workflow complexity makes it valuable.

---

# 11. Repositories and Ports

Repository/gateway abstractions are optional.

Introduce them when they provide a meaningful benefit, such as:

- multiple data sources
- replaceable storage
- offline support
- multiple implementations
- architectural test doubles
- complex application workflows
- meaningful infrastructure volatility

Do not create ceremony such as:

```text
Repository
RepositoryImpl
RepositoryFactory
RepositoryProvider
DataSource
DataSourceImpl
```

for a trivial single-source CRUD operation without a real boundary to protect.

The abstraction should answer:

> What change does this boundary make cheaper?

If there is no useful answer, reconsider it.

---

# 12. Dependency Injection

Use dependency injection when substitutable implementations or composition boundaries matter.

Simple function or constructor injection is often sufficient.

Avoid large service containers merely for ceremony.

Compose dependencies near an application/composition boundary.

Do not introduce a dependency-injection framework simply because the system can use one.

---

# 13. Replaceability Test

For significant dependencies ask:

> Could this implementation change without rewriting business logic?

Examples:

```text
REST → GraphQL
Axios → fetch
PostgreSQL → another database
one auth provider → another
web storage → another persistence mechanism
one vendor SDK → another
```

Not every dependency requires total isolation.

The goal is to prevent meaningful business logic from becoming tightly coupled to replaceable infrastructure without a reason.

---

# 14. Shared Code

Shared code should be genuinely shared and semantically neutral.

Good shared concepts:

```text
HTTP transport
logging infrastructure
generic date utilities
generic validation primitives
design-system primitives
pagination primitives
```

Bad shared concepts:

```text
calculateEmployeeOvertime
isEmployeeEligibleForLeave
EmployeeTable
PayrollApprovalPolicy
```

Do not move something to `shared` merely because multiple files use it.

Usage count is not ownership.

---

# 15. App/Composition Layer

A composition layer may own:

- application startup
- dependency wiring
- global configuration
- routing composition
- global providers
- infrastructure composition
- application-wide error boundaries
- global policies

It should not become a business-logic dump.

Composition should connect modules rather than absorb their responsibilities.

---

# 16. Change-Cost Test

For every architectural boundary ask:

> What future change does this boundary make cheaper?

Examples:

### Mapper

Protects the application from external representation changes.

### HTTP client

Protects features from transport configuration and transport-specific errors.

### Domain rule

Protects business policy from being duplicated across entry points.

### Feature module

Protects business capability ownership and locality.

### Repository interface

Protects application logic from multiple data-source implementations.

If an abstraction has no meaningful answer, reconsider it.

---

# 17. Change-Reason Test

For every module ask:

> What reasons can cause this code to change?

If one module changes because of:

- external contract changes
- UI changes
- business-rule changes
- persistence changes
- routing changes
- infrastructure changes

then it may contain too many responsibilities.

A module should have a small, coherent set of reasons to change.

---

# 18. Progressive Architecture

Use architecture progressively.

### Small feature

Keep it small.

```text
feature/
  api
  model
  UI
```

### Medium feature

Introduce clearer boundaries:

```text
feature/
  api/
  domain/
  ui/
```

### Complex feature

When justified:

```text
feature/
  api/
  application/
  domain/
  infrastructure/
  ui/
```

The structure should grow because complexity grows.

Do not create empty layers for future possibilities.

---

# 19. Avoid Architectural Cosplay

Never add these merely for prestige:

- entity classes
- repository interfaces
- repository implementations
- factories
- providers
- service classes
- dependency-injection containers
- use-case classes
- command buses
- event buses
- ports/adapters
- elaborate mapper layers
- nested directories

unless they solve a real problem.

A sophisticated folder tree is not evidence of good architecture.

Architecture is dependency direction, ownership, and change protection—not directory naming.

---

# 20. Architectural Smell Heuristics

Treat these as signals, not absolute laws:

- one module owns multiple unrelated workflows
- a module has dozens of unrelated dependencies
- external DTO fields appear throughout business logic
- many modules import infrastructure directly
- shared code depends on business-specific modules
- business rules are repeated across entry points
- generic utility modules continually grow
- global state contains most application data
- a trivial change requires touching many unrelated areas
- tests require large parts of the application to verify simple business logic
- abstractions outnumber meaningful concepts
- changes in an external representation force widespread internal changes

When these occur, inspect coupling and ownership before adding more abstractions.

---

# 21. Architecture Review Procedure

When reviewing architecture, inspect in this order:

### Ownership

- Who owns each business capability?
- Are concepts located near their source of truth?

### Dependency direction

- Do stable concepts depend on unstable implementation details?
- Are there cycles?

### Boundaries

- Where does external data enter?
- Where is it validated?
- Where is it mapped?
- Where are side effects performed?

### Application workflows

- Are meaningful workflows explicit?
- Is orchestration mixed into unrelated modules?

### Replaceability

- Which infrastructure choices are intentionally coupled?
- Which should be replaceable?

### Public APIs

- Are internal implementation details leaking between modules?

### Complexity

- Is the architecture proportional to the actual complexity?

### Testability

- Can important business logic be tested without infrastructure?

### Change cost

- Would common future changes remain localized?

---

# 22. AI Architecture Decision Procedure

Before introducing an architectural structure:

1. Identify the business capability.
2. Identify the responsibility.
3. Identify the ownership boundary.
4. Identify the dependency direction.
5. Identify trust boundaries.
6. Identify external representations.
7. Identify whether mapping is needed.
8. Identify whether orchestration is substantial.
9. Identify replaceable dependencies.
10. Check existing public module APIs.
11. Ask what future change the abstraction protects.
12. Prefer the smallest architecture that safely contains current complexity.

The key question is:

> What real problem does this boundary solve?

---

# 23. AI Refactoring Procedure

When refactoring architecture:

1. Preserve behavior first.
2. Identify mixed responsibilities.
3. Identify dependency violations.
4. Identify external representations leaking inward.
5. Identify duplicated business rules.
6. Identify misplaced shared code.
7. Identify unnecessary global coupling.
8. Move code to the smallest correct ownership boundary.
9. Introduce abstractions only where they reduce meaningful coupling.
10. Narrow public APIs.
11. Add tests around stable business logic.
12. Avoid broad restructuring when focused change is sufficient.

Do not reorganize the entire repository simply because another folder structure looks cleaner.

---

# 24. Final Architectural Test

A system is in good architectural shape when most of these are true:

- business capabilities have clear ownership
- dependencies point toward stable concepts
- external representations are contained at boundaries
- business rules do not depend on replaceable infrastructure
- important business logic is independently testable
- shared code is genuinely shared
- public module APIs are intentional
- application workflows are explicit when they matter
- infrastructure can change without unnecessary business-logic rewrites
- architecture does not contain complexity that the system does not have
- the structure makes future changes cheaper and more predictable

---

# 25. Core Maxims

1. **Architecture is dependency direction, not directory naming.**
2. **Organize around ownership and business capability.**
3. **Inner concepts should not depend on outer implementation details.**
4. **Treat external data as an external representation.**
5. **Validate and map at boundaries.**
6. **Use the smallest abstraction that protects a real change boundary.**
7. **Introduce layers progressively.**
8. **A repository is optional, not a requirement.**
9. **A use case is justified by workflow complexity, not by endpoint count.**
10. **Shared code must be semantically shared.**
11. **Public APIs should be narrower than internal implementation.**
12. **Ask what change each abstraction makes cheaper.**
13. **Prefer explicit ownership over technical dumping grounds.**
14. **Architecture should reduce change cost, not increase ceremony.**
