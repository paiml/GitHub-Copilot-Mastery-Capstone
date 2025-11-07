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

  findById(id: string): Promise<Result<T, Error>> {
    const entity = this.data.get(id);
    if (!entity) {
      return Promise.resolve(Err(new Error(`Entity missing: ${id}`)));
    }
    return Promise.resolve(Ok(entity));
  }

  findAll(filter?: Partial<T>): Promise<Result<T[], Error>> {
    try {
      let results = Array.from(this.data.values());

      if (filter) {
        results = results.filter((entity) => {
          return Object.entries(filter).every(([key, value]) => {
            return (entity as Record<string, unknown>)[key] === value;
          });
        });
      }

      return Promise.resolve(Ok(results));
    } catch (error) {
      return Promise.resolve(Err(error as Error));
    }
  }

  create(entity: Omit<T, "id">): Promise<Result<T, Error>> {
    try {
      const id = crypto.randomUUID();
      const newEntity = { ...entity, id } as T;
      this.data.set(id, newEntity);
      return Promise.resolve(Ok(newEntity));
    } catch (error) {
      return Promise.resolve(Err(error as Error));
    }
  }

  update(id: string, updates: Partial<T>): Promise<Result<T, Error>> {
    const existing = this.data.get(id);
    if (!existing) {
      return Promise.resolve(Err(new Error(`Entity missing: ${id}`)));
    }

    const updated = { ...existing, ...updates, id };
    this.data.set(id, updated);
    return Promise.resolve(Ok(updated));
  }

  delete(id: string): Promise<Result<void, Error>> {
    const exists = this.data.has(id);
    if (!exists) {
      return Promise.resolve(Err(new Error(`Entity missing: ${id}`)));
    }

    this.data.delete(id);
    return Promise.resolve(Ok(undefined));
  }
}
