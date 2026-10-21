import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

const schema = z.object({
  kind: z.enum(["artist", "event", "booking", "campaign", "content", "contact", "task", "finance"]),
  payload: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const db = await getDb();
  if (!process.env.ADMIN_DB_SECRET) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const { data, error } = await db.rpc("admin_create_backoffice_item", {
    p_secret: process.env.ADMIN_DB_SECRET,
    p_kind: parsed.data.kind,
    p_payload: parsed.data.payload,
  });

  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ ok: true, id: data });
}
