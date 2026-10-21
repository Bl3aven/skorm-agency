import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getArtistSessionSlug } from "@/lib/artist-auth";
import { getAdminData } from "@/lib/admin-data";
import { getDb } from "@/lib/db";
import { resolveMediaMetadata } from "@/lib/media-metadata";

const mediaSchema = z.object({
  title: z.string().optional(),
  meta: z.string().optional(),
  cover: z.string().optional(),
  href: z.string().optional(),
  audioUrl: z.string().optional(),
  fullAudioUrl: z.string().optional(),
  src: z.string().optional(),
  previewUrl: z.string().optional(),
  deezerId: z.string().optional(),
  durationSec: z.number().optional(),
  mediaType: z.enum(["photo", "video"]).optional(),
  showOnHome: z.boolean().optional(),
  genres: z.array(z.string()).optional(),
  styles: z.array(z.string()).optional(),
  bpm: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
}).nullable().optional();

const visualMediaSchema = z.object({
  title: z.string().optional(), meta: z.string().optional(), cover: z.string().optional(), href: z.string().optional(),
  mediaType: z.enum(["photo", "video"]).optional(), showOnHome: z.boolean().optional(),
});

const schema = z.object({
  tagline: z.string().optional(),
  bio: z.string().optional(),
  instagram_url: z.string().optional(),
  image_url: z.string().optional(),
  home_image_url: z.string().optional(),
  featured_sound: mediaSchema,
  media_sounds: z.array(mediaSchema).optional(),
  media_releases: z.array(mediaSchema).optional(),
  media_videos: z.array(visualMediaSchema).optional(),
});

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({error:"Origine invalide"},{status:403});
  const slug = await getArtistSessionSlug();
  if (!slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { artists } = await getAdminData();
  const artist = artists.find((item) => item.slug === slug);
  if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

  const db = await getDb();
  if (!process.env.ADMIN_DB_SECRET) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const readiness = await db.from("artists").select("featured_sound,media_sounds,media_releases,media_videos,home_image_url").eq("id",artist.id).single();
  if(readiness.error) return NextResponse.json({error:"La base médias doit être mise à jour. Rien n’a été enregistré : conserve tes liens dans le formulaire."},{status:503});
  async function enrich(item: z.infer<typeof mediaSchema>) {
    if(!item) return item;
    const href=item.href || item.audioUrl || item.fullAudioUrl;
    if(!href || (item.title && item.cover)) return item;
    try {const data=await resolveMediaMetadata(href);return {...item,href:data.href,title:item.title||data.title,cover:item.cover||data.cover,meta:item.meta||data.meta};} catch {return item;}
  }
  const payload={...parsed.data};
  if(payload.featured_sound) payload.featured_sound=await enrich(payload.featured_sound);
  if(payload.media_sounds) payload.media_sounds=await Promise.all(payload.media_sounds.map(enrich));
  const { error } = await db.rpc("artist_save_profile", {
    p_secret: process.env.ADMIN_DB_SECRET,
    p_id: artist.id,
    p_payload: payload,
  });

  if (error) return NextResponse.json({ error: "Sauvegarde impossible. La base médias doit être mise à jour ; tes modifications restent dans le formulaire." }, { status: 503 });
  const check=await db.from("artists").select("*").eq("id",artist.id).single();
  if(check.error) return NextResponse.json({error:"Sauvegarde non vérifiée. Recharge avant de réessayer."},{status:503});
  const same=(a:unknown,b:unknown):boolean => {
    if(a===b) return true;
    if(a===null||b===null||typeof a!=="object"||typeof b!=="object") return false;
    const aa=a as Record<string,unknown>,bb=b as Record<string,unknown>;
    return Object.keys(aa).length===Object.keys(bb).length&&Object.keys(aa).every(k=>same(aa[k],bb[k]));
  };
  if(Object.entries(payload).some(([key,value])=>!same(JSON.parse(JSON.stringify(value)),check.data[key]))) return NextResponse.json({error:"Les données enregistrées ne correspondent pas. Conserve tes modifications et réessaie."},{status:503});

  revalidatePath("/");
  revalidatePath("/artistes");
  revalidatePath(`/artistes/${artist.slug}`);
  revalidatePath("/en");
  revalidatePath("/en/artistes");
  revalidatePath(`/en/artistes/${artist.slug}`);
  return NextResponse.json({ ok: true });
}
