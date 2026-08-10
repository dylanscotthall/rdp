import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await ctx.params;
  const { caption, locationId, featured, featuredOrder, featuredLarge } =
    await req.json();

  const image = await prisma.image.update({
    where: { id },
    data: {
      ...(caption !== undefined && { caption }),
      ...(locationId !== undefined && {
        locationId: locationId ? Number(locationId) : null,
      }),
      ...(featured !== undefined && { featured }),
      ...(featuredOrder !== undefined && { featuredOrder }),
      ...(featuredLarge !== undefined && { featuredLarge }),
    },
    include: { location: true },
  });

  return NextResponse.json(image);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await ctx.params;
  await prisma.themeImage.deleteMany({ where: { imageId: id } });
  await prisma.theme.updateMany({
    where: { coverImageId: id },
    data: { coverImageId: null },
  });
  await prisma.image.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
