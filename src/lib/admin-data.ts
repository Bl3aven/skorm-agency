import { getDb } from "@/lib/db";
import { artistMedia, artists as publicArtists } from "@/lib/content";
import { adminArtistSnapshot } from "@/lib/admin-artist-snapshot";

type ArtistRow = {
  id: string; name: string; slug: string; tagline: string | null; bio: string | null;
  image_url: string | null; instagram_url: string | null;
  home_image_url?: string | null; featured_sound?: unknown | null;
  media_sounds?: unknown[] | null; media_releases?: unknown[] | null; media_videos?: unknown[] | null;
  updated_at?: string | null;
};
type EventRow = { id: string; artist_id?: string; is_published?: boolean; image_url?: string | null; starts_at: string; title: string; city: string; status: string; artist_name: string | null };
type InquiryRow = {
  id: string; contact_name: string; company: string | null; email: string; inquiry_type: string;
  artist_slug: string | null; message: string; status: string; created_at: string;
  phone?: string | null; event_date?: string | null; budget_range?: string | null;
  internal_notes?: string | null; source?: string | null; updated_at?: string | null;
};
type BookingRow = {
  id: string; status: string; payment_status: string; fee: number | null; event_name: string;
  city: string | null; event_date: string | null; artist_name: string | null;
};
type CampaignRow = {
  id: string; status: string; budget: number | null; brand_name: string; title: string;
  deadline: string | null; artist_name: string | null;
};
type ContentRow = {
  id: string; status: string; platform: string; title: string; publish_at: string | null;
  content_type: string; artist_name: string | null; caption?: string | null; asset_url?: string | null;
};
type ContactRow = {
  id: string; full_name: string; email: string | null; company: string | null;
  category: string; country: string | null; relationship: string;
};
type TaskRow = {
  id: string; priority: string; title: string; category: string; due_at: string | null;
  artist_name: string | null; status: string;
};
type FinanceRow = {
  id: string; type: string; amount: number; label: string; transaction_date: string;
  status: string; artist_name: string | null;
};

export type AdminData = {
  artists: ArtistRow[];
  events: EventRow[];
  inquiries: InquiryRow[];
  bookings: BookingRow[];
  campaigns: CampaignRow[];
  content_items: ContentRow[];
  contacts: ContactRow[];
  tasks: TaskRow[];
  financial_transactions: FinanceRow[];
};

const empty: AdminData = {
  artists: [], events: [], inquiries: [], bookings: [], campaigns: [],
  content_items: [], contacts: [], tasks: [], financial_transactions: [],
};

function snapshotAdminData(): AdminData {
  return {
    ...empty,
    artists: adminArtistSnapshot.map((artist) => ({ ...artist })),
  };
}

export async function syncPublicArtistsToAdmin() {
  if (!process.env.ADMIN_DB_SECRET) return;
  const db = await getDb();

  const existingSlugs = new Set<string>();
  const { data: existingData, error: existingError } = await db.rpc("admin_get_backoffice", { p_secret: process.env.ADMIN_DB_SECRET });
  if (existingError || !existingData) return;
  const existingArtists = (existingData as Partial<AdminData> | null)?.artists || [];
  existingArtists.forEach((artist) => {
    if (artist.slug) existingSlugs.add(artist.slug);
  });

  // Le roster est désormais géré depuis l'admin : dès qu'au moins un artiste
  // existe en base, on ne ré-injecte plus jamais la liste statique. Sinon un
  // artiste supprimé (ou renommé) réapparaîtrait au rechargement suivant.
  if (existingSlugs.size > 0) return;

  await Promise.all(publicArtists.filter((artist) => !existingSlugs.has(artist.slug)).map(async (artist, index) => {
    const media = artistMedia[artist.slug as keyof typeof artistMedia];
    const featuredSound = "featuredSound" in artist ? artist.featuredSound : media?.sounds?.[0] || null;
    const payload = {
      p_secret: process.env.ADMIN_DB_SECRET,
      p_slug: artist.slug,
      p_name: artist.name,
      p_tagline: artist.genre,
      p_bio: artist.bio,
      p_instagram_url: artist.instagram,
      p_image_url: artist.heroImage || artist.homeImage || null,
      p_home_image_url: artist.homeImage || null,
      p_featured_sound: featuredSound,
      p_display_order: index + 1,
      p_media_sounds: media?.sounds || [],
      p_media_releases: media?.releases || [],
      p_media_videos: media?.videos || [],
    };
    const { error } = await db.rpc("admin_upsert_public_artist", payload);
    if (!error) return;
    await db.rpc("admin_upsert_public_artist", {
      p_secret: payload.p_secret,
      p_slug: payload.p_slug,
      p_name: payload.p_name,
      p_tagline: payload.p_tagline,
      p_bio: payload.p_bio,
      p_instagram_url: payload.p_instagram_url,
      p_image_url: payload.p_image_url,
      p_display_order: payload.p_display_order,
    });
  }));
}

export async function getAdminData(): Promise<AdminData> {
  if (!process.env.ADMIN_DB_SECRET) return snapshotAdminData();
  const db = await getDb();
  const { data, error } = await db.rpc("admin_get_backoffice", { p_secret: process.env.ADMIN_DB_SECRET });
  if (error || !data) return snapshotAdminData();
  const backoffice = data as AdminData;
  backoffice.artists = backoffice.artists.map((artist) => {
    const publicArtist = publicArtists.find((item) => item.slug === artist.slug);
    const media = artistMedia[artist.slug as keyof typeof artistMedia];
    const featuredSound = (publicArtist as { featuredSound?: unknown } | undefined)?.featuredSound || media?.sounds?.[0] || null;
    return {
      ...artist,
      home_image_url: (artist.home_image_url && !artist.home_image_url.startsWith("blob:"))
        ? artist.home_image_url
        : (artist.image_url && !artist.image_url.startsWith("blob:"))
          ? artist.image_url
          : (publicArtist?.homeImage || null),
      featured_sound: artist.featured_sound || featuredSound || null,
      media_sounds: artist.media_sounds ?? [...(media?.sounds || [])],
      media_releases: artist.media_releases ?? [...(media?.releases || [])],
      media_videos: artist.media_videos ?? [...(media?.videos || [])],
    };
  });
  return backoffice;
}
