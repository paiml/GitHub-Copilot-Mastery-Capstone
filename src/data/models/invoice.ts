import type { Invoice, InvoiceLineItem, Supplier } from "../../shared/types/invoice.ts";

export function createInvoice(data: Partial<Invoice>): Invoice {
  return {
    id: data.id ?? crypto.randomUUID(),
    invoiceNumber: data.invoiceNumber ?? "",
    date: data.date ?? new Date(),
    dueDate: data.dueDate ?? new Date(),
    supplier: data.supplier ?? {} as Supplier,
    lineItems: data.lineItems ?? [] as InvoiceLineItem[],
    total: data.total ?? { amount: 0, currency: "USD" },
    currency: data.currency ?? "USD",
    status: data.status ?? "pending",
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
}
