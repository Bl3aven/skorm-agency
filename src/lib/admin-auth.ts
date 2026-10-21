import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "SKORM_admin";

function sessionToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return "";
  return createHmac("sha256", secret).update("SKORM-admin-session").digest("hex");
}

export function validAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  const emailBuffer = Buffer.from(email);
  const expectedEmailBuffer = Buffer.from(expectedEmail);
  const passwordBuffer = Buffer.from(password);
  const expectedPasswordBuffer = Buffer.from(expectedPassword);
  return (
    emailBuffer.length === expectedEmailBuffer.length &&
    passwordBuffer.length === expectedPasswordBuffer.length &&
    timingSafeEqual(emailBuffer, expectedEmailBuffer) &&
    timingSafeEqual(passwordBuffer, expectedPasswordBuffer)
  );
}

export async function hasAdminSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value ?? "";
  const expected = sessionToken();
  if (!token || !expected || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function getAdminCookie() {
  return {
    name: COOKIE_NAME,
    value: sessionToken(),
    options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 12 },
  };
}

