import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { joinShopSchema } from "@/lib/validators/join-shop";

function createCandidateMemberCode() {
  const value = Math.floor(100000 + Math.random() * 900000);
  return `LC-${value}`;
}

async function generateUniqueMemberCode(
  tx: Omit<
    typeof prisma,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
) {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = createCandidateMemberCode();
    const existing = await tx.membership.findUnique({
      where: {
        memberCode: candidate,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Unable to generate unique member code");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = joinShopSchema.safeParse(body);

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

  let userId: string | null = session?.user?.id ?? null;
  if (!userId) {
    const fallbackUser = await prisma.user.findFirst({
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
    userId = fallbackUser?.id ?? null;
  }

  if (!userId) {
    return Response.json(
      { ok: false, error: "No active user found" },
      { status: 401 },
    );
  }

  const business = await prisma.business.findUnique({
    where: {
      slug: parsed.data.businessSlug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!business) {
    return Response.json(
      { ok: false, error: "Business not found" },
      { status: 404 },
    );
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_businessId: {
        userId,
        businessId: business.id,
      },
    },
    select: {
      id: true,
      memberCode: true,
      pointsBalance: true,
      visitsCount: true,
    },
  });

  if (existingMembership) {
    return Response.json({
      ok: true,
      alreadyJoined: true,
      business,
      membership: existingMembership,
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const memberCode = await generateUniqueMemberCode(tx);

    const membership = await tx.membership.create({
      data: {
        userId,
        businessId: business.id,
        memberCode,
      },
      select: {
        id: true,
        memberCode: true,
        pointsBalance: true,
        visitsCount: true,
      },
    });

    await tx.notification.create({
      data: {
        userId,
        businessId: business.id,
        type: "PROGRAM_UPDATE",
        title: "New shop added",
        body: `You joined ${business.name} in your loyalty network.`,
      },
    });

    return membership;
  });

  return Response.json({
    ok: true,
    alreadyJoined: false,
    business,
    membership: result,
  });
}
