import { Hono } from "hono";
import { ReconciliationRequestSchema } from "../schemas/reconciliation.ts";
import { validateRequest } from "../middleware/validation.ts";
import { logger } from "../../shared/utils/logger.ts";

type Variables = {
  validatedData: unknown;
};

const app = new Hono<{ Variables: Variables }>();

const reconciliations: Map<string, unknown> = new Map();

app.post("/reconciliations", validateRequest(ReconciliationRequestSchema), (c) => {
  const request = c.get("validatedData") as Record<string, unknown>;
  const reconciliationId = crypto.randomUUID();

  const reconciliation = {
    reconciliationId,
    ...request,
    status: "completed",
    confidence: 100,
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };

  reconciliations.set(reconciliationId, reconciliation);

  logger.info("Reconciliation completed", {
    reconciliationId,
    invoiceId: request.invoiceId as string,
  });

  return c.json(reconciliation, 200);
});

app.get("/reconciliations/:id", (c) => {
  const id = c.req.param("id");
  const reconciliation = reconciliations.get(id);

  if (!reconciliation) {
    return c.json(
      {
        type: "https://api.pretendco.com/problems/not-found",
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
    timestamp: string;
  } | undefined;

  if (!reconciliation) {
    return c.json(
      {
        type: "https://api.pretendco.com/problems/not-found",
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
    timestamp: reconciliation.timestamp,
  });
});

export default app;
