import { NextResponse } from "next/server";
import { getAdminCookie, validAdminCredentials } from "@/lib/admin-auth";
import { getArtistCookie, validArtistCredentials } from "@/lib/artist-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !validAdminCredentials(String(body.email), String(body.password))) {
    const artist = await validArtistCredentials(String(body.email), String(body.password));
    if (!artist) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const response = NextResponse.json({ ok: true, role: "artist", redirect: "/espace-artiste", artist });
    const cookie = getArtistCookie(artist.slug);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  }
  const response = NextResponse.json({ ok: true, role: "admin", redirect: "/admin" });
  const cookie = getAdminCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
