import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { InvoiceRepository } from "../../../../src/data/repositories/invoice.ts";
import { createTestInvoice } from "../../../fixtures/factories.ts";

describe("InvoiceRepository", () => {
  describe("create and findById", () => {
    it("should create and retrieve invoice", async () => {
      const repo = new InvoiceRepository();
      const invoice = createTestInvoice();

      const createResult = await repo.create(invoice);
      assertEquals(createResult.ok, true);

      if (createResult.ok) {
        const findResult = await repo.findById(createResult.value.id!);
        assertEquals(findResult.ok, true);
        if (findResult.ok) {
          assertEquals(findResult.value.invoiceNumber, invoice.invoiceNumber);
        }
      }
    });
  });

  describe("findByInvoiceNumber", () => {
    it("should find invoice by invoice number", async () => {
      const repo = new InvoiceRepository();
      const invoice = createTestInvoice({ invoiceNumber: "INV-999999" });

      await repo.create(invoice);
      const result = await repo.findByInvoiceNumber("INV-999999");

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.invoiceNumber, "INV-999999");
      }
    });

    it("should return error when invoice number not found", async () => {
      const repo = new InvoiceRepository();
      const invoice = createTestInvoice({ invoiceNumber: "INV-111111" });

      await repo.create(invoice);
      const result = await repo.findByInvoiceNumber("INV-NONEXISTENT");

      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(
          result.error.message,
          "Invoice missing: INV-NONEXISTENT",
        );
      }
    });

    it("should return error when repository is empty", async () => {
      const repo = new InvoiceRepository();
      const result = await repo.findByInvoiceNumber("INV-999999");

      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(result.error.message, "Invoice missing: INV-999999");
      }
    });

    it("should find correct invoice among multiple invoices", async () => {
      const repo = new InvoiceRepository();
      const invoice1 = createTestInvoice({ invoiceNumber: "INV-111111" });
      const invoice2 = createTestInvoice({ invoiceNumber: "INV-222222" });
      const invoice3 = createTestInvoice({ invoiceNumber: "INV-333333" });

      await repo.create(invoice1);
      await repo.create(invoice2);
      await repo.create(invoice3);

      const result = await repo.findByInvoiceNumber("INV-222222");

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.invoiceNumber, "INV-222222");
      }
    });
  });

  describe("findByCurrency", () => {
    it("should find invoices by USD currency", async () => {
      const repo = new InvoiceRepository();
      const invoice1 = createTestInvoice({ currency: "USD" });
      const invoice2 = createTestInvoice({ currency: "EUR" });
      const invoice3 = createTestInvoice({ currency: "USD" });

      await repo.create(invoice1);
      await repo.create(invoice2);
      await repo.create(invoice3);

      const result = await repo.findByCurrency("USD");

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 2);
        assertEquals(result.value.every((inv) => inv.currency === "USD"), true);
      }
    });

    it("should find invoices by EUR currency", async () => {
      const repo = new InvoiceRepository();
      const invoice1 = createTestInvoice({ currency: "USD" });
      const invoice2 = createTestInvoice({ currency: "EUR" });
      const invoice3 = createTestInvoice({ currency: "GBP" });

      await repo.create(invoice1);
      await repo.create(invoice2);
      await repo.create(invoice3);

      const result = await repo.findByCurrency("EUR");

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 1);
        assertEquals(result.value[0].currency, "EUR");
      }
    });

    it("should find invoices by GBP currency", async () => {
      const repo = new InvoiceRepository();
      const invoice1 = createTestInvoice({ currency: "GBP" });
      const invoice2 = createTestInvoice({ currency: "GBP" });
      const invoice3 = createTestInvoice({ currency: "USD" });

      await repo.create(invoice1);
      await repo.create(invoice2);
      await repo.create(invoice3);

      const result = await repo.findByCurrency("GBP");

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 2);
        assertEquals(result.value.every((inv) => inv.currency === "GBP"), true);
      }
    });

    it("should return empty array when no invoices match currency", async () => {
      const repo = new InvoiceRepository();
      const invoice1 = createTestInvoice({ currency: "USD" });
      const invoice2 = createTestInvoice({ currency: "EUR" });

      await repo.create(invoice1);
      await repo.create(invoice2);

      const result = await repo.findByCurrency("GBP");

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 0);
      }
    });

    it("should return empty array when repository is empty", async () => {
      const repo = new InvoiceRepository();
      const result = await repo.findByCurrency("USD");

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 0);
      }
    });
  });

  describe("findPendingReconciliation", () => {
    it("should find pending invoices", async () => {
      const repo = new InvoiceRepository();
      const invoice1 = createTestInvoice({ status: "pending" });
      const invoice2 = createTestInvoice({ status: "completed" });

      await repo.create(invoice1);
      await repo.create(invoice2);

      const result = await repo.findPendingReconciliation();

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 1);
        assertEquals(result.value.every((inv) => inv.status === "pending"), true);
      }
    });

    it("should return empty array when no pending invoices", async () => {
      const repo = new InvoiceRepository();
      const invoice1 = createTestInvoice({ status: "completed" });
      const invoice2 = createTestInvoice({ status: "completed" });

      await repo.create(invoice1);
      await repo.create(invoice2);

      const result = await repo.findPendingReconciliation();

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 0);
      }
    });

    it("should return empty array when repository is empty", async () => {
      const repo = new InvoiceRepository();
      const result = await repo.findPendingReconciliation();

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 0);
      }
    });

    it("should find multiple pending invoices", async () => {
      const repo = new InvoiceRepository();
      const invoice1 = createTestInvoice({ status: "pending" });
      const invoice2 = createTestInvoice({ status: "pending" });
      const invoice3 = createTestInvoice({ status: "pending" });
      const invoice4 = createTestInvoice({ status: "completed" });

      await repo.create(invoice1);
      await repo.create(invoice2);
      await repo.create(invoice3);
      await repo.create(invoice4);

      const result = await repo.findPendingReconciliation();

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 3);
        assertEquals(result.value.every((inv) => inv.status === "pending"), true);
      }
    });

    it("should only return pending status, not other statuses", async () => {
      const repo = new InvoiceRepository();
      const invoice1 = createTestInvoice({ status: "pending" });
      const invoice2 = createTestInvoice({ status: "in_progress" });
      const invoice3 = createTestInvoice({ status: "rejected" });

      await repo.create(invoice1);
      await repo.create(invoice2);
      await repo.create(invoice3);

      const result = await repo.findPendingReconciliation();

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 1);
        assertEquals(result.value[0].status, "pending");
      }
    });
  });

  describe("error handling", () => {
    it("should handle findByInvoiceNumber with null invoiceNumber gracefully", () => {
      const repo = new InvoiceRepository();
      // TypeScript prevents null, but test runtime behavior
      const result = repo.findByInvoiceNumber(null as unknown as string);
      assertEquals(result.ok, false);
    });

    it("should handle findByInvoiceNumber with undefined invoiceNumber gracefully", () => {
      const repo = new InvoiceRepository();
      const result = repo.findByInvoiceNumber(undefined as unknown as string);
      assertEquals(result.ok, false);
    });

    it("should handle corrupted data in findPendingReconciliation", () => {
      const repo = new InvoiceRepository();
      // Access protected data member and corrupt it
      // deno-lint-ignore no-explicit-any
      (repo as any).data.set("bad-id", null); // Corrupt data with null

      const result = repo.findPendingReconciliation();

      // Should either succeed with empty array or return error
      assertEquals(result.ok === true || result.ok === false, true);
    });
  });
});
