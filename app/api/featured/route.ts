import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [images, videos] = await Promise.all([
      prisma.image.findMany({
        where: { featured: true },
        orderBy: { featuredOrder: "asc" },
      }),
      prisma.video.findMany({
        where: { featured: true },
        orderBy: { featuredOrder: "asc" },
      }),
    ]);

    const combined = [
      ...images.map((img) => ({ type: "image" as const, ...img })),
      ...videos.map((vid) => ({ type: "video" as const, ...vid })),
    ].sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));

    return NextResponse.json(combined);
  } catch (err) {
    // Temporarily expose error so we can diagnose — remove before sharing publicly
    console.error("featured route error:", err);
    return NextResponse.json(
      {
        error: String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 },
    );
  }
}
