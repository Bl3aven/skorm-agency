import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  course: z.enum(["beginner", "expert"]),
  progress: z.number().min(0).max(100),
  stage: z.string().max(80),
  status: z.string().max(80),
  level: z.number().optional(),
  score: z.number().optional(),
  finalScore: z.number().optional(),
  composition_link: z.string().optional(),
  tools: z.string().optional(),
  method: z.string().optional(),
  certificate: z.boolean().optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const db = await getDb();
  if (!process.env.ADMIN_DB_SECRET) return NextResponse.json({ ok: true, local: true });

  const data = parsed.data;
  const label = data.course === "expert" ? "Formation Expert" : "Formation Débutant";
  const message = Object.entries(data)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("\n");

  await db.from("inquiries").insert({
    inquiry_type: "formation",
    contact_name: data.email,
    company: label,
    email: data.email,
    artist_slug: null,
    message,
    status: data.status,
    source: "training-progress",
  });

  return NextResponse.json({ ok: true });
}
