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

  const video = await prisma.video.update({
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

  return NextResponse.json(video);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await ctx.params;
  await prisma.themeVideo.deleteMany({ where: { videoId: id } });
  await prisma.theme.updateMany({
    where: { coverVideoId: id },
    data: { coverVideoId: null },
  });
  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
