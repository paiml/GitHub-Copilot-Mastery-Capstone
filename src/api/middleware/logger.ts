import type { Context, Next } from "hono";
import { logger } from "../../shared/utils/logger.ts";

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  c.set("requestId", requestId);

  logger.info("Request started", {
    requestId,
    method: c.req.method,
    path: c.req.path,
    userAgent: c.req.header("user-agent"),
  });

  await next();

  const duration = Date.now() - start;

  logger.info("Request completed", {
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
  });
}
