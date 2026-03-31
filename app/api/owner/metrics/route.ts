import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  let businessId: string | null = null;

  if (session?.user?.id) {
    const businessAccount = await prisma.businessAccount.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        businessId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    businessId = businessAccount?.businessId ?? null;
  }

  if (!businessId) {
    const fallbackBusiness = await prisma.business.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
    });
    businessId = fallbackBusiness?.id ?? null;
  }

  if (!businessId) {
    return Response.json({ ok: true, data: null });
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    activeMembers,
    rewardsClaimed,
    monthlyPurchaseAggregate,
    latestMetric,
    activeOffers,
  ] = await Promise.all([
    prisma.membership.count({
      where: {
        businessId,
        status: "ACTIVE",
      },
    }),
    prisma.redemption.count({
      where: {
        businessId,
        redeemedAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.purchase.aggregate({
      where: {
        businessId,
        capturedAt: {
          gte: monthStart,
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        amountCents: true,
      },
    }),
    prisma.monthlyMetric.findFirst({
      where: {
        businessId,
      },
      orderBy: {
        month: "desc",
      },
    }),
    prisma.reward.count({
      where: {
        businessId,
        isActive: true,
      },
    }),
  ]);

  const redemptionEfficiency =
    activeMembers > 0 ? Math.round((rewardsClaimed / activeMembers) * 100) : 0;

  return Response.json({
    ok: true,
    data: {
      activeMembers,
      rewardsClaimed,
      redemptionEfficiency,
      monthlyPurchases: monthlyPurchaseAggregate._count._all,
      monthlyRevenueCents: monthlyPurchaseAggregate._sum.amountCents ?? 0,
      retentionRate: latestMetric?.retentionRate ?? 0,
      activeOffers,
    },
  });
}
