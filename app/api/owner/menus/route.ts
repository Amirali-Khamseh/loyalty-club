import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveOwnerBusinessId } from "@/lib/owner-context";
import {
  createSpecialMenuSchema,
  updateSpecialMenuSchema,
} from "@/lib/validators/owner";

const menuIdSchema = z.object({
  menuId: z.string().cuid(),
});

const updateMenuWithIdSchema = menuIdSchema.extend({
  data: updateSpecialMenuSchema,
});

function toDateOrNull(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value);
}

export async function POST(request: Request) {
  const businessId = await resolveOwnerBusinessId();

  if (!businessId) {
    return Response.json(
      { ok: false, error: "Business not found" },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createSpecialMenuSchema.safeParse(body);

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

  const menu = await prisma.specialMenu.create({
    data: {
      businessId,
      title: payload.title,
      description: payload.description,
      isActive: payload.isActive,
      startsAt: toDateOrNull(payload.startsAt),
      endsAt: toDateOrNull(payload.endsAt),
    },
  });

  return Response.json({ ok: true, menu });
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
  const parsed = updateMenuWithIdSchema.safeParse(body);

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

  const existing = await prisma.specialMenu.findFirst({
    where: {
      id: payload.menuId,
      businessId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return Response.json(
      { ok: false, error: "Menu not found" },
      { status: 404 },
    );
  }

  const menu = await prisma.specialMenu.update({
    where: {
      id: payload.menuId,
    },
    data: {
      title: payload.data.title,
      description: payload.data.description,
      isActive: payload.data.isActive,
      startsAt: toDateOrNull(payload.data.startsAt),
      endsAt: toDateOrNull(payload.data.endsAt),
    },
  });

  return Response.json({ ok: true, menu });
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
  const parsed = menuIdSchema.safeParse(body);

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

  const existing = await prisma.specialMenu.findFirst({
    where: {
      id: parsed.data.menuId,
      businessId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return Response.json(
      { ok: false, error: "Menu not found" },
      { status: 404 },
    );
  }

  await prisma.specialMenu.delete({
    where: {
      id: parsed.data.menuId,
    },
  });

  return Response.json({ ok: true });
}
