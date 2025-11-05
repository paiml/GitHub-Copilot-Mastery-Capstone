# Course 4: Capstone - Building Production Features with Copilot

## Executive Summary

Build a production-ready financial reconciliation system for Xero using GitHub Copilot, Deno TypeScript, and enterprise-grade quality enforcement. This capstone integrates all skills from Courses 1-3 while demonstrating Toyota Way principles through PMAT quality gates.

**Project**: Multi-Currency Invoice Reconciliation Engine  
**Duration**: 75 minutes (15 videos + hands-on labs)  
**Tech Stack**: Deno 2.0+, TypeScript 5.3+, PMAT 2.63.0+, bashrs 0.3.1+  
**Quality Target**: >80% test coverage, 0 SATD, complexity ≤20, TDG Grade A+

---

## Course Learning Objectives

By the end of this course, learners will:

1. **Plan Production Features** - Use GitHub Copilot to analyze requirements, query internal knowledge bases, and create comprehensive technical specifications
2. **Implement Full-Stack Solutions** - Build API layers, business logic, and data persistence with AI-assisted development
3. **Enforce Enterprise Quality** - Apply PMAT quality gates, achieve >80% test coverage, and maintain zero technical debt
4. **Deploy Confidently** - Create production-ready systems with monitoring, error handling, and performance validation

---

## Project Overview: Invoice Reconciliation Engine

### Business Context (Xero)

Xero customers need to reconcile multi-currency invoices from international suppliers. The system must:

- Convert EUR/GBP invoices to USD with real-time exchange rates
- Match invoice line items to purchase orders
- Handle currency fluctuation tolerances (±2%)
- Generate audit trails for financial compliance
- Process 1,000+ invoices/hour with <100ms P99 latency

### Technical Architecture

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

### Core Features

1. **Multi-Currency Support**
   - Real-time exchange rate fetching
   - Historical rate lookup for backdated invoices
   - Currency conversion with precision (4 decimal places)

2. **Invoice Reconciliation**
   - Fuzzy matching algorithm (90% confidence threshold)
   - Line-item level matching with quantity/price validation
   - Tolerance handling for currency fluctuations

3. **Audit Trail**
   - Immutable transaction log
   - User action tracking
   - Compliance reporting (SOX, GDPR)

4. **Performance Requirements**
   - Throughput: >1,000 invoices/hour
   - Latency: <100ms P99
   - Availability: 99.9% uptime
   - Data integrity: Zero data loss

---

## Technical Specifications

### Technology Stack

```typescript
// deno.json
{
  "name": "@xero/invoice-reconciliation",
  "version": "1.0.0",
  "tasks": {
    "dev": "deno run --watch --allow-all src/main.ts",
    "test": "deno test --allow-all --coverage=coverage",
    "coverage": "deno coverage coverage --lcov > coverage.lcov",
    "bench": "deno bench --allow-all",
    "check": "deno check **/*.ts",
    "lint": "deno lint",
    "fmt": "deno fmt",
    "quality": "deno task fmt && deno task lint && deno task check && deno task test",
    "pmat": "pmat quality-gate --strict",
    "pmat:tdg": "pmat analyze tdg . --include-components",
    "deploy": "deployctl deploy --project=invoice-reconciliation src/main.ts"
  },
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.0",
    "@std/testing": "jsr:@std/testing@^1.0.0",
    "@std/http": "jsr:@std/http@^1.0.0",
    "@std/log": "jsr:@std/log@^1.0.0",
    "zod": "https://deno.land/x/zod@v3.22.4/mod.ts"
  },
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "strictNullChecks": true
  },
  "fmt": {
    "lineWidth": 100,
    "indentWidth": 2,
    "semiColons": true
  },
  "lint": {
    "rules": {
      "tags": ["recommended"],
      "exclude": ["no-explicit-any"]
    }
  }
}
```

### Directory Structure

```
invoice-reconciliation/
├── src/
│   ├── api/                    # API Layer (Task 1)
│   │   ├── routes/
│   │   │   ├── invoices.ts     # Invoice endpoints
│   │   │   ├── reconciliation.ts # Reconciliation endpoints
│   │   │   └── health.ts       # Health check endpoint
│   │   ├── middleware/
│   │   │   ├── validation.ts   # Request validation
│   │   │   ├── auth.ts         # Authentication
│   │   │   └── ratelimit.ts    # Rate limiting
│   │   └── schemas/
│   │       ├── invoice.ts      # Invoice schema (Zod)
│   │       └── reconciliation.ts # Reconciliation schema
│   │
│   ├── business/               # Business Logic (Task 2)
│   │   ├── reconciliation/
│   │   │   ├── matcher.ts      # Fuzzy matching engine
│   │   │   ├── validator.ts    # Business rule validation
│   │   │   └── tolerance.ts    # Currency tolerance handler
│   │   ├── currency/
│   │   │   ├── converter.ts    # Currency conversion
│   │   │   ├── rates.ts        # Exchange rate fetcher
│   │   │   └── cache.ts        # Rate caching
│   │   └── audit/
│   │       ├── logger.ts       # Audit trail logger
│   │       └── reporter.ts     # Compliance reporting
│   │
│   ├── data/                   # Data Layer (Task 3)
│   │   ├── repositories/
│   │   │   ├── invoice.ts      # Invoice repository
│   │   │   ├── reconciliation.ts # Reconciliation repository
│   │   │   └── audit.ts        # Audit log repository
│   │   ├── models/
│   │   │   ├── invoice.ts      # Invoice model
│   │   │   ├── line_item.ts    # Line item model
│   │   │   └── audit_log.ts    # Audit log model
│   │   └── database/
│   │       ├── client.ts       # Database client
│   │       ├── migrations.ts   # Schema migrations
│   │       └── seeds.ts        # Test data
│   │
│   ├── shared/                 # Shared Utilities
│   │   ├── types/
│   │   │   ├── invoice.ts      # Common types
│   │   │   └── result.ts       # Result<T, E> type
│   │   ├── errors/
│   │   │   ├── base.ts         # Base error class
│   │   │   ├── validation.ts   # Validation errors
│   │   │   └── business.ts     # Business logic errors
│   │   └── utils/
│   │       ├── logger.ts       # Structured logging
│   │       ├── config.ts       # Configuration
│   │       └── metrics.ts      # Performance metrics
│   │
│   ├── main.ts                 # Application entry point
│   └── server.ts               # HTTP server setup
│
├── tests/                      # Test Suite (Task 4)
│   ├── unit/
│   │   ├── api/                # API unit tests
│   │   ├── business/           # Business logic unit tests
│   │   └── data/               # Data layer unit tests
│   ├── integration/
│   │   ├── api_integration.test.ts
│   │   ├── business_integration.test.ts
│   │   └── e2e_flow.test.ts
│   ├── fixtures/
│   │   ├── invoices.json       # Test invoice data
│   │   └── exchange_rates.json # Test exchange rates
│   └── helpers/
│       ├── test_server.ts      # Test server setup
│       └── assertions.ts       # Custom assertions
│
├── benchmarks/                 # Performance Benchmarks
│   ├── api_bench.ts            # API endpoint benchmarks
│   ├── matching_bench.ts       # Matching algorithm benchmarks
│   └── currency_bench.ts       # Currency conversion benchmarks
│
├── scripts/                    # Build & Deployment Scripts
│   ├── install.sh              # Installation script (bashrs)
│   ├── deploy.sh               # Deployment script (bashrs)
│   └── health_check.sh         # Health check script (bashrs)
│
├── docs/
│   ├── specifications/
│   │   └── capstone.md         # This document
│   ├── architecture/
│   │   ├── system_design.md    # System architecture
│   │   └── api_design.md       # API specification
│   ├── quality/
│   │   ├── pmat_roadmap.md     # PMAT quality roadmap
│   │   └── quality_gates.md    # Quality gate definitions
│   └── video_scripts/
│       ├── module_1/           # Video scripts for Module 1
│       ├── module_2/           # Video scripts for Module 2
│       └── module_3/           # Video scripts for Module 3
│
├── .github/
│   └── workflows/
│       ├── quality.yml         # Quality checks CI
│       └── deploy.yml          # Deployment pipeline
│
├── Makefile                    # Build automation
├── Dockerfile                  # Container image
├── .pmat.toml                  # PMAT configuration
├── deno.json                   # Deno configuration
├── deno.lock                   # Dependency lock file
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## Module 1: Project Planning and Setup (15 minutes)

### Video 4.1.1: Capstone Project Overview (3:30)

**Learning Objectives:**
- Understand the full-stack architecture
- Identify key technical challenges
- Review quality requirements (>80% coverage, 0 SATD)

**Content:**
1. **Business Problem** (0:00-1:00)
   - Xero customer pain point: manual invoice reconciliation
   - Multi-currency complexity with EUR/GBP/USD
   - Compliance requirements (audit trails)

2. **Technical Solution** (1:00-2:00)
   - Four-layer architecture walkthrough
   - Technology choices (Deno, TypeScript, PMAT)
   - Performance targets (1K invoices/hour, <100ms P99)

3. **Success Criteria** (2:00-3:30)
   - Quality gates: TDG Grade A+, >80% coverage
   - Feature completeness: 4 tasks implemented
   - Production readiness: monitoring, error handling

**Hands-on Activity:**
```bash
# Clone starter repository
git clone https://github.com/xero-learning/invoice-reconciliation-starter
cd invoice-reconciliation-starter

# Review architecture diagram
cat docs/architecture/system_design.md

# Initialize project
deno task init
```

---

### Video 4.1.2: Task 0 - The Planning Phase (3:45)

**Learning Objectives:**
- Use GitHub Copilot Chat to analyze requirements
- Generate technical specifications from business requirements
- Create task breakdown with acceptance criteria

**Content:**
1. **Requirements Analysis with Copilot** (0:00-1:30)
   - Prompt: "Analyze the invoice reconciliation requirements and identify edge cases"
   - Copilot Chat workspace mode to review requirements.md
   - Extract functional and non-functional requirements

2. **Technical Specification Generation** (1:30-2:30)
   - Prompt: "Create API endpoint specifications for invoice reconciliation"
   - Generate OpenAPI/Swagger definitions
   - Define data models and validation rules

3. **Task Breakdown** (2:30-3:45)
   - Prompt: "Break down implementation into 4 tasks with acceptance criteria"
   - Task 1: API Layer (endpoints, validation, schemas)
   - Task 2: Business Logic (reconciliation, currency conversion)
   - Task 3: Data Layer (repositories, models, persistence)
   - Task 4: Test Suite (unit, integration, E2E)

**Copilot Prompts:**
```
@workspace Analyze requirements.md and identify:
1. Core business rules for invoice matching
2. Edge cases (currency fluctuations, partial matches)
3. Non-functional requirements (performance, security)
4. Integration points (exchange rate APIs, database)

Create acceptance criteria for each requirement.
```

**Hands-on Activity:**
```bash
# Initialize PMAT configuration
pmat init

# Review PMAT roadmap template
cat docs/quality/pmat_roadmap.md

# Generate specification using Copilot
# Open GitHub Copilot Chat in VS Code/Cursor
```

---

### Video 4.1.3: Understanding the Xero Context (3:30)

**Learning Objectives:**
- Navigate Xero's internal documentation
- Query knowledge bases using Copilot
- Understand Xero's API patterns and conventions

**Content:**
1. **Xero API Patterns** (0:00-1:15)
   - RESTful conventions (resource-oriented URLs)
   - Authentication (OAuth 2.0)
   - Rate limiting (60 requests/minute)
   - Error response format (RFC 7807)

2. **Multi-Currency Standards** (1:15-2:15)
   - ISO 4217 currency codes
   - Exchange rate precision (4 decimal places)
   - Currency conversion rounding rules
   - Historical rate storage requirements

3. **Compliance Requirements** (2:15-3:30)
   - Audit trail immutability
   - Data retention policies (7 years)
   - GDPR and CCPA compliance
   - SOX requirements for financial data

**Copilot Prompts:**
```
@workspace Search Xero documentation for:
1. Invoice API schema and validation rules
2. Currency conversion best practices
3. Audit logging standards
4. Error handling conventions

Summarize key patterns I should follow.
```

**Hands-on Activity:**
```typescript
// Use Copilot to generate Xero-compliant types
// Prompt: "Generate TypeScript types for Xero invoice API based on docs/"

interface XeroInvoice {
  // Copilot generates based on context
}
```

---

### Video 4.1.4: Querying Internal Knowledge Bases (3:15)

**Learning Objectives:**
- Use Copilot to search internal documentation
- Extract relevant code examples from codebase
- Apply organizational patterns and conventions

**Content:**
1. **Workspace Search Techniques** (0:00-1:00)
   - `@workspace` command for codebase search
   - Symbol search: `#InvoiceValidator`
   - File search: `/api/schemas/`
   - Multi-file context loading

2. **Pattern Recognition** (1:00-2:00)
   - Prompt: "Show me examples of validation middleware in this codebase"
   - Prompt: "What error handling patterns are used in /api routes?"
   - Extract and apply existing patterns

3. **Code Generation from Examples** (2:00-3:15)
   - Prompt: "Generate a new route handler following the pattern in /api/routes/health.ts"
   - Maintain consistency with existing code
   - Apply team conventions automatically

**Copilot Prompts:**
```
@workspace Find examples of:
1. Zod validation schemas for financial data
2. Repository pattern implementations
3. Error handling middleware
4. Test fixtures for currency conversion

Generate similar code for invoice reconciliation.
```

**Hands-on Activity:**
```bash
# Search codebase for patterns
git grep "ValidationError"
git grep "Repository<"

# Use Copilot to generate consistent code
# Open invoice.ts and start typing:
export class InvoiceRepository implements Repository<Invoice> {
  // Let Copilot complete based on existing patterns
```

---

## Module 2: Full-Stack Implementation (30 minutes)

### Video 4.2.1: Task 1 - The API Layer (4:15)

**Learning Objectives:**
- Design RESTful API endpoints with Copilot
- Implement request validation using Zod
- Create comprehensive error handling

**Content:**
1. **Endpoint Design** (0:00-1:30)
   - POST `/api/v1/invoices` - Create invoice
   - GET `/api/v1/invoices/:id` - Retrieve invoice
   - POST `/api/v1/reconciliations` - Trigger reconciliation
   - GET `/api/v1/reconciliations/:id/status` - Check status

2. **Schema Validation** (1:30-2:45)
   - Zod schemas for request/response validation
   - Custom validators (currency codes, amounts)
   - Error message formatting

3. **Middleware Stack** (2:45-4:15)
   - Authentication middleware
   - Rate limiting (100 requests/minute)
   - Request logging
   - Error handling

**Implementation:**

```typescript
// src/api/schemas/invoice.ts
import { z } from "zod";

const CurrencyCodeSchema = z.enum(["USD", "EUR", "GBP", "AUD", "CAD"]);

const MoneySchema = z.object({
  amount: z.number().positive().multipleOf(0.01),
  currency: CurrencyCodeSchema,
});

const LineItemSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1).max(500),
  quantity: z.number().int().positive(),
  unitPrice: MoneySchema,
  total: MoneySchema,
});

export const InvoiceSchema = z.object({
  invoiceNumber: z.string().regex(/^INV-\d{6}$/),
  date: z.string().datetime(),
  dueDate: z.string().datetime(),
  supplier: z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    taxId: z.string().optional(),
  }),
  lineItems: z.array(LineItemSchema).min(1),
  total: MoneySchema,
  currency: CurrencyCodeSchema,
});

export type Invoice = z.infer<typeof InvoiceSchema>;
```

```typescript
// src/api/routes/invoices.ts
import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";
import { validator } from "https://deno.land/x/hono@v3.11.7/middleware.ts";
import { InvoiceSchema } from "../schemas/invoice.ts";
import { InvoiceService } from "../../business/invoice_service.ts";

const app = new Hono();
const invoiceService = new InvoiceService();

app.post(
  "/invoices",
  validator("json", (value, c) => {
    const parsed = InvoiceSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: parsed.error.format() }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const invoice = c.req.valid("json");
    const result = await invoiceService.create(invoice);
    
    if (result.isErr()) {
      return c.json({ error: result.error.message }, 500);
    }
    
    return c.json(result.value, 201);
  }
);

app.get("/invoices/:id", async (c) => {
  const id = c.req.param("id");
  const result = await invoiceService.findById(id);
  
  if (result.isErr()) {
    return c.json({ error: "Invoice not found" }, 404);
  }
  
  return c.json(result.value);
});

export default app;
```

**Copilot Prompts:**
```
Generate a Hono route handler for invoice reconciliation that:
1. Validates request using InvoiceSchema
2. Calls ReconciliationService.reconcile()
3. Returns 202 Accepted with job ID
4. Includes error handling for validation and business logic errors

Follow the pattern in /api/routes/invoices.ts
```

**Hands-on Activity:**
```bash
# Generate API layer with Copilot
cd src/api
touch routes/reconciliation.ts

# Use Copilot to generate:
# 1. POST /reconciliations endpoint
# 2. GET /reconciliations/:id/status endpoint
# 3. Validation middleware
# 4. Error handling

# Test endpoints
deno task dev
curl -X POST http://localhost:8000/api/v1/invoices -H "Content-Type: application/json" -d @tests/fixtures/invoice.json
```

**Quality Checks:**
```bash
# Run PMAT validation
pmat analyze complexity src/api/ --max-complexity 10
pmat analyze satd src/api/ --fail-on-violation

# Test coverage for API layer
deno test tests/unit/api/ --coverage
```

---

### Video 4.2.2: Implementing Data Validation (3:45)

**Learning Objectives:**
- Create custom Zod validators
- Implement business rule validation
- Handle validation errors gracefully

**Content:**
1. **Custom Validators** (0:00-1:30)
   - Currency amount precision (4 decimals)
   - Invoice number format validation
   - Date range validation (invoice vs. due date)

2. **Business Rule Validation** (1:30-2:45)
   - Total amount matches line item sum
   - Currency consistency across line items
   - Supplier tax ID format (per country)

3. **Error Response Format** (2:45-3:45)
   - RFC 7807 Problem Details
   - Field-level error messages
   - Localized error messages

**Implementation:**

```typescript
// src/api/middleware/validation.ts
import { z } from "zod";
import type { Context, Next } from "https://deno.land/x/hono@v3.11.7/mod.ts";

// Custom validator for money amounts (max 4 decimal places)
const MoneyAmount = z.number().refine(
  (val) => {
    const str = val.toFixed(4);
    const decimals = str.split('.')[1];
    return decimals ? decimals.replace(/0+$/, '').length <= 4 : true;
  },
  { message: "Amount must have at most 4 decimal places" }
);

// Custom validator for invoice total matching line items
export const validateInvoiceTotal = (invoice: unknown) => {
  const inv = invoice as Invoice;
  const lineItemTotal = inv.lineItems.reduce(
    (sum, item) => sum + item.total.amount,
    0
  );
  
  const tolerance = 0.01; // 1 cent tolerance
  if (Math.abs(lineItemTotal - inv.total.amount) > tolerance) {
    throw new ValidationError(
      "Invoice total does not match sum of line items",
      {
        expected: lineItemTotal,
        actual: inv.total.amount,
        tolerance,
      }
    );
  }
};

// Validation middleware factory
export function validateRequest<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const parsed = schema.parse(body);
      c.set("validatedData", parsed);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            type: "https://api.xero.com/problems/validation-error",
            title: "Request Validation Failed",
            status: 400,
            detail: "One or more fields failed validation",
            errors: error.format(),
          },
          400
        );
      }
      throw error;
    }
  };
}
```

**Copilot Prompts:**
```
Create a Zod schema for reconciliation request that validates:
1. Invoice ID (UUID format)
2. Purchase order ID (UUID format)
3. Matching tolerance (0-100 percentage)
4. Currency conversion rules (object with source/target currencies)

Include custom refinements for business rules:
- Tolerance must be between 0 and 5%
- Source and target currencies must be different
- If source is EUR, exchange rate provider must be ECB
```

**Hands-on Activity:**
```typescript
// Create custom validators
// Prompt: "Generate a validator for currency exchange rates"

const ExchangeRateSchema = z.object({
  // Let Copilot complete
});
```

**Quality Checks:**
```bash
# Test validation middleware
deno test tests/unit/api/middleware/validation.test.ts

# Check cyclomatic complexity
pmat analyze complexity src/api/middleware/validation.ts
```

---

### Video 4.2.3: Task 2 - The Business Logic (4:30)

**Learning Objectives:**
- Implement fuzzy matching algorithm
- Handle currency conversion with caching
- Create audit trail system

**Content:**
1. **Fuzzy Matching Algorithm** (0:00-2:00)
   - Levenshtein distance for description matching
   - Quantity and price tolerance (±2%)
   - Confidence score calculation (0-100%)

2. **Currency Conversion** (2:00-3:15)
   - Real-time rate fetching (exchangerate-api.com)
   - Rate caching (1-hour TTL)
   - Historical rate lookup for backdated invoices

3. **Audit Trail** (3:15-4:30)
   - Immutable event log
   - User action tracking
   - Compliance reporting

**Implementation:**

```typescript
// src/business/reconciliation/matcher.ts
export class InvoiceMatcher {
  private readonly DESCRIPTION_THRESHOLD = 0.85;
  private readonly PRICE_TOLERANCE = 0.02; // 2%
  private readonly QUANTITY_TOLERANCE = 0.02; // 2%

  async matchInvoice(
    invoice: Invoice,
    purchaseOrders: PurchaseOrder[]
  ): Promise<MatchResult> {
    const candidates: MatchCandidate[] = [];

    for (const po of purchaseOrders) {
      const score = this.calculateMatchScore(invoice, po);
      if (score.confidence >= 0.9) {
        candidates.push({ purchaseOrder: po, score });
      }
    }

    candidates.sort((a, b) => b.score.confidence - a.score.confidence);

    return {
      bestMatch: candidates[0]?.purchaseOrder ?? null,
      confidence: candidates[0]?.score.confidence ?? 0,
      alternatives: candidates.slice(1, 4),
      reasons: this.explainMatch(invoice, candidates[0]),
    };
  }

  private calculateMatchScore(
    invoice: Invoice,
    po: PurchaseOrder
  ): MatchScore {
    const scores: number[] = [];

    // Match line items
    for (const invItem of invoice.lineItems) {
      const poItem = po.lineItems.find((item) =>
        this.matchesLineItem(invItem, item)
      );
      if (poItem) {
        scores.push(this.calculateLineItemScore(invItem, poItem));
      }
    }

    return {
      confidence: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      matchedItems: scores.length,
      totalItems: invoice.lineItems.length,
    };
  }

  private matchesLineItem(
    invItem: InvoiceLineItem,
    poItem: PurchaseOrderLineItem
  ): boolean {
    // Description similarity
    const descSimilarity = this.calculateLevenshtein(
      invItem.description.toLowerCase(),
      poItem.description.toLowerCase()
    );

    if (descSimilarity < this.DESCRIPTION_THRESHOLD) {
      return false;
    }

    // Quantity tolerance check
    const qtyDiff = Math.abs(invItem.quantity - poItem.quantity) / poItem.quantity;
    if (qtyDiff > this.QUANTITY_TOLERANCE) {
      return false;
    }

    // Price tolerance check (after currency conversion)
    const convertedPrice = this.convertPrice(
      invItem.unitPrice,
      poItem.unitPrice.currency
    );
    const priceDiff = Math.abs(convertedPrice - poItem.unitPrice.amount) /
      poItem.unitPrice.amount;
    if (priceDiff > this.PRICE_TOLERANCE) {
      return false;
    }

    return true;
  }

  private calculateLevenshtein(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - (distance / maxLen);
  }
}
```

```typescript
// src/business/currency/converter.ts
import { LRUCache } from "https://deno.land/x/lru_cache@1.0.0/mod.ts";

export class CurrencyConverter {
  private rateCache: LRUCache<string, ExchangeRate>;
  private readonly API_URL = "https://api.exchangerate-api.com/v4/latest/";

  constructor() {
    this.rateCache = new LRUCache({ max: 100, ttl: 3600 * 1000 }); // 1 hour
  }

  async convert(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
    date?: Date
  ): Promise<Money> {
    if (from === to) {
      return { amount, currency: to };
    }

    const rate = await this.getExchangeRate(from, to, date);
    const converted = amount * rate.rate;
    const rounded = Math.round(converted * 10000) / 10000; // 4 decimal places

    return {
      amount: rounded,
      currency: to,
    };
  }

  private async getExchangeRate(
    from: CurrencyCode,
    to: CurrencyCode,
    date?: Date
  ): Promise<ExchangeRate> {
    const cacheKey = `${from}-${to}-${date?.toISOString() ?? "latest"}`;
    const cached = this.rateCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const url = date
      ? `${this.API_URL}${from}?date=${date.toISOString().split("T")[0]}`
      : `${this.API_URL}${from}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
    }

    const data = await response.json();
    const rate: ExchangeRate = {
      from,
      to,
      rate: data.rates[to],
      timestamp: new Date(data.date),
    };

    this.rateCache.set(cacheKey, rate);
    return rate;
  }
}
```

**Copilot Prompts:**
```
@workspace Implement a confidence score calculator that:
1. Uses Levenshtein distance for text similarity
2. Calculates percentage difference for quantities and prices
3. Applies configurable thresholds (85% for descriptions, 2% for amounts)
4. Returns a weighted average confidence score (0-100%)

Follow the pattern in business/reconciliation/matcher.ts
Include detailed comments explaining the algorithm.
```

**Hands-on Activity:**
```bash
# Implement business logic with Copilot
cd src/business/reconciliation

# Generate matcher algorithm
# Prompt: "Generate fuzzy matching logic for invoice line items"

# Test the matcher
deno test tests/unit/business/reconciliation/matcher.test.ts
```

**Quality Checks:**
```bash
# Complexity check (must be ≤20)
pmat analyze complexity src/business/reconciliation/matcher.ts --max-complexity 20

# Dead code detection
pmat analyze dead-code src/business/

# SATD check (must be 0)
pmat analyze satd src/business/ --fail-on-violation
```

---

### Video 4.2.4: Handling Complex Business Rules (4:00)

**Learning Objectives:**
- Implement rule engine pattern
- Handle currency fluctuation tolerances
- Create business exception hierarchy

**Content:**
1. **Rule Engine Pattern** (0:00-1:30)
   - Rule interface and implementations
   - Rule composition (AND, OR, NOT)
   - Rule evaluation with context

2. **Tolerance Handling** (1:30-2:45)
   - ±2% tolerance for currency fluctuations
   - Historical average for volatility detection
   - Threshold alerts for manual review

3. **Exception Hierarchy** (2:45-4:00)
   - BusinessRuleViolationError
   - ToleranceExceededError
   - InsufficientDataError
   - Error recovery strategies

**Implementation:**

```typescript
// src/business/rules/rule_engine.ts
export interface Rule<T> {
  evaluate(context: T): RuleResult;
  explain(): string;
}

export class ToleranceRule implements Rule<ReconciliationContext> {
  constructor(
    private tolerance: number, // percentage (e.g., 2 for 2%)
    private field: keyof ReconciliationContext
  ) {}

  evaluate(context: ReconciliationContext): RuleResult {
    const expected = context.purchaseOrder[this.field];
    const actual = context.invoice[this.field];
    const diff = Math.abs(actual - expected) / expected;

    if (diff <= this.tolerance / 100) {
      return {
        passed: true,
        message: `${this.field} within ${this.tolerance}% tolerance`,
        severity: "info",
      };
    }

    return {
      passed: false,
      message: `${this.field} exceeds ${this.tolerance}% tolerance (${(diff * 100).toFixed(2)}%)`,
      severity: diff <= 0.05 ? "warning" : "error",
      details: { expected, actual, tolerance: this.tolerance },
    };
  }

  explain(): string {
    return `${this.field} must be within ${this.tolerance}% of expected value`;
  }
}

export class RuleEngine {
  private rules: Rule<ReconciliationContext>[] = [];

  addRule(rule: Rule<ReconciliationContext>): this {
    this.rules.push(rule);
    return this;
  }

  async evaluate(context: ReconciliationContext): Promise<EvaluationResult> {
    const results: RuleResult[] = [];
    
    for (const rule of this.rules) {
      const result = rule.evaluate(context);
      results.push(result);
      
      if (!result.passed && result.severity === "error") {
        throw new BusinessRuleViolationError(
          `Rule violation: ${rule.explain()}`,
          { rule: rule.explain(), result }
        );
      }
    }

    return {
      passed: results.every((r) => r.passed),
      results,
      warnings: results.filter((r) => !r.passed && r.severity === "warning"),
    };
  }
}
```

```typescript
// src/shared/errors/business.ts
export class BusinessError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "BusinessError";
  }
}

export class BusinessRuleViolationError extends BusinessError {
  constructor(message: string, details?: unknown) {
    super(message, "BUSINESS_RULE_VIOLATION", details);
    this.name = "BusinessRuleViolationError";
  }
}

export class ToleranceExceededError extends BusinessError {
  constructor(
    field: string,
    expected: number,
    actual: number,
    tolerance: number
  ) {
    const diff = ((Math.abs(actual - expected) / expected) * 100).toFixed(2);
    super(
      `${field} exceeds tolerance: ${diff}% (max ${tolerance}%)`,
      "TOLERANCE_EXCEEDED",
      { field, expected, actual, tolerance, difference: diff }
    );
    this.name = "ToleranceExceededError";
  }
}
```

**Copilot Prompts:**
```
Create a rule engine that evaluates business rules for invoice reconciliation:
1. Currency match rule (invoice.currency === po.currency)
2. Total amount tolerance rule (±2%)
3. Line item count rule (all invoice items have matches)
4. Date validity rule (invoice date <= today, >= PO date)

Use a composite pattern to combine rules with AND/OR logic.
Include comprehensive error messages and recovery strategies.
```

**Hands-on Activity:**
```typescript
// Create rule instances
const engine = new RuleEngine();
engine
  .addRule(new ToleranceRule(2, "totalAmount"))
  .addRule(new CurrencyMatchRule())
  .addRule(new DateValidityRule());

// Evaluate rules
const result = await engine.evaluate(context);
```

**Quality Checks:**
```bash
# Test rule engine
deno test tests/unit/business/rules/

# Complexity analysis
pmat analyze complexity src/business/rules/ --max-complexity 15
```

---

### Video 4.2.5: Task 3 - The Data Layer (4:15)

**Learning Objectives:**
- Implement repository pattern
- Create data models with TypeScript
- Handle database migrations

**Content:**
1. **Repository Pattern** (0:00-1:45)
   - Generic repository interface
   - Invoice repository implementation
   - Transaction support

2. **Data Models** (1:45-2:45)
   - Invoice model with relations
   - Audit log model (immutable)
   - Query builders

3. **Migrations & Seeds** (2:45-4:15)
   - Schema migration scripts
   - Test data seeds
   - Database initialization

**Implementation:**

```typescript
// src/data/repositories/base.ts
export interface Repository<T> {
  findById(id: string): Promise<Result<T, Error>>;
  findAll(filter?: Partial<T>): Promise<Result<T[], Error>>;
  create(entity: Omit<T, "id">): Promise<Result<T, Error>>;
  update(id: string, entity: Partial<T>): Promise<Result<T, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}

export abstract class BaseRepository<T> implements Repository<T> {
  constructor(protected db: Database, protected tableName: string) {}

  async findById(id: string): Promise<Result<T, Error>> {
    try {
      const result = await this.db.query<T>(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return Err(new Error(`${this.tableName} not found: ${id}`));
      }
      
      return Ok(result.rows[0]);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async findAll(filter?: Partial<T>): Promise<Result<T[], Error>> {
    try {
      const conditions = filter
        ? Object.keys(filter).map((k, i) => `${k} = $${i + 1}`)
        : [];
      const values = filter ? Object.values(filter) : [];
      
      const query = `
        SELECT * FROM ${this.tableName}
        ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
      `;
      
      const result = await this.db.query<T>(query, values);
      return Ok(result.rows);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async create(entity: Omit<T, "id">): Promise<Result<T, Error>> {
    try {
      const keys = Object.keys(entity);
      const values = Object.values(entity);
      const placeholders = keys.map((_, i) => `$${i + 1}`);
      
      const query = `
        INSERT INTO ${this.tableName} (${keys.join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *
      `;
      
      const result = await this.db.query<T>(query, values);
      return Ok(result.rows[0]);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async update(id: string, entity: Partial<T>): Promise<Result<T, Error>> {
    try {
      const keys = Object.keys(entity);
      const values = Object.values(entity);
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`);
      
      const query = `
        UPDATE ${this.tableName}
        SET ${setClause.join(", ")}
        WHERE id = $${keys.length + 1}
        RETURNING *
      `;
      
      const result = await this.db.query<T>(query, [...values, id]);
      
      if (result.rows.length === 0) {
        return Err(new Error(`${this.tableName} not found: ${id}`));
      }
      
      return Ok(result.rows[0]);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const result = await this.db.query(
        `DELETE FROM ${this.tableName} WHERE id = $1`,
        [id]
      );
      
      if (result.rowCount === 0) {
        return Err(new Error(`${this.tableName} not found: ${id}`));
      }
      
      return Ok(undefined);
    } catch (error) {
      return Err(error as Error);
    }
  }
}
```

```typescript
// src/data/repositories/invoice.ts
export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor(db: Database) {
    super(db, "invoices");
  }

  async findByInvoiceNumber(
    invoiceNumber: string
  ): Promise<Result<Invoice, Error>> {
    try {
      const result = await this.db.query<Invoice>(
        `SELECT * FROM invoices WHERE invoice_number = $1`,
        [invoiceNumber]
      );
      
      if (result.rows.length === 0) {
        return Err(new Error(`Invoice not found: ${invoiceNumber}`));
      }
      
      return Ok(result.rows[0]);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async findByCurrency(
    currency: CurrencyCode
  ): Promise<Result<Invoice[], Error>> {
    return this.findAll({ currency } as Partial<Invoice>);
  }

  async findPendingReconciliation(): Promise<Result<Invoice[], Error>> {
    try {
      const result = await this.db.query<Invoice>(`
        SELECT i.* FROM invoices i
        LEFT JOIN reconciliations r ON i.id = r.invoice_id
        WHERE r.id IS NULL
        ORDER BY i.created_at ASC
      `);
      
      return Ok(result.rows);
    } catch (error) {
      return Err(error as Error);
    }
  }
}
```

```typescript
// src/data/database/migrations.ts
export const migrations = [
  {
    version: 1,
    name: "create_invoices_table",
    up: `
      CREATE TABLE invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        date TIMESTAMP NOT NULL,
        due_date TIMESTAMP NOT NULL,
        supplier_id UUID NOT NULL,
        supplier_name VARCHAR(255) NOT NULL,
        total_amount DECIMAL(19, 4) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
      CREATE INDEX idx_invoices_supplier_id ON invoices(supplier_id);
      CREATE INDEX idx_invoices_status ON invoices(status);
    `,
    down: `DROP TABLE invoices;`,
  },
  {
    version: 2,
    name: "create_line_items_table",
    up: `
      CREATE TABLE line_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price_amount DECIMAL(19, 4) NOT NULL,
        unit_price_currency VARCHAR(3) NOT NULL,
        total_amount DECIMAL(19, 4) NOT NULL,
        total_currency VARCHAR(3) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX idx_line_items_invoice_id ON line_items(invoice_id);
    `,
    down: `DROP TABLE line_items;`,
  },
  {
    version: 3,
    name: "create_audit_logs_table",
    up: `
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        action VARCHAR(50) NOT NULL,
        user_id VARCHAR(255),
        changes JSONB NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
      CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
    `,
    down: `DROP TABLE audit_logs;`,
  },
];
```

**Copilot Prompts:**
```
@workspace Generate a repository implementation for Reconciliation that:
1. Extends BaseRepository<Reconciliation>
2. Implements findByInvoiceId(invoiceId: string)
3. Implements findByStatus(status: ReconciliationStatus)
4. Implements createWithAuditLog(reconciliation, auditLog)
5. Uses transactions for multi-table operations

Follow the pattern in /data/repositories/invoice.ts
```

**Hands-on Activity:**
```bash
# Create database migrations
cd src/data/database

# Generate migration with Copilot
# Prompt: "Generate migration for reconciliations table"

# Run migrations
deno task migrate:up

# Seed test data
deno task seed
```

**Quality Checks:**
```bash
# Test repositories
deno test tests/unit/data/repositories/

# Check for dead code
pmat analyze dead-code src/data/

# Complexity check
pmat analyze complexity src/data/ --max-complexity 15
```

---

### Video 4.2.6: Working with ORMs and Persistence (3:45)

**Learning Objectives:**
- Choose appropriate persistence strategy
- Implement connection pooling
- Handle transactions and rollbacks

**Content:**
1. **Persistence Strategy** (0:00-1:15)
   - PostgreSQL for transactional data
   - Redis for caching exchange rates
   - File system for audit logs (immutable)

2. **Connection Management** (1:15-2:30)
   - Connection pooling (10-20 connections)
   - Health checks and reconnection
   - Graceful shutdown

3. **Transaction Handling** (2:30-3:45)
   - ACID properties for reconciliation
   - Savepoints for complex workflows
   - Rollback strategies on error

**Implementation:**

```typescript
// src/data/database/client.ts
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

export class DatabaseClient {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool(connectionString, {
      size: 20, // max connections
      lazy: true,
    });
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      const result = await client.queryObject<T>(sql, params);
      return result;
    } finally {
      client.release();
    }
  }

  async transaction<T>(
    fn: (client: PoolClient) => Promise<T>
  ): Promise<Result<T, Error>> {
    const client = await this.pool.connect();
    try {
      await client.queryObject("BEGIN");
      const result = await fn(client);
      await client.queryObject("COMMIT");
      return Ok(result);
    } catch (error) {
      await client.queryObject("ROLLBACK");
      return Err(error as Error);
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
```

```typescript
// src/data/database/transaction_manager.ts
export class TransactionManager {
  constructor(private db: DatabaseClient) {}

  async executeInTransaction<T>(
    operations: TransactionOperation[]
  ): Promise<Result<T, Error>> {
    return this.db.transaction(async (client) => {
      const results: unknown[] = [];

      for (const op of operations) {
        try {
          const result = await op.execute(client);
          results.push(result);
        } catch (error) {
          throw new TransactionError(
            `Operation failed: ${op.name}`,
            error as Error,
            results
          );
        }
      }

      return results as T;
    });
  }
}

interface TransactionOperation {
  name: string;
  execute(client: PoolClient): Promise<unknown>;
}
```

**Copilot Prompts:**
```
Create a transaction manager that:
1. Supports multiple operations in a single transaction
2. Implements savepoint creation and rollback
3. Tracks operation sequence for audit
4. Provides detailed error context on failure

Include examples for:
- Creating invoice with line items
- Reconciling invoice with purchase order
- Updating audit log atomically
```

**Hands-on Activity:**
```typescript
// Use transaction manager
const txManager = new TransactionManager(db);

await txManager.executeInTransaction([
  {
    name: "create-invoice",
    execute: (client) => invoiceRepo.create(invoice, client),
  },
  {
    name: "create-line-items",
    execute: (client) =>
      Promise.all(
        lineItems.map((item) => lineItemRepo.create(item, client))
      ),
  },
  {
    name: "create-audit-log",
    execute: (client) => auditRepo.create(auditLog, client),
  },
]);
```

**Quality Checks:**
```bash
# Integration tests with database
deno test tests/integration/data/

# Check for resource leaks
pmat analyze dead-code src/data/database/
```

---

## Module 3: Testing and Validation (30 minutes)

### Video 4.3.1: Task 4 - The Test Suite (5:00)

**Learning Objectives:**
- Achieve >80% test coverage
- Write effective unit tests with Copilot
- Create integration and E2E tests

**Content:**
1. **Unit Testing Strategy** (0:00-2:00)
   - Test each function independently
   - Mock external dependencies
   - Use property-based testing for algorithms

2. **Integration Testing** (2:00-3:30)
   - Test API endpoints end-to-end
   - Test database operations
   - Test business logic with real data

3. **E2E Testing** (3:30-5:00)
   - Complete invoice reconciliation flow
   - Error scenarios and edge cases
   - Performance validation

**Implementation:**

```typescript
// tests/unit/business/reconciliation/matcher.test.ts
import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { InvoiceMatcher } from "../../../../src/business/reconciliation/matcher.ts";
import { createTestInvoice, createTestPurchaseOrder } from "../../../fixtures/factories.ts";

describe("InvoiceMatcher", () => {
  const matcher = new InvoiceMatcher();

  describe("matchInvoice", () => {
    it("should match invoice with exact PO line items", async () => {
      const invoice = createTestInvoice({
        lineItems: [
          {
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
          },
        ],
      });

      const po = createTestPurchaseOrder({
        lineItems: [
          {
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
          },
        ],
      });

      const result = await matcher.matchInvoice(invoice, [po]);

      assertExists(result.bestMatch);
      assertEquals(result.bestMatch.id, po.id);
      assertEquals(result.confidence, 1.0);
    });

    it("should match invoice with similar descriptions", async () => {
      const invoice = createTestInvoice({
        lineItems: [
          {
            description: "Widget A - Blue",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
          },
        ],
      });

      const po = createTestPurchaseOrder({
        lineItems: [
          {
            description: "Widget A - Blu",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
          },
        ],
      });

      const result = await matcher.matchInvoice(invoice, [po]);

      assertExists(result.bestMatch);
      assertEquals(result.confidence >= 0.9, true);
    });

    it("should handle price tolerance", async () => {
      const invoice = createTestInvoice({
        lineItems: [
          {
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.50, currency: "USD" },
          },
        ],
      });

      const po = createTestPurchaseOrder({
        lineItems: [
          {
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
          },
        ],
      });

      const result = await matcher.matchInvoice(invoice, [po]);

      assertExists(result.bestMatch);
      assertEquals(result.confidence >= 0.9, true);
    });

    it("should reject matches exceeding tolerance", async () => {
      const invoice = createTestInvoice({
        lineItems: [
          {
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 60.00, currency: "USD" },
          },
        ],
      });

      const po = createTestPurchaseOrder({
        lineItems: [
          {
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
          },
        ],
      });

      const result = await matcher.matchInvoice(invoice, [po]);

      assertEquals(result.bestMatch, null);
      assertEquals(result.confidence, 0);
    });
  });

  describe("calculateLevenshtein", () => {
    it("should return 1.0 for identical strings", () => {
      const similarity = (matcher as any).calculateLevenshtein(
        "hello",
        "hello"
      );
      assertEquals(similarity, 1.0);
    });

    it("should return 0.0 for completely different strings", () => {
      const similarity = (matcher as any).calculateLevenshtein(
        "hello",
        "xyz"
      );
      assertEquals(similarity < 0.3, true);
    });

    it("should handle case sensitivity", () => {
      const similarity = (matcher as any).calculateLevenshtein(
        "Hello",
        "hello"
      );
      assertEquals(similarity >= 0.8, true);
    });
  });
});
```

```typescript
// tests/integration/api_integration.test.ts
import { assertEquals } from "@std/assert";
import { describe, it, beforeAll, afterAll } from "@std/testing/bdd";
import { createTestServer } from "../helpers/test_server.ts";

describe("API Integration Tests", () => {
  let server: Deno.HttpServer;
  let baseUrl: string;

  beforeAll(async () => {
    server = await createTestServer();
    baseUrl = `http://localhost:${server.addr.port}`;
  });

  afterAll(async () => {
    await server.shutdown();
  });

  describe("POST /api/v1/invoices", () => {
    it("should create invoice with valid data", async () => {
      const invoice = {
        invoiceNumber: "INV-000001",
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        supplier: {
          id: crypto.randomUUID(),
          name: "ACME Corp",
        },
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
        total: { amount: 500.00, currency: "USD" },
        currency: "USD",
      };

      const response = await fetch(`${baseUrl}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });

      assertEquals(response.status, 201);
      const created = await response.json();
      assertEquals(created.invoiceNumber, invoice.invoiceNumber);
    });

    it("should reject invoice with invalid schema", async () => {
      const invalid = {
        invoiceNumber: "INVALID",
        // missing required fields
      };

      const response = await fetch(`${baseUrl}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalid),
      });

      assertEquals(response.status, 400);
    });
  });

  describe("POST /api/v1/reconciliations", () => {
    it("should reconcile invoice with matching PO", async () => {
      // Create invoice and PO first
      const invoiceId = await createTestInvoiceViaAPI(baseUrl);
      const poId = await createTestPurchaseOrderViaAPI(baseUrl);

      const response = await fetch(`${baseUrl}/api/v1/reconciliations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          purchaseOrderId: poId,
          tolerance: 2.0,
        }),
      });

      assertEquals(response.status, 202);
      const result = await response.json();
      assertEquals(result.status, "processing");
    });
  });
});
```

```typescript
// tests/e2e/e2e_flow.test.ts
import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

describe("E2E: Complete Reconciliation Flow", () => {
  it("should complete full invoice reconciliation workflow", async () => {
    // 1. Create supplier
    const supplier = await api.createSupplier({
      name: "ACME Corp",
      taxId: "12-3456789",
    });
    assertExists(supplier.id);

    // 2. Create purchase order
    const po = await api.createPurchaseOrder({
      supplierId: supplier.id,
      lineItems: [
        {
          description: "Widget A",
          quantity: 100,
          unitPrice: { amount: 50.00, currency: "USD" },
        },
      ],
    });
    assertExists(po.id);

    // 3. Create invoice (EUR currency)
    const invoice = await api.createInvoice({
      invoiceNumber: "INV-000001",
      supplierId: supplier.id,
      currency: "EUR",
      lineItems: [
        {
          description: "Widget A",
          quantity: 100,
          unitPrice: { amount: 45.00, currency: "EUR" },
        },
      ],
    });
    assertExists(invoice.id);

    // 4. Trigger reconciliation
    const reconciliation = await api.reconcileInvoice({
      invoiceId: invoice.id,
      purchaseOrderId: po.id,
      tolerance: 2.0,
    });
    assertEquals(reconciliation.status, "processing");

    // 5. Wait for reconciliation to complete
    let status = reconciliation.status;
    while (status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updated = await api.getReconciliation(reconciliation.id);
      status = updated.status;
    }

    // 6. Verify reconciliation result
    assertEquals(status, "matched");
    const result = await api.getReconciliation(reconciliation.id);
    assertExists(result.matchedPurchaseOrder);
    assertEquals(result.matchedPurchaseOrder.id, po.id);
    assertEquals(result.confidence >= 0.9, true);

    // 7. Verify audit trail
    const auditLogs = await api.getAuditLogs({
      entityType: "reconciliation",
      entityId: reconciliation.id,
    });
    assertEquals(auditLogs.length >= 2, true); // created + completed
  });

  it("should handle currency conversion in reconciliation", async () => {
    // Create EUR invoice and USD purchase order
    // Verify conversion is applied correctly
    // Verify tolerance is calculated on converted amount
  });

  it("should reject reconciliation exceeding tolerance", async () => {
    // Create invoice with price 10% higher than PO
    // Verify reconciliation fails
    // Verify error details include tolerance violation
  });
});
```

**Copilot Prompts:**
```
@workspace Generate comprehensive tests for CurrencyConverter that:
1. Test successful conversion between EUR/USD/GBP
2. Test rate caching behavior (cache hit/miss)
3. Test historical rate lookup with date parameter
4. Test error handling (API failure, invalid currency)
5. Test conversion precision (4 decimal places)

Follow testing patterns in tests/unit/business/
Use factories from tests/fixtures/factories.ts
Aim for >90% coverage of CurrencyConverter class
```

**Hands-on Activity:**
```bash
# Generate test suite with Copilot
cd tests/unit/api

# Prompt: "Generate tests for POST /api/v1/reconciliations endpoint"

# Run tests with coverage
deno task test --coverage

# Generate coverage report
deno task coverage
```

**Quality Checks:**
```bash
# Verify >80% coverage
deno coverage coverage --lcov | grep -E "^(lines|functions)"

# Run PMAT quality gate
pmat quality-gate --strict

# Check TDG score
pmat analyze tdg . --include-components
```

---

### Video 4.3.2: End-to-End Testing Strategies (4:30)

**Learning Objectives:**
- Design comprehensive E2E test scenarios
- Use test fixtures and factories
- Implement test data management

**Content:**
1. **E2E Test Design** (0:00-1:45)
   - Happy path scenarios
   - Error scenarios (validation, business rules)
   - Edge cases (currency fluctuations, partial matches)

2. **Test Fixtures** (1:45-3:00)
   - Invoice fixtures (valid, invalid, edge cases)
   - Purchase order fixtures
   - Exchange rate fixtures

3. **Test Data Management** (3:00-4:30)
   - Database seeding for tests
   - Cleanup after tests
   - Isolation between tests

**Implementation:**

```typescript
// tests/fixtures/factories.ts
import { faker } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";

export function createTestInvoice(overrides?: Partial<Invoice>): Invoice {
  return {
    id: crypto.randomUUID(),
    invoiceNumber: `INV-${faker.datatype.number({ min: 100000, max: 999999 })}`,
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 86400000),
    supplier: {
      id: crypto.randomUUID(),
      name: faker.company.companyName(),
      taxId: `${faker.datatype.number({ min: 10, max: 99 })}-${faker.datatype.number({ min: 1000000, max: 9999999 })}`,
    },
    lineItems: [
      {
        id: crypto.randomUUID(),
        description: faker.commerce.productName(),
        quantity: faker.datatype.number({ min: 1, max: 100 }),
        unitPrice: {
          amount: parseFloat(faker.commerce.price()),
          currency: "USD",
        },
        total: {
          amount: 0, // calculated below
          currency: "USD",
        },
      },
    ],
    total: { amount: 0, currency: "USD" }, // calculated below
    currency: "USD",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestPurchaseOrder(overrides?: Partial<PurchaseOrder>): PurchaseOrder {
  return {
    id: crypto.randomUUID(),
    poNumber: `PO-${faker.datatype.number({ min: 100000, max: 999999 })}`,
    date: new Date(),
    supplierId: crypto.randomUUID(),
    lineItems: [
      {
        id: crypto.randomUUID(),
        description: faker.commerce.productName(),
        quantity: faker.datatype.number({ min: 1, max: 100 }),
        unitPrice: {
          amount: parseFloat(faker.commerce.price()),
          currency: "USD",
        },
        total: {
          amount: 0,
          currency: "USD",
        },
      },
    ],
    total: { amount: 0, currency: "USD" },
    currency: "USD",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

```typescript
// tests/helpers/test_server.ts
import { createServer } from "../../src/server.ts";
import { DatabaseClient } from "../../src/data/database/client.ts";

export async function createTestServer(): Promise<TestServer> {
  // Use in-memory database for tests
  const db = new DatabaseClient("postgresql://localhost:5432/test_db");
  
  // Run migrations
  await runMigrations(db);
  
  // Seed test data
  await seedTestData(db);
  
  // Create server
  const server = createServer(db);
  
  return {
    server,
    db,
    async cleanup() {
      await db.query("TRUNCATE TABLE invoices, line_items, reconciliations, audit_logs CASCADE");
      await db.close();
      await server.shutdown();
    },
  };
}

interface TestServer {
  server: Deno.HttpServer;
  db: DatabaseClient;
  cleanup(): Promise<void>;
}
```

**Copilot Prompts:**
```
Create E2E test scenarios for invoice reconciliation covering:
1. Successful reconciliation with exact match
2. Successful reconciliation with fuzzy match (90% confidence)
3. Failed reconciliation (tolerance exceeded)
4. Partial match requiring manual review
5. Multi-currency reconciliation with conversion
6. Historical rate lookup for backdated invoices

Include assertions for:
- Reconciliation status (matched, failed, manual_review)
- Confidence scores
- Audit trail entries
- Currency conversion accuracy
```

**Hands-on Activity:**
```bash
# Run E2E tests
deno test tests/e2e/ --allow-all

# Run with verbose output
deno test tests/e2e/ --allow-all --trace-ops

# Generate HTML coverage report
deno coverage coverage --html
```

**Quality Checks:**
```bash
# Verify E2E coverage
deno coverage coverage --include=src/

# Check for flaky tests
for i in {1..10}; do deno test tests/e2e/ --allow-all || break; done
```

---

### Video 4.3.3: Reviewing Your Implementation (4:15)

**Learning Objectives:**
- Use Copilot to review code quality
- Identify refactoring opportunities
- Validate against requirements

**Content:**
1. **Code Quality Review** (0:00-1:30)
   - Prompt: "Review my implementation for code smells"
   - Prompt: "Suggest refactorings to reduce complexity"
   - Prompt: "Identify potential bugs or edge cases"

2. **Requirements Validation** (1:30-3:00)
   - Verify all acceptance criteria met
   - Check performance requirements (latency, throughput)
   - Validate compliance requirements (audit trail, GDPR)

3. **PMAT Quality Gates** (3:00-4:15)
   - Run comprehensive PMAT analysis
   - Review TDG report (aim for A+)
   - Address any quality violations

**Implementation:**

```bash
# Run comprehensive quality checks
make quality-check

# Generate PMAT reports
pmat analyze complexity . --top-files 20
pmat analyze satd . --fail-on-violation
pmat analyze dead-code .
pmat analyze duplicates --detection-type all

# Generate TDG report
pmat analyze tdg . --include-components --format markdown > docs/quality/tdg_report.md

# Run quality gate
pmat quality-gate --strict
```

**Copilot Prompts:**
```
@workspace Review my entire codebase and provide:
1. Code quality score (1-10) with justification
2. Top 5 refactoring opportunities ranked by impact
3. Potential bugs or edge cases not covered by tests
4. Performance optimization suggestions
5. Security vulnerabilities or best practice violations

Focus on:
- src/business/reconciliation/matcher.ts (most complex)
- src/api/routes/reconciliation.ts (public interface)
- src/data/repositories/ (data integrity)
```

**Hands-on Activity:**
```bash
# Use Copilot to generate refactoring suggestions
# Open GitHub Copilot Chat in workspace mode

# Prompt sequence:
# 1. "Analyze complexity of src/business/reconciliation/matcher.ts"
# 2. "Suggest refactorings to reduce cyclomatic complexity below 15"
# 3. "Generate refactored version maintaining test compatibility"
```

**Quality Checks:**
```bash
# Final quality validation
deno task quality  # fmt + lint + check + test
pmat quality-gate --strict

# Verify metrics
echo "Test Coverage:"
deno coverage coverage --lcov | grep -E "^lines"

echo "\nComplexity:"
pmat analyze complexity . --max-complexity 20

echo "\nTDG Grade:"
pmat analyze tdg . --include-components | grep "Grade:"
```

---

### Video 4.3.4: Comparing with Best Practices (3:45)

**Learning Objectives:**
- Compare implementation against industry standards
- Identify areas for improvement
- Learn from reference implementations

**Content:**
1. **Industry Standards** (0:00-1:15)
   - REST API design (Richardson Maturity Model Level 3)
   - Error handling (RFC 7807)
   - Logging (structured logging with correlation IDs)

2. **Reference Implementations** (1:15-2:45)
   - Compare with open-source invoice systems
   - Analyze Xero's public APIs
   - Study best practices from similar projects

3. **Improvement Roadmap** (2:45-3:45)
   - Prioritize enhancements (P0, P1, P2)
   - Create technical debt tickets
   - Plan for future iterations

**Copilot Prompts:**
```
@workspace Compare my API implementation with REST best practices:
1. Are my endpoints RESTful? (resource-oriented, proper HTTP verbs)
2. Do I follow HATEOAS principles?
3. Is my error handling RFC 7807 compliant?
4. Are my response codes appropriate?
5. Do I support content negotiation?

Provide specific examples of violations and corrective actions.
```

**Hands-on Activity:**
```bash
# Generate API comparison report
cat > docs/api_review.md << 'EOF'
# API Best Practices Review

## Richardson Maturity Model Assessment
- Level 0: ❌ Not applicable
- Level 1: ✅ Resource-based URLs
- Level 2: ✅ HTTP verbs
- Level 3: ⚠️  HATEOAS partially implemented

## Recommendations
1. Add hypermedia links to responses
2. Implement OPTIONS endpoint for API discovery
3. Add rate limiting headers
EOF
```

---

### Video 4.3.5: Final Reflections and Next Steps (3:30)

**Learning Objectives:**
- Reflect on Copilot usage effectiveness
- Identify learning outcomes
- Plan continued learning

**Content:**
1. **Copilot Effectiveness** (0:00-1:15)
   - What worked well (multi-turn prompts, workspace context)
   - What could be improved (edge case handling)
   - Productivity gains vs. manual coding

2. **Learning Outcomes** (1:15-2:30)
   - Technical skills gained (Deno, TypeScript, PMAT)
   - AI-assisted development patterns
   - Quality-first mindset

3. **Next Steps** (2:30-3:30)
   - Deploy to production (Deno Deploy)
   - Monitor and iterate
   - Continue Copilot skill development

**Final Reflection Questions:**
1. How did GitHub Copilot improve your development speed?
2. What prompting techniques were most effective?
3. How did PMAT quality gates change your coding approach?
4. What would you do differently in the next project?

**Post-Course Resources:**
- GitHub Copilot documentation
- Deno Deploy documentation
- PMAT advanced features
- Xero Developer Community

---

## Quality Requirements

### PMAT Roadmap

Create detailed roadmap at `docs/quality/pmat_roadmap.md`:

```markdown
# PMAT Quality Roadmap

## Sprint 1: Foundation (Week 1)

### Day 1-2: Project Setup
- [ ] Initialize Deno project with strict TypeScript
- [ ] Configure PMAT with `.pmat.toml`
- [ ] Setup CI/CD pipeline with quality gates
- [ ] Create Makefile with quality targets

**Quality Gates:**
- Complexity: ≤20 (cyclomatic), ≤15 (cognitive)
- SATD: 0 comments allowed
- Test Coverage: >70%

### Day 3-5: API Layer (Task 1)
- [ ] Implement RESTful endpoints
- [ ] Add request validation (Zod schemas)
- [ ] Create middleware (auth, rate limiting, logging)
- [ ] Write unit tests for API layer

**Quality Gates:**
- API layer coverage: >85%
- Complexity per function: ≤10
- Zero SATD comments

### Day 6-7: Code Review & Refactoring
- [ ] Run PMAT complexity analysis
- [ ] Run PMAT SATD detection
- [ ] Refactor violations
- [ ] Update documentation

**PMAT Commands:**
```bash
pmat analyze complexity src/api/ --max-complexity 10
pmat analyze satd src/api/ --fail-on-violation
pmat quality-gate --strict
```

## Sprint 2: Business Logic (Week 2)

### Day 1-3: Reconciliation Engine (Task 2)
- [ ] Implement fuzzy matching algorithm
- [ ] Add currency conversion with caching
- [ ] Create rule engine for business rules
- [ ] Write property-based tests

**Quality Gates:**
- Business logic coverage: >90%
- Complexity: ≤15 for matcher algorithm
- Zero dead code

### Day 4-5: Data Layer (Task 3)
- [ ] Implement repository pattern
- [ ] Create database models
- [ ] Add transaction support
- [ ] Write integration tests

**Quality Gates:**
- Data layer coverage: >85%
- Zero SQL injection vulnerabilities
- Proper error handling

### Day 6-7: Sprint Review
- [ ] Run comprehensive PMAT analysis
- [ ] Generate TDG report
- [ ] Address P0/P1 issues
- [ ] Update roadmap

**PMAT Commands:**
```bash
pmat analyze tdg . --include-components
pmat analyze duplicates --detection-type all
pmat analyze dead-code .
```

## Sprint 3: Testing & Deployment (Week 3)

### Day 1-3: Test Suite (Task 4)
- [ ] Achieve >80% overall coverage
- [ ] Write E2E tests
- [ ] Add performance benchmarks
- [ ] Create test documentation

**Quality Gates:**
- Overall coverage: >80%
- E2E coverage: 100% of critical paths
- All benchmarks pass performance targets

### Day 4-5: Production Readiness
- [ ] Add monitoring and logging
- [ ] Create deployment scripts (bashrs)
- [ ] Write runbooks
- [ ] Performance testing

**Quality Gates:**
- Zero deployment script errors
- All bashrs scripts pass ShellCheck
- Dockerfile passes best practices

### Day 6-7: Final Quality Gate
- [ ] Run PMAT quality-gate --strict
- [ ] Verify TDG Grade A+
- [ ] Deploy to staging
- [ ] Conduct final review

**PMAT Commands:**
```bash
pmat quality-gate --strict
pmat analyze tdg . --format html > docs/quality/final_report.html
```

## Continuous Quality Enforcement

### Pre-Commit Checks
```bash
make pre-commit  # fmt + lint + check + test
```

### CI/CD Pipeline
```yaml
quality:
  - deno task quality
  - pmat quality-gate --strict
  - pmat analyze tdg . --fail-below B+
```

### Weekly Reviews
- Run PMAT TDG analysis
- Review complexity trends
- Update technical debt backlog
- Prioritize refactoring tasks
```

### Quality Gates Configuration

Create `.pmat.toml`:

```toml
# PMAT Configuration for Invoice Reconciliation

[quality_gates]
max_cyclomatic_complexity = 20
max_cognitive_complexity = 15
max_function_length = 50
max_file_length = 300
zero_satd = true
min_test_coverage = 80.0

[analysis]
# Directories to analyze
include_dirs = ["src"]
exclude_dirs = ["tests", "benchmarks", "scripts"]

# File patterns to analyze
include_patterns = ["*.ts", "*.tsx"]
exclude_patterns = ["*.test.ts", "*.bench.ts"]

[tdg]
# Technical Debt Grading thresholds
grade_a_plus = 95
grade_a = 90
grade_b = 80
grade_c = 70
grade_d = 60

# Component weights
structural_weight = 0.20
semantic_weight = 0.20
duplication_weight = 0.15
coupling_weight = 0.15
documentation_weight = 0.15
consistency_weight = 0.15

[complexity]
# Complexity thresholds
warn_cyclomatic = 15
fail_cyclomatic = 20
warn_cognitive = 12
fail_cognitive = 15

[satd]
# Self-Admitted Technical Debt detection
patterns = ["TODO", "FIXME", "HACK", "XXX", "TECHDEBT"]
severity = "error"  # fail build on detection

[dead_code]
# Dead code detection
detect_unused_functions = true
detect_unused_variables = true
detect_unused_imports = true

[duplicates]
# Code duplication detection
min_tokens = 50
similarity_threshold = 0.85
detection_types = ["exact", "renamed", "modified", "semantic"]
```

### Makefile

Create comprehensive `Makefile`:

```makefile
.PHONY: help init dev test coverage bench quality pmat deploy clean

# Default target
.DEFAULT_GOAL := help

# Variables
DENO := deno
PMAT := pmat
BASHRS := bashrs

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '$(GREEN)Invoice Reconciliation - Make Targets$(NC)'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

init: ## Initialize project dependencies
	@echo '$(GREEN)Initializing project...$(NC)'
	$(DENO) --version
	$(PMAT) --version
	$(BASHRS) --version
	@echo '$(GREEN)✓ All tools installed$(NC)'

dev: ## Start development server with watch mode
	@echo '$(GREEN)Starting development server...$(NC)'
	$(DENO) task dev

test: ## Run all tests
	@echo '$(GREEN)Running tests...$(NC)'
	$(DENO) task test

coverage: test ## Generate coverage report
	@echo '$(GREEN)Generating coverage report...$(NC)'
	$(DENO) task coverage
	@echo '$(GREEN)✓ Coverage report: coverage.lcov$(NC)'

coverage-html: coverage ## Generate HTML coverage report
	@echo '$(GREEN)Generating HTML coverage report...$(NC)'
	$(DENO) coverage coverage --html
	@echo '$(GREEN)✓ HTML report: coverage/html/$(NC)'

bench: ## Run performance benchmarks
	@echo '$(GREEN)Running benchmarks...$(NC)'
	$(DENO) task bench

lint: ## Run linter
	@echo '$(GREEN)Running linter...$(NC)'
	$(DENO) task lint

fmt: ## Format code
	@echo '$(GREEN)Formatting code...$(NC)'
	$(DENO) task fmt

check: ## Type check
	@echo '$(GREEN)Type checking...$(NC)'
	$(DENO) task check

quality: fmt lint check test ## Run all quality checks
	@echo '$(GREEN)✓ All quality checks passed$(NC)'

pmat-complexity: ## Analyze code complexity
	@echo '$(GREEN)Analyzing complexity...$(NC)'
	$(PMAT) analyze complexity src/ --max-complexity 20 --top-files 10

pmat-satd: ## Detect self-admitted technical debt
	@echo '$(GREEN)Detecting SATD...$(NC)'
	$(PMAT) analyze satd src/ --fail-on-violation

pmat-dead-code: ## Detect dead code
	@echo '$(GREEN)Detecting dead code...$(NC)'
	$(PMAT) analyze dead-code src/

pmat-duplicates: ## Detect code duplicates
	@echo '$(GREEN)Detecting duplicates...$(NC)'
	$(PMAT) analyze duplicates --detection-type all --format markdown

pmat-tdg: ## Generate Technical Debt Grading report
	@echo '$(GREEN)Generating TDG report...$(NC)'
	$(PMAT) analyze tdg . --include-components --format markdown > docs/quality/tdg_report.md
	@echo '$(GREEN)✓ TDG report: docs/quality/tdg_report.md$(NC)'

pmat-quality-gate: ## Run PMAT quality gate
	@echo '$(GREEN)Running PMAT quality gate...$(NC)'
	$(PMAT) quality-gate --strict

pmat: pmat-complexity pmat-satd pmat-dead-code pmat-duplicates pmat-tdg pmat-quality-gate ## Run all PMAT checks
	@echo '$(GREEN)✓ All PMAT checks passed$(NC)'

bashrs-build: ## Build shell scripts from Rust
	@echo '$(GREEN)Building shell scripts...$(NC)'
	$(BASHRS) build scripts/install.rs -o scripts/install.sh
	$(BASHRS) build scripts/deploy.rs -o scripts/deploy.sh
	$(BASHRS) build scripts/health_check.rs -o scripts/health_check.sh
	@echo '$(GREEN)✓ Shell scripts built$(NC)'

bashrs-check: ## Verify shell scripts
	@echo '$(GREEN)Verifying shell scripts...$(NC)'
	shellcheck scripts/*.sh
	@echo '$(GREEN)✓ Shell scripts verified$(NC)'

build: bashrs-build ## Build project
	@echo '$(GREEN)Building project...$(NC)'
	$(DENO) task build
	@echo '$(GREEN)✓ Build complete$(NC)'

deploy-staging: build quality pmat ## Deploy to staging
	@echo '$(GREEN)Deploying to staging...$(NC)'
	./scripts/deploy.sh staging
	@echo '$(GREEN)✓ Deployed to staging$(NC)'

deploy-production: build quality pmat ## Deploy to production
	@echo '$(YELLOW)Deploying to production...$(NC)'
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		./scripts/deploy.sh production; \
		echo '$(GREEN)✓ Deployed to production$(NC)'; \
	else \
		echo '$(RED)✗ Deployment cancelled$(NC)'; \
	fi

health-check: ## Run health check
	@echo '$(GREEN)Running health check...$(NC)'
	./scripts/health_check.sh

clean: ## Clean build artifacts
	@echo '$(GREEN)Cleaning...$(NC)'
	rm -rf coverage/
	rm -rf .deno/
	rm -f coverage.lcov
	@echo '$(GREEN)✓ Cleaned$(NC)'

pre-commit: fmt lint check test pmat-satd ## Pre-commit checks
	@echo '$(GREEN)✓ Pre-commit checks passed$(NC)'

ci: quality pmat build ## CI pipeline
	@echo '$(GREEN)✓ CI pipeline passed$(NC)'

sprint-close: ci coverage-html pmat-tdg ## Sprint close checks
	@echo '$(GREEN)✓ Sprint close complete$(NC)'
	@echo ''
	@echo '$(YELLOW)Coverage Report:$(NC)'
	@$(DENO) coverage coverage --lcov | grep -E "^(lines|functions)"
	@echo ''
	@echo '$(YELLOW)TDG Grade:$(NC)'
	@$(PMAT) analyze tdg . --include-components | grep "Grade:"

.PHONY: all
all: init quality pmat build ## Run everything
	@echo '$(GREEN)✓ All tasks complete$(NC)'
```

### bashrs Scripts

Create `scripts/install.rs`:

```rust
// scripts/install.rs
#[rash::main]
fn main() {
    let version = env_var_or("VERSION", "1.0.0");
    let prefix = env_var_or("PREFIX", "/usr/local");
    
    echo("Installing Invoice Reconciliation {version} to {prefix}");
    
    // Create directories
    mkdir_p("{prefix}/bin");
    mkdir_p("{prefix}/lib/invoice-reconciliation");
    mkdir_p("{prefix}/share/invoice-reconciliation");
    
    // Copy binary
    if exec("cp target/invoice-reconciliation {prefix}/bin/") {
        echo("✓ Binary installed");
    } else {
        echo("✗ Failed to install binary");
        exit(1);
    }
    
    // Copy libraries
    if exec("cp -r lib/* {prefix}/lib/invoice-reconciliation/") {
        echo("✓ Libraries installed");
    } else {
        echo("✗ Failed to install libraries");
        exit(1);
    }
    
    // Set permissions
    exec("chmod +x {prefix}/bin/invoice-reconciliation");
    
    echo("✓ Installation complete");
    echo("Run: {prefix}/bin/invoice-reconciliation --help");
}
```

Create `scripts/deploy.rs`:

```rust
// scripts/deploy.rs
#[rash::main]
fn main() {
    let env = env_var_or("DEPLOY_ENV", "staging");
    let project = env_var_or("DENO_PROJECT", "invoice-reconciliation");
    
    echo("Deploying to {env}...");
    
    // Run quality checks
    if !exec("make quality") {
        echo("✗ Quality checks failed");
        exit(1);
    }
    
    // Run PMAT quality gate
    if !exec("pmat quality-gate --strict") {
        echo("✗ PMAT quality gate failed");
        exit(1);
    }
    
    // Build project
    if !exec("deno task build") {
        echo("✗ Build failed");
        exit(1);
    }
    
    // Deploy to Deno Deploy
    if exec("deployctl deploy --project={project}-{env} src/main.ts") {
        echo("✓ Deployed to {env}");
        
        // Run health check
        let url = "https://{project}-{env}.deno.dev/health";
        exec("curl -f {url}");
    } else {
        echo("✗ Deployment failed");
        exit(1);
    }
}
```

---

## Assessment Criteria

### Technical Implementation (40%)

- **API Layer** (10%)
  - ✅ RESTful endpoints with proper HTTP verbs
  - ✅ Request/response validation with Zod
  - ✅ Error handling (RFC 7807)
  - ✅ Middleware (auth, rate limiting, logging)

- **Business Logic** (15%)
  - ✅ Fuzzy matching algorithm with >90% confidence
  - ✅ Currency conversion with caching
  - ✅ Business rule engine with tolerance handling
  - ✅ Audit trail system

- **Data Layer** (10%)
  - ✅ Repository pattern implementation
  - ✅ Database migrations and seeds
  - ✅ Transaction support
  - ✅ Query optimization

- **Infrastructure** (5%)
  - ✅ Dockerfile with multi-stage build
  - ✅ Deployment scripts (bashrs)
  - ✅ CI/CD pipeline
  - ✅ Monitoring and logging

### Quality Standards (30%)

- **Test Coverage** (10%)
  - ✅ >80% overall coverage
  - ✅ Unit tests for all modules
  - ✅ Integration tests for API
  - ✅ E2E tests for critical paths

- **PMAT Quality Gates** (15%)
  - ✅ Complexity ≤20 (cyclomatic), ≤15 (cognitive)
  - ✅ Zero SATD comments
  - ✅ Zero dead code
  - ✅ TDG Grade A+ (>95%)

- **Code Quality** (5%)
  - ✅ TypeScript strict mode
  - ✅ Zero linter warnings
  - ✅ Consistent formatting
  - ✅ Documentation comments

### GitHub Copilot Usage (20%)

- **Prompting Effectiveness** (10%)
  - ✅ Use of multi-turn conversations
  - ✅ Workspace context awareness
  - ✅ Effective code generation prompts
  - ✅ Code review and refactoring prompts

- **Productivity Gains** (10%)
  - ✅ Reduced implementation time
  - ✅ Fewer bugs due to validation
  - ✅ Better code quality
  - ✅ Comprehensive test coverage

### Documentation (10%)

- **Technical Documentation** (5%)
  - ✅ API specification (OpenAPI/Swagger)
  - ✅ Architecture diagrams
  - ✅ Database schema
  - ✅ Deployment guide

- **Quality Documentation** (5%)
  - ✅ PMAT roadmap
  - ✅ TDG report
  - ✅ Test coverage report
  - ✅ Performance benchmarks

---

## Success Metrics

### Quantitative Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Coverage | >80% | `deno coverage` |
| Cyclomatic Complexity | ≤20 | `pmat analyze complexity` |
| Cognitive Complexity | ≤15 | `pmat analyze complexity` |
| SATD Comments | 0 | `pmat analyze satd` |
| Dead Code | 0 | `pmat analyze dead-code` |
| TDG Grade | A+ (>95%) | `pmat analyze tdg` |
| API Latency | <100ms P99 | `deno bench` |
| Throughput | >1K invoices/hour | `deno bench` |

### Qualitative Metrics

- **Code Quality**: Maintainable, readable, well-documented
- **Copilot Usage**: Effective prompts, high-quality generation
- **Architecture**: Clean separation of concerns, SOLID principles
- **Error Handling**: Comprehensive, user-friendly error messages
- **Security**: No vulnerabilities, proper authentication/authorization

---

## Appendix

### Required Tools

```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Install PMAT
cargo install pmat

# Install bashrs
cargo install bashrs

# Verify installations
deno --version
pmat --version
bashrs --version
```

### Reference Links

- [Deno Documentation](https://deno.land/manual)
- [PMAT Repository](https://github.com/paiml/paiml-mcp-agent-toolkit)
- [bashrs Repository](https://github.com/paiml/bashrs)
- [Xero API Documentation](https://developer.xero.com/documentation/)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)

### Video Script Templates

See `docs/video_scripts/` for detailed video scripts with:
- Exact dialogue
- Screen captures
- Code examples
- Hands-on activities
- Copilot prompts

---

**End of Specification**

*Version: 1.0.0*  
*Last Updated: November 5, 2025*  
*Authors: Noah Liam, Alfredo*  
*Partners: Xero & LinkedIn Learning*
