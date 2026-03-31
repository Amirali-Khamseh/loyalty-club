import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveOwnerBusinessId } from "@/lib/owner-context";
import {
  createSpecialMenuItemSchema,
  updateSpecialMenuItemSchema,
} from "@/lib/validators/owner";

const itemIdSchema = z.object({
  itemId: z.string().cuid(),
});

const updateItemWithIdSchema = itemIdSchema.extend({
  data: updateSpecialMenuItemSchema,
});

export async function POST(request: Request) {
  const businessId = await resolveOwnerBusinessId();

  if (!businessId) {
    return Response.json(
      { ok: false, error: "Business not found" },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createSpecialMenuItemSchema.safeParse(body);

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

  const menu = await prisma.specialMenu.findFirst({
    where: {
      id: payload.menuId,
      businessId,
    },
    select: {
      id: true,
    },
  });

  if (!menu) {
    return Response.json(
      { ok: false, error: "Menu not found" },
      { status: 404 },
    );
  }

  const item = await prisma.specialMenuItem.create({
    data: {
      menuId: payload.menuId,
      title: payload.title,
      description: payload.description,
      publicPriceCents: payload.publicPriceCents,
      networkPriceCents: payload.networkPriceCents,
      isActive: payload.isActive,
    },
  });

  return Response.json({ ok: true, item });
}

export async function PUT(request: Request) {
  const businessId = await resolveOwnerBusinessId();

  if (!businessId) {
    return Response.json(
      { ok: false, error: "Business not found" },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = updateItemWithIdSchema.safeParse(body);

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

  const existing = await prisma.specialMenuItem.findFirst({
    where: {
      id: payload.itemId,
      menu: {
        businessId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return Response.json(
      { ok: false, error: "Menu item not found" },
      { status: 404 },
    );
  }

  const item = await prisma.specialMenuItem.update({
    where: {
      id: payload.itemId,
    },
    data: {
      title: payload.data.title,
      description: payload.data.description,
      publicPriceCents: payload.data.publicPriceCents,
      networkPriceCents: payload.data.networkPriceCents,
      isActive: payload.data.isActive,
    },
  });

  return Response.json({ ok: true, item });
}

export async function DELETE(request: Request) {
  const businessId = await resolveOwnerBusinessId();

  if (!businessId) {
    return Response.json(
      { ok: false, error: "Business not found" },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = itemIdSchema.safeParse(body);

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

  const existing = await prisma.specialMenuItem.findFirst({
    where: {
      id: parsed.data.itemId,
      menu: {
        businessId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return Response.json(
      { ok: false, error: "Menu item not found" },
      { status: 404 },
    );
  }

  await prisma.specialMenuItem.delete({
    where: {
      id: parsed.data.itemId,
    },
  });

  return Response.json({ ok: true });
}
