import { z } from "zod";

export const joinShopSchema = z.object({
  businessSlug: z.string().trim().min(2).max(120),
});

export type JoinShopInput = z.infer<typeof joinShopSchema>;
