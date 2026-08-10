import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    include: { location: true },
  });
  return NextResponse.json(videos);
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { fileUrl, caption } = await req.json();
  if (!fileUrl) {
    return NextResponse.json({ error: "fileUrl required" }, { status: 400 });
  }

  const existing = await prisma.video.findFirst({ where: { fileUrl } });
  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const video = await prisma.video.create({ data: { fileUrl, caption } });
  return NextResponse.json(video, { status: 201 });
}
