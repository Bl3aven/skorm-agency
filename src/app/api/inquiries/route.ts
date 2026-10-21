import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";

const inquirySchema = z.object({
  type: z.enum(["booking", "brand", "press", "artist", "other"]),
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().default(""),
  email: z.string().email().max(180),
  artist: z.string().trim().max(80).optional().default("general"),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: Request) {
  const parsed = inquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const db = await getDb();
  if (!process.env.ADMIN_DB_SECRET) return NextResponse.json({ error: "Back-office non configuré" }, { status: 503 });

  const { error } = await db.from("inquiries").insert({
    inquiry_type: parsed.data.type,
    contact_name: parsed.data.name,
    company: parsed.data.company || null,
    email: parsed.data.email,
    artist_slug: parsed.data.artist === "general" ? null : parsed.data.artist,
    message: parsed.data.message,
    source: "website",
  });

  if (error) return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
