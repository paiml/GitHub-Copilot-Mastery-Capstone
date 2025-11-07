import { BaseError } from "./base.ts";

export class ValidationError extends BaseError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class SchemaValidationError extends BaseError {
  constructor(message: string, details?: unknown) {
    super(message, "SCHEMA_VALIDATION_ERROR", 400, details);
  }
}
