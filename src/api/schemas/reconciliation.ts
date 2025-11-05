import { z } from "zod";

export const ReconciliationRequestSchema = z.object({
  invoiceId: z.string().uuid(),
  purchaseOrderId: z.string().uuid(),
  tolerance: z.number().min(0).max(5).default(2.0),
});

export const ReconciliationStatusSchema = z.enum([
  "pending",
  "processing",
  "matched",
  "failed",
  "manual_review",
]);

export const ReconciliationResponseSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  purchaseOrderId: z.string().uuid(),
  status: ReconciliationStatusSchema,
  confidence: z.number().min(0).max(1),
  matchedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export type ReconciliationRequest = z.infer<typeof ReconciliationRequestSchema>;
export type ReconciliationResponse = z.infer<typeof ReconciliationResponseSchema>;
