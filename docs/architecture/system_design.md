# System Architecture

## Overview

The Invoice Reconciliation Engine is built using a layered architecture pattern with clear
separation of concerns.

## Architecture Layers

### 1. API Layer (`src/api/`)

- **Routes**: REST endpoints for invoices, reconciliations, and health checks
- **Middleware**: Request validation, error handling, and logging
- **Schemas**: Zod-based validation schemas for type-safe API contracts

### 2. Business Logic Layer (`src/business/`)

- **Reconciliation**: Fuzzy matching algorithm for invoice-to-PO matching
- **Currency**: Exchange rate fetching and currency conversion with caching
- **Audit**: Immutable audit trail logging
- **Rules**: Business rule engine for tolerance validation

### 3. Data Layer (`src/data/`)

- **Repositories**: Data access patterns (Repository pattern)
- **Models**: Domain models and factories
- **Database**: In-memory implementation (for demonstration)

### 4. Shared Layer (`src/shared/`)

- **Types**: Common type definitions and Result monad
- **Errors**: Hierarchical error classes
- **Utils**: Logger, configuration, and utilities

## Key Design Patterns

1. **Repository Pattern**: Abstract data access logic
2. **Result Monad**: Functional error handling with `Result<T, E>`
3. **Middleware Chain**: Composable request processing
4. **Factory Pattern**: Test data generation
5. **Rule Engine**: Flexible business rule validation

## Technology Stack

- **Runtime**: Deno 2.0+
- **Language**: TypeScript 5.3+ (strict mode)
- **Web Framework**: Hono (lightweight, fast)
- **Validation**: Zod (type-safe schemas)
- **Testing**: Deno's built-in test runner

## Quality Enforcement

- **PMAT**: Quality gates for complexity, SATD, and dead code
- **Test Coverage**: >80% required
- **TypeScript**: Strict mode with all checks enabled
- **Linting**: Deno's recommended rules

## Data Flow

```
Client Request
    ↓
Middleware (Logger, Error Handler)
    ↓
Route Handler
    ↓
Validation (Zod Schema)
    ↓
Business Logic
    ↓
Data Repository
    ↓
Response
```

## Reconciliation Flow

```
1. Receive reconciliation request (Invoice ID, PO ID)
2. Fetch invoice and purchase order
3. Apply fuzzy matching algorithm
   - Calculate Levenshtein distance for descriptions
   - Check quantity tolerance (±2%)
   - Check price tolerance (±2%)
4. Calculate confidence score (0-100%)
5. If confidence >= 90%: Match
   Else if confidence >= 75%: Manual Review
   Else: No Match
6. Log audit trail
7. Return reconciliation result
```

## Error Handling

All errors inherit from `BaseError` and follow RFC 7807 Problem Details format:

```json
{
  "type": "https://api.pretendco.com/problems/validation-error",
  "title": "Request Validation Failed",
  "status": 400,
  "detail": "One or more fields failed validation",
  "errors": { ... }
}
```

## Performance Considerations

- **Caching**: Exchange rates cached for 1 hour (configurable)
- **In-Memory Storage**: Current implementation for demo; production would use PostgreSQL
- **Async Operations**: All I/O operations are async/await
- **Structured Logging**: JSON logs for easy parsing and monitoring

## Future Enhancements

1. PostgreSQL database integration
2. Redis for distributed caching
3. Background job processing for reconciliations
4. Webhook notifications for reconciliation results
5. GraphQL API alongside REST
