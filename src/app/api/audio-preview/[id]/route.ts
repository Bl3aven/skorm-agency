import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid track" }, { status: 400 });

  const response = await fetch(`https://api.deezer.com/track/${id}`, { next: { revalidate: 1800 } });
  const track = await response.json();
  if (!track?.preview) return NextResponse.json({ error: "Preview unavailable" }, { status: 404 });

  return NextResponse.redirect(track.preview);
}
