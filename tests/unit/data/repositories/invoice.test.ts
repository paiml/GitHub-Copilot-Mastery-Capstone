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
        assertEquals(result.value.length >= 1, true);
        assertEquals(result.value.every((inv) => inv.status === "pending"), true);
      }
    });
  });
});
