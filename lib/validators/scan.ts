import { z } from "zod";

export const capturePurchaseSchema = z.object({
  businessSlug: z.string().min(2).max(120),
  memberCode: z.string().min(3).max(64),
  amountCents: z.number().int().positive().max(10_000_000),
  note: z.string().max(280).optional(),
  externalReference: z.string().max(120).optional(),
});

export type CapturePurchaseInput = z.infer<typeof capturePurchaseSchema>;
