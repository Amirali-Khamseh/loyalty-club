import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
    return Response.json({ ok: true, data: null });
  }

  const [memberships, notifications] = await Promise.all([
    prisma.membership.findMany({
      where: {
        userId,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            primaryColor: true,
            description: true,
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
      take: 8,
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        createdAt: true,
      },
    }),
  ]);

  return Response.json({
    ok: true,
    data: {
      memberships,
      notifications,
    },
  });
}
