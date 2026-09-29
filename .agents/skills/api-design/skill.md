# API Design Skill

## Purpose

Teach and enforce professional, predictable, resource-oriented API design.

The goal is to design APIs that are:

- Discoverable
- Intuitive
- Consistent
- Predictable
- Semantically correct
- Evolvable
- Easy for frontend and backend developers to consume
- Scalable across a growing codebase

A developer should be able to reasonably predict the structure and behavior of an endpoint without constantly consulting documentation.

This skill applies whenever designing, reviewing, refactoring, or explaining HTTP/REST APIs.

---

# 1. Core API Design Philosophy

Design APIs around **resources and representations**, not implementation actions.

Prefer:

    /users
    /users/{userId}
    /orders
    /orders/{orderId}
    /products

Avoid action-oriented URLs:

    /getUsers
    /createUser
    /deleteUser
    /updateUser
    /fetchOrders

The HTTP method communicates the operation.

The URL identifies the resource.

Think:

    HTTP method + resource URL = operation semantics

Examples:

    GET    /users
    POST   /users
    GET    /users/{userId}
    PATCH  /users/{userId}
    DELETE /users/{userId}

---

# 2. Resource-Oriented URL Design

## 2.1 Use nouns

URLs should represent domain resources.

Good:

    /users
    /employees
    /departments
    /invoices
    /payments

Bad:

    /getUsers
    /createEmployee
    /processPayment
    /deleteInvoice

The URL should answer:

> "What resource am I interacting with?"

The HTTP method answers:

> "What am I doing with it?"

---

# 3. Collection and Individual Resource URLs

Use plural nouns for collections.

Recommended convention:

    /users
    /users/{userId}

    /orders
    /orders/{orderId}

    /products
    /products/{productId}

A collection represents multiple resources.

A member URL represents one specific resource.

Example:

    GET /users

means:

> Retrieve the user collection.

While:

    GET /users/123

means:

> Retrieve user 123.

Do not mix singular and plural conventions:

Bad:

    /user
    /users/{id}
    /customer
    /orders/{id}

Prefer one consistent convention throughout the API.

---

# 4. HTTP Method Semantics

Use HTTP methods according to their standardized semantics.

## GET

Retrieve a resource or collection.

Examples:

    GET /users
    GET /users/123

GET should not intentionally mutate server state.

Avoid:

    GET /users/123/delete

or:

    GET /users/123/send-email

---

## POST

Create a new resource inside a collection.

Example:

    POST /users

Request:

    {
      "name": "Ali",
      "email": "ali@example.com"
    }

Typical response:

    201 Created

POST can also be used for operations that do not map cleanly to CRUD, but resource-oriented modeling should be considered first.

---

## PUT

Replace the complete representation of an existing resource.

Example:

    PUT /users/123

PUT conceptually means:

> Replace the resource representation with this representation.

Do not casually use PUT when only a few fields are being changed.

---

## PATCH

Partially modify an existing resource.

Example:

    PATCH /users/123

Request:

    {
      "name": "Ali Tarek"
    }

PATCH is appropriate when only part of the resource changes.

---

## DELETE

Remove a resource.

Example:

    DELETE /users/123

Do not create:

    POST /users/123/delete

unless there is a genuinely non-standard operation that cannot be represented by DELETE.

---

# 5. HTTP Method Decision Rules

When reviewing an endpoint, ask:

1. Am I retrieving data?
   -> GET

2. Am I creating a resource?
   -> POST

3. Am I replacing an entire resource?
   -> PUT

4. Am I partially modifying a resource?
   -> PATCH

5. Am I deleting a resource?
   -> DELETE

Do not choose HTTP methods merely because they are convenient to implement.

Choose them according to their semantics.

---

# 6. Nested Resources

Use nesting when there is a meaningful resource relationship.

Example:

    GET /users/{userId}/orders

This communicates:

> Orders belonging to a specific user.

Another example:

    GET /departments/{departmentId}/employees

Avoid excessive nesting.

Bad:

    /companies/{companyId}/departments/{departmentId}/teams/{teamId}/users/{userId}/orders

When nesting becomes unnecessarily deep, use independent resource URLs and query filtering where appropriate.

For example:

    GET /orders?userId=123

The correct choice depends on the domain relationship and whether the child resource has an independent identity.

---

# 7. Path Parameters vs Query Parameters

Use **path parameters** to identify a specific resource.

Example:

    GET /products/123

Use **query parameters** for collection behavior such as:

- Filtering
- Searching
- Sorting
- Pagination
- Field selection
- Optional query behavior

Examples:

    GET /products?category=books

    GET /products?sort=price

    GET /products?page=2&limit=20

    GET /products?status=active

Do not encode filters into resource paths.

Bad:

    /products/category/books

Prefer:

    /products?category=books

The path identifies the resource.

The query modifies how a collection is retrieved.

---

# 8. Collection Query Design

Collection endpoints should support predictable query conventions.

Example:

    GET /users?page=2&limit=20

Filtering:

    GET /users?status=active

Multiple filters:

    GET /users?status=active&departmentId=10

Sorting:

    GET /users?sort=createdAt&order=desc

Searching:

    GET /users?search=ali

The exact query syntax may vary by project, but consistency is mandatory.

Do not create a different query convention for every endpoint.

---

# 9. Status Codes

Use HTTP status codes to communicate the outcome of the request.

Common codes:

### 200 OK

Successful request with a response body.

Examples:

    GET /users
    GET /users/123
    PATCH /users/123

---

### 201 Created

A new resource was successfully created.

Example:

    POST /users

Return `201` when the server successfully creates a resource.

If appropriate, expose the newly created resource and/or its location.

---

### 204 No Content

The operation succeeded but there is intentionally no response body.

Common example:

    DELETE /users/123

Response:

    204 No Content

Do not return an arbitrary JSON body with a 204 response.

---

### 400 Bad Request

The request cannot be processed because it is malformed or otherwise invalid at the HTTP/request level.

Examples may include malformed syntax or invalid request structure.

Do not use 400 indiscriminately for every possible application error.

---

### 401 Unauthorized

The request lacks valid authentication credentials.

Typical cases:

- Missing authentication
- Invalid authentication
- Expired authentication

Important:

`401` means authentication is required or failed.

It does not mean the authenticated user lacks permission.

---

### 403 Forbidden

The request is understood and the client is authenticated, but the client is not permitted to perform the operation.

Example:

    DELETE /users/123

The authenticated user exists but lacks the required permission.

---

### 404 Not Found

The requested resource cannot be found.

Example:

    GET /users/999999

when that user does not exist.

---

### 422 Unprocessable Content

The request is structurally valid but fails application-level validation.

Example:

    POST /users

    {
      "email": "not-an-email"
    }

The request can be parsed, but the submitted data violates validation rules.

Use this consistently according to the project's API conventions.

---

### 429 Too Many Requests

The client has exceeded the allowed request rate.

Typically used with rate limiting.

---

# 10. Status Code Consistency

Do not randomly select status codes between endpoints.

For example, if validation failures consistently use:

    422

then all equivalent validation failures should use `422`.

Likewise:

- Authentication failure -> `401`
- Authorization failure -> `403`
- Missing resource -> `404`
- Successful creation -> `201`

API consumers should be able to rely on these semantics.

---

# 11. Error Response Design

Never return errors as arbitrary plain strings.

Bad:

    "User not found"

Bad:

    {
      "message": "Something went wrong"
    }

Use a structured error representation.

Recommended baseline:

    {
      "error": {
        "code": "USER_NOT_FOUND",
        "message": "The requested user was not found"
      }
    }

For validation errors, include structured context.

Example:

    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "The request contains invalid fields",
        "details": [
          {
            "field": "email",
            "code": "INVALID_EMAIL",
            "message": "Email must be a valid email address"
          },
          {
            "field": "name",
            "code": "REQUIRED",
            "message": "Name is required"
          }
        ]
      }
    }

The exact schema can differ between projects, but the structure must remain consistent.

---

# 12. Error Codes

Error codes should be stable machine-readable identifiers.

Good:

    USER_NOT_FOUND
    EMAIL_ALREADY_EXISTS
    INVALID_CREDENTIALS
    VALIDATION_ERROR
    INSUFFICIENT_PERMISSIONS

Avoid using the human-readable message as the machine-readable identifier.

Bad:

    "The user could not be found"

Messages may change.

Error codes should remain stable so clients can reliably branch on them when necessary.

---

# 13. Response Envelope Consistency

Choose a response strategy and apply it consistently.

For example, an API may return:

    {
      "data": {
        "id": "123",
        "name": "Ali"
      }
    }

Collection:

    {
      "data": [
        {
          "id": "123",
          "name": "Ali"
        }
      ]
    }

Another valid strategy is to return the resource directly.

The important rule is consistency.

Do not return:

    GET /users

as:

    {
      "users": [...]
    }

and then:

    GET /orders

as:

    {
      "data": [...]
    }

unless there is a deliberate architectural reason.

---

# 14. Pagination

Collection endpoints should use a predictable pagination strategy.

Example:

    GET /users?page=2&limit=20

Possible response:

    {
      "data": [...],
      "pagination": {
        "page": 2,
        "limit": 20,
        "total": 135,
        "totalPages": 7
      }
    }

For large or frequently changing datasets, cursor-based pagination may be more appropriate.

Example:

    GET /users?limit=20&cursor=eyJpZCI6...

Do not mix incompatible pagination strategies arbitrarily across the API.

---

# 15. Filtering, Sorting, and Searching

Treat collection querying as part of the API's design system.

Example:

    GET /employees?status=active

    GET /employees?departmentId=5

    GET /employees?search=ali

    GET /employees?sort=createdAt&order=desc

For multiple values, define a consistent convention.

Example:

    GET /employees?status=active,terminated

or another explicitly documented format.

Do not invent endpoint-specific query syntax without reason.

---

# 16. Naming Conventions

Choose one naming convention for JSON properties.

For example:

    {
      "firstName": "Ali",
      "lastName": "Tarek",
      "createdAt": "2026-09-29T10:30:00Z"
    }

or:

    {
      "first_name": "Ali",
      "last_name": "Tarek",
      "created_at": "2026-09-29T10:30:00Z"
    }

Both are valid.

The critical rule is:

> Choose one convention and apply it consistently.

Do not mix:

    firstName
    last_name
    CreatedAt

inside the same API.

---

# 17. Date and Time Formats

Use standardized machine-readable date/time formats.

Prefer ISO 8601 / RFC 3339 representations.

Example:

    "2026-09-29T10:30:00Z"

For APIs operating across time zones:

- Store timestamps consistently.
- Communicate time zones explicitly when necessary.
- Do not rely on ambiguous strings such as `"09/29/2026 10:30"`.

Document whether a field represents:

- An instant in time
- A local date
- A local time
- A time-zone-aware datetime

Do not treat these as interchangeable concepts.

---

# 18. API Versioning and Evolution

API evolution is a first-class architectural concern.

Prefer additive, backward-compatible changes when possible.

Generally safe examples:

- Adding optional response fields
- Adding new endpoints
- Adding optional query parameters

Potentially breaking changes:

- Removing fields
- Renaming fields
- Changing field types
- Changing endpoint semantics
- Changing required request fields
- Changing existing response structures
- Changing error semantics relied upon by clients

Avoid breaking existing clients unnecessarily.

---

# 19. Versioning Strategy

If a breaking change is unavoidable, establish an explicit versioning strategy.

Example:

    /api/v1/users

    /api/v2/users

The exact strategy may differ:

- URI versioning
- Header/media-type versioning
- Another explicit compatibility mechanism

The important principle is that clients should be able to understand which API contract they are consuming.

Do not silently change the meaning of an existing endpoint.

---

# 20. Backward Compatibility

Before changing an existing endpoint, ask:

1. Does the request contract change?
2. Does the response contract change?
3. Does the meaning of an existing field change?
4. Does validation behavior change?
5. Does the status-code behavior change?
6. Does authentication or authorization behavior change?
7. Could an existing client break?

Treat API contracts as public interfaces even when the API is consumed only by internal applications.

---

# 21. RESTful Actions That Do Not Map Cleanly to CRUD

Not every domain operation naturally maps to CRUD.

Do not force unnatural resource models merely to avoid verbs.

For example, a domain may contain an operation such as:

    POST /users/{userId}/password-reset

or:

    POST /orders/{orderId}/cancellation

Such endpoints can be valid when the operation represents a domain command that does not naturally correspond to creating, replacing, updating, or deleting a resource.

However:

> Do not introduce action endpoints merely because they are easier to implement.

First determine whether the operation can naturally be modeled as a resource.

Prefer domain modeling over arbitrary verb-based URLs.

---

# 22. Idempotency

Understand the idempotency characteristics of HTTP methods.

Conceptually:

- GET should be safe.
- PUT should be idempotent.
- DELETE is generally idempotent.
- POST is generally not idempotent.
- PATCH may or may not be idempotent depending on the operation.

For operations where duplicate requests could create serious side effects, consider an idempotency mechanism.

Example:

    POST /payments

with:

    Idempotency-Key: 8f7c...

This is especially relevant to:

- Payments
- Orders
- Financial operations
- External API calls
- Resource creation where retries are expected

Do not implement idempotency merely as a buzzword. Define its behavior explicitly.

---

# 23. Authentication vs Authorization

Keep authentication and authorization semantics distinct.

Authentication:

> Who is the caller?

Authorization:

> Is the caller allowed to perform this operation?

Typical HTTP semantics:

    401 -> authentication is missing or invalid

    403 -> authentication exists, but access is forbidden

Do not use `403` for every authentication problem.

---

# 24. API Discoverability

A well-designed API should be predictable.

Given:

    GET /users

a developer should reasonably infer:

    GET /users/{id}

and potentially:

    POST /users

    PATCH /users/{id}

    DELETE /users/{id}

Likewise:

    GET /orders

should lead naturally to:

    GET /orders/{id}

Consistency across resources is more valuable than clever endpoint naming.

---

# 25. API Design Review Checklist

When reviewing an endpoint, evaluate:

### Resource model

- Is the URL centered around a resource?
- Is the resource represented by a noun?
- Is the collection pluralized?
- Is the URL structure predictable?
- Is nesting justified?

### HTTP semantics

- Is GET used for retrieval?
- Is POST used for creation or appropriate non-CRUD commands?
- Is PUT used for replacement?
- Is PATCH used for partial modification?
- Is DELETE used for deletion?

### Parameters

- Are path parameters identifying resources?
- Are query parameters used for filtering/sorting/pagination?
- Are query conventions consistent?

### Status codes

- Is the success status correct?
- Is `201` used for successful creation?
- Is `204` used when no body is intentionally returned?
- Are `401`, `403`, `404`, `422`, and `429` distinguished correctly?

### Errors

- Is the error structured?
- Does it contain a stable error code?
- Does it contain a human-readable message?
- Does validation expose relevant field-level context?

### Consistency

- Are property names consistent?
- Are date formats consistent?
- Are response envelopes consistent?
- Are pagination conventions consistent?
- Are error structures consistent?

### Evolution

- Could the change break existing clients?
- Is the change backward compatible?
- If breaking, is versioning explicit?

### Developer experience

- Can a developer predict the endpoint?
- Does the URL communicate the resource?
- Does the HTTP method communicate the operation?
- Is special documentation required because the API behaves unexpectedly?

---

# 26. API Design Smell Detection

Flag the following patterns during API review.

## URL smells

    /getUsers
    /createUser
    /deleteUser
    /updateUser

    /user
    /users
    /customer
    /customers

    /users/getActiveUsers

## Method smells

    GET /users/delete/123

    POST /users/get

    POST /users/update/123

when standard HTTP semantics would express the operation naturally.

## Response smells

    "Something went wrong"

    {
      "error": "User not found"
    }

    {
      "message": "invalid"
    }

when the API requires structured machine-readable errors.

## Consistency smells

    firstName
    last_name

    createdAt
    updated_at

    /users?page=1
    /orders?offset=20

without a deliberate system-wide reason.

## Evolution smells

Changing:

    GET /users/{id}

from returning:

    {
      "id": "123",
      "name": "Ali"
    }

to an incompatible structure without versioning or a migration strategy.

---

# 27. Teaching Strategy

When teaching API design, do not merely memorize endpoint examples.

Explain the underlying model:

    Resource
        ↓
    URL identifies resource
        ↓
    HTTP method expresses operation
        ↓
    Status code communicates outcome
        ↓
    Response schema communicates representation
        ↓
    Error schema communicates failure
        ↓
    Versioning protects clients from breaking changes

Use concrete examples and counterexamples.

For every bad endpoint, explain:

1. What is wrong.
2. Why it is problematic.
3. What resource is actually being represented.
4. Which HTTP semantics should be used.
5. What the corrected endpoint looks like.

Example:

Bad:

    POST /getUser

Reason:

The URL describes an implementation action instead of identifying a resource.

Better:

    GET /users/{userId}

Reason:

The URL identifies the user resource and GET communicates retrieval.

---

# 28. Important Exceptions

These rules are design defaults, not absolute laws.

A professional API may legitimately use a non-RESTful-looking endpoint when:

- The operation is a domain command.
- The operation has significant side effects.
- The operation does not naturally map to CRUD.
- An external protocol requires a particular structure.
- Backward compatibility requires an existing convention.
- A specialized API style is intentionally being used.

When an exception is introduced:

1. Make the reason explicit.
2. Keep the exception consistent.
3. Avoid spreading the exception pattern unnecessarily.
4. Prefer predictable domain semantics over arbitrary adherence to a rule.

Do not optimize for "REST purity" at the expense of a coherent domain model.

---

# 29. Primary Principle

The highest-level rule is:

> Make the API predictable.

A developer should be able to infer:

- Where a resource lives.
- How to retrieve it.
- How to create it.
- How to modify it.
- How to delete it.
- How to filter collections.
- What status codes mean.
- What errors look like.
- How the API evolves.

The API should communicate its domain model through consistent conventions rather than forcing developers to memorize arbitrary endpoint behavior.

---

# 30. AI Behavior Rules

When designing or reviewing an API:

1. Prefer resource-oriented URLs.
2. Use plural nouns for collections.
3. Use HTTP methods according to their semantics.
4. Use paths for resource identity.
5. Use query parameters for collection operations.
6. Use standard HTTP status codes.
7. Use structured errors.
8. Use stable machine-readable error codes.
9. Keep response structures consistent.
10. Keep naming conventions consistent.
11. Use standardized date/time formats.
12. Consider pagination for collections.
13. Preserve backward compatibility.
14. Version breaking API contracts.
15. Do not introduce action-based endpoints without a domain-level reason.
16. Do not force CRUD when a genuine domain command is more expressive.
17. Identify and explain deviations from these conventions.
18. Review API designs as contracts, not merely URLs.
19. Optimize for predictability and developer experience.
20. Prefer simple, consistent conventions over clever API designs.

When asked to design an API, first identify the domain resources and their relationships, then derive the endpoint structure from those resources.

When asked to review an API, identify violations, explain the semantic problem, and provide a corrected design.

When multiple valid designs exist, explain the trade-offs rather than arbitrarily presenting one as universally correct.