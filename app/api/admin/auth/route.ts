import { NextResponse } from "next/server";

async function hmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// POST /api/admin/auth — login
export async function POST(req: Request) {
  const { password } = await req.json();

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminPassword || !adminSecret) {
    return NextResponse.json(
      { error: "Server misconfigured: missing env vars" },
      { status: 500 },
    );
  }

  if (!password || password !== adminPassword) {
    // Deliberate delay to slow brute force
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await hmac(adminPassword, adminSecret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("rdp_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}

// DELETE /api/admin/auth — logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("rdp_admin", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
