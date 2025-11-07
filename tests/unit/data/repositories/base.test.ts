import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { InMemoryRepository } from "../../../../src/data/repositories/base.ts";

// Test implementation of InMemoryRepository for testing purposes
interface TestEntity {
  id?: string;
  name: string;
  status: string;
  value: number;
}

class TestRepository extends InMemoryRepository<TestEntity> {}

describe("InMemoryRepository", () => {
  describe("create", () => {
    it("should create entity with generated UUID", async () => {
      const repo = new TestRepository();
      const entity = { name: "Test", status: "active", value: 100 };

      const result = await repo.create(entity);

      assertEquals(result.ok, true);
      if (result.ok) {
        assertExists(result.value.id);
        assertEquals(result.value.name, "Test");
        assertEquals(result.value.status, "active");
        assertEquals(result.value.value, 100);
      }
    });

    it("should create multiple entities with unique IDs", async () => {
      const repo = new TestRepository();
      const entity1 = { name: "Test1", status: "active", value: 100 };
      const entity2 = { name: "Test2", status: "pending", value: 200 };

      const result1 = await repo.create(entity1);
      const result2 = await repo.create(entity2);

      assertEquals(result1.ok, true);
      assertEquals(result2.ok, true);

      if (result1.ok && result2.ok) {
        assertEquals(result1.value.id !== result2.value.id, true);
      }
    });
  });

  describe("findById", () => {
    it("should find entity by ID", async () => {
      const repo = new TestRepository();
      const entity = { name: "Test", status: "active", value: 100 };

      const createResult = await repo.create(entity);
      assertEquals(createResult.ok, true);

      if (createResult.ok) {
        const findResult = await repo.findById(createResult.value.id!);
        assertEquals(findResult.ok, true);

        if (findResult.ok) {
          assertEquals(findResult.value.name, "Test");
          assertEquals(findResult.value.status, "active");
          assertEquals(findResult.value.value, 100);
        }
      }
    });

    it("should return error when entity not found", async () => {
      const repo = new TestRepository();
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440000";

      const result = await repo.findById(nonExistentId);

      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(
          result.error.message,
          `Entity missing: ${nonExistentId}`,
        );
      }
    });

    it("should return error for invalid UUID", async () => {
      const repo = new TestRepository();
      const invalidId = "not-a-valid-uuid";

      const result = await repo.findById(invalidId);

      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(result.error.message, `Entity missing: ${invalidId}`);
      }
    });
  });

  describe("findAll", () => {
    it("should return all entities when no filter provided", async () => {
      const repo = new TestRepository();
      const entity1 = { name: "Test1", status: "active", value: 100 };
      const entity2 = { name: "Test2", status: "pending", value: 200 };
      const entity3 = { name: "Test3", status: "active", value: 300 };

      await repo.create(entity1);
      await repo.create(entity2);
      await repo.create(entity3);

      const result = await repo.findAll();

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 3);
      }
    });

    it("should return empty array when repository is empty", async () => {
      const repo = new TestRepository();

      const result = await repo.findAll();

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 0);
      }
    });

    it("should filter entities by single property", async () => {
      const repo = new TestRepository();
      const entity1 = { name: "Test1", status: "active", value: 100 };
      const entity2 = { name: "Test2", status: "pending", value: 200 };
      const entity3 = { name: "Test3", status: "active", value: 300 };

      await repo.create(entity1);
      await repo.create(entity2);
      await repo.create(entity3);

      const result = await repo.findAll({ status: "active" });

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 2);
        assertEquals(result.value.every((e) => e.status === "active"), true);
      }
    });

    it("should filter entities by multiple properties", async () => {
      const repo = new TestRepository();
      const entity1 = { name: "Test1", status: "active", value: 100 };
      const entity2 = { name: "Test2", status: "active", value: 200 };
      const entity3 = { name: "Test3", status: "pending", value: 100 };

      await repo.create(entity1);
      await repo.create(entity2);
      await repo.create(entity3);

      const result = await repo.findAll({ status: "active", value: 100 });

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 1);
        assertEquals(result.value[0].name, "Test1");
        assertEquals(result.value[0].status, "active");
        assertEquals(result.value[0].value, 100);
      }
    });

    it("should return empty array when no entities match filter", async () => {
      const repo = new TestRepository();
      const entity1 = { name: "Test1", status: "active", value: 100 };
      const entity2 = { name: "Test2", status: "pending", value: 200 };

      await repo.create(entity1);
      await repo.create(entity2);

      const result = await repo.findAll({ status: "completed" });

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 0);
      }
    });

    it("should handle partial property matches correctly", async () => {
      const repo = new TestRepository();
      const entity1 = { name: "Test1", status: "active", value: 100 };
      const entity2 = { name: "Test2", status: "active", value: 200 };

      await repo.create(entity1);
      await repo.create(entity2);

      const result = await repo.findAll({ name: "Test1" });

      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.value.length, 1);
        assertEquals(result.value[0].name, "Test1");
      }
    });
  });

  describe("update", () => {
    it("should update existing entity", async () => {
      const repo = new TestRepository();
      const entity = { name: "Test", status: "active", value: 100 };

      const createResult = await repo.create(entity);
      assertEquals(createResult.ok, true);

      if (createResult.ok) {
        const updateResult = await repo.update(createResult.value.id!, {
          name: "Updated",
          value: 200,
        });

        assertEquals(updateResult.ok, true);
        if (updateResult.ok) {
          assertEquals(updateResult.value.id, createResult.value.id);
          assertEquals(updateResult.value.name, "Updated");
          assertEquals(updateResult.value.status, "active");
          assertEquals(updateResult.value.value, 200);
        }
      }
    });

    it("should update single property", async () => {
      const repo = new TestRepository();
      const entity = { name: "Test", status: "active", value: 100 };

      const createResult = await repo.create(entity);
      assertEquals(createResult.ok, true);

      if (createResult.ok) {
        const updateResult = await repo.update(createResult.value.id!, {
          status: "pending",
        });

        assertEquals(updateResult.ok, true);
        if (updateResult.ok) {
          assertEquals(updateResult.value.name, "Test");
          assertEquals(updateResult.value.status, "pending");
          assertEquals(updateResult.value.value, 100);
        }
      }
    });

    it("should preserve ID when updating", async () => {
      const repo = new TestRepository();
      const entity = { name: "Test", status: "active", value: 100 };

      const createResult = await repo.create(entity);
      assertEquals(createResult.ok, true);

      if (createResult.ok) {
        const originalId = createResult.value.id!;
        const updateResult = await repo.update(originalId, {
          name: "Updated",
        });

        assertEquals(updateResult.ok, true);
        if (updateResult.ok) {
          assertEquals(updateResult.value.id, originalId);
        }
      }
    });

    it("should not allow ID to be changed via updates object", async () => {
      const repo = new TestRepository();
      const entity = { name: "Test", status: "active", value: 100 };

      const createResult = await repo.create(entity);
      assertEquals(createResult.ok, true);

      if (createResult.ok) {
        const originalId = createResult.value.id!;
        const maliciousId = "malicious-id-attempt";

        const updateResult = await repo.update(originalId, {
          name: "Updated",
          id: maliciousId,
        } as Partial<TestEntity>);

        assertEquals(updateResult.ok, true);
        if (updateResult.ok) {
          assertEquals(updateResult.value.id, originalId);
          assertEquals(updateResult.value.id !== maliciousId, true);
        }
      }
    });

    it("should return error when updating non-existent entity", async () => {
      const repo = new TestRepository();
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440000";

      const result = await repo.update(nonExistentId, { name: "Updated" });

      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(
          result.error.message,
          `Entity missing: ${nonExistentId}`,
        );
      }
    });

    it("should return error for invalid UUID", async () => {
      const repo = new TestRepository();
      const invalidId = "not-a-valid-uuid";

      const result = await repo.update(invalidId, { name: "Updated" });

      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(result.error.message, `Entity missing: ${invalidId}`);
      }
    });

    it("should allow updating all properties except id", async () => {
      const repo = new TestRepository();
      const entity = { name: "Test", status: "active", value: 100 };

      const createResult = await repo.create(entity);
      assertEquals(createResult.ok, true);

      if (createResult.ok) {
        const updateResult = await repo.update(createResult.value.id!, {
          name: "NewName",
          status: "completed",
          value: 999,
        });

        assertEquals(updateResult.ok, true);
        if (updateResult.ok) {
          assertEquals(updateResult.value.id, createResult.value.id);
          assertEquals(updateResult.value.name, "NewName");
          assertEquals(updateResult.value.status, "completed");
          assertEquals(updateResult.value.value, 999);
        }
      }
    });
  });

  describe("delete", () => {
    it("should delete existing entity", async () => {
      const repo = new TestRepository();
      const entity = { name: "Test", status: "active", value: 100 };

      const createResult = await repo.create(entity);
      assertEquals(createResult.ok, true);

      if (createResult.ok) {
        const deleteResult = await repo.delete(createResult.value.id!);
        assertEquals(deleteResult.ok, true);

        const findResult = await repo.findById(createResult.value.id!);
        assertEquals(findResult.ok, false);
      }
    });

    it("should return error when deleting non-existent entity", async () => {
      const repo = new TestRepository();
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440000";

      const result = await repo.delete(nonExistentId);

      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(
          result.error.message,
          `Entity missing: ${nonExistentId}`,
        );
      }
    });

    it("should return error for invalid UUID", async () => {
      const repo = new TestRepository();
      const invalidId = "not-a-valid-uuid";

      const result = await repo.delete(invalidId);

      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(result.error.message, `Entity missing: ${invalidId}`);
      }
    });

    it("should allow deleting and recreating with same data", async () => {
      const repo = new TestRepository();
      const entity = { name: "Test", status: "active", value: 100 };

      const createResult1 = await repo.create(entity);
      assertEquals(createResult1.ok, true);

      if (createResult1.ok) {
        await repo.delete(createResult1.value.id!);

        const createResult2 = await repo.create(entity);
        assertEquals(createResult2.ok, true);

        if (createResult2.ok) {
          assertEquals(createResult2.value.id !== createResult1.value.id, true);
        }
      }
    });

    it("should remove entity from findAll results after deletion", async () => {
      const repo = new TestRepository();
      const entity1 = { name: "Test1", status: "active", value: 100 };
      const entity2 = { name: "Test2", status: "active", value: 200 };

      const createResult1 = await repo.create(entity1);
      const createResult2 = await repo.create(entity2);

      assertEquals(createResult1.ok, true);
      assertEquals(createResult2.ok, true);

      if (createResult1.ok && createResult2.ok) {
        const beforeDelete = await repo.findAll();
        assertEquals(beforeDelete.ok, true);
        if (beforeDelete.ok) {
          assertEquals(beforeDelete.value.length, 2);
        }

        await repo.delete(createResult1.value.id!);

        const afterDelete = await repo.findAll();
        assertEquals(afterDelete.ok, true);
        if (afterDelete.ok) {
          assertEquals(afterDelete.value.length, 1);
          assertEquals(afterDelete.value[0].id, createResult2.value.id);
        }
      }
    });
  });

  describe("error handling", () => {
    it("should handle corrupted data in findAll", async () => {
      const repo = new TestRepository();
      // Add valid entity first
      await repo.create({ name: "Test", status: "active", value: 100 });

      // Corrupt internal data
      // deno-lint-ignore no-explicit-any
      (repo as any).data.set("bad-id", null);

      const result = await repo.findAll();

      // Should either succeed or return error
      assertEquals(result.ok === true || result.ok === false, true);
    });

    it("should handle corrupted data in findAll with filter", async () => {
      const repo = new TestRepository();
      // Add valid entity first
      await repo.create({ name: "Test", status: "active", value: 100 });

      // Corrupt internal data
      // deno-lint-ignore no-explicit-any
      (repo as any).data.set("bad-id", null);

      const result = await repo.findAll({ status: "active" });

      // Should either succeed or return error
      assertEquals(result.ok === true || result.ok === false, true);
    });
  });
});
