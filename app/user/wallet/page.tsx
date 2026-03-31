import QRCode from "qrcode";
import { getCurrentSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { UserWalletTabs } from "@/components/user/user-wallet-tabs";

async function getWalletData() {
  const session = await getCurrentSession();

  let userId = session?.user?.id;

  if (!userId) {
    const fallback = await prisma.user.findFirst({
      where: {
        role: "USER",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
    });

    userId = fallback?.id;
  }

  if (!userId) {
    return null;
  }

  const [memberships, notifications] = await Promise.all([
    prisma.membership.findMany({
      where: {
        userId,
      },
      include: {
        business: {
          include: {
            loyaltyProgram: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    }),
  ]);

  const joinedBusinessIds = memberships.map(
    (membership) => membership.businessId,
  );

  const availableBusinesses = await prisma.business.findMany({
    where: {
      id: {
        notIn: joinedBusinessIds,
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });

  return { memberships, notifications, availableBusinesses };
}

export default async function UserWalletPage() {
  const walletData = await getWalletData();

  if (!walletData) {
    return (
      <div className="glass-surface rounded-3xl p-8 text-slate-200">
        No wallet records found. Seed the database to preview member experience.
      </div>
    );
  }

  const membershipsWithQr = await Promise.all(
    walletData.memberships.map(async (membership) => {
      const qrDataUrl = await QRCode.toDataURL(membership.memberCode, {
        width: 180,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      return {
        membership,
        qrDataUrl,
      };
    }),
  );

  const membershipCards = membershipsWithQr.map(
    ({ membership, qrDataUrl }) => ({
      id: membership.id,
      memberCode: membership.memberCode,
      pointsBalance: membership.pointsBalance,
      visitsCount: membership.visitsCount,
      qrDataUrl,
      business: {
        name: membership.business.name,
        description: membership.business.description,
        rewardLabel:
          membership.business.loyaltyProgram?.rewardLabel ?? "Reward",
        visitsPerReward:
          membership.business.loyaltyProgram?.visitsPerReward ?? 10,
      },
    }),
  );

  const activities = walletData.notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    createdAt: notification.createdAt.toISOString(),
  }));

  return (
    <UserWalletTabs
      membershipCards={membershipCards}
      activities={activities}
      availableBusinesses={walletData.availableBusinesses}
    />
  );
}
