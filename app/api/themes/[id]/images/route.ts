import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const rows = await prisma.themeImage.findMany({
    where: { themeId: Number(id) },
    include: { image: { include: { location: true } } },
    orderBy: { image: { createdAt: "desc" } },
  });
  return NextResponse.json(rows.map((r) => r.image));
}

export async function POST(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await ctx.params;
  const { imageId } = await req.json();
  const row = await prisma.themeImage.create({
    data: { themeId: Number(id), imageId },
  });
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await ctx.params;
  const { imageId } = await req.json();
  await prisma.themeImage.delete({
    where: { themeId_imageId: { themeId: Number(id), imageId } },
  });
  return NextResponse.json({ success: true });
}
