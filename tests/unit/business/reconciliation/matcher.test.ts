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

    it("should return no match when no POs match", async () => {
      const invoice = createTestInvoice({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget X",
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
            description: "Widget Y",
            quantity: 5,
            unitPrice: { amount: 25.00, currency: "USD" },
            total: { amount: 125.00, currency: "USD" },
          },
        ],
      });

      const result = await matcher.matchInvoice(invoice, [po]);

      assertEquals(result.bestMatch, null);
      assertEquals(result.confidence, 0);
      assertExists(result.reasons, "Expected reasons to be defined");
      assertEquals(result.reasons.includes("No matching purchase orders found"), true);
    });

    it("should handle different currencies in explanation", async () => {
      const invoice = createTestInvoice({
        currency: "EUR",
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "EUR" },
            total: { amount: 500.00, currency: "EUR" },
          },
        ],
      });

      const po = createTestPurchaseOrder({
        currency: "USD",
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
      assertExists(result.reasons, "Expected reasons to be defined for currency mismatch");
      assertEquals(result.reasons.some(r => r.includes("Currency conversion")), true);
    });

    it("should handle quantity tolerance at threshold", async () => {
      const invoice = createTestInvoice({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,  // Smaller difference from PO
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
          {
            id: crypto.randomUUID(),
            description: "Widget B",
            quantity: 11,  // 10% more than PO, but balanced by exact match on Widget A
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 550.00, currency: "USD" },
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
          {
            id: crypto.randomUUID(),
            description: "Widget B",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
      });

      const result = await matcher.matchInvoice(invoice, [po]);

      assertExists(result.bestMatch);
      assertEquals(result.confidence > 0.8, true, `Expected confidence > 0.8 but got ${result.confidence}`);
    });

    it("should return alternatives in order of confidence", async () => {
      const invoice = createTestInvoice({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
          {
            id: crypto.randomUUID(),
            description: "Widget B",
            quantity: 5,
            unitPrice: { amount: 100.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
      });

      const exactPO = createTestPurchaseOrder({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
          {
            id: crypto.randomUUID(),
            description: "Widget B",
            quantity: 5,
            unitPrice: { amount: 100.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
      });

      const similarPO = createTestPurchaseOrder({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A",
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
          {
            id: crypto.randomUUID(),
            description: "Widget B - Red",  // Description difference
            quantity: 5,
            unitPrice: { amount: 100.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
      });

      const lessSimilarPO = createTestPurchaseOrder({
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "Widget A - Blue",  // Small description difference
            quantity: 10,
            unitPrice: { amount: 50.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
          {
            id: crypto.randomUUID(),
            description: "Widget B - Special Edition",  // Larger description difference
            quantity: 5,
            unitPrice: { amount: 100.00, currency: "USD" },
            total: { amount: 500.00, currency: "USD" },
          },
        ],
      });

      const result = await matcher.matchInvoice(invoice, [lessSimilarPO, exactPO, similarPO]);

      assertExists(result.bestMatch);
      assertEquals(result.bestMatch.id, exactPO.id);
      assertEquals(result.alternatives.length, 2);
      assertEquals(result.alternatives[0].purchaseOrder.id, similarPO.id);
      assertEquals(result.alternatives[1].purchaseOrder.id, lessSimilarPO.id);
      assertEquals(
        result.alternatives.every((alt, i, arr) =>
          i === 0 || alt.score.confidence <= arr[i-1].score.confidence
        ),
        true,
        "Alternatives should be ordered by descending confidence"
      );
    });
  });
});
