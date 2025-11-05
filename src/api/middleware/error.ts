import type { Context, Next } from "hono";
import { BaseError } from "../../shared/errors/base.ts";
import { logger } from "../../shared/utils/logger.ts";

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    if (error instanceof BaseError) {
      logger.error(error.message, error, {
        code: error.code,
        path: c.req.path,
        method: c.req.method,
      });

      return c.json(
        {
          type: `https://api.xero.com/problems/${error.code.toLowerCase().replace(/_/g, "-")}`,
          title: error.name,
          status: error.statusCode,
          detail: error.message,
          ...(error.details && { errors: error.details }),
        },
        error.statusCode,
      );
    }

    logger.error("Unhandled error", error as Error, {
      path: c.req.path,
      method: c.req.method,
    });

    return c.json(
      {
        type: "https://api.xero.com/problems/internal-error",
        title: "Internal Server Error",
        status: 500,
        detail: "An unexpected error occurred",
      },
      500,
    );
  }
}
