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
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
      });

      const po = createTestPurchaseOrder({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
      });

      const result = await matcher.matchInvoice(invoice, [po]);

      assertExists(result.bestMatch);
      assertEquals(result.bestMatch.id, po.id);
      assertEquals(result.confidence >= 0.9, true);
    });

    it("should match invoice with similar descriptions", async () => {
      const invoice = createTestInvoice({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A - Blue",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
      });

      const po = createTestPurchaseOrder({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A - Blu",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
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
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.50, currency: "USD" },
            total: { amount: 505.00, currency: "USD" },
          },
        ],
      });

      const po = createTestPurchaseOrder({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
      });

      const result = await matcher.matchInvoice(invoice, [po]);

      assertExists(result.bestMatch);
      assertEquals(result.confidence >= 0.9, true);
    });

    it("should return null for no matches", async () => {
      const invoice = createTestInvoice({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 100.00, currency: "USD" },
            total: { amount: 1000.00, currency: "USD" },
          },
        ],
      });

      const po = createTestPurchaseOrder({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget B",
            quantity: 20,
            unitPrice: { amount: 25.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
      });

      const result = await matcher.matchInvoice(invoice, [po]);

      assertEquals(result.bestMatch, null);
      assertEquals(result.confidence, 0);
    });
  });
});
