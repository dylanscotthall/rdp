import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const locationId = Number(id);

  const [images, videos] = await Promise.all([
    prisma.image.findMany({
      where: { locationId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.video.findMany({
      where: { locationId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const combined = [
    ...images.map((img) => ({ type: "image" as const, ...img })),
    ...videos.map((vid) => ({ type: "video" as const, ...vid })),
  ];

  return NextResponse.json(combined);
}
