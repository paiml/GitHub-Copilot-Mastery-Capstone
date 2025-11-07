# System Overview - Speaker Notes

## Opening (Title)

- Enterprise invoice reconciliation system
- Port 9001, Extreme TDD, zero-defect policy

## Development Workflow (Left Side)

### Step 1: Developer Entry

- `make quality` - single command quality gate
- Enforces discipline before code reaches production

### Step 2: Quality Gates

- 83 unit tests, 95.4% line coverage
- 100% mutation score (8/8 mutations killed)
- Tests verify behavior, not just coverage

### Step 3: Server Initialization

- `make dev` starts Hono web server
- localhost:9001 for local development

### Step 4: Client Interaction

- Browser UI for demo page
- API clients (curl, Postman) for testing
- All requests flow through Hono middleware

### Step 5: Comprehensive Testing

- 117 total tests across 3 layers
- Unit (83), E2E (20), API integration (14)
- Mutation testing validates test quality

### Step 6: Production Ready

- Zero defects enforced via Makefile
- Cannot build without passing all gates
- Ready for deployment after quality pass

## Server Architecture (Right Side)

### Hono Framework Layer

- Middleware pipeline for all requests
- Validation, logging, error handling

### API Layer (Top)

- **Health**: Simple status checks
- **API Docs**: OpenAPI 3.0 specification
- **Invoice API**: Full CRUD operations
- **Reconciliation**: POST trigger, GET status
- **Validation**: Zod schemas, RFC 7807 errors

### Business Layer (Middle)

- **Matcher**: Levenshtein fuzzy matching, confidence scores
- **Currency**: Multi-currency support (USD/EUR/GBP/AUD/CAD)
- **Rules**: ±2% tolerance for discrepancies
- **Audit**: Immutable log trail
- **Error Handler**: Standardized HTTP errors (400/404/422/500)

### Data Layer (Bottom)

- **Base Repository**: Generic CRUD, Result<T,E> pattern
- **Invoice Repository**: Domain-specific queries, in-memory Map
- **Reconciliation Repository**: Match results, audit trails
- **Storage**: Map<UUID, Entity> for development
- Production: PostgreSQL or DynamoDB

## Key Concepts (Bottom)

### Result<T,E> Pattern

- Railway-oriented programming
- Ok<T> for success, Err<E> for failure
- No exceptions thrown, type-safe errors

### Quality Metrics

- 95.4% coverage, 100% mutation score
- 117 tests total
- <100ms P99 latency
- Zero-defect enforcement

## Key Metrics Box (Left Bottom)

- 3-layer clean architecture
- Result<T,E> throughout stack
- RFC 7807 standardized errors
- Sub-100ms performance
- Deno + TypeScript runtime
