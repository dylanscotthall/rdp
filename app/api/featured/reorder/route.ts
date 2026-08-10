import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

// POST /api/featured/reorder
// Body: { items: Array<{ id: string; type: "image" | "video" }> }
// Assigns featuredOrder 0, 1, 2... in the order received
export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { items } = (await req.json()) as {
    items: { id: string; type: "image" | "video" }[];
  };

  if (!Array.isArray(items)) {
    return NextResponse.json(
      { error: "items array required" },
      { status: 400 },
    );
  }

  await prisma.$transaction(
    items.map(({ id, type }, index) =>
      type === "image"
        ? prisma.image.update({ where: { id }, data: { featuredOrder: index } })
        : prisma.video.update({
            where: { id },
            data: { featuredOrder: index },
          }),
    ),
  );

  return NextResponse.json({ ok: true });
}
