import { Hono } from "hono";
import { errorHandler } from "./api/middleware/error.ts";
import { requestLogger } from "./api/middleware/logger.ts";
import healthRoutes from "./api/routes/health.ts";
import invoiceRoutes from "./api/routes/invoices.ts";
import reconciliationRoutes from "./api/routes/reconciliation.ts";
import { logger } from "./shared/utils/logger.ts";

export function createApp(): Hono {
  const app = new Hono();

  app.use("*", requestLogger);
  app.use("*", errorHandler);

  app.route("/", healthRoutes);
  app.route("/api/v1", invoiceRoutes);
  app.route("/api/v1", reconciliationRoutes);

  return app;
}

export function startServer(port: number): Deno.HttpServer {
  const app = createApp();

  logger.info("Starting server", { port, environment: Deno.env.get("ENVIRONMENT") ?? "development" });

  return Deno.serve({ port }, app.fetch);
}
