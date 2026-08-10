import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const images = await prisma.image.findMany({
    orderBy: { createdAt: "desc" },
    include: { location: true },
  });
  return NextResponse.json(images);
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { fileUrl, caption, width, height } = await req.json();
  if (!fileUrl) {
    return NextResponse.json({ error: "fileUrl required" }, { status: 400 });
  }

  const existing = await prisma.image.findFirst({ where: { fileUrl } });
  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const image = await prisma.image.create({
    data: { fileUrl, caption, width, height },
  });
  return NextResponse.json(image, { status: 201 });
}
