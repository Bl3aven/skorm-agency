import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

const kindSchema = z.enum(["artist", "event", "booking", "campaign", "content", "contact", "task", "finance", "inquiry"]);

const updateSchema = z.object({
  action: z.literal("update"),
  kind: kindSchema,
  id: z.string().uuid(),
  payload: z.record(z.string(), z.unknown()),
});

const deleteSchema = z.object({
  action: z.literal("delete"),
  kind: kindSchema,
  id: z.string().uuid(),
});

const schema = z.discriminatedUnion("action", [updateSchema, deleteSchema]);

export async function POST(request: Request) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const db = await getDb();
  if (!process.env.ADMIN_DB_SECRET) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  if (parsed.data.kind === "inquiry") {
    if (parsed.data.action === "delete") {
      const { error } = await db.rpc("admin_delete_inquiry", {
        p_secret: process.env.ADMIN_DB_SECRET,
        p_id: parsed.data.id,
      });
      return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
    }
    const { error } = await db.rpc("admin_update_inquiry", {
      p_secret: process.env.ADMIN_DB_SECRET,
      p_id: parsed.data.id,
      p_status: String(parsed.data.payload.status || "") || null,
      p_internal_notes: typeof parsed.data.payload.internal_notes === "string" ? parsed.data.payload.internal_notes : null,
    });
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
  }

  const rpc = parsed.data.action === "delete" ? "admin_delete_backoffice_item" : "admin_update_backoffice_item";
  const args = parsed.data.action === "delete"
    ? { p_secret: process.env.ADMIN_DB_SECRET, p_kind: parsed.data.kind, p_id: parsed.data.id }
    : { p_secret: process.env.ADMIN_DB_SECRET, p_kind: parsed.data.kind, p_id: parsed.data.id, p_payload: parsed.data.payload };

  const { error } = await db.rpc(rpc, args);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}
