import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getArtistSessionSlug } from "@/lib/artist-auth";
import { getDb } from "@/lib/db";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("note"), content: z.string().max(20000) }),
  z.object({ action: z.literal("delete"), id: z.string().uuid(), visibility: z.enum(["private", "public"]).default("private") }),
  z.object({ action: z.literal("event"), id: z.string().uuid().optional(),
    visibility: z.enum(["private", "public"]), title: z.string().trim().min(2).max(180),
    starts_at: z.string().datetime(), ends_at: z.string().datetime().nullable(),
    location: z.string().trim().max(240), notes: z.string().max(2000),
    image_url: z.string().max(2000000).refine(v => !v || /^https:\/\//i.test(v) || /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(v)).optional() }),
]);

async function context() {
  const slug = await getArtistSessionSlug();
  if (!slug) throw new Error("401");
  const db = await getDb();
  const secret = process.env.ADMIN_DB_SECRET;
  if (!db || !secret) throw new Error("503");
  const res: any = await db.rpc("admin_get_artist_workspace", { p_secret: secret });
  const data = res.data; const error = res.error;
  if (error || !data) throw new Error("503");
  const artist = data.artists.find((a: { slug: string }) => a.slug === slug);
  if (!artist) throw new Error("401");
  const events = (data.events as Array<{ id: string; artist_id: string; title: string; starts_at: string; ends_at: string | null; location: string; category: string; notes: string }>).filter((e: { artist_id: string }) => e.artist_id === artist.id);
  return { db, secret, artist, events };
}

function failure(error: unknown) {
  const status = error instanceof Error && error.message === "401" ? 401 : 503;
  return NextResponse.json({ error: status === 401 ? "Reconnecte-toi à ton espace artiste." : "Agenda indisponible. Réessaie dans un instant." }, { status });
}

export async function GET() {
  try {
    const { db, artist, events } = await context();
    const { data, error } = await db.from("events").select("*").eq("artist_id", artist.id).eq("is_published", true);
    if (error) throw error;
    const imageSupport = await db.from("events").select("image_url").limit(0);
    return NextResponse.json({
      imagesEnabled: !imageSupport.error,
      events: [...events.filter(e => e.category === "artist-personal").map(e => ({ ...e, visibility: "private" })),
        ...((data || []) as Array<Record<string, unknown>>).map((e: Record<string, unknown>) => ({ ...e, location: e.venue || e.city, notes: "", visibility: "public" }))],
      note: events.find(e => e.category === "artist-notebook")?.notes || "",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Origine invalide" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie le titre et les dates." }, { status: 400 });
  try {
    const { db, secret, artist, events } = await context();
    const input = parsed.data;
    if ((input.action === "event" || input.action === "delete") && input.visibility === "public") {
      let existing = null;
      if (input.id) {
        const result = await db.from("events").select("*").eq("id", input.id).eq("artist_id", artist.id).eq("is_published", true).maybeSingle();
        if (result.error) throw result.error;
        existing = result.data;
        if (!existing) return NextResponse.json({ error: "Date introuvable" }, { status: 404 });
      }
      const payload = input.action === "event" ? {
        artist_id: artist.id, title: input.title, starts_at: input.starts_at, venue: input.location,
        city: input.location || "À annoncer", status: existing?.status || "confirmed", is_published: true,
        country_code: existing?.country_code || "FR", ticket_url: existing?.ticket_url || null,
        image_url: input.image_url ?? existing?.image_url ?? null,
      } : {};
      let result = await db.rpc("artist_manage_public_event", { p_secret: secret, p_artist_id: artist.id,
        p_id: input.id || null, p_action: input.action, p_payload: payload });
      // Older databases support editing/deletion already; images require the additive migration.
      if (result.error?.code === "PGRST202") {
        if (input.action === "event" && input.image_url) return NextResponse.json({ error: "Les affiches ne sont pas encore activées. Ta date n’a pas été modifiée." }, { status: 503 });
        result = await db.rpc(input.action === "delete" ? "admin_delete_backoffice_item" : input.id ? "admin_update_backoffice_item" : "admin_create_backoffice_item", {
          p_secret: secret, p_kind: "event", ...(input.id ? { p_id: input.id } : {}), ...(input.action === "event" ? { p_payload: payload } : {}),
        });
      }
      if (result.error) throw result.error;
      for (const path of ["/", "/en", "/agenda", "/en/agenda", `/artistes/${artist.slug}`]) revalidatePath(path);
      return NextResponse.json({ ok: true });
    }
    if (input.action === "delete") {
      if (!events.some(e => e.id === input.id && e.category === "artist-personal")) return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
      const { error } = await db.rpc("admin_delete_private_event", { p_secret: secret, p_id: input.id });
      if (error) throw error;
    } else {
      const notebook = input.action === "note" ? events.find(e => e.category === "artist-notebook") : undefined;
      const id = input.action === "note" ? notebook?.id : input.id;
      if (id && !events.some(e => e.id === id && e.category === (input.action === "note" ? "artist-notebook" : "artist-personal"))) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
      if (input.action === "event" && input.ends_at && input.ends_at <= input.starts_at) return NextResponse.json({ error: "La fin doit être après le début." }, { status: 400 });
      const payload = { p_secret: secret, ...(id ? { p_id: id } : { p_artist_id: artist.id }),
        p_title: input.action === "note" ? "Bloc-notes artiste" : input.title,
        p_starts_at: input.action === "note" ? notebook?.starts_at || new Date().toISOString() : input.starts_at,
        p_ends_at: input.action === "note" ? null : input.ends_at,
        p_location: input.action === "note" ? null : input.location,
        p_category: input.action === "note" ? "artist-notebook" : "artist-personal",
        p_notes: input.action === "note" ? input.content : input.notes };
      const { error } = await db.rpc(id ? "admin_update_private_event" : "admin_create_private_event", payload);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (error) { return failure(error); }
}
