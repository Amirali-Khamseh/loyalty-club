import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveOwnerBusinessId } from "@/lib/owner-context";
import { createRewardSchema, updateRewardSchema } from "@/lib/validators/owner";

const rewardIdSchema = z.object({
  rewardId: z.string().cuid(),
});

const updateRewardWithIdSchema = rewardIdSchema.extend({
  data: updateRewardSchema,
});

export async function POST(request: Request) {
  const businessId = await resolveOwnerBusinessId();

  if (!businessId) {
    return Response.json(
      { ok: false, error: "Business not found" },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createRewardSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: "Invalid payload",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  const reward = await prisma.reward.create({
    data: {
      businessId,
      title: payload.title,
      description: payload.description,
      requiredVisits: payload.requiredVisits,
      requiredPoints: payload.requiredPoints,
      isSpecialMenuAccess: payload.isSpecialMenuAccess,
      isActive: true,
    },
  });

  return Response.json({ ok: true, reward });
}

export async function PUT(request: Request) {
  const businessId = await resolveOwnerBusinessId();

  if (!businessId) {
    return Response.json(
      { ok: false, error: "Business not found" },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = updateRewardWithIdSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: "Invalid payload",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  const existing = await prisma.reward.findFirst({
    where: {
      id: payload.rewardId,
      businessId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return Response.json(
      { ok: false, error: "Reward not found" },
      { status: 404 },
    );
  }

  const reward = await prisma.reward.update({
    where: {
      id: payload.rewardId,
    },
    data: {
      title: payload.data.title,
      description: payload.data.description,
      requiredVisits: payload.data.requiredVisits,
      requiredPoints: payload.data.requiredPoints,
      isSpecialMenuAccess: payload.data.isSpecialMenuAccess,
      isActive: payload.data.isActive,
    },
  });

  return Response.json({ ok: true, reward });
}

export async function DELETE(request: Request) {
  const businessId = await resolveOwnerBusinessId();

  if (!businessId) {
    return Response.json(
      { ok: false, error: "Business not found" },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = rewardIdSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: "Invalid payload",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const existing = await prisma.reward.findFirst({
    where: {
      id: parsed.data.rewardId,
      businessId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return Response.json(
      { ok: false, error: "Reward not found" },
      { status: 404 },
    );
  }

  await prisma.reward.delete({
    where: {
      id: parsed.data.rewardId,
    },
  });

  return Response.json({ ok: true });
}
