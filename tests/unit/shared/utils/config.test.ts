import { assertEquals, assertExists } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import { config, getEnv, getEnvNumber } from "../../../../src/shared/utils/config.ts";

describe("Config", () => {
  describe("config object", () => {
    it("should have port configuration", () => {
      assertExists(config.port);
      assertEquals(typeof config.port, "number");
    });

    it("should have environment configuration", () => {
      assertExists(config.environment);
      assertEquals(
        ["development", "staging", "production"].includes(config.environment),
        true,
      );
    });

    it("should have database configuration", () => {
      assertExists(config.database);
      assertExists(config.database.url);
      assertEquals(typeof config.database.poolSize, "number");
    });

    it("should have exchange rate configuration", () => {
      assertExists(config.exchangeRate);
      assertExists(config.exchangeRate.apiUrl);
      assertEquals(typeof config.exchangeRate.cacheTtl, "number");
    });

    it("should have reconciliation thresholds", () => {
      assertExists(config.reconciliation);
      assertEquals(config.reconciliation.descriptionThreshold, 0.85);
      assertEquals(config.reconciliation.priceTolerancePct, 2.0);
      assertEquals(config.reconciliation.quantityTolerancePct, 2.0);
      assertEquals(config.reconciliation.confidenceThreshold, 0.9);
    });

    it("should have valid numeric values", () => {
      assertEquals(config.port > 0, true);
      assertEquals(config.database.poolSize > 0, true);
      assertEquals(config.exchangeRate.cacheTtl > 0, true);
    });
  });

  describe("getEnv function", () => {
    const testKey = "TEST_CONFIG_VAR_STRING";

    afterEach(() => {
      Deno.env.delete(testKey);
    });

    it("should return environment variable when set", () => {
      Deno.env.set(testKey, "custom-value");
      const result = getEnv(testKey, "default");
      assertEquals(result, "custom-value");
    });

    it("should return default when environment variable not set", () => {
      Deno.env.delete(testKey);
      const result = getEnv(testKey, "default-value");
      assertEquals(result, "default-value");
    });

    it("should handle empty string environment variable", () => {
      Deno.env.set(testKey, "");
      const result = getEnv(testKey, "default");
      assertEquals(result, "");
    });
  });

  describe("getEnvNumber function", () => {
    const testKey = "TEST_CONFIG_VAR_NUMBER";

    afterEach(() => {
      Deno.env.delete(testKey);
    });

    it("should return parsed number when environment variable is set", () => {
      Deno.env.set(testKey, "12345");
      const result = getEnvNumber(testKey, 999);
      assertEquals(result, 12345);
    });

    it("should return default when environment variable not set", () => {
      Deno.env.delete(testKey);
      const result = getEnvNumber(testKey, 888);
      assertEquals(result, 888);
    });

    it("should parse negative numbers", () => {
      Deno.env.set(testKey, "-456");
      const result = getEnvNumber(testKey, 0);
      assertEquals(result, -456);
    });

    it("should return default for empty string", () => {
      Deno.env.set(testKey, "");
      const result = getEnvNumber(testKey, 777);
      assertEquals(result, 777);
    });

    it("should handle zero value", () => {
      Deno.env.set(testKey, "0");
      const result = getEnvNumber(testKey, 100);
      assertEquals(result, 0);
    });
  });
});
