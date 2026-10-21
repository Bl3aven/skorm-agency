import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

const artistSchema = z.object({
  action: z.literal("create_artist"),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120),
  tagline: z.string().trim().max(180).optional(),
  instagram_url: z.string().trim().max(300).optional(),
});
const eventSchema = z.object({
  action: z.literal("create_event"),
  artist_id: z.string().uuid(),
  title: z.string().trim().min(2).max(180),
  starts_at: z.string().min(10),
  ends_at: z.string().optional(),
  location: z.string().trim().max(240).optional(),
  category: z.string().trim().max(80),
  notes: z.string().trim().max(2000).optional(),
});
const updateEventSchema = z.object({
  action: z.literal("update_event"),
  id: z.string().uuid(),
  title: z.string().trim().min(2).max(180),
  starts_at: z.string().min(10),
  ends_at: z.string().optional(),
  location: z.string().trim().max(240).optional(),
  category: z.string().trim().max(80),
  notes: z.string().trim().max(2000).optional(),
});
const deleteEventSchema = z.object({
  action: z.literal("delete_event"),
  id: z.string().uuid(),
});
const noteSchema = z.object({
  action: z.literal("save_note"),
  artist_id: z.string().uuid(),
  content: z.string().max(20000),
});
const schema = z.discriminatedUnion("action", [artistSchema, eventSchema, updateEventSchema, deleteEventSchema, noteSchema]);

export async function POST(request: Request) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const db = await getDb();
  if (!process.env.ADMIN_DB_SECRET) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  const secret = process.env.ADMIN_DB_SECRET;

  if (parsed.data.action === "create_artist") {
    const { error } = await db.rpc("admin_create_artist", {
      p_secret: secret, p_name: parsed.data.name, p_slug: parsed.data.slug,
      p_tagline: parsed.data.tagline || null, p_instagram_url: parsed.data.instagram_url || null,
    });
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
  }
  if (parsed.data.action === "create_event") {
    const { error } = await db.rpc("admin_create_private_event", {
      p_secret: secret, p_artist_id: parsed.data.artist_id, p_title: parsed.data.title,
      p_starts_at: parsed.data.starts_at, p_ends_at: parsed.data.ends_at || null,
      p_location: parsed.data.location || null, p_category: parsed.data.category, p_notes: parsed.data.notes || null,
    });
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
  }
  if (parsed.data.action === "update_event") {
    const { error } = await db.rpc("admin_update_private_event", {
      p_secret: secret, p_id: parsed.data.id, p_title: parsed.data.title,
      p_starts_at: parsed.data.starts_at, p_ends_at: parsed.data.ends_at || null,
      p_location: parsed.data.location || null, p_category: parsed.data.category, p_notes: parsed.data.notes || null,
    });
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
  }
  if (parsed.data.action === "delete_event") {
    const { error } = await db.rpc("admin_delete_private_event", {
      p_secret: secret, p_id: parsed.data.id,
    });
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
  }
  const { error } = await db.rpc("admin_save_artist_note", {
    p_secret: secret, p_artist_id: parsed.data.artist_id, p_content: parsed.data.content,
  });
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}
