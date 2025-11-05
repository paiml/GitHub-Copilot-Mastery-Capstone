import { BaseError } from "./base.ts";

export class ValidationError extends BaseError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class SchemaValidationError extends ValidationError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    this.code = "SCHEMA_VALIDATION_ERROR";
  }
}
