import { prisma } from "@/lib/prisma";
import { resolveOwnerBusinessId } from "@/lib/owner-context";
import { updateProgramSchema } from "@/lib/validators/owner";

export async function PUT(request: Request) {
  const businessId = await resolveOwnerBusinessId();

  if (!businessId) {
    return Response.json(
      { ok: false, error: "Business not found" },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProgramSchema.safeParse(body);

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

  const program = await prisma.loyaltyProgram.upsert({
    where: {
      businessId,
    },
    update: {
      title: payload.title,
      visitsPerReward: payload.visitsPerReward,
      pointsPerDollar: payload.pointsPerDollar,
      rewardLabel: payload.rewardLabel,
      rewardDescription: payload.rewardDescription,
      rewardType: payload.rewardType,
      pointsExpireInDays: payload.pointsExpireInDays,
    },
    create: {
      businessId,
      title: payload.title,
      visitsPerReward: payload.visitsPerReward,
      pointsPerDollar: payload.pointsPerDollar,
      rewardLabel: payload.rewardLabel,
      rewardDescription: payload.rewardDescription,
      rewardType: payload.rewardType,
      pointsExpireInDays: payload.pointsExpireInDays,
    },
  });

  return Response.json({
    ok: true,
    program: {
      id: program.id,
      title: program.title,
      visitsPerReward: program.visitsPerReward,
      pointsPerDollar: program.pointsPerDollar,
      rewardLabel: program.rewardLabel,
      rewardDescription: program.rewardDescription,
      rewardType: program.rewardType,
      pointsExpireInDays: program.pointsExpireInDays,
    },
  });
}
