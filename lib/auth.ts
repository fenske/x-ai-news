import { cookies } from "next/headers";

// SHA-256 hash of the password - set this in .env.local
// To generate: echo -n "your-password" | shasum -a 256
const PASSWORD_HASH = process.env.PASSWORD_HASH || "";

const AUTH_COOKIE_NAME = "x-sentinel-auth";
const AUTH_COOKIE_VALUE = "authenticated";

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string): Promise<boolean> {
  if (!PASSWORD_HASH) {
    // If no password hash is set, allow access (for development)
    console.warn("WARNING: PASSWORD_HASH not set. Authentication disabled.");
    return true;
  }

  const inputHash = await hashPassword(password);
  return inputHash === PASSWORD_HASH.toLowerCase();
}

export async function isAuthenticated(): Promise<boolean> {
  if (!PASSWORD_HASH) {
    // If no password hash is set, allow access
    return true;
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === AUTH_COOKIE_VALUE;
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export function isAuthEnabled(): boolean {
  return !!PASSWORD_HASH;
}
