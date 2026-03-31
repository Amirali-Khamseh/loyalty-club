import { OwnerDashboardTabs } from "@/components/owner/owner-dashboard-tabs";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-session";

function toDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getDashboardData() {
  const session = await getCurrentSession();

  let businessId: string | null = null;

  if (session?.user?.id) {
    const account = await prisma.businessAccount.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        businessId: true,
      },
    });

    businessId = account?.businessId ?? null;
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
    return null;
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const lookbackDays = 14;
  const lookbackStart = new Date();
  lookbackStart.setDate(lookbackStart.getDate() - (lookbackDays - 1));
  lookbackStart.setHours(0, 0, 0, 0);

  const [
    business,
    activeMembers,
    rewardsClaimed,
    monthlyPurchases,
    latestMetric,
    topRewards,
    activeMenu,
    activeOffers,
    purchasesForTrend,
    redemptionsForTrend,
  ] = await Promise.all([
    prisma.business.findUnique({
      where: {
        id: businessId,
      },
      include: {
        loyaltyProgram: true,
      },
    }),
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
      _sum: {
        amountCents: true,
      },
      _count: {
        _all: true,
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
    prisma.reward.findMany({
      where: {
        businessId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
      orderBy: {
        redemptions: {
          _count: "desc",
        },
      },
      take: 3,
    }),
    prisma.specialMenu.findFirst({
      where: {
        businessId,
        isActive: true,
      },
      include: {
        items: {
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.reward.count({
      where: {
        businessId,
        isActive: true,
      },
    }),
    prisma.purchase.findMany({
      where: {
        businessId,
        capturedAt: {
          gte: lookbackStart,
        },
      },
      select: {
        capturedAt: true,
        amountCents: true,
      },
      orderBy: {
        capturedAt: "asc",
      },
    }),
    prisma.redemption.findMany({
      where: {
        businessId,
        redeemedAt: {
          gte: lookbackStart,
        },
      },
      select: {
        redeemedAt: true,
      },
      orderBy: {
        redeemedAt: "asc",
      },
    }),
  ]);

  if (!business) {
    return null;
  }

  const dayBuckets = new Map<
    string,
    { day: string; visits: number; revenueCents: number; rewards: number }
  >();

  for (let offset = 0; offset < lookbackDays; offset += 1) {
    const date = new Date(lookbackStart);
    date.setDate(lookbackStart.getDate() + offset);

    const key = toDayKey(date);
    dayBuckets.set(key, {
      day: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      visits: 0,
      revenueCents: 0,
      rewards: 0,
    });
  }

  for (const purchase of purchasesForTrend) {
    const key = toDayKey(purchase.capturedAt);
    const current = dayBuckets.get(key);
    if (!current) {
      continue;
    }

    current.visits += 1;
    current.revenueCents += purchase.amountCents;
  }

  for (const redemption of redemptionsForTrend) {
    const key = toDayKey(redemption.redeemedAt);
    const current = dayBuckets.get(key);
    if (!current) {
      continue;
    }

    current.rewards += 1;
  }

  const dailySeries = Array.from(dayBuckets.values());

  const redemptionEfficiency =
    activeMembers > 0 ? Math.round((rewardsClaimed / activeMembers) * 100) : 0;

  return {
    businessName: business.name,
    businessSlug: business.slug,
    metrics: {
      activeMembers,
      rewardsClaimed,
      monthlyPurchases: monthlyPurchases._count._all,
      monthlyRevenueCents: monthlyPurchases._sum.amountCents ?? 0,
      retentionRate: latestMetric?.retentionRate ?? 0,
      activeOffers,
      redemptionEfficiency,
    },
    dailySeries,
    loyaltyProgram: business.loyaltyProgram
      ? {
          title: business.loyaltyProgram.title,
          visitsPerReward: business.loyaltyProgram.visitsPerReward,
          pointsPerDollar: business.loyaltyProgram.pointsPerDollar,
          rewardLabel: business.loyaltyProgram.rewardLabel,
          rewardDescription: business.loyaltyProgram.rewardDescription,
        }
      : null,
    topRewards: topRewards.map((reward) => ({
      id: reward.id,
      title: reward.title,
      requiredVisits: reward.requiredVisits,
      requiredPoints: reward.requiredPoints,
      claims: reward._count.redemptions,
    })),
    activeMenu: activeMenu
      ? {
          title: activeMenu.title,
          description: activeMenu.description,
          items: activeMenu.items.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            networkPriceCents: item.networkPriceCents,
            publicPriceCents: item.publicPriceCents,
          })),
        }
      : null,
  };
}

export default async function OwnerDashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="glass-surface rounded-3xl p-8 text-slate-200">
        No business data found. Run db setup and seed scripts to begin.
      </div>
    );
  }

  return (
    <OwnerDashboardTabs
      businessName={data.businessName}
      businessSlug={data.businessSlug}
      metrics={data.metrics}
      loyaltyProgram={data.loyaltyProgram}
      topRewards={data.topRewards}
      dailySeries={data.dailySeries}
      activeMenu={data.activeMenu}
    />
  );
}
