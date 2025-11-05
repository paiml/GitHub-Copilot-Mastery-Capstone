import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/health/ready", (c) => {
  return c.json({
    status: "ready",
    timestamp: new Date().toISOString(),
  });
});

export default app;
