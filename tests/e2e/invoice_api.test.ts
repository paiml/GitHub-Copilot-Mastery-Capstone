/**
 * End-to-End Tests for Invoice API
 *
 * Tests critical user flows through the REST API:
 * - Health checks
 * - Invoice creation
 * - Invoice retrieval
 * - Reconciliation workflows
 */

import { assertEquals, assertExists } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import {
  createTestInvoiceData,
  setupBrowser,
  startServer,
  teardownBrowser,
  type TestContext,
  waitForServer,
} from "./setup.ts";

let context: TestContext;
let serverProcess: Deno.ChildProcess;
const BASE_URL = "http://localhost:9001";

describe("Invoice API E2E Tests", {
  sanitizeResources: false,
  sanitizeOps: false,
}, () => {
  beforeAll(async () => {
    // Start the server
    console.log("Starting server for e2e tests...");
    serverProcess = startServer();

    // Wait for server to be ready
    await waitForServer(BASE_URL);

    // Set up browser (not needed for API tests, but demonstrates capability)
    context = await setupBrowser();
  });

  afterAll(async () => {
    // Clean up
    if (context) {
      await teardownBrowser(context);
    }

    if (serverProcess) {
      try {
        // Check if process is still running before attempting cleanup
        const status = await Promise.race([
          serverProcess.status,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 100)),
        ]);

        // If status is null, process is still running
        if (status === null) {
          // Close streams before killing process
          try {
            await serverProcess.stdout.cancel();
          } catch {
            // Stream already closed
          }
          try {
            await serverProcess.stderr.cancel();
          } catch {
            // Stream already closed
          }
          serverProcess.kill("SIGTERM");
          await serverProcess.status;
        }
      } catch (_error) {
        // Process already terminated, nothing to do
      }
    }
  });

  describe("Health Endpoints", () => {
    it("should return healthy status from /health", async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();

      assertEquals(response.status, 200);
      assertEquals(data.status, "healthy");
      assertExists(data.timestamp);
    });

    it("should return ready status from /health/ready", async () => {
      const response = await fetch(`${BASE_URL}/health/ready`);
      const data = await response.json();

      assertEquals(response.status, 200);
      assertEquals(data.status, "ready");
      assertExists(data.uptime);
    });
  });

  describe("Invoice CRUD Operations", () => {
    it("should create a new invoice via POST /api/v1/invoices", async () => {
      const invoiceData = createTestInvoiceData();

      const response = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      assertEquals(response.status, 201);

      const data = await response.json();
      assertExists(data.id);
      assertEquals(data.invoiceNumber, invoiceData.invoiceNumber);
      assertEquals(data.currency, "USD");
    });

    it("should retrieve invoice by ID via GET /api/v1/invoices/:id", async () => {
      // Create an invoice first
      const invoiceData = createTestInvoiceData();
      const createResponse = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      const createdInvoice = await createResponse.json();

      // Retrieve it
      const getResponse = await fetch(
        `${BASE_URL}/api/v1/invoices/${createdInvoice.id}`,
      );

      assertEquals(getResponse.status, 200);

      const data = await getResponse.json();
      assertEquals(data.id, createdInvoice.id);
      assertEquals(data.invoiceNumber, invoiceData.invoiceNumber);
    });

    it("should return 404 for non-existent invoice", async () => {
      const fakeId = crypto.randomUUID();
      const response = await fetch(`${BASE_URL}/api/v1/invoices/${fakeId}`);

      assertEquals(response.status, 404);
    });

    it("should list all invoices via GET /api/v1/invoices", async () => {
      // Create a few invoices
      const invoice1 = createTestInvoiceData({ invoiceNumber: "INV-E2E-001" });
      const invoice2 = createTestInvoiceData({ invoiceNumber: "INV-E2E-002" });

      const resp1 = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice1),
      });
      await resp1.json(); // Consume response body

      const resp2 = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice2),
      });
      await resp2.json(); // Consume response body

      // List all
      const response = await fetch(`${BASE_URL}/api/v1/invoices`);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(Array.isArray(data), true);
      assertEquals(data.length >= 2, true);
    });

    it("should validate invoice data and reject invalid input", async () => {
      const invalidInvoice = {
        invoiceNumber: "", // Invalid: empty
        date: "not-a-date", // Invalid: bad date format
        currency: "INVALID", // Invalid: not in enum
      };

      const response = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidInvoice),
      });

      assertEquals(response.status, 400);

      const data = await response.json();
      assertEquals(data.type, "about:blank");
      assertExists(data.title);
    });
  });

  describe("Reconciliation Workflows", () => {
    it("should trigger reconciliation via POST /api/v1/reconciliations", async () => {
      // Create an invoice
      const invoiceData = createTestInvoiceData();
      const createResponse = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      const invoice = await createResponse.json();

      // Create a matching purchase order (mock data)
      const purchaseOrder = {
        id: crypto.randomUUID(),
        poNumber: "PO-12345",
        date: new Date().toISOString(),
        supplier: invoice.supplier,
        lineItems: invoice.lineItems,
        total: invoice.total,
        currency: invoice.currency,
      };

      // Trigger reconciliation
      const reconResponse = await fetch(`${BASE_URL}/api/v1/reconciliations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          purchaseOrder,
        }),
      });

      assertEquals(reconResponse.status, 200);

      const data = await reconResponse.json();
      assertExists(data.reconciliationId);
      assertEquals(data.status, "completed");
    });

    it("should retrieve reconciliation status via GET /api/v1/reconciliations/:id/status", async () => {
      // Create invoice and trigger reconciliation
      const invoiceData = createTestInvoiceData();
      const createResponse = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      const invoice = await createResponse.json();

      const purchaseOrder = {
        id: crypto.randomUUID(),
        poNumber: "PO-67890",
        date: new Date().toISOString(),
        supplier: invoice.supplier,
        lineItems: invoice.lineItems,
        total: invoice.total,
        currency: invoice.currency,
      };

      const reconResponse = await fetch(`${BASE_URL}/api/v1/reconciliations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          purchaseOrder,
        }),
      });

      const recon = await reconResponse.json();

      // Get status
      const statusResponse = await fetch(
        `${BASE_URL}/api/v1/reconciliations/${recon.reconciliationId}/status`,
      );

      assertEquals(statusResponse.status, 200);

      const statusData = await statusResponse.json();
      assertExists(statusData.status);
      assertExists(statusData.timestamp);
    });
  });

  describe("Multi-Currency Support", () => {
    it("should handle EUR currency invoice", async () => {
      const invoiceData = createTestInvoiceData({
        currency: "EUR",
        total: { amount: 500.0, currency: "EUR" },
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Euro Widget",
            quantity: 10,
            unitPrice: { amount: 50.0, currency: "EUR" },
            total: { amount: 500.0, currency: "EUR" },
          },
        ],
      });

      const response = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      assertEquals(response.status, 201);

      const data = await response.json();
      assertEquals(data.currency, "EUR");
    });

    it("should handle GBP currency invoice", async () => {
      const invoiceData = createTestInvoiceData({
        currency: "GBP",
        total: { amount: 500.0, currency: "GBP" },
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "British Widget",
            quantity: 10,
            unitPrice: { amount: 50.0, currency: "GBP" },
            total: { amount: 500.0, currency: "GBP" },
          },
        ],
      });

      const response = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      assertEquals(response.status, 201);

      const data = await response.json();
      assertEquals(data.currency, "GBP");
    });
  });

  describe("Error Handling", () => {
    it("should return RFC 7807 Problem Details for errors", async () => {
      const response = await fetch(`${BASE_URL}/api/v1/invoices/invalid-id`);

      assertEquals(response.status, 404);
      const contentType = response.headers.get("content-type") || "";
      assertEquals(
        contentType.includes("application/problem+json"),
        true,
      );

      const data = await response.json();
      assertEquals(data.type, "about:blank");
      assertExists(data.title);
      assertEquals(data.status, 404);
    });

    it("should handle malformed JSON gracefully", async () => {
      const response = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{invalid-json",
      });

      assertEquals(response.status >= 400 && response.status < 500, true);
    });
  });
});
