import { z } from "zod";

export const CurrencyCodeSchema = z.enum(["USD", "EUR", "GBP", "AUD", "CAD"]);

export const MoneySchema = z.object({
  amount: z.number().positive().multipleOf(0.0001),
  currency: CurrencyCodeSchema,
});

export const LineItemSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1).max(500),
  quantity: z.number().int().positive(),
  unitPrice: MoneySchema,
  total: MoneySchema,
});

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  taxId: z.string().optional(),
});

export const InvoiceSchema = z.object({
  invoiceNumber: z.string().regex(/^INV-\d{6}$/),
  date: z.string().datetime(),
  dueDate: z.string().datetime(),
  supplier: SupplierSchema,
  lineItems: z.array(LineItemSchema).min(1),
  total: MoneySchema,
  currency: CurrencyCodeSchema,
}).refine((data) => {
  const lineItemTotal = data.lineItems.reduce((sum, item) => sum + item.total.amount, 0);
  const tolerance = 0.01;
  return Math.abs(lineItemTotal - data.total.amount) <= tolerance;
}, {
  message: "Invoice total must match sum of line items",
});

export type InvoiceInput = z.infer<typeof InvoiceSchema>;
