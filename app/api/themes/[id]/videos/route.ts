import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const rows = await prisma.themeVideo.findMany({
    where: { themeId: Number(id) },
    include: { video: { include: { location: true } } },
    orderBy: { video: { createdAt: "desc" } },
  });
  return NextResponse.json(rows.map((r) => r.video));
}

export async function POST(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await ctx.params;
  const { videoId } = await req.json();
  const row = await prisma.themeVideo.create({
    data: { themeId: Number(id), videoId },
  });
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await ctx.params;
  const { videoId } = await req.json();
  await prisma.themeVideo.delete({
    where: { themeId_videoId: { themeId: Number(id), videoId } },
  });
  return NextResponse.json({ success: true });
}
