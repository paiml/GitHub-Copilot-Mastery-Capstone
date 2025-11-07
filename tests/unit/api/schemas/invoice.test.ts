import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { InvoiceSchema } from "../../../../src/api/schemas/invoice.ts";

describe("InvoiceSchema", () => {
  it("should validate valid invoice", () => {
    const validInvoice = {
      invoiceNumber: "INV-123456",
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

    const result = InvoiceSchema.safeParse(validInvoice);
    assertEquals(result.success, true);
  });

  it("should reject invalid invoice number", () => {
    const invalidInvoice = {
      invoiceNumber: "INVALID",
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

    const result = InvoiceSchema.safeParse(invalidInvoice);
    assertEquals(result.success, false);
  });

  it("should reject invoice with mismatched total", () => {
    const invalidInvoice = {
      invoiceNumber: "INV-123456",
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
      total: { amount: 600.00, currency: "USD" },
      currency: "USD",
    };

    const result = InvoiceSchema.safeParse(invalidInvoice);
    assertEquals(result.success, false);
  });
});
