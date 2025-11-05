import { BaseError } from "./base.ts";

export class BusinessError extends BaseError {
  constructor(
    message: string,
    code: string,
    details?: unknown,
  ) {
    super(message, code, 422, details);
  }
}

export class BusinessRuleViolationError extends BusinessError {
  constructor(message: string, details?: unknown) {
    super(message, "BUSINESS_RULE_VIOLATION", details);
  }
}

export class ToleranceExceededError extends BusinessError {
  constructor(
    field: string,
    expected: number,
    actual: number,
    tolerance: number,
  ) {
    const diff = ((Math.abs(actual - expected) / expected) * 100).toFixed(2);
    super(
      `${field} exceeds tolerance: ${diff}% (max ${tolerance}%)`,
      "TOLERANCE_EXCEEDED",
      { field, expected, actual, tolerance, difference: diff },
    );
  }
}

export class InsufficientDataError extends BusinessError {
  constructor(message: string, details?: unknown) {
    super(message, "INSUFFICIENT_DATA", details);
  }
}
