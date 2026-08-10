import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const themes = await prisma.theme.findMany({
    orderBy: { createdAt: "asc" },
    include: { coverImage: true, coverVideo: true },
  });
  return NextResponse.json(themes);
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const theme = await prisma.theme.create({ data: { name: name.trim() } });
  return NextResponse.json(theme, { status: 201 });
}
