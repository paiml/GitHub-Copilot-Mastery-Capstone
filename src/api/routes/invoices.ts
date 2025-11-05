import { Hono } from "hono";
import { InvoiceSchema } from "../schemas/invoice.ts";
import { validateRequest } from "../middleware/validation.ts";
import { logger } from "../../shared/utils/logger.ts";

const app = new Hono();

const invoices: Map<string, unknown> = new Map();

app.post("/invoices", validateRequest(InvoiceSchema), async (c) => {
  const invoice = c.get("validatedData");
  const id = crypto.randomUUID();

  const invoiceWithId = {
    id,
    ...invoice,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  invoices.set(id, invoiceWithId);

  logger.info("Invoice created", { invoiceId: id, invoiceNumber: invoice.invoiceNumber });

  return c.json(invoiceWithId, 201);
});

app.get("/invoices/:id", (c) => {
  const id = c.req.param("id");
  const invoice = invoices.get(id);

  if (!invoice) {
    return c.json(
      {
        type: "https://api.xero.com/problems/not-found",
        title: "Invoice Not Found",
        status: 404,
        detail: `Invoice with ID ${id} not found`,
      },
      404,
    );
  }

  return c.json(invoice);
});

app.get("/invoices", (c) => {
  const allInvoices = Array.from(invoices.values());
  return c.json({
    data: allInvoices,
    total: allInvoices.length,
  });
});

export default app;
