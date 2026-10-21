import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import sharp from "sharp";
import { getPublicPool } from "@/lib/production-public-data";

export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!process.env.DATABASE_URL) return new NextResponse(null, { status: 404 });
  const [rows] = await getPublicPool().execute<RowDataPacket[]>("SELECT COALESCE(NULLIF(home_image_url, ''), image_url) AS image FROM artists WHERE slug = ? AND is_active = 1 LIMIT 1", [slug]);
  const source: unknown = rows[0]?.image;
  if (typeof source !== "string") return new NextResponse(null, { status: 404 });
  const match = source.match(/^data:image\/(?:jpeg|jpg|png|webp|avif);base64,([\s\S]+)$/);
  if (!match) {
    const target = new URL(source, "https://skorm-agency.com");
    if (!["https:", "http:"].includes(target.protocol)) return new NextResponse(null, { status: 404 });
    return NextResponse.redirect(target);
  }
  try {
    const image = await sharp(Buffer.from(match[1], "base64"), { limitInputPixels: 40000000 }).rotate().resize({ width: 700, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    return new NextResponse(new Uint8Array(image), { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch { return new NextResponse(null, { status: 404 }); }
}
