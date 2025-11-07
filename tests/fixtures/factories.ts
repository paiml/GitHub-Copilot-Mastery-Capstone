import type { Invoice, PurchaseOrder } from "../../src/shared/types/invoice.ts";

export function createTestInvoice(overrides?: Partial<Invoice>): Invoice {
  return {
    id: crypto.randomUUID(),
    invoiceNumber: `INV-${Math.floor(Math.random() * 900000 + 100000)}`,
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 86400000),
    supplier: {
      id: crypto.randomUUID(),
      name: "Test Supplier Inc",
      taxId: "12-3456789",
    },
    lineItems: [
      {
        id: crypto.randomUUID(),
        description: "Test Product",
        quantity: 10,
        unitPrice: { amount: 50.00, currency: "USD" },
        total: { amount: 500.00, currency: "USD" },
      },
    ],
    total: { amount: 500.00, currency: "USD" },
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
    poNumber: `PO-${Math.floor(Math.random() * 900000 + 100000)}`,
    date: new Date(),
    supplierId: crypto.randomUUID(),
    lineItems: [
      {
        id: crypto.randomUUID(),
        description: "Test Product",
        quantity: 10,
        unitPrice: { amount: 50.00, currency: "USD" },
        total: { amount: 500.00, currency: "USD" },
      },
    ],
    total: { amount: 500.00, currency: "USD" },
    currency: "USD",
    status: "approved",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
