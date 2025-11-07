# Project Architecture & Data Flow

## Overview

The Invoice Reconciliation Engine is a multi-currency invoice reconciliation system built using
Clean Architecture principles with clear separation of concerns across API, Business Logic, and Data
layers. The system matches invoices against purchase orders using fuzzy matching algorithms and
supports real-time currency conversion.

## Core Concepts

### 1. **Layered Architecture**

The application follows a strict 3-tier architecture:

- **API Layer**: HTTP endpoints, request validation, error handling, middleware
- **Business Layer**: Domain logic, reconciliation algorithms, currency conversion, rule engines
- **Data Layer**: Repositories, models, in-memory storage

### 2. **Result Type Pattern**

All operations return a `Result<T, E>` type (Railway-Oriented Programming):

- `Ok(value)`: Success case with data
- `Err(error)`: Failure case with error details

This eliminates exceptions and makes error handling explicit and type-safe.

### 3. **Request Validation**

All incoming requests are validated using Zod schemas before reaching business logic:

- Type-safe validation at runtime
- Automatic TypeScript type inference
- RFC 7807 Problem Details error responses

### 4. **Reconciliation Engine**

The core matching algorithm uses:

- **Levenshtein Distance**: Fuzzy text matching for descriptions (85% threshold)
- **Price Tolerance**: ±2% variance allowed
- **Quantity Tolerance**: ±2% variance allowed
- **Confidence Scoring**: Weighted algorithm (40% description, 30% quantity, 30% price)
- **Multi-Currency**: Automatic conversion using real-time exchange rates

### 5. **Audit Trail**

All reconciliation operations are logged with:

- Immutable audit logs
- Structured logging (JSON)
- Compliance support (SOX, GDPR)

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│                    (Browser, cURL, API Consumers)                        │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 │ HTTP/JSON
                                 │
┌────────────────────────────────▼─────────────────────────────────────────┐
│                            API LAYER (Hono)                              │
│  ┌───────────────┐  ┌──────────────────┐  ┌────────────────────────┐   │
│  │   Middleware  │  │  Route Handlers  │  │   Schema Validation    │   │
│  │               │  │                  │  │                        │   │
│  │ • Logger      │─▶│ • /health        │◀─│ • InvoiceSchema        │   │
│  │ • Error       │  │ • /invoices      │  │ • ReconciliationSchema │   │
│  │   Handler     │  │ • /reconcile     │  │   (Zod)                │   │
│  └───────────────┘  └──────────────────┘  └────────────────────────┘   │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 │ Validated DTOs
                                 │
┌────────────────────────────────▼─────────────────────────────────────────┐
│                          BUSINESS LAYER                                  │
│  ┌──────────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │ Reconciliation       │  │ Currency          │  │ Rule Engine     │  │
│  │ Engine               │  │ Converter         │  │                 │  │
│  │                      │  │                   │  │                 │  │
│  │ • InvoiceMatcher     │  │ • Rate Cache      │  │ • Business      │  │
│  │ • Levenshtein Algo   │◀─│ • API Client      │  │   Rules         │  │
│  │ • Confidence Score   │  │ • TTL Management  │  │ • Validation    │  │
│  │ • Match Candidates   │  │                   │  │                 │  │
│  └──────────┬───────────┘  └───────────────────┘  └─────────────────┘  │
│             │                         ▲                                  │
│             │                         │                                  │
│             │                         │ External API Call                │
└─────────────┼─────────────────────────┼──────────────────────────────────┘
              │                         │
              │ Result<T,E>             │
              │                         │
┌─────────────▼─────────────────────────┴──────────────────────────────────┐
│                           DATA LAYER                                     │
│  ┌──────────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │ Repositories         │  │ Models            │  │ Audit Logger    │  │
│  │                      │  │                   │  │                 │  │
│  │ • InvoiceRepository  │  │ • Invoice         │  │ • Structured    │  │
│  │ • BaseRepository     │  │ • PurchaseOrder   │  │   Logs          │  │
│  │ • CRUD Operations    │  │ • LineItem        │  │ • Immutable     │  │
│  │ • Result<T,E>        │  │ • Money           │  │   Trail         │  │
│  └──────────┬───────────┘  └───────────────────┘  └─────────────────┘  │
│             │                                                            │
│             ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              In-Memory Storage (Map<string, T>)                  │  │
│  │          • Fast read/write • UUID-based keys • Type-safe         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘

External Services:
┌────────────────────────────┐
│ Exchange Rate API          │
│ (exchangerate-api.com)     │
│ • Real-time rates          │
│ • EUR, USD, GBP            │
└────────────────────────────┘
```

## Data Flow Diagram

### Invoice Creation Flow

```
User Request ──▶ POST /api/v1/invoices
                        │
                        │ 1. Validate request body (Zod)
                        ▼
                 ┌─────────────┐
                 │ Validation  │──✗──▶ 400 Bad Request (RFC 7807)
                 │ Middleware  │
                 └──────┬──────┘
                        │ ✓ Valid
                        │ 2. Generate UUID
                        ▼
                 ┌─────────────┐
                 │ Route       │
                 │ Handler     │
                 └──────┬──────┘
                        │ 3. Create invoice object
                        ▼
                 ┌─────────────┐
                 │ Invoice     │
                 │ Repository  │
                 └──────┬──────┘
                        │ 4. Store in memory
                        ▼
                 ┌─────────────┐
                 │ Map.set()   │
                 └──────┬──────┘
                        │ 5. Log audit event
                        ▼
                 ┌─────────────┐
                 │ Audit       │
                 │ Logger      │
                 └──────┬──────┘
                        │ 6. Return 201 Created
                        ▼
                   JSON Response
                   { id, status, ... }
```

### Reconciliation Flow

```
User Request ──▶ POST /api/v1/reconciliations
                        │
                        │ 1. Validate request (invoiceId, purchaseOrder)
                        ▼
                 ┌─────────────┐
                 │ Validation  │──✗──▶ 400 Bad Request
                 │ Middleware  │
                 └──────┬──────┘
                        │ ✓ Valid
                        │ 2. Extract invoiceId & PO data
                        ▼
                 ┌─────────────┐
                 │ Reconcile   │
                 │ Handler     │
                 └──────┬──────┘
                        │ 3. Fetch invoice from repository
                        ▼
                 ┌─────────────┐
                 │ Invoice     │──✗──▶ 404 Not Found
                 │ Repository  │
                 └──────┬──────┘
                        │ ✓ Invoice found
                        │ 4. Check currency mismatch
                        ▼
           ┌────────────┴────────────┐
           │                         │
           ▼                         ▼
    Different Currency        Same Currency
           │                         │
           │ 5a. Convert             │ 5b. Skip conversion
           ▼                         │
    ┌─────────────┐                 │
    │  Currency   │                 │
    │  Converter  │                 │
    │             │                 │
    │ • Fetch API │                 │
    │ • Cache     │                 │
    │ • Convert   │                 │
    └──────┬──────┘                 │
           │ Converted amounts      │
           └────────────┬────────────┘
                        │ 6. Match invoice to PO
                        ▼
                 ┌─────────────┐
                 │  Invoice    │
                 │  Matcher    │
                 │             │
                 │ • Line item │
                 │   matching  │
                 │ • Levenshtein│
                 │ • Tolerances│
                 │ • Score     │
                 └──────┬──────┘
                        │ 7. Calculate confidence
                        ▼
           ┌────────────┴────────────┐
           │                         │
           ▼                         ▼
    Confidence ≥ 90%         Confidence < 90%
    (Match Found)            (No Match)
           │                         │
           │ 8a. Create              │ 8b. Return
           │     reconciliation      │     low confidence
           ▼                         ▼
    ┌─────────────┐          ┌─────────────┐
    │ Store       │          │ Alternative │
    │ Result      │          │ Candidates  │
    └──────┬──────┘          └──────┬──────┘
           │                         │
           │ 9. Log audit event      │
           ▼                         │
    ┌─────────────┐                 │
    │ Audit       │                 │
    │ Logger      │                 │
    └──────┬──────┘                 │
           │                         │
           └────────────┬────────────┘
                        │ 10. Return reconciliation result
                        ▼
                   JSON Response
                   {
                     reconciliationId,
                     status: "completed",
                     confidence: 95.2,
                     bestMatch: {...},
                     alternatives: [...]
                   }
```

## Key Components

### API Layer

**Location**: `src/api/`

- **Routes** (`routes/`):
  - `health.ts`: Health check endpoint
  - `invoices.ts`: Invoice CRUD operations
  - `reconciliation.ts`: Reconciliation endpoints

- **Middleware** (`middleware/`):
  - `validation.ts`: Zod schema validation
  - `error.ts`: RFC 7807 error handler
  - `logger.ts`: Request/response logging

- **Schemas** (`schemas/`):
  - `invoice.ts`: Invoice validation schema
  - `reconciliation.ts`: Reconciliation request schema

### Business Layer

**Location**: `src/business/`

- **Reconciliation** (`reconciliation/`):
  - `matcher.ts`: Core matching algorithm
    - Levenshtein distance calculation
    - Line item matching
    - Confidence scoring
    - Match explanation

- **Currency** (`currency/`):
  - `converter.ts`: Currency conversion service
    - Exchange rate API integration
    - Rate caching (TTL-based)
    - Multi-currency support

- **Rules** (`rules/`):
  - `rule_engine.ts`: Business rule validation

- **Audit** (`audit/`):
  - `logger.ts`: Audit trail logging

### Data Layer

**Location**: `src/data/`

- **Repositories** (`repositories/`):
  - `base.ts`: Generic in-memory repository (CRUD)
  - `invoice.ts`: Invoice-specific queries
    - `findByInvoiceNumber()`
    - `findByCurrency()`
    - `findPendingReconciliation()`

- **Models** (`models/`):
  - `invoice.ts`: Domain model types

### Shared Layer

**Location**: `src/shared/`

- **Types** (`types/`):
  - `result.ts`: Result<T, E> type and helpers
  - `invoice.ts`: Core domain types

- **Utils** (`utils/`):
  - `logger.ts`: Structured logging
  - `config.ts`: Environment configuration

- **Errors** (`errors/`):
  - `base.ts`: Base error classes
  - `business.ts`: Business logic errors
  - `validation.ts`: Validation errors

## Configuration

The system uses environment-based configuration (`src/shared/utils/config.ts`):

```typescript
{
  port: 8080,
  environment: "development" | "staging" | "production",
  database: {
    url: "in-memory",
    poolSize: 10
  },
  exchangeRate: {
    apiUrl: "https://api.exchangerate-api.com/v4/latest/",
    cacheTtl: 3600  // 1 hour
  },
  reconciliation: {
    descriptionThreshold: 0.85,    // 85% similarity
    priceTolerancePct: 2.0,        // ±2%
    quantityTolerancePct: 2.0,     // ±2%
    confidenceThreshold: 0.9       // 90% minimum
  }
}
```

## Quality Metrics

### Test Coverage

- **Line Coverage**: 96.1% (requirement: ≥80%)
- **Branch Coverage**: 88.4% (requirement: ≥80%)
- **Test Count**: 101 passing tests (18 E2E + 83 unit)

### Static Analysis

- **Cyclomatic Complexity**: <10 per function
- **SATD (Self-Admitted Technical Debt)**: 0 TODO/FIXME/HACK comments
- **Type Safety**: Strict TypeScript with no implicit any

### Performance Targets

- **Throughput**: >1,000 invoices/hour
- **Latency**: <100ms P99
- **Availability**: 99.9% uptime

## Error Handling Strategy

All errors follow RFC 7807 Problem Details format:

```json
{
  "type": "https://api.pretendco.com/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Invoice number is required",
  "instance": "/api/v1/invoices"
}
```

### Error Flow

```
Operation Failure
      │
      ▼
┌─────────────┐
│ Err(error)  │
│ Result Type │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Error       │
│ Middleware  │
└──────┬──────┘
       │
       ├─── 400: Validation Error
       ├─── 404: Not Found
       ├─── 422: Business Rule Violation
       └─── 500: Internal Server Error
       │
       ▼
   RFC 7807 JSON Response
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     CloudFront (CDN)                             │
│              Distribution ID: YOUR_DISTRIBUTION_ID               │
│          • Global edge locations • HTTPS/TLS                     │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              S3 Bucket (Static Hosting)                          │
│        your-bucket-name                                          │
│          • Built assets • HTML/JS/CSS                            │
└──────────────────────────────────────────────────────────────────┘

Local Development:
┌──────────────────────────────────────────────────────────────────┐
│  make dev  →  Deno Development Server (Hot Reload)               │
│  make build → Deno Bundle → dist/                                │
│  make deploy → AWS S3 Sync → CloudFront Invalidation             │
└──────────────────────────────────────────────────────────────────┘
```

## Development Workflow

1. **Local Development**: `make dev` (hot reload on port 8080)
2. **Quality Gates**: `make quality` (fmt, lint, test, mutation)
3. **Build**: `make build` (bundles to `dist/`)
4. **Deploy**: `make deploy` (S3 sync + CloudFront invalidation)

## Key Design Decisions

### 1. In-Memory Storage

- **Why**: Simplifies demo, zero external dependencies
- **Trade-off**: Data lost on restart (acceptable for demo)
- **Alternative**: PostgreSQL/DynamoDB for production

### 2. Result Type Pattern

- **Why**: Type-safe error handling without exceptions
- **Benefit**: Explicit error paths, compiler-enforced handling
- **Inspiration**: Rust's Result<T, E>

### 3. Fuzzy Matching Algorithm

- **Why**: Real-world invoices/POs have typos and variations
- **Algorithm**: Levenshtein distance + tolerance thresholds
- **Tunable**: Configurable thresholds via environment variables

### 4. Extreme TDD

- **Why**: Zero-defect requirement for financial system
- **Approach**: Test-first, mutation testing, 80% coverage minimum
- **Result**: 96.1% line coverage, 88.4% branch coverage

## Conclusion

The Invoice Reconciliation Engine demonstrates enterprise-grade architecture with:

- **Clean separation of concerns** (API → Business → Data)
- **Type-safe error handling** (Result<T, E> pattern)
- **Comprehensive testing** (96%+ coverage, mutation testing)
- **Real-world algorithms** (fuzzy matching, currency conversion)
- **Production-ready deployment** (S3 + CloudFront)

The system is built using Extreme TDD methodology with zero tolerance for defects, ensuring high
reliability for financial transaction processing.
