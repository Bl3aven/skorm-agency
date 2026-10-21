import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

const listSchema = z.enum(["org", "death"]);

const upsertSchema = z.object({
  action: z.literal("upsert"),
  list: listSchema,
  id: z.string().uuid().optional().nullable(),
  payload: z.record(z.string(), z.unknown()),
});

const deleteSchema = z.object({
  action: z.literal("delete"),
  list: listSchema,
  id: z.string().uuid(),
});

const schema = z.discriminatedUnion("action", [upsertSchema, deleteSchema]);

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const db = await getDb();
  if (!process.env.ADMIN_DB_SECRET) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const isOrg = parsed.data.list === "org";
  const rpc =
    parsed.data.action === "delete"
      ? isOrg
        ? "admin_delete_org_entry"
        : "admin_delete_death_note_entry"
      : isOrg
        ? "admin_upsert_org_entry"
        : "admin_upsert_death_note_entry";

  const args =
    parsed.data.action === "delete"
      ? { p_secret: process.env.ADMIN_DB_SECRET, p_id: parsed.data.id }
      : {
          p_secret: process.env.ADMIN_DB_SECRET,
          p_id: parsed.data.id || null,
          p_payload: parsed.data.payload,
        };

  const { data, error } = await db.rpc(rpc, args);

  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ ok: true, id: data ?? null });
}
