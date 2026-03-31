import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { capturePurchaseSchema } from "@/lib/validators/scan";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = capturePurchaseSchema.safeParse(body);

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

  const session = await getServerSession(authOptions);
  const payload = parsed.data;

  const business = await prisma.business.findUnique({
    where: { slug: payload.businessSlug },
    include: {
      loyaltyProgram: true,
      rewards: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!business) {
    return Response.json(
      { ok: false, error: "Business not found" },
      { status: 404 },
    );
  }

  const membership = await prisma.membership.findFirst({
    where: {
      businessId: business.id,
      memberCode: payload.memberCode,
    },
  });

  if (!membership) {
    return Response.json(
      { ok: false, error: "Member not found for this business" },
      { status: 404 },
    );
  }

  if (payload.externalReference) {
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        businessId: business.id,
        externalReference: payload.externalReference,
      },
      include: {
        membership: {
          select: {
            memberCode: true,
            pointsBalance: true,
            visitsCount: true,
          },
        },
      },
    });

    if (existingPurchase) {
      return Response.json({
        ok: true,
        idempotent: true,
        purchaseId: existingPurchase.id,
        memberCode: existingPurchase.membership.memberCode,
        pointsBalance: existingPurchase.membership.pointsBalance,
        visitsCount: existingPurchase.membership.visitsCount,
      });
    }
  }

  const pointsPerDollar = business.loyaltyProgram?.pointsPerDollar ?? 0;
  const pointsEarned = Math.floor(payload.amountCents / 100) * pointsPerDollar;
  const visitsEarned = 1;

  const transactionResult = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        businessId: business.id,
        membershipId: membership.id,
        capturedById: session?.user?.id,
        amountCents: payload.amountCents,
        pointsEarned,
        visitsEarned,
        purchaseNote: payload.note,
        externalReference: payload.externalReference,
      },
    });

    if (pointsEarned > 0) {
      await tx.pointsLedger.create({
        data: {
          membershipId: membership.id,
          purchaseId: purchase.id,
          pointsDelta: pointsEarned,
          reason: "purchase",
        },
      });
    }

    const updatedMembership = await tx.membership.update({
      where: { id: membership.id },
      data: {
        pointsBalance: {
          increment: pointsEarned,
        },
        visitsCount: {
          increment: visitsEarned,
        },
      },
      select: {
        id: true,
        memberCode: true,
        pointsBalance: true,
        visitsCount: true,
      },
    });

    await tx.qRScanEvent.create({
      data: {
        businessId: business.id,
        membershipId: membership.id,
        scannedById: session?.user?.id,
        purchaseId: purchase.id,
        rawCode: payload.memberCode,
        status: "captured",
      },
    });

    return {
      purchase,
      updatedMembership,
    };
  });

  const unlockedReward = business.rewards.find((reward) => {
    const meetsVisits =
      reward.requiredVisits === null ||
      reward.requiredVisits === undefined ||
      transactionResult.updatedMembership.visitsCount >= reward.requiredVisits;
    const meetsPoints =
      reward.requiredPoints === null ||
      reward.requiredPoints === undefined ||
      transactionResult.updatedMembership.pointsBalance >=
        reward.requiredPoints;
    return meetsVisits && meetsPoints;
  });

  return Response.json({
    ok: true,
    idempotent: false,
    purchaseId: transactionResult.purchase.id,
    memberCode: transactionResult.updatedMembership.memberCode,
    pointsEarned,
    visitsEarned,
    pointsBalance: transactionResult.updatedMembership.pointsBalance,
    visitsCount: transactionResult.updatedMembership.visitsCount,
    unlockedReward: unlockedReward
      ? {
          id: unlockedReward.id,
          title: unlockedReward.title,
        }
      : null,
  });
}
