import { assertEquals, assertStringIncludes } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { setupTestEnvironment, teardownTestEnvironment, type TestContext } from "./setup.ts";

const BASE_URL = Deno.env.get("TEST_BASE_URL") || "http://localhost:8000";

describe("Index Page E2E Tests", {
  sanitizeResources: false,
  sanitizeOps: false,
}, () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await setupTestEnvironment(true);
  });

  afterAll(async () => {
    await teardownTestEnvironment(context);
  });

  describe("Page Load", () => {
    it("should load the index page successfully", async () => {
      const response = await context.page.goto(BASE_URL);
      assertEquals(response?.status(), 200);
    });

    it("should display the correct title", async () => {
      await context.page.goto(BASE_URL);
      const title = await context.page.title();
      assertStringIncludes(title, "Invoice Reconciliation Engine");
    });

    it("should display page content", async () => {
      await context.page.goto(BASE_URL);
      const content = await context.page.content();
      assertStringIncludes(content, "Invoice Reconciliation Engine");
      assertStringIncludes(content, "Quick Start");
    });
  });

  describe("Navigation Links", () => {
    it("should have working health check link", async () => {
      await context.page.goto(BASE_URL);
      const healthLink = await context.page.locator('a[href="/health"]');
      const count = await healthLink.count();
      assertEquals(count > 0, true);

      // Click and verify navigation
      const [response] = await Promise.all([
        context.page.waitForResponse((resp) => resp.url().includes("/health")),
        healthLink.click(),
      ]);
      assertEquals(response.status(), 200);
    });

    it("should have working API docs link", async () => {
      await context.page.goto(BASE_URL);
      const apiDocsLink = await context.page.locator('a[href="/api/docs"]');
      const count = await apiDocsLink.count();
      assertEquals(count > 0, true);

      // Click and verify navigation
      const [response] = await Promise.all([
        context.page.waitForResponse((resp) => resp.url().includes("/api/docs")),
        apiDocsLink.click(),
      ]);
      assertEquals(response.status(), 200);
    });

    it("should have working Swagger UI link", async () => {
      await context.page.goto(BASE_URL);
      const swaggerLink = await context.page.locator('a[href="/api/swagger"]');
      const count = await swaggerLink.count();
      assertEquals(count > 0, true);

      // Click and verify navigation
      await swaggerLink.first().click();
      await context.page.waitForLoadState("networkidle");

      const content = await context.page.content();
      assertStringIncludes(content, "swagger-ui");
    });
  });

  describe("Health Status Indicator", () => {
    it("should fetch and display health status", async () => {
      await context.page.goto(BASE_URL);
      await context.page.waitForTimeout(2000); // Wait for health check
      const content = await context.page.content();
      assertStringIncludes(content, "System Status");
    });

    it("should show green indicator for healthy status", async () => {
      await context.page.goto(BASE_URL);
      await context.page.waitForTimeout(2000); // Wait for health check
      const indicator = await context.page.locator(".status-indicator");
      const classes = await indicator.getAttribute("class");
      assertStringIncludes(classes || "", "healthy");
    });
  });

  describe("Quick Start Commands", () => {
    it("should display make quality command", async () => {
      await context.page.goto(BASE_URL);
      const content = await context.page.content();
      assertStringIncludes(content, "make quality");
    });

    it("should display make build command", async () => {
      await context.page.goto(BASE_URL);
      const content = await context.page.content();
      assertStringIncludes(content, "make build");
    });

    it("should display make dev command", async () => {
      await context.page.goto(BASE_URL);
      const content = await context.page.content();
      assertStringIncludes(content, "make dev");
    });

    it("should display curl health check command", async () => {
      await context.page.goto(BASE_URL);
      const content = await context.page.content();
      assertStringIncludes(content, "curl http://localhost:9001/health");
    });
  });

  describe("Responsive Design", () => {
    it("should be mobile responsive", async () => {
      await context.page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await context.page.goto(BASE_URL);

      const container = await context.page.locator(".container");
      assertEquals(await container.isVisible(), true);
    });

    it("should be tablet responsive", async () => {
      await context.page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await context.page.goto(BASE_URL);

      const container = await context.page.locator(".container");
      assertEquals(await container.isVisible(), true);
    });

    it("should be desktop responsive", async () => {
      await context.page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
      await context.page.goto(BASE_URL);

      const container = await context.page.locator(".container");
      assertEquals(await container.isVisible(), true);
    });
  });
});
