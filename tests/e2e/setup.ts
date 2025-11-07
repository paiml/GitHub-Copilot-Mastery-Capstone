/**
 * Playwright E2E Test Setup for Invoice Reconciliation Engine
 *
 * This file provides utilities for setting up and tearing down the test environment
 * for end-to-end tests using Playwright with Deno.
 */

import { type Browser, chromium, type Page } from "npm:playwright@1.40.1";

export interface TestContext {
  browser: Browser;
  page: Page;
  baseURL: string;
}

let serverProcess: Deno.ChildProcess | null = null;

/**
 * Sets up a Playwright browser instance and page for testing
 * @param headless Whether to run in headless mode (default: true)
 * @returns TestContext with browser, page, and baseURL
 */
export async function setupBrowser(headless = true): Promise<TestContext> {
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();
  const baseURL = Deno.env.get("TEST_BASE_URL") || "http://localhost:8000";

  // Set up default timeouts
  await page.setDefaultTimeout(10000);

  return { browser, page, baseURL };
}

/**
 * Starts the test server
 */
export async function startTestServer(): Promise<void> {
  const port = parseInt(Deno.env.get("TEST_PORT") || "8000");

  // Merge existing environment variables with PORT override
  const envVars = {
    ...Deno.env.toObject(),
    PORT: port.toString(),
  };

  const command = new Deno.Command("deno", {
    args: ["run", "--allow-all", "src/main.ts"],
    stdout: "piped",
    stderr: "piped",
    env: envVars,
  });

  serverProcess = command.spawn();
  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

/**
 * Stops the test server
 */
export function stopTestServer(): void {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

/**
 * Sets up the complete test environment including server and browser
 */
export async function setupTestEnvironment(headless = true): Promise<TestContext> {
  await startTestServer();
  return await setupBrowser(headless);
}

/**
 * Tears down the complete test environment
 */
export async function teardownTestEnvironment(context: TestContext): Promise<void> {
  await context.browser.close();
  stopTestServer();
}

/**
 * Starts the server for e2e tests (returns process for manual management)
 */
export function startServer(): Deno.ChildProcess {
  const port = parseInt(Deno.env.get("TEST_PORT") || "9001");

  // Merge existing environment variables with PORT override
  const envVars = {
    ...Deno.env.toObject(),
    PORT: port.toString(),
  };

  const command = new Deno.Command("deno", {
    args: ["run", "--allow-all", "src/main.ts"],
    stdout: "piped",
    stderr: "piped",
    env: envVars,
  });

  return command.spawn();
}

/**
 * Waits for server to be ready by polling health endpoint
 */
export async function waitForServer(baseURL: string, maxRetries = 30): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${baseURL}/health`);
      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Server failed to start at ${baseURL}`);
}

/**
 * Tears down the browser (alias for backwards compatibility)
 */
export async function teardownBrowser(context: TestContext): Promise<void> {
  await context.browser.close();
}

/**
 * Helper to create test invoice data
 */
export function createTestInvoiceData(overrides?: Record<string, unknown>) {
  const randomSixDigit = Math.floor(100000 + Math.random() * 900000);
  return {
    invoiceNumber: `INV-${randomSixDigit}`,
    date: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    supplier: {
      id: crypto.randomUUID(),
      name: "Test Supplier Corp",
    },
    lineItems: [
      {
        id: crypto.randomUUID(),
        description: "Test Widget",
        quantity: 10,
        unitPrice: { amount: 50.0, currency: "USD" },
        total: { amount: 500.0, currency: "USD" },
      },
    ],
    total: { amount: 500.0, currency: "USD" },
    currency: "USD",
    status: "pending",
    ...overrides,
  };
}
