import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Err, Ok } from "../../../../src/shared/types/result.ts";

describe("Result", () => {
  describe("Ok", () => {
    it("should create Ok result", () => {
      const result = Ok(42);
      assertEquals(result.ok, true);
      assertEquals(result.value, 42);
      assertEquals(result.isOk(), true);
      assertEquals(result.isErr(), false);
    });
  });

  describe("Err", () => {
    it("should create Err result", () => {
      const error = new Error("test error");
      const result = Err(error);
      assertEquals(result.ok, false);
      assertEquals(result.error, error);
      assertEquals(result.isOk(), false);
      assertEquals(result.isErr(), true);
    });
  });
});
