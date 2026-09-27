---
name: clean-code
version: 1.0.0
description: >
  Technology-independent engineering skill for writing, reviewing, refactoring,
  and maintaining clear, correct, cohesive, testable, and maintainable code
  across languages, frameworks, and platforms.
---

# Clean Code Skill

## Mission

Write and review code that is easy to understand, difficult to misuse, easy to change, and easy to test.

Optimize for:

- clarity
- correctness
- cohesion
- low coupling
- explicit intent
- local reasoning
- predictable behavior
- testability
- low cognitive load
- progressive complexity

Do not optimize for:

- maximum abstraction
- maximum number of helpers
- maximum number of files
- cleverness
- theoretical purity
- comments that compensate for unclear code
- eliminating every instance of duplication

The goal is code that communicates its intent through names, structure, and behavior.

---

# 1. Core Principles

## 1.1 Make intent obvious

Prefer:

- precise names
- small cohesive functions
- explicit data flow
- obvious control flow
- meaningful types
- minimal hidden behavior
- focused modules
- local reasoning

Avoid:

- cryptic names
- unexplained magic numbers
- boolean blindness
- giant functions
- hidden side effects
- speculative abstractions
- generic junk drawers
- comments that merely restate code

A reader should not need to reverse-engineer implementation details to understand what the code is trying to accomplish.

## 1.2 High cohesion, low coupling

Keep code that changes together together.

A module should have a coherent responsibility and a small, understandable set of reasons to change.

Avoid forcing unrelated modules to know implementation details about each other.

## 1.3 Progressive complexity

Start simple.

Introduce additional helpers, abstractions, layers, or indirection only when real complexity, reuse, isolation, or a change boundary justifies them.

Do not create abstractions merely because a pattern exists.

---

# 2. Naming

Names should communicate intent.

Bad:

```text
x
d
data
flag
thing
manager
helper
processor
```

Better:

```text
user
activeEmployees
expirationDate
hasPermission
canDelete
shouldRetry
```

Use semantic boolean names such as:

```text
isLoading
isActive
hasPermission
canDelete
shouldRedirect
```

Avoid magic values.

Bad:

```text
if status == 1
```

Prefer:

```text
if isActive
```

or an explicit status/enum representation.

A name should tell the reader what a value means, not merely what its type is.

---

# 3. Functions and Methods

A function should perform one coherent conceptual responsibility.

Do not combine unrelated concerns such as:

- parsing
- validation
- persistence
- network communication
- notification
- navigation
- rendering
- unrelated transformation

Prefer composition:

```text
input = parseInput(rawInput)
validated = validate(input)
result = performOperation(validated)
notifySuccess(result)
```

Do not split every trivial operation into a helper.

Create a helper when it improves one or more of:

- semantics
- reuse
- isolation
- testability
- readability
- dependency control

A function with many unrelated reasons to change is usually doing too much.

---

# 4. Comments

Use comments to explain:

- why a non-obvious workaround exists
- why an unusual decision was made
- a business constraint not visible from code
- a compatibility requirement
- a security reason
- a non-obvious performance tradeoff

Do not comment what the code literally does.

Bad:

```text
// Filter active users
activeUsers = users.filter(isActiveUser)
```

Good code should need fewer comments because names and structure carry meaning.

---

# 5. DRY and Duplication

Do not blindly eliminate all duplication.

Ask:

> Does this duplicated code represent the same concept and change for the same reason?

Conceptual duplication is a stronger signal for abstraction than textual duplication.

Wrong abstraction is often more expensive than harmless duplication.

Do not create a generic helper merely because two functions currently share a few lines.

---

# 6. Generic Abstractions

Avoid vague abstractions such as:

```text
utils
helpers
manager
service
processor
handler
common
core
misc
```

unless the concept is genuinely meaningful.

Prefer names that communicate responsibility:

```text
calculateTax
validateOrder
formatDate
parsePaymentResponse
normalizeError
```

A file or module name should provide useful information before the file is opened.

Do not allow generic utility modules to become graveyards for unrelated behavior.

Ask where each function conceptually belongs.

---

# 7. Types and Data Ownership

Place types close to the concept that owns them.

Avoid one giant global `types` file.

Prefer ownership-oriented organization:

```text
orders/
  order.ts
  order-request.ts
  order-response.ts
```

or equivalent structures appropriate to the technology.

Only make a type globally/shared when it is genuinely shared and domain-neutral.

---

# 8. Separation of Concerns

Separate concerns when they have different reasons to change.

Typical concerns include:

- input parsing
- validation
- business rules
- data access
- external communication
- transformation
- presentation
- persistence
- orchestration

Do not split code mechanically into layers. Split it when doing so makes ownership and change boundaries clearer.

---

# 9. Error Handling

Establish predictable error behavior.

Distinguish where useful between:

- input/validation errors
- external/transport errors
- authorization errors
- business/domain errors
- infrastructure failures
- presentation errors

Normalize external error representations at appropriate boundaries.

Catch errors when you can:

- recover
- translate
- add meaningful context
- present a user-facing outcome
- perform required cleanup

Do not catch an error merely to immediately rethrow the same error.

Do not silently swallow errors.

---

# 10. Side Effects

Make side effects explicit.

Pure logic should remain pure when practical.

Examples of side effects include:

- network calls
- filesystem operations
- database writes
- environment access
- global state mutation
- logging
- timers
- external service calls

Keep side effects near the boundary that owns them.

Business calculations should not unexpectedly perform external operations.

---

# 11. State and Derived Values

Store facts; derive conclusions.

Avoid storing both:

```text
users
activeUsers
```

when `activeUsers` can safely be derived from `users`.

Duplicated state creates synchronization problems.

Before introducing stored state, ask:

1. Is this a source of truth?
2. Can it be derived?
3. Who owns it?
4. How long must it live?
5. What invalidates it?

---

# 12. Readability Test

A mature module should communicate its purpose through structure.

A reader should be able to answer quickly:

- What does this module own?
- What are its inputs?
- What does it produce?
- What can fail?
- What external dependencies does it have?
- What state does it mutate?
- What are its important invariants?

If the answer requires tracing through many unrelated files, consider whether a missing or misplaced boundary is creating cognitive load.

---

# 13. Change-Reason Test

For every significant module ask:

> What reasons can cause this code to change?

If one module changes because of many unrelated concerns, it probably contains too many responsibilities.

Examples of distinct change reasons:

- external contract changes
- business-rule changes
- presentation changes
- persistence changes
- configuration changes
- infrastructure changes

Keep these concerns separated when separation reduces meaningful coupling.

---

# 14. Testability

Important logic should be testable without unnecessary environmental dependencies.

Prefer business logic that can run without:

- a UI renderer
- a browser
- a network
- global application state
- real infrastructure
- framework-specific dependencies

Purity is not mandatory everywhere, but pure logic should remain pure when practical.

Test by responsibility:

- pure logic with focused unit tests
- boundary behavior with integration tests
- major workflows with end-to-end tests where appropriate

Do not use large integration tests as a substitute for simple unit tests.

---

# 15. Performance

Do not optimize based on habit.

Measure or reason from actual bottlenecks.

Avoid premature:

- caching
- memoization
- batching
- concurrency
- complicated data structures
- optimization abstractions

If performance concerns influence architecture, state the reason explicitly.

Optimize for clarity first unless there is evidence that runtime performance requires a different tradeoff.

---

# 16. Security-Aware Code Quality

Keep trust boundaries explicit.

Treat external input as untrusted until validated.

Never assume that:

- user input is safe
- network data is valid
- configuration exists
- external services behave as documented
- client-side checks establish security

Keep secrets out of source code and untrusted environments.

Security-sensitive business constraints must be enforced at the authoritative boundary, not only in presentation code.

---

# 17. Clean Code Review Procedure

When reviewing code, inspect in this order.

### Correctness

- Does it behave correctly?
- Are edge cases handled?
- Are failure states explicit?
- Are side effects correct?

### Responsibility

- Does each function have a coherent responsibility?
- Does each module have a coherent responsibility?
- Are unrelated concerns mixed together?

### Dependencies

- Are dependencies explicit?
- Are unnecessary implementation details leaking across boundaries?
- Is the code coupled to replaceable infrastructure without reason?

### Ownership

- Does each concept live near its source of truth?
- Is shared code genuinely shared?

### State

- Is state actually needed?
- Is derived state unnecessarily stored?
- Are multiple sources of truth created?

### Data boundaries

- Are external representations leaking into internal logic?
- Is validation performed where trust changes?
- Are transformations at the correct boundary?

### Naming

- Can intent be understood without comments?
- Are booleans and states named semantically?

### Abstraction

- Is the code over-engineered?
- Is a missing abstraction causing real coupling?
- Is an abstraction protecting a meaningful change boundary?

### Testability

- Can important logic be tested independently?

### Maintainability

- Would a focused change require touching unrelated code?
- Is the next likely change predictable and localized?

---

# 18. AI Decision Procedure Before Writing Code

Before creating or modifying code:

1. Identify ownership.
2. Identify the responsibility.
3. Identify trust boundaries.
4. Identify inputs and outputs.
5. Identify side effects.
6. Identify state and derived values.
7. Check existing abstractions.
8. Check whether a new abstraction is actually necessary.
9. Consider change impact.
10. Check testability.
11. Check readability.
12. Prefer the smallest design that safely handles the current complexity.

Ask:

> Am I introducing this abstraction because the problem requires it, or because the pattern says it should exist?

---

# 19. AI Refactoring Procedure

When improving existing code:

1. Preserve behavior first.
2. Identify mixed responsibilities.
3. Identify hidden side effects.
4. Identify external dependencies leaking inward.
5. Identify duplicated state.
6. Identify generic junk-drawer modules.
7. Identify unclear names.
8. Move code to the smallest correct ownership boundary.
9. Introduce abstractions only where they reduce coupling or complexity.
10. Keep public interfaces narrow.
11. Add tests around extracted logic.
12. Avoid broad rewrites when a focused refactor is sufficient.

Do not restructure an entire project merely because another arrangement looks theoretically cleaner.

---

# 20. Core Maxims

1. **Store facts; derive conclusions.**
2. **Name concepts; do not hide meaning behind generic helpers.**
3. **Keep high cohesion and low coupling.**
4. **Use the smallest abstraction that protects a real change boundary.**
5. **Duplication can be cheaper than the wrong abstraction.**
6. **Keep side effects explicit.**
7. **Keep important logic independently testable.**
8. **Treat external input as untrusted.**
9. **Make ownership obvious.**
10. **Make the next change predictable and cheap.**
