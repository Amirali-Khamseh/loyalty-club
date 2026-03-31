import {
  BusinessPlanTier,
  BusinessAccountRole,
  MembershipStatus,
  NewsletterStatus,
  NotificationType,
  PlatformRole,
  PrismaClient,
  RedemptionStatus,
  RewardType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.pointsLedger.deleteMany();
  await prisma.qRScanEvent.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.specialMenuItem.deleteMany();
  await prisma.specialMenu.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.monthlyMetric.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.loyaltyProgram.deleteMany();
  await prisma.businessSubscription.deleteMany();
  await prisma.businessAccount.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  const owner = await prisma.user.create({
    data: {
      name: "Amina Owner",
      email: "owner@precisionconcierge.dev",
      role: PlatformRole.OWNER,
      image: "https://i.pravatar.cc/200?img=12",
    },
  });

  const member = await prisma.user.create({
    data: {
      name: "Sara J",
      email: "sara@precisionconcierge.dev",
      role: PlatformRole.USER,
      image: "https://i.pravatar.cc/200?img=36",
    },
  });

  const business = await prisma.business.create({
    data: {
      name: "The Artisan Bakery",
      slug: "artisan-bakery",
      description: "Local boulangerie with an elite loyalty network program.",
      primaryColor: "#ba9eff",
      planTier: BusinessPlanTier.PRO,
      seatLimit: 1,
    },
  });

  const secondBusiness = await prisma.business.create({
    data: {
      name: "Indigo Roasters",
      slug: "indigo-roasters",
      description: "Specialty coffee for neighborhood regulars.",
      primaryColor: "#8b5cf6",
      planTier: BusinessPlanTier.BASIC,
      seatLimit: 1,
    },
  });

  await prisma.businessAccount.create({
    data: {
      userId: owner.id,
      businessId: business.id,
      role: BusinessAccountRole.OWNER,
      isActive: true,
    },
  });

  await prisma.businessSubscription.createMany({
    data: [
      {
        businessId: business.id,
        planTier: BusinessPlanTier.PRO,
        seatLimit: 1,
        status: "active",
        billingProvider: "placeholder",
        billingReference: "stub_pro_001",
      },
      {
        businessId: secondBusiness.id,
        planTier: BusinessPlanTier.BASIC,
        seatLimit: 1,
        status: "active",
        billingProvider: "placeholder",
        billingReference: "stub_basic_001",
      },
    ],
  });

  await prisma.loyaltyProgram.createMany({
    data: [
      {
        businessId: business.id,
        title: "Loyalty Blueprint",
        visitsPerReward: 10,
        pointsPerDollar: 10,
        rewardLabel: "Free loaf",
        rewardDescription:
          "Unlock a complimentary artisan loaf after 10 visits.",
        rewardType: RewardType.HYBRID,
        pointsExpireInDays: 365,
      },
      {
        businessId: secondBusiness.id,
        title: "Coffee Momentum",
        visitsPerReward: 5,
        pointsPerDollar: 6,
        rewardLabel: "Free handcrafted drink",
        rewardDescription:
          "Collect momentum points and claim your drink reward.",
        rewardType: RewardType.POINTS,
        pointsExpireInDays: 180,
      },
    ],
  });

  const bakeryMembership = await prisma.membership.create({
    data: {
      userId: member.id,
      businessId: business.id,
      memberCode: "LC-9821",
      status: MembershipStatus.ACTIVE,
      visitsCount: 8,
      pointsBalance: 720,
    },
  });

  const coffeeMembership = await prisma.membership.create({
    data: {
      userId: member.id,
      businessId: secondBusiness.id,
      memberCode: "LC-5542",
      status: MembershipStatus.ACTIVE,
      visitsCount: 3,
      pointsBalance: 245,
    },
  });

  const [purchaseOne, purchaseTwo] = await Promise.all([
    prisma.purchase.create({
      data: {
        membershipId: bakeryMembership.id,
        businessId: business.id,
        capturedById: owner.id,
        amountCents: 1899,
        pointsEarned: 190,
        visitsEarned: 1,
        purchaseNote: "Signature espresso roast",
      },
    }),
    prisma.purchase.create({
      data: {
        membershipId: coffeeMembership.id,
        businessId: secondBusiness.id,
        amountCents: 950,
        pointsEarned: 57,
        visitsEarned: 1,
        purchaseNote: "Nitro cold brew",
      },
    }),
  ]);

  await prisma.pointsLedger.createMany({
    data: [
      {
        membershipId: bakeryMembership.id,
        purchaseId: purchaseOne.id,
        pointsDelta: 190,
        reason: "purchase",
      },
      {
        membershipId: coffeeMembership.id,
        purchaseId: purchaseTwo.id,
        pointsDelta: 57,
        reason: "purchase",
      },
    ],
  });

  const premiumReward = await prisma.reward.create({
    data: {
      businessId: business.id,
      title: "Weekend Brunch Voucher",
      description: "Exclusive loyalty voucher for network members.",
      requiredVisits: 10,
      requiredPoints: 600,
      isActive: true,
    },
  });

  await prisma.redemption.create({
    data: {
      rewardId: premiumReward.id,
      membershipId: bakeryMembership.id,
      businessId: business.id,
      status: RedemptionStatus.CLAIMED,
    },
  });

  const menu = await prisma.specialMenu.create({
    data: {
      businessId: business.id,
      title: "Gold Member Specials",
      description: "Premium items available to loyalty network members.",
      isActive: true,
    },
  });

  await prisma.specialMenuItem.createMany({
    data: [
      {
        menuId: menu.id,
        title: "Vintage Reserve Selection",
        description: "Cellar reserve bottle with network pricing.",
        publicPriceCents: 12500,
        networkPriceCents: 8500,
      },
      {
        menuId: menu.id,
        title: "45-Day Dry Aged Wagyu",
        description: "Premium reserve cut with private member pricing.",
        publicPriceCents: 18000,
        networkPriceCents: 14500,
      },
      {
        menuId: menu.id,
        title: "The Concierge Grand Dessert",
        description: "Complimentary for registered anniversary month members.",
        publicPriceCents: 4500,
        networkPriceCents: 0,
      },
    ],
  });

  await prisma.newsletter.create({
    data: {
      businessId: business.id,
      subject: "Double Points Weekend",
      content:
        "Earn double points across all specialty coffee partners this Friday through Sunday.",
      status: NewsletterStatus.SCHEDULED,
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 8),
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: member.id,
        businessId: business.id,
        type: NotificationType.REWARD_UNLOCKED,
        title: "Reward unlocked",
        body: "You are 2 visits away from your free loaf reward.",
      },
      {
        userId: member.id,
        businessId: business.id,
        type: NotificationType.NEWSLETTER,
        title: "Double points weekend",
        body: "Check out this week\'s special multiplier announcement.",
      },
    ],
  });

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  await prisma.monthlyMetric.create({
    data: {
      businessId: business.id,
      month: firstOfMonth,
      purchasesCount: 1284,
      purchasesAmountCents: 2468500,
      rewardsClaimed: 452,
      activeMembers: 1284,
      retentionRate: 74,
    },
  });

  await prisma.qRScanEvent.create({
    data: {
      businessId: business.id,
      membershipId: bakeryMembership.id,
      scannedById: owner.id,
      purchaseId: purchaseOne.id,
      rawCode: bakeryMembership.memberCode,
      status: "captured",
    },
  });

  console.log("Seed complete:", {
    owner: owner.email,
    member: member.email,
    businesses: [business.slug, secondBusiness.slug],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
