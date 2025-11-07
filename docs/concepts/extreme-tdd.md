# Extreme TDD (Test-Driven Development)

## Overview

Extreme TDD is a rigorous, quality-first development methodology that extends traditional
Test-Driven Development with comprehensive quality gates, static analysis, and advanced testing
techniques. It ensures zero-defect code through multiple layers of verification before code reaches
production.

## The Extreme TDD Workflow

### A. Create Ticket Using PMAT (YAML)

Start by creating structured tickets that define the work to be done.

```yaml
# Example ticket format
ticket:
  id: FEAT-001
  title: "Implement Invoice Reconciliation Endpoint"
  type: feature
  priority: high
  acceptance_criteria:
    - "POST /api/v1/reconciliations accepts invoice and PO data"
    - "Returns reconciliation result with confidence score"
    - "Handles missing data gracefully with RFC 7807 errors"
  quality_requirements:
    line_coverage: 80
    branch_coverage: 80
    complexity: low
    satd: 0
```

**Key Points:**

- Define acceptance criteria upfront
- Specify quality requirements (coverage thresholds, complexity limits)
- Use YAML for machine-readable, trackable tickets
- PMAT (Project Management and Tracking) ensures traceability

### B. Write Test First (Traditional TDD)

Write the test BEFORE writing any implementation code.

```typescript
// tests/unit/api/routes/reconciliation.test.ts
describe("POST /api/v1/reconciliations", () => {
  it("should reconcile invoice with purchase order", async () => {
    const invoice = createTestInvoice();
    const purchaseOrder = createTestPurchaseOrder();

    const response = await fetch("/api/v1/reconciliations", {
      method: "POST",
      body: JSON.stringify({ invoiceId: invoice.id, purchaseOrder }),
    });

    assertEquals(response.status, 200);
    const data = await response.json();
    assertExists(data.reconciliationId);
    assertEquals(data.status, "completed");
  });
});
```

**Benefits:**

- Forces you to think about the API/interface first
- Creates executable specifications
- Ensures testability from the start

### C. Verify Fail (Red)

Run the test and confirm it FAILS for the right reason.

```bash
make test
# Expected: Test fails because endpoint doesn't exist yet
# ❌ Error: POST /api/v1/reconciliations → 404 Not Found
```

**Why This Matters:**

- Confirms the test actually tests something
- Prevents false positives from broken tests
- Validates test setup and assertions

### D. Implement Code Using Static Analysis

Write the minimal code to make the test pass, while using static analysis tools to verify quality.

```typescript
// src/api/routes/reconciliation.ts
app.post("/reconciliations", validateRequest(ReconciliationRequestSchema), (c) => {
  const request = c.get("validatedData");
  const reconciliationId = crypto.randomUUID();

  const reconciliation = {
    reconciliationId,
    status: "completed",
    confidence: 100,
    createdAt: new Date().toISOString(),
  };

  return c.json(reconciliation, 200);
});
```

**Static Analysis Checks:**

1. **PMAT Complexity Detection**
   ```bash
   # Check cyclomatic complexity
   deno task check-complexity
   # Goal: Keep complexity < 10 per function
   ```

2. **SATD (Self-Admitted Technical Debt) Detection**
   ```bash
   # Scan for TODO, FIXME, HACK comments
   grep -r "TODO\|FIXME\|HACK" src/
   # Goal: Zero SATD in production code
   ```

3. **Type Checking**
   ```bash
   deno check **/*.ts
   # Strict TypeScript with no implicit any
   ```

4. **Linting**
   ```bash
   deno lint
   # Enforce code style and catch common errors
   ```

**Green Phase:**

```bash
make test
# ✅ All tests pass
```

### E. Mutation/Fuzz Testing

Verify that unit tests catch BOTH positive AND negative cases through advanced testing.

#### Mutation Testing

Mutation testing deliberately introduces bugs (mutations) to verify tests catch them.

```typescript
// Original code
if (invoice.total > 0) {
  return Ok(invoice);
}

// Mutation 1: Change > to >=
if (invoice.total >= 0) { // Should be caught by tests
  return Ok(invoice);
}

// Mutation 2: Remove condition
return Ok(invoice); // Should be caught by tests
```

**Run Mutation Tests:**

```bash
deno task mutation
# Checks if tests detect code mutations
# Goal: Mutation score > 80%
```

#### Fuzz Testing

Generate random/edge-case inputs to find unexpected failures.

```typescript
describe("fuzzing reconciliation endpoint", () => {
  it("should handle random malformed data", async () => {
    for (let i = 0; i < 100; i++) {
      const fuzzData = generateRandomJSON();
      const response = await fetch("/api/v1/reconciliations", {
        method: "POST",
        body: JSON.stringify(fuzzData),
      });

      // Should never crash - either 200 or 400
      assertEquals([200, 400].includes(response.status), true);
    }
  });
});
```

**Test Coverage Validation:**

```bash
make test
# Verify:
# - Line coverage ≥ 80% per file
# - Branch coverage ≥ 80% per file
# - Both positive cases (happy path) AND negative cases (errors)
```

### F. Write E2E Tickets

Create End-to-End test tickets that verify complete user workflows.

```yaml
ticket:
  id: E2E-001
  title: "Invoice Reconciliation User Flow"
  type: e2e_test
  workflow:
    - "User creates invoice via POST /api/v1/invoices"
    - "User creates purchase order"
    - "User triggers reconciliation"
    - "System returns matched result"
    - "User retrieves reconciliation status"
  success_criteria:
    - "All API calls succeed with proper status codes"
    - "Data persists across requests"
    - "RFC 7807 errors returned for invalid input"
```

**Implement E2E Tests:**

```typescript
describe("Invoice Reconciliation E2E Flow", () => {
  it("should complete full reconciliation workflow", async () => {
    // 1. Create invoice
    const invoiceResponse = await fetch(`${BASE_URL}/api/v1/invoices`, {
      method: "POST",
      body: JSON.stringify(invoiceData),
    });
    const invoice = await invoiceResponse.json();

    // 2. Trigger reconciliation
    const reconResponse = await fetch(`${BASE_URL}/api/v1/reconciliations`, {
      method: "POST",
      body: JSON.stringify({ invoiceId: invoice.id, purchaseOrder }),
    });
    const recon = await reconResponse.json();

    // 3. Verify status
    const statusResponse = await fetch(
      `${BASE_URL}/api/v1/reconciliations/${recon.reconciliationId}/status`,
    );
    const status = await statusResponse.json();

    assertEquals(status.status, "completed");
  });
});
```

### G. Update Ticket

Update the original ticket with implementation details and test results.

```yaml
ticket:
  id: FEAT-001
  title: "Implement Invoice Reconciliation Endpoint"
  status: completed
  implementation:
    files:
      - src/api/routes/reconciliation.ts
      - src/api/schemas/reconciliation.ts
    test_files:
      - tests/unit/api/routes/reconciliation.test.ts
      - tests/e2e/invoice_api.test.ts
  quality_metrics:
    line_coverage: 100
    branch_coverage: 100
    mutation_score: 85
    complexity_avg: 3.2
    satd_count: 0
  verification:
    unit_tests: ✅ 15 passing
    e2e_tests: ✅ 3 passing
    static_analysis: ✅ passed
    mutation_testing: ✅ 85% score
```

### H. Run "make test" and Verify

Final verification step ensures all quality gates pass.

```bash
make test
```

**Expected Output:**

```
Running tests...
✅ Unit tests: 101 passing
✅ E2E tests: 18 passing
✅ Coverage: 96.1% line, 88.4% branch
✅ All files meet 80% coverage requirement

| File                                   | Branch % | Line % |
| -------------------------------------- | -------- | ------ |
| src/api/schemas/invoice.ts             |    100.0 |  100.0 |
| src/business/reconciliation/matcher.ts |     83.3 |   89.7 |
| src/data/repositories/base.ts          |     90.0 |   94.3 |
| src/data/repositories/invoice.ts       |    100.0 |  100.0 |
| All files                              |     88.4 |   96.1 |

✓ Tests passed
```

**Quality Gate Checklist:**

- ✅ All unit tests pass
- ✅ All E2E tests pass
- ✅ Line coverage ≥ 80% per file
- ✅ Branch coverage ≥ 80% per file
- ✅ Mutation score ≥ 80%
- ✅ Cyclomatic complexity < 10
- ✅ Zero SATD (TODO/FIXME/HACK)
- ✅ Type checking passes
- ✅ Linter passes
- ✅ No security vulnerabilities

## Benefits of Extreme TDD

### 1. **Zero Defects**

Multiple layers of testing catch bugs before they reach production.

### 2. **Comprehensive Coverage**

Not just line coverage - branch coverage, mutation testing, and fuzz testing ensure ALL code paths
work correctly.

### 3. **Living Documentation**

Tests serve as executable specifications that never go out of date.

### 4. **Refactoring Confidence**

Comprehensive test suite enables fearless refactoring.

### 5. **Quality Metrics**

Objective, measurable quality through coverage reports, mutation scores, and complexity metrics.

### 6. **Reproducibility**

YAML tickets and automated quality gates make the process repeatable and auditable.

## Real-World Example

This project uses Extreme TDD throughout:

1. **Ticket Created**: Implement E2E tests for Invoice API
2. **Tests Written First**: 18 E2E test scenarios covering all endpoints
3. **Verified Fail**: Tests failed with 404s (endpoints didn't exist)
4. **Implemented with Static Analysis**:
   - Added all endpoints
   - Used Zod for validation
   - Ran `deno check` and `deno lint` continuously
5. **Mutation Testing**: Added edge case tests (null inputs, corrupted data)
6. **E2E Tests**: All 18 scenarios passing
7. **Ticket Updated**: Marked complete with 100% coverage metrics
8. **Verified**: `make test` shows 119 passing tests, 96.1% line coverage

## Tools Used

- **Testing Framework**: Deno Test + @std/testing
- **E2E Testing**: Playwright
- **Coverage**: Deno Coverage (built-in)
- **Static Analysis**: Deno Check (TypeScript compiler)
- **Linting**: Deno Lint
- **Mutation Testing**: Custom mutation test runner
- **Type Safety**: Zod schema validation
- **Ticket Tracking**: YAML-based PMAT

## Conclusion

Extreme TDD is not just about writing tests first - it's about building quality into every step of
the development process through:

- Rigorous test-first development
- Comprehensive static analysis
- Advanced testing techniques (mutation, fuzz)
- Measurable quality gates
- Complete traceability from ticket to deployment

The result: production-ready code with **zero tolerance for defects**.
