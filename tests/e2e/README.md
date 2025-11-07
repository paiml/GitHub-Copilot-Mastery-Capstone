# End-to-End Testing Setup

## Prerequisites

E2E tests require Playwright browsers to be installed. These tests are designed for comprehensive
API workflow validation.

## Installation

### Install Playwright Browsers

```bash
# Install Playwright via npm (one-time setup)
npx playwright install chromium

# Or install all browsers
npx playwright install
```

### Alternative: Skip E2E Tests

If you don't need E2E tests (e.g., in CI without browser support), run:

```bash
# Run only unit tests
make test-unit
deno task test:unit

# Or run tests excluding e2e
deno test --allow-all tests/unit/
```

## Running E2E Tests

After installing browsers:

```bash
# Run E2E tests only
make test-e2e
deno task test:e2e

# Run all tests (unit + e2e)
make test
deno task test
```

## E2E Test Coverage

The E2E suite covers:

- Health check endpoints
- Invoice CRUD operations
- Reconciliation workflows
- Multi-currency support
- Error handling and RFC 7807 compliance

## Environment Variables

```bash
# Optional: Override test server URL
export TEST_BASE_URL=http://localhost:8000
```

## Headless vs. Headed Mode

By default, tests run in headless mode. To see the browser:

```typescript
// In setup.ts
const context = await setupBrowser(false); // headed mode
```

## CI/CD Integration

For CI environments without display:

```yaml
# GitHub Actions example
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E Tests
  run: make test-e2e
```

## Troubleshooting

**Error: Executable doesn't exist**

```bash
npx playwright install chromium
```

**Port already in use**

```bash
# Kill existing server
pkill -f "deno run.*main.ts"
```

**Tests timeout**

- Increase timeout in setup.ts
- Check server startup logs
- Verify health endpoint responds

## Local Development

For local development, you may want to run the server separately:

```bash
# Terminal 1: Start server
deno task dev

# Terminal 2: Run E2E tests
TEST_BASE_URL=http://localhost:8000 deno task test:e2e
```

## Production Deployment

E2E tests are optional for production deployment. The quality gate requires:

- ✅ Unit tests: 80%+ coverage per file
- ✅ Mutation tests: 90%+ mutation score
- ⚠️ E2E tests: Optional (requires browser installation)

For production CI/CD without E2E:

```bash
make test-unit    # Required
make mutation     # Required
make test-e2e     # Optional
```
