# Invoice Reconciliation Engine

Enterprise-grade invoice reconciliation system built with **Extreme TDD** methodology, featuring
100% mutation score and zero-defect quality gates.

## ✨ Features

- **🔗 Type-Safe Error Handling**: Result<T,E> pattern eliminates exceptions
- **🧬 100% Mutation Score**: Tests verify actual behavior, not just coverage
- **📋 RFC 7807 Compliant**: Standardized Problem Details for HTTP APIs
- **🔍 Fuzzy Matching**: Levenshtein distance algorithm (85% threshold)
- **💱 Multi-Currency Support**: Real-time conversion for USD, EUR, GBP, AUD, CAD
- **🎯 Clean Architecture**: API → Business → Data layer separation
- **📚 OpenAPI/Swagger**: Interactive API documentation
- **🧪 Extreme TDD**: Test-first development with comprehensive E2E tests

## 🚀 Quick Start

### Prerequisites

- **Deno 2.5.2+**
- **Make** (optional, for convenience commands)
- **Playwright browsers** (auto-installed with `make install`)

### Installation

```bash
# Install dependencies (Deno + Playwright)
make install

# Or manually
deno install
npx playwright@1.40.1 install chromium
```

### Development

```bash
# Start development server on port 9001
make dev

# Run all quality gates (required before deploy)
make quality

# Build production bundle
make build
```

### Testing

```bash
# Run all tests with coverage
make test

# Run specific test suites
make test-unit          # Unit tests only
make test-e2e           # E2E tests (requires server running)
make test-api           # API integration tests

# Run mutation testing
make mutation
```

## 📊 Quality Metrics

All quality gates must pass before deployment:

| Metric                | Target | Current    | Status |
| --------------------- | ------ | ---------- | ------ |
| **Line Coverage**     | ≥80%   | 95.4%      | ✅     |
| **Branch Coverage**   | ≥75%   | 87.5%      | ✅     |
| **Mutation Score**    | ≥90%   | 100%       | ✅     |
| **Unit Tests**        | -      | 83 passing | ✅     |
| **E2E Tests**         | -      | 20 passing | ✅     |
| **API Tests**         | -      | 14 passing | ✅     |
| **TypeScript Errors** | 0      | 0          | ✅     |
| **Linting Errors**    | 0      | 0          | ✅     |
| **Defects**           | 0      | 0          | ✅     |

## 🔍 Assessment

Continuously improve code quality using PMAT analysis:

```bash
# Run PMAT for comprehensive code quality assessment
make pmat
```

Use PMAT to identify and eliminate:
- **High complexity** functions that need refactoring
- **Dead code** and unused imports
- **Code smells** and anti-patterns
- **Maintainability** issues

Regular assessment ensures the codebase remains clean, maintainable, and production-ready.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              API Layer (Hono)                   │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ /health  │ /invoices│  /recon  │  /docs   │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
│    • Validation (Zod)                           │
│    • Error Handling (RFC 7807)                  │
│    • OpenAPI/Swagger                            │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│           Business Logic Layer                  │
│  ┌──────────────────┬──────────────────────┐   │
│  │ Reconciliation   │ Currency Converter   │   │
│  │ Matcher          │ (Real-time rates)    │   │
│  └──────────────────┴──────────────────────┘   │
│    • Fuzzy Matching (Levenshtein)              │
│    • Rule Engine                                │
│    • Audit Logging                              │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│            Data Layer                           │
│  ┌──────────────────┬──────────────────────┐   │
│  │ InvoiceRepo      │ Base Repository      │   │
│  └──────────────────┴──────────────────────┘   │
│    • In-Memory Storage                          │
│    • Result<T,E> Pattern                        │
│    • Type-Safe Queries                          │
└─────────────────────────────────────────────────┘
```

## 🧪 Testing Strategy

### Extreme TDD Approach

1. **Write test first** (Red phase)
2. **Implement minimal code** (Green phase)
3. **Refactor** (Refactor phase)
4. **Verify with mutation testing**

### Test Pyramid

```
     ╱╲
    ╱E2E╲          20 tests (UI + API flows)
   ╱──────╲
  ╱  API   ╲       14 tests (Integration)
 ╱──────────╲
╱   Unit     ╲     83 tests (Business logic)
──────────────
```

### Mutation Testing

We achieve **100% mutation score** by testing actual behavior:

```bash
# Run mutation tests
make mutation

# Output shows all 8 mutations killed:
# ✅ findById: Change error message
# ✅ update: Remove ID preservation
# ✅ delete: Skip actual deletion
# ✅ findAll: Change filter logic
# ✅ findAll: Invert filter logic
# ✅ findByInvoiceNumber: Change error message
# ✅ findPendingReconciliation: Change status check
# ✅ findPendingReconciliation: Invert filter
```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:9001/api/swagger
- **OpenAPI Spec**: http://localhost:9001/api/docs
- **Health Check**: http://localhost:9001/health

### Example Requests

```bash
# Health check
curl http://localhost:9001/health

# List all invoices
curl http://localhost:9001/api/v1/invoices

# Create invoice
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
      "description": "Professional Services",
      "quantity": 10,
      "unitPrice": {"amount": 125.00, "currency": "USD"},
      "total": {"amount": 1250.00, "currency": "USD"}
    }],
    "total": {"amount": 1250.00, "currency": "USD"}
  }'
```

## 🛠️ Tech Stack

| Category             | Technology             | Version  |
| -------------------- | ---------------------- | -------- |
| **Runtime**          | Deno                   | 2.5.2+   |
| **Language**         | TypeScript             | 5.9.2    |
| **Web Framework**    | Hono                   | 3.11.7   |
| **Validation**       | Zod                    | 3.22.4+  |
| **Testing**          | Deno Test + Playwright | 1.40.1   |
| **Quality Analysis** | PMAT                   | 2.63.0+  |
| **Linting**          | Deno Lint              | Built-in |
| **Formatting**       | Deno Fmt               | Built-in |

## 📝 Project Structure

```
.
├── src/
│   ├── api/                 # HTTP layer
│   │   ├── middleware/      # Error handling, logging, validation
│   │   ├── routes/          # Endpoint handlers
│   │   ├── schemas/         # Zod validation schemas
│   │   └── openapi.ts       # OpenAPI/Swagger config
│   ├── business/            # Domain logic
│   │   ├── reconciliation/  # Matching algorithms
│   │   ├── currency/        # Exchange rate conversion
│   │   ├── rules/           # Business rule engine
│   │   └── audit/           # Audit trail logging
│   ├── data/                # Data access layer
│   │   ├── repositories/    # Data access patterns
│   │   └── models/          # Data models
│   ├── shared/              # Shared utilities
│   │   ├── types/           # TypeScript types (Result<T,E>)
│   │   ├── errors/          # Error classes (RFC 7807)
│   │   └── utils/           # Helper functions
│   ├── main.ts              # Entry point
│   └── server.ts            # Server configuration
├── tests/
│   ├── unit/                # 83 unit tests
│   ├── e2e/                 # 20 E2E tests (Playwright)
│   ├── mutation/            # Mutation testing scripts
│   └── fixtures/            # Test data factories
├── scripts/
│   ├── test-api.sh          # API integration tests
│   └── lint-html.ts         # HTML/CSS linter
├── public/
│   └── index.html           # Demo landing page
├── docs/                    # Documentation
├── coverage/                # Test coverage reports
├── Makefile                 # Build automation
└── deno.json                # Deno configuration
```

## 🔧 Available Commands

Run `make help` to see all available commands:

```bash
# Quality & Testing
make quality        # Run ALL quality gates (required before deploy)
make lint          # TypeScript + HTML/CSS linting
make test          # All tests with coverage
make test-unit     # Unit tests only
make test-e2e      # E2E tests (requires server running)
make test-api      # API integration tests
make mutation      # Mutation testing
make coverage      # Generate coverage report

# Development
make dev           # Start development server
make fmt           # Format all code
make check         # Type check only

# Build & Deploy
make build         # Build production bundle (after quality gates)
make deploy        # Deploy to production (S3 + CloudFront)
make deploy-check  # Verify deployment prerequisites

# Utilities
make clean         # Remove generated files
make info          # Display project info
make help          # Show all commands
```

## 🎯 Zero-Defect Philosophy

This project follows a **zero-tolerance for defects** approach:

1. ✅ All tests must pass
2. ✅ 100% mutation score required
3. ✅ No TypeScript errors
4. ✅ No linting violations
5. ✅ Cannot build without passing quality gates
6. ✅ Cannot deploy without passing build

```bash
# This WILL FAIL if any quality gate fails:
make build    # Runs: make quality → fmt → lint → test-unit → mutation → pmat

# Quality gates are enforced via Makefile dependencies
```

## 📖 Documentation

- **TDD Demo Guide**: See `docs/tdd-demo.md` for step-by-step walkthrough
- **Architecture**: See `docs/architecture/system_design.md`
- **API Specification**: See `docs/specifications/capstone.md`
- **Testing Guide**: See `TESTING.md`

## 🤝 Contributing

This is a demonstration project showcasing Extreme TDD methodology. All contributions must:

1. Follow TDD approach (tests first)
2. Maintain 100% mutation score
3. Pass all quality gates
4. Include E2E tests for user-facing changes
5. Update documentation

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with Extreme TDD** | **100% Mutation Score** | **Zero Defects** | **Production Ready**
