# Invoice Reconciliation Engine

Multi-currency invoice reconciliation system for Xero built with Deno, TypeScript, and enterprise-grade quality enforcement.

## Features

- **Multi-Currency Support**: Real-time exchange rate fetching with EUR/GBP/USD conversion
- **Fuzzy Matching**: Intelligent invoice-to-PO matching with 90% confidence threshold
- **Audit Trail**: Immutable transaction logs for compliance (SOX, GDPR)
- **High Performance**: >1,000 invoices/hour with <100ms P99 latency

## Tech Stack

- **Runtime**: Deno 2.0+
- **Language**: TypeScript 5.3+
- **Framework**: Hono (Web Framework)
- **Validation**: Zod
- **Quality**: PMAT 2.63.0+

## Quick Start

```bash
# Install dependencies
deno --version

# Run development server
deno task dev

# Run tests with coverage
deno task test
deno task coverage

# Run quality checks
deno task quality
```

## Quality Metrics

- Test Coverage: >80%
- Cyclomatic Complexity: ≤20
- SATD Comments: 0
- TDG Grade: A+

## Architecture

```
┌─────────────────┐
│   API Layer     │  ← REST endpoints with validation
├─────────────────┤
│ Business Logic  │  ← Reconciliation engine
├─────────────────┤
│   Data Layer    │  ← Persistence & caching
├─────────────────┤
│  Infrastructure │  ← Monitoring & deployment
└─────────────────┘
```

## License

See LICENSE file for details.
