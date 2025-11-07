# Invoice Reconciliation Engine - TDD Demo

This document provides a step-by-step demonstration of the Invoice Reconciliation Engine, showcasing
Extreme TDD practices, quality gates, and API functionality.

## Prerequisites

- Deno 2.5.2+ installed
- `jq` for JSON formatting (optional)
- Port 9001 available

## Demo Flow

### 1. Project Information

Display project configuration and environment:

```bash
make info
```

**Expected Output:**

- Project name and directory structure
- Deno version and TypeScript version
- AWS deployment configuration (placeholders)

### 2. Code Quality - Formatting

Format all code files to ensure consistency:

```bash
make fmt
```

**Expected Output:**

- Checks and formats 54+ files
- TypeScript, Markdown, and JSON files
- All files pass formatting standards

### 3. Code Quality - Linting

Run static analysis and type checking:

```bash
make lint
```

**Expected Output:**

- Lints 34 TypeScript files
- Type checks all source and test files
- Zero linting errors or warnings
- "✓ Lint checks passed"

### 4. Unit Testing

Run comprehensive unit test suite:

```bash
make test-unit
```

**Expected Output:**

- 6 test suites, 83 test steps
- All tests passing (0 failed)
- Coverage report:
  - Line Coverage: 95.4%
  - Branch Coverage: 87.5%
- Coverage exceeds 80% requirement

### 5. Mutation Testing (Test Quality Verification)

Verify test suite quality with mutation testing:

```bash
make mutation
```

**Expected Output:**

- 8 mutations tested
- 8 mutations killed (100% score)
- 0 mutations survived
- Mutation score: 100.0%
- Exceeds 90% threshold

### 6. Quality Gate (All Checks)

Run all quality checks in sequence:

```bash
make quality
```

**Expected Output:**

- ✅ Formatting: Passed
- ✅ Linting: Passed
- ✅ Unit Tests: Passed (95.4% coverage)
- ✅ Mutation Testing: 100% score
- ✅ PMAT Analysis: Passed
- "✓ All quality gates passed!"

### 7. Production Build

Build production bundle (runs quality gates first):

```bash
make build
```

**Expected Output:**

- Runs all quality gates automatically
- Type checks main entry point
- Creates `dist/` directory with production code
- "✓ Build complete: dist/"

### 8. Start Development Server

Start the API server:

```bash
make dev
```

**Expected Output:**

- Server starts on http://localhost:9001
- "Server started successfully"
- Hot reload enabled (watches file changes)

---

## API Testing

**Note:** Open a new terminal while `make dev` is running.

### Health Check

Verify the service is running:

```bash
curl http://localhost:9001/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-06T...",
  "version": "1.0.0"
}
```

### Create Invoice

Create a new invoice:

```bash
curl -X POST http://localhost:9001/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "INV-202401",
    "date": "2024-01-15T10:00:00Z",
    "dueDate": "2024-02-15T10:00:00Z",
    "supplier": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corporation",
      "taxId": "12-3456789"
    },
    "currency": "USD",
    "lineItems": [{
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "description": "Professional Services - Software Development",
      "quantity": 10,
      "unitPrice": {"amount": 125.00, "currency": "USD"},
      "total": {"amount": 1250.00, "currency": "USD"}
    }],
    "total": {"amount": 1250.00, "currency": "USD"}
  }'
```

**Expected Response:**

```json
{
  "id": "e581aa66-fc58-40e9-8d5a-a9456a3169b5",
  "invoiceNumber": "INV-202401",
  "status": "pending",
  "createdAt": "2025-11-06T...",
  "updatedAt": "2025-11-06T...",
  ...
}
```

### List All Invoices

Retrieve all invoices:

```bash
curl http://localhost:9001/api/v1/invoices
```

**Expected Response:**

```json
[
  {
    "id": "...",
    "invoiceNumber": "INV-202401",
    "status": "pending",
    ...
  }
]
```

### Get Invoice by ID

Retrieve a specific invoice:

```bash
curl http://localhost:9001/api/v1/invoices/{invoice-id}
```

Replace `{invoice-id}` with the UUID from the create response.

**Expected Response:**

```json
{
  "id": "{invoice-id}",
  "invoiceNumber": "INV-202401",
  ...
}
```

### Test Validation - Invalid Invoice Number

Test validation by submitting an invalid invoice number:

```bash
curl -X POST http://localhost:9001/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "INVALID",
    "date": "2024-01-15T10:00:00Z",
    "dueDate": "2024-02-15T10:00:00Z",
    "supplier": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corp"
    },
    "currency": "USD",
    "lineItems": [{
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "description": "Test",
      "quantity": 1,
      "unitPrice": {"amount": 100.00, "currency": "USD"},
      "total": {"amount": 100.00, "currency": "USD"}
    }],
    "total": {"amount": 100.00, "currency": "USD"}
  }'
```

**Expected Response (400 Bad Request):**

```json
{
  "type": "about:blank",
  "title": "Request Validation Failed",
  "status": 400,
  "detail": "One or more fields failed validation",
  "errors": {
    "invoiceNumber": {
      "_errors": ["Invalid"]
    }
  }
}
```

### Test Validation - Total Mismatch

Test validation when line items don't match total:

```bash
curl -X POST http://localhost:9001/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "INV-202402",
    "date": "2024-01-15T10:00:00Z",
    "dueDate": "2024-02-15T10:00:00Z",
    "supplier": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corp"
    },
    "currency": "USD",
    "lineItems": [{
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "description": "Test",
      "quantity": 1,
      "unitPrice": {"amount": 100.00, "currency": "USD"},
      "total": {"amount": 100.00, "currency": "USD"}
    }],
    "total": {"amount": 999.00, "currency": "USD"}
  }'
```

**Expected Response (400 Bad Request):**

```json
{
  "type": "about:blank",
  "title": "Request Validation Failed",
  "status": 400,
  "detail": "Invoice total must match sum of line items",
  ...
}
```

---

## Continuous Integration

### Run Full CI Pipeline

Execute the complete CI pipeline:

```bash
make ci
```

**Expected Output:**

- Runs all quality gates (fmt, lint, test, mutation, pmat)
- "✓ CI pipeline passed"

### Run Full CD Pipeline

Execute CI + deployment simulation:

```bash
make cd
```

**Expected Output:**

- Runs CI pipeline
- Runs build
- (Deployment would happen in production with AWS credentials)

---

## Key Metrics

### Test Coverage

- **Line Coverage:** 95.4% (exceeds 80% requirement)
- **Branch Coverage:** 87.5% (exceeds 80% requirement)
- **Total Tests:** 83 test steps across 6 suites

### Mutation Testing

- **Mutation Score:** 100.0%
- **Mutations Killed:** 8/8
- **Threshold:** 90% (exceeded)

### Code Quality

- **Linting Errors:** 0
- **Type Errors:** 0
- **Formatting Issues:** 0
- **SATD Comments:** 0 (TODO/FIXME/HACK)

---

## Zero-Defect Philosophy

This project implements **Extreme TDD** with zero tolerance for defects:

1. **Quality Gates Enforced:** Cannot build without passing all tests
2. **Mutation Testing:** Verifies test quality, not just coverage
3. **Strict TypeScript:** No implicit `any`, strict null checks
4. **RFC 7807 Errors:** Standardized error responses
5. **Result<T,E> Pattern:** Railway-oriented programming for type-safe error handling

---

## Cleanup

Stop the development server:

```bash
# Press Ctrl+C in the terminal running 'make dev'
```

Clean build artifacts:

```bash
make clean
```

---

## Additional Commands

### Run E2E Tests

```bash
make test-e2e
```

### Generate Coverage Report

```bash
make coverage
```

### Run Benchmarks

```bash
make bench
```

### Validate Makefile

```bash
make validate-makefile
```

---

## API Documentation

For complete API documentation, visit:

- OpenAPI Spec: http://localhost:9001/api/docs
- Interactive Swagger UI: http://localhost:9001/api/swagger

---

## Conclusion

This demo showcases a production-ready invoice reconciliation system built with:

- **Extreme TDD** methodology
- **100% mutation score** (proving test quality)
- **95%+ test coverage**
- **Zero-defect** quality gates
- **Type-safe** error handling
- **RFC 7807** compliant error responses

Perfect for demonstrating professional-grade software engineering practices.
