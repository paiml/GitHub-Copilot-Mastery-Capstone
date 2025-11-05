import { Err, Ok, type Result } from "../../shared/types/result.ts";

export interface Repository<T> {
  findById(id: string): Promise<Result<T, Error>>;
  findAll(filter?: Partial<T>): Promise<Result<T[], Error>>;
  create(entity: Omit<T, "id">): Promise<Result<T, Error>>;
  update(id: string, entity: Partial<T>): Promise<Result<T, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}

export abstract class InMemoryRepository<T extends { id?: string }> implements Repository<T> {
  protected data: Map<string, T> = new Map();

  async findById(id: string): Promise<Result<T, Error>> {
    const entity = this.data.get(id);
    if (!entity) {
      return Err(new Error(`Entity not found: ${id}`));
    }
    return Ok(entity);
  }

  async findAll(filter?: Partial<T>): Promise<Result<T[], Error>> {
    try {
      let results = Array.from(this.data.values());

      if (filter) {
        results = results.filter((entity) => {
          return Object.entries(filter).every(([key, value]) => {
            return (entity as Record<string, unknown>)[key] === value;
          });
        });
      }

      return Ok(results);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async create(entity: Omit<T, "id">): Promise<Result<T, Error>> {
    try {
      const id = crypto.randomUUID();
      const newEntity = { ...entity, id } as T;
      this.data.set(id, newEntity);
      return Ok(newEntity);
    } catch (error) {
      return Err(error as Error);
    }
  }

  async update(id: string, updates: Partial<T>): Promise<Result<T, Error>> {
    const existing = this.data.get(id);
    if (!existing) {
      return Err(new Error(`Entity not found: ${id}`));
    }

    const updated = { ...existing, ...updates, id };
    this.data.set(id, updated);
    return Ok(updated);
  }

  async delete(id: string): Promise<Result<void, Error>> {
    const exists = this.data.has(id);
    if (!exists) {
      return Err(new Error(`Entity not found: ${id}`));
    }

    this.data.delete(id);
    return Ok(undefined);
  }
}
