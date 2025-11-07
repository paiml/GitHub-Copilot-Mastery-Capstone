// Currency types
export type CurrencyCode = "USD" | "EUR" | "GBP" | "AUD" | "CAD";

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

// Invoice types
export interface Supplier {
  id: string;
  name: string;
  taxId?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: Money;
  total: Money;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  date: Date | string;
  dueDate: Date | string;
  supplier: Supplier;
  lineItems: InvoiceLineItem[];
  total: Money;
  currency: CurrencyCode;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Purchase Order types
export interface PurchaseOrderLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: Money;
  total: Money;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: Date | string;
  supplierId: string;
  lineItems: PurchaseOrderLineItem[];
  total: Money;
  currency: CurrencyCode;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Exchange Rate types
export interface ExchangeRate {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  timestamp: Date;
}

// Reconciliation types
export interface MatchScore {
  confidence: number;
  matchedItems: number;
  totalItems: number;
}

export interface MatchCandidate {
  purchaseOrder: PurchaseOrder;
  score: MatchScore;
}

export interface MatchResult {
  bestMatch: PurchaseOrder | null;
  confidence: number;
  alternatives: MatchCandidate[];
  reasons?: string[];
}

export interface ReconciliationContext {
  invoice: Invoice;
  purchaseOrder: PurchaseOrder;
  [key: string]: unknown;
}

export interface RuleResult {
  passed: boolean;
  message: string;
  severity: "info" | "warning" | "error";
  details?: Record<string, unknown>;
}

export interface EvaluationResult {
  passed: boolean;
  results: RuleResult[];
  warnings: RuleResult[];
}

// Audit Log types
export interface AuditLog {
  id?: string;
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  changes: Record<string, unknown>;
  timestamp: Date;
}
