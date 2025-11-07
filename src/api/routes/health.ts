import { Hono } from "hono";

const app = new Hono();
const startTime = Date.now();

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/health/ready", (c) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  return c.json({
    status: "ready",
    timestamp: new Date().toISOString(),
    uptime,
  });
});

export default app;
