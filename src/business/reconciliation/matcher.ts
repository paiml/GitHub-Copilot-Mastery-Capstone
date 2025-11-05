import type {
  Invoice,
  InvoiceLineItem,
  MatchCandidate,
  MatchResult,
  MatchScore,
  Money,
  PurchaseOrder,
  PurchaseOrderLineItem,
} from "../../shared/types/invoice.ts";
import { config } from "../../shared/utils/config.ts";

export class InvoiceMatcher {
  private readonly DESCRIPTION_THRESHOLD = config.reconciliation.descriptionThreshold;
  private readonly PRICE_TOLERANCE = config.reconciliation.priceTolerancePct / 100;
  private readonly QUANTITY_TOLERANCE = config.reconciliation.quantityTolerancePct / 100;
  private readonly CONFIDENCE_THRESHOLD = config.reconciliation.confidenceThreshold;

  async matchInvoice(
    invoice: Invoice,
    purchaseOrders: PurchaseOrder[],
  ): Promise<MatchResult> {
    const candidates: MatchCandidate[] = [];

    for (const po of purchaseOrders) {
      const score = this.calculateMatchScore(invoice, po);
      if (score.confidence >= this.CONFIDENCE_THRESHOLD) {
        candidates.push({ purchaseOrder: po, score });
      }
    }

    candidates.sort((a, b) => b.score.confidence - a.score.confidence);

    return {
      bestMatch: candidates[0]?.purchaseOrder ?? null,
      confidence: candidates[0]?.score.confidence ?? 0,
      alternatives: candidates.slice(1, 4),
      reasons: this.explainMatch(invoice, candidates[0]),
    };
  }

  private calculateMatchScore(invoice: Invoice, po: PurchaseOrder): MatchScore {
    const scores: number[] = [];

    for (const invItem of invoice.lineItems) {
      const poItem = po.lineItems.find((item) => this.matchesLineItem(invItem, item));
      if (poItem) {
        scores.push(this.calculateLineItemScore(invItem, poItem));
      }
    }

    return {
      confidence: scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0,
      matchedItems: scores.length,
      totalItems: invoice.lineItems.length,
    };
  }

  private matchesLineItem(
    invItem: InvoiceLineItem,
    poItem: PurchaseOrderLineItem,
  ): boolean {
    const descSimilarity = this.calculateLevenshtein(
      invItem.description.toLowerCase(),
      poItem.description.toLowerCase(),
    );

    if (descSimilarity < this.DESCRIPTION_THRESHOLD) {
      return false;
    }

    const qtyDiff = Math.abs(invItem.quantity - poItem.quantity) / poItem.quantity;
    if (qtyDiff > this.QUANTITY_TOLERANCE) {
      return false;
    }

    const priceDiff = Math.abs(invItem.unitPrice.amount - poItem.unitPrice.amount) /
      poItem.unitPrice.amount;
    if (priceDiff > this.PRICE_TOLERANCE) {
      return false;
    }

    return true;
  }

  private calculateLineItemScore(
    invItem: InvoiceLineItem,
    poItem: PurchaseOrderLineItem,
  ): number {
    const descSimilarity = this.calculateLevenshtein(
      invItem.description.toLowerCase(),
      poItem.description.toLowerCase(),
    );

    const qtyDiff = Math.abs(invItem.quantity - poItem.quantity) / poItem.quantity;
    const qtyScore = 1 - qtyDiff;

    const priceDiff = Math.abs(invItem.unitPrice.amount - poItem.unitPrice.amount) /
      poItem.unitPrice.amount;
    const priceScore = 1 - priceDiff;

    return (descSimilarity * 0.4 + qtyScore * 0.3 + priceScore * 0.3);
  }

  private calculateLevenshtein(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - (distance / maxLen);
  }

  private explainMatch(
    invoice: Invoice,
    candidate?: MatchCandidate,
  ): string[] {
    if (!candidate) {
      return ["No matching purchase orders found"];
    }

    const reasons: string[] = [];
    const { purchaseOrder, score } = candidate;

    reasons.push(
      `Matched ${score.matchedItems} of ${score.totalItems} line items`,
    );
    reasons.push(`Overall confidence: ${(score.confidence * 100).toFixed(1)}%`);

    if (invoice.currency !== purchaseOrder.currency) {
      reasons.push(
        `Currency conversion applied: ${invoice.currency} → ${purchaseOrder.currency}`,
      );
    }

    return reasons;
  }
}
