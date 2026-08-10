import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await ctx.params;
  const { imageId } = await req.json();
  const theme = await prisma.theme.update({
    where: { id: Number(id) },
    data: { coverImageId: imageId },
  });
  return NextResponse.json(theme);
}
