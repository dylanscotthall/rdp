import { cookies } from "next/headers";

const COOKIE_NAME = "rdp_admin";

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

function unauthorizedResponse(message = "Unauthorized"): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Call at the top of any protected API route handler.
 * Returns null if the request is authenticated.
 * Returns a 401 Response if not — just return it immediately.
 *
 * Usage:
 *   const unauth = await requireAdmin();
 *   if (unauth) return unauth;
 */
export async function requireAdmin(): Promise<Response | null> {
  const secret = process.env.ADMIN_SECRET;
  const password = process.env.ADMIN_PASSWORD;

  if (!secret || !password) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured: missing env vars" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return unauthorizedResponse();

  const expected = await hmac(password, secret);

  // Constant-time comparison — prevents timing attacks
  if (token.length !== expected.length) return unauthorizedResponse();
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return unauthorizedResponse();

  return null;
}
