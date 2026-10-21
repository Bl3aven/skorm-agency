import "server-only";
import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import type { AdminData } from "@/lib/admin-data";

let pool: Pool | undefined;

function jsonValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return value; }
}

function publicMedia(value: unknown): unknown {
  const parsed = jsonValue(value);
  if (Array.isArray(parsed)) return parsed.map(publicMedia);
  if (parsed && typeof parsed === "object") return Object.fromEntries(Object.entries(parsed).map(([key, v]) => [key, typeof v === "string" && /^(data:|blob:)/.test(v) ? undefined : v]));
  return parsed;
}

function photo(slug: string, value: unknown, version?: string): string | null {
  if (typeof value === "string" && value && !/^(data:|blob:)/.test(value)) return value;
  if (typeof value === "string" && value.startsWith("data:image/")) return `/preprod-media/artists/${encodeURIComponent(slug)}?v=${encodeURIComponent(version || "current")}`;
  return null;
}

export function getPublicPool() {
  if (!pool) pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 2, dateStrings: true, waitForConnections: true });
  return pool;
}

/** Public read queries only. Mutations and authentication stay on the production API. */
export async function getProductionPublicData(): Promise<AdminData> {
  const pool = getPublicPool();
  const [artistResult, eventResult] = await Promise.all([
    pool.execute<RowDataPacket[]>("SELECT id, name, slug, tagline, bio, image_url, home_image_url, instagram_url, featured_sound, media_sounds, media_releases, media_videos, updated_at FROM artists WHERE is_active = 1 ORDER BY display_order, name"),
    pool.execute<RowDataPacket[]>("SELECT id, artist_id, starts_at, title, city, status, image_url, is_published FROM events WHERE is_published = 1 ORDER BY starts_at"),
  ]);
  const artists = artistResult[0].map(row => ({ ...row,
    image_url: photo(row.slug, row.image_url, row.updated_at), home_image_url: photo(row.slug, row.home_image_url || row.image_url, row.updated_at),
    featured_sound: publicMedia(row.featured_sound), media_sounds: publicMedia(row.media_sounds),
    media_releases: publicMedia(row.media_releases), media_videos: publicMedia(row.media_videos),
  })) as AdminData["artists"];
  const events = eventResult[0].map(row => ({ ...row, is_published: true, artist_name: artists.find(a => a.id === row.artist_id)?.name || null, image_url: typeof row.image_url === "string" && !row.image_url.startsWith("data:") ? row.image_url : null })) as AdminData["events"];
  return { artists, events, inquiries: [], bookings: [], campaigns: [], content_items: [], contacts: [], tasks: [], financial_transactions: [] };
}
