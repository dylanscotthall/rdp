import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await ctx.params;
  await prisma.themeImage.deleteMany({ where: { themeId: Number(id) } });
  await prisma.theme.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
