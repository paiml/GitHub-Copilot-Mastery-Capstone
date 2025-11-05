import { Hono } from "hono";
import { ReconciliationRequestSchema } from "../schemas/reconciliation.ts";
import { validateRequest } from "../middleware/validation.ts";
import { logger } from "../../shared/utils/logger.ts";

const app = new Hono();

const reconciliations: Map<string, unknown> = new Map();

app.post("/reconciliations", validateRequest(ReconciliationRequestSchema), async (c) => {
  const request = c.get("validatedData");
  const id = crypto.randomUUID();

  const reconciliation = {
    id,
    ...request,
    status: "processing",
    confidence: 0,
    createdAt: new Date().toISOString(),
  };

  reconciliations.set(id, reconciliation);

  logger.info("Reconciliation started", {
    reconciliationId: id,
    invoiceId: request.invoiceId,
    purchaseOrderId: request.purchaseOrderId,
  });

  return c.json(reconciliation, 202);
});

app.get("/reconciliations/:id", (c) => {
  const id = c.req.param("id");
  const reconciliation = reconciliations.get(id);

  if (!reconciliation) {
    return c.json(
      {
        type: "https://api.xero.com/problems/not-found",
        title: "Reconciliation Not Found",
        status: 404,
        detail: `Reconciliation with ID ${id} not found`,
      },
      404,
    );
  }

  return c.json(reconciliation);
});

app.get("/reconciliations/:id/status", (c) => {
  const id = c.req.param("id");
  const reconciliation = reconciliations.get(id) as {
    status: string;
    confidence: number;
  } | undefined;

  if (!reconciliation) {
    return c.json(
      {
        type: "https://api.xero.com/problems/not-found",
        title: "Reconciliation Not Found",
        status: 404,
        detail: `Reconciliation with ID ${id} not found`,
      },
      404,
    );
  }

  return c.json({
    id,
    status: reconciliation.status,
    confidence: reconciliation.confidence,
  });
});

export default app;
