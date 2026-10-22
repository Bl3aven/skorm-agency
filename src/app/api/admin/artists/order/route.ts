import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { z } from "zod";

// GET : lister les artistes (id, slug, display_order) pour piloter l'ordre depuis l'admin/API.
export async function GET(request: Request) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  if (!process.env.ADMIN_DB_SECRET) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  const { data, error } = await db.rpc("admin_get_backoffice", { p_secret: process.env.ADMIN_DB_SECRET });
  if (error || !data) return NextResponse.json({ error: (error && error.message) || "No data" }, { status: 500 });
  const artists = ((data as any)?.artists || []).map((a: any) => ({ id: a.id, slug: a.slug, name: a.name, display_order: a.display_order }));
  return NextResponse.json({ artists });
}

// POST : définir l'ordre. Body : { order: [{ id, display_order }] }
const orderSchema = z.object({ order: z.array(z.object({ id: z.string().uuid(), display_order: z.number().int() })).min(1) });

export async function POST(request: Request) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const db = await getDb();
  if (!process.env.ADMIN_DB_SECRET) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  const { order } = parsed.data;
  // Update direct de display_order (la RPC admin_update_backoffice_item peut ne pas
  // prendre en compte display_order selon le chemin).
  for (const item of order) {
    await db.rpc("admin_set_artist_display_order", {
      p_secret: process.env.ADMIN_DB_SECRET,
      p_id: item.id,
      p_display_order: item.display_order,
    });
  }
  return NextResponse.json({ ok: true, updated: order.length });
}
