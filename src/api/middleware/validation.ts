import type { Context, Next } from "hono";
import { z } from "zod";

export function validateRequest<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const parsed = schema.parse(body);
      c.set("validatedData", parsed);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            type: "https://api.xero.com/problems/validation-error",
            title: "Request Validation Failed",
            status: 400,
            detail: "One or more fields failed validation",
            errors: error.format(),
          },
          400,
        );
      }
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
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const parsed = schema.parse(query);
      c.set("validatedQuery", parsed);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            type: "https://api.xero.com/problems/validation-error",
            title: "Query Validation Failed",
            status: 400,
            detail: "One or more query parameters failed validation",
            errors: error.format(),
          },
          400,
        );
      }
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
  };
}
