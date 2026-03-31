import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const draftNewsletterSchema = z.object({
  subject: z.string().min(3).max(120),
  content: z.string().min(10).max(10_000),
  businessSlug: z.string().min(2).max(120).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = draftNewsletterSchema.safeParse(body);

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

  let businessId: string | null = null;

  if (parsed.data.businessSlug) {
    const business = await prisma.business.findUnique({
      where: {
        slug: parsed.data.businessSlug,
      },
      select: {
        id: true,
      },
    });
    businessId = business?.id ?? null;
  }

  if (!businessId && session?.user?.id) {
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
    return Response.json(
      { ok: false, error: "No business found for newsletter draft" },
      { status: 404 },
    );
  }

  const draft = await prisma.newsletter.create({
    data: {
      businessId,
      subject: parsed.data.subject,
      content: parsed.data.content,
      status: "DRAFT",
    },
    select: {
      id: true,
      subject: true,
      status: true,
      createdAt: true,
    },
  });

  return Response.json({
    ok: true,
    newsletter: draft,
  });
}
