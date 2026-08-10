import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(locations);
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { name, country, latitude, longitude } = await req.json();
  if (!name || !latitude || !longitude) {
    return NextResponse.json(
      { error: "name, latitude, longitude required" },
      { status: 400 },
    );
  }
  const loc = await prisma.location.create({
    data: { name, country, latitude, longitude },
  });
  return NextResponse.json(loc, { status: 201 });
}
