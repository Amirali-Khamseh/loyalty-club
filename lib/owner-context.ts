import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function resolveOwnerBusinessId() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const businessAccount = await prisma.businessAccount.findFirst({
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

    if (businessAccount?.businessId) {
      return businessAccount.businessId;
    }
  }

  const fallbackBusiness = await prisma.business.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  return fallbackBusiness?.id ?? null;
}
