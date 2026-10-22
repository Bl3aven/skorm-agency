import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { artists as publicArtists } from "@/lib/content";

export const ARTIST_DEFAULT_PASSWORD = process.env.ARTIST_DEFAULT_PASSWORD ?? "";
const COOKIE_NAME = "SKORM_artist";

export type ArtistLogin = {
  slug: string;
  name: string;
};

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/@skorm-agency\.com$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function aliasesFor(slug: string, name: string) {
  const normalizedSlug = normalize(slug);
  const normalizedName = normalize(name);
  const parts = normalizedName.split("-").filter(Boolean);
  const compactName = parts.join("");
  const initials = parts.map((part) => part[0]).join("");

  const aliases = new Set([
    normalizedSlug,
    normalizedName,
    compactName,
    initials,
    normalizedSlug.replace(/-rave-unit$/, ""),
    normalizedSlug.replace(/-hardlab$/, ""),
    normalizedSlug.replace(/-tutti$/, ""),
    normalizedName.replace(/-rave-unit$/, ""),
    normalizedName.replace(/-hardlab$/, ""),
    normalizedName.replace(/-tutti$/, ""),
  ]);

  if (normalizedSlug === "cgl-rave-unit") aliases.add("cgl");
  if (normalizedSlug === "nova-hardlab") aliases.add("nova");
  if (normalizedSlug === "andrea-tutti") aliases.add("andrea");

  aliases.delete("");
  return aliases;
}

function tokenFor(slug: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_DB_SECRET || "";
  if (!secret) return "";
  return `${slug}.${createHmac("sha256", secret).update(`artist:${slug}`).digest("hex")}`;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function findArtistLogin(identifier: string): Promise<ArtistLogin | null> {
  const normalized = normalize(identifier);
  if (!normalized) return null;

  const db = await getDb();
  if (!process.env.ADMIN_DB_SECRET) return null;
  const { data } = await db
    .from("artists")
    .select("slug,name,is_active")
    .eq("is_active", true);
  const artistRows = (data as Array<{ slug: string; name: string; is_active?: boolean }> | null) || [];
  const match = artistRows.find((artist) => {
    return aliasesFor(artist.slug, artist.name).has(normalized);
  });
  if (match) return { slug: match.slug, name: match.name };

  const fallback = publicArtists.find((artist) => {
    return aliasesFor(artist.slug, artist.name).has(normalized);
  });
  return fallback ? { slug: fallback.slug, name: fallback.name } : null;
}

export async function validArtistCredentials(identifier: string, password: string) {
  if (password !== ARTIST_DEFAULT_PASSWORD) return null;
  return findArtistLogin(identifier);
}

export function getArtistCookie(slug: string) {
  return {
    name: COOKIE_NAME,
    value: tokenFor(slug),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    },
  };
}

export async function getArtistSessionSlug() {
  const value = (await cookies()).get(COOKIE_NAME)?.value || "";
  const [slug] = value.split(".");
  if (!slug || !value || !safeEqual(value, tokenFor(slug))) return null;
  return slug;
}

export async function hasArtistSession(slug: string) {
  const sessionSlug = await getArtistSessionSlug();
  return sessionSlug === slug;
}
