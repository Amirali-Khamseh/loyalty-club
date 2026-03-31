import { RewardType } from "@prisma/client";
import { z } from "zod";

export const updateProgramSchema = z.object({
  title: z.string().trim().min(2).max(120),
  visitsPerReward: z.number().int().min(1).max(10_000),
  pointsPerDollar: z.number().int().min(0).max(1_000),
  rewardLabel: z.string().trim().min(2).max(100),
  rewardDescription: z.string().trim().max(500).nullable().optional(),
  rewardType: z.nativeEnum(RewardType),
  pointsExpireInDays: z.number().int().min(0).max(3_650).nullable(),
});

const rewardThresholdSchema = z.number().int().min(1).max(1_000_000).nullable();

export const createRewardSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().max(500).nullable().optional(),
    requiredVisits: rewardThresholdSchema,
    requiredPoints: rewardThresholdSchema,
    isSpecialMenuAccess: z.boolean().default(false),
  })
  .refine(
    (value) => value.requiredVisits !== null || value.requiredPoints !== null,
    {
      message: "At least one requirement is required.",
      path: ["requiredVisits"],
    },
  );

export const updateRewardSchema = createRewardSchema.extend({
  isActive: z.boolean().optional(),
});

export const createSpecialMenuSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

export const updateSpecialMenuSchema = createSpecialMenuSchema;

export const createSpecialMenuItemSchema = z.object({
  menuId: z.string().cuid(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  publicPriceCents: z
    .number()
    .int()
    .min(1)
    .max(10_000_000)
    .optional()
    .nullable(),
  networkPriceCents: z.number().int().min(1).max(10_000_000),
  isActive: z.boolean().default(true),
});

export const updateSpecialMenuItemSchema = createSpecialMenuItemSchema.omit({
  menuId: true,
});

export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type CreateRewardInput = z.infer<typeof createRewardSchema>;
export type UpdateRewardInput = z.infer<typeof updateRewardSchema>;
export type CreateSpecialMenuInput = z.infer<typeof createSpecialMenuSchema>;
export type UpdateSpecialMenuInput = z.infer<typeof updateSpecialMenuSchema>;
export type CreateSpecialMenuItemInput = z.infer<
  typeof createSpecialMenuItemSchema
>;
export type UpdateSpecialMenuItemInput = z.infer<
  typeof updateSpecialMenuItemSchema
>;
