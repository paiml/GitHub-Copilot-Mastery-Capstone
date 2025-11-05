import type {
  EvaluationResult,
  ReconciliationContext,
  RuleResult,
} from "../../shared/types/invoice.ts";
import { BusinessRuleViolationError } from "../../shared/errors/business.ts";

export interface Rule<T> {
  evaluate(context: T): RuleResult;
  explain(): string;
}

export class ToleranceRule implements Rule<ReconciliationContext> {
  constructor(
    private tolerance: number,
    private field: string,
  ) {}

  evaluate(context: ReconciliationContext): RuleResult {
    const expected = (context.purchaseOrder as Record<string, number>)[this.field];
    const actual = (context.invoice as Record<string, number>)[this.field];

    if (typeof expected !== "number" || typeof actual !== "number") {
      return {
        passed: true,
        message: `${this.field} comparison skipped (non-numeric values)`,
        severity: "info",
      };
    }

    const diff = Math.abs(actual - expected) / expected;

    if (diff <= this.tolerance / 100) {
      return {
        passed: true,
        message: `${this.field} within ${this.tolerance}% tolerance`,
        severity: "info",
      };
    }

    return {
      passed: false,
      message:
        `${this.field} exceeds ${this.tolerance}% tolerance (${(diff * 100).toFixed(2)}%)`,
      severity: diff <= 0.05 ? "warning" : "error",
      details: { expected, actual, tolerance: this.tolerance },
    };
  }

  explain(): string {
    return `${this.field} must be within ${this.tolerance}% of expected value`;
  }
}

export class RuleEngine {
  private rules: Rule<ReconciliationContext>[] = [];

  addRule(rule: Rule<ReconciliationContext>): this {
    this.rules.push(rule);
    return this;
  }

  async evaluate(context: ReconciliationContext): Promise<EvaluationResult> {
    const results: RuleResult[] = [];

    for (const rule of this.rules) {
      const result = rule.evaluate(context);
      results.push(result);

      if (!result.passed && result.severity === "error") {
        throw new BusinessRuleViolationError(
          `Rule violation: ${rule.explain()}`,
          { rule: rule.explain(), result },
        );
      }
    }

    return {
      passed: results.every((r) => r.passed),
      results,
      warnings: results.filter((r) => !r.passed && r.severity === "warning"),
    };
  }
}
