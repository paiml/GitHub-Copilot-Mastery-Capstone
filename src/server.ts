import { Hono } from "hono";
import { serveStatic } from "https://deno.land/x/hono@v3.11.7/middleware.ts";
import { errorHandler } from "./api/middleware/error.ts";
import { requestLogger } from "./api/middleware/logger.ts";
import { setupOpenAPI } from "./api/openapi.ts";
import healthRoutes from "./api/routes/health.ts";
import invoiceRoutes from "./api/routes/invoices.ts";
import reconciliationRoutes from "./api/routes/reconciliation.ts";
import { logger } from "./shared/utils/logger.ts";

export function createApp(): Hono {
  const app = new Hono();

  app.use("*", requestLogger);
  app.use("*", errorHandler);

  // Setup OpenAPI documentation
  setupOpenAPI(app);

  // Health and API routes must be registered BEFORE static files
  app.route("/", healthRoutes);
  app.route("/api/v1", invoiceRoutes);
  app.route("/api/v1", reconciliationRoutes);

  // Handle favicon.ico to prevent 404 errors
  app.get("/favicon.ico", (c) => c.body(null, 204));

  // Serve static files from public directory (must be last)
  app.use("/*", serveStatic({ root: "./public" }));

  return app;
}

export function startServer(port: number): Deno.HttpServer {
  const app = createApp();

  logger.info("Starting server", {
    port,
    environment: Deno.env.get("ENVIRONMENT") ?? "development",
  });

  return Deno.serve({ port }, app.fetch);
}
