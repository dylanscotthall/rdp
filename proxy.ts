import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "rdp_admin";
const LOGIN_PATH = "/admin/login";

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

async function isValidToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !password) return false;
  const expected = await hmac(password, secret);
  // Constant-time comparison to prevent timing attacks
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Always allow the login page and its API
  if (pathname === LOGIN_PATH) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (token && (await isValidToken(token))) {
    return NextResponse.next();
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
