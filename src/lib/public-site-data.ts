import { getAdminData, type AdminData } from "@/lib/admin-data";
import {
  artistMedia,
  artists as fallbackArtists,
  dates as fallbackDates,
  getFeaturedAudioForArtist,
  isPlayableAudioItem,
} from "@/lib/content";

export type PublicMediaItem = {
  title: string;
  meta?: string;
  cover?: string;
  href?: string;
  audioUrl?: string;
  fullAudioUrl?: string;
  src?: string;
  deezerId?: string;
  previewUrl?: string;
  durationSec?: number;
  duration?: number;
  mediaType?: "photo" | "video";
  showOnHome?: boolean;
  genres?: string[];
  styles?: string[];
  bpm?: string;
  country?: string;
  location?: string;
};

export type PublicArtist = {
  slug: string;
  name: string;
  genre: string;
  bio: string;
  role?: string;
  instagram: string;
  homeImage?: string;
  heroImage?: string;
  socials: { label: string; href: string }[];
  featuredSound?: PublicMediaItem | null;
  filters?: { genres: string[]; styles: string[]; bpm?: string; country?: string; location?: string };
  media: {
    sounds: PublicMediaItem[];
    releases: PublicMediaItem[];
    videos: PublicMediaItem[];
  };
};

export type PublicDate = {
  past?: boolean;
  imageUrl?: string;
  artistSlug?: string;
  iso: string;
  day: string;
  month: string;
  artist: string;
  event: string;
  location: string;
  status: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function mediaItemFromUnknown(value: unknown): PublicMediaItem | null {
  if (!isRecord(value)) return null;
  const hasFilters = Array.isArray(value.genres) || Array.isArray(value.styles) || typeof value.bpm === "string" || typeof value.country === "string" || typeof value.location === "string";
  if ((!value.title || typeof value.title !== "string" || !value.title.trim()) && !hasFilters && !value.href && !value.audioUrl && !value.fullAudioUrl) return null;
  return {
    title: typeof value.title === "string" && value.title.trim() ? cleanPublicText(value.title) : value.href || value.audioUrl || value.fullAudioUrl ? "Écouter ce titre" : "",
    meta: typeof value.meta === "string" ? cleanPublicText(value.meta) : undefined,
    cover: typeof value.cover === "string" ? value.cover : undefined,
    href: typeof value.href === "string" ? value.href : undefined,
    audioUrl: typeof value.audioUrl === "string" ? value.audioUrl : undefined,
    fullAudioUrl: typeof value.fullAudioUrl === "string" ? value.fullAudioUrl : undefined,
    src: typeof value.src === "string" ? value.src : undefined,
    deezerId: typeof value.deezerId === "string" ? value.deezerId : undefined,
    previewUrl: typeof value.previewUrl === "string" ? value.previewUrl : undefined,
    durationSec: typeof value.durationSec === "number" ? value.durationSec : undefined,
    duration: typeof value.duration === "number" ? value.duration : undefined,
    mediaType: value.mediaType === "photo" ? "photo" : value.mediaType === "video" ? "video" : undefined,
    showOnHome: typeof value.showOnHome === "boolean" ? value.showOnHome : undefined,
    genres: Array.isArray(value.genres) ? value.genres.filter((item): item is string => typeof item === "string") : undefined,
    styles: Array.isArray(value.styles) ? value.styles.filter((item): item is string => typeof item === "string") : undefined,
    bpm: typeof value.bpm === "string" ? value.bpm : undefined,
    country: typeof value.country === "string" ? value.country : undefined,
    location: typeof value.location === "string" ? value.location : undefined,
  };
}

function mediaArrayFromUnknown(value: unknown): PublicMediaItem[] {
  if (!Array.isArray(value)) return [];
  return value.map(mediaItemFromUnknown).filter(Boolean) as PublicMediaItem[];
}

function dateParts(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { iso: "", day: "--", month: "TBA" };
  }
  return {
    iso: date.toISOString().slice(0, 10),
    day: new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date).replace(".", "").toUpperCase(),
  };
}

function isUpcoming(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= today;
}

const adminArtistVisualFallbacks: Record<
  string,
  { homeImage: string; heroImage: string; featuredSound?: PublicMediaItem }
> = {
  paga: {
    homeImage: "/artists/paga-home-mixing.jpg",
    heroImage: "/artists/paga-home-mixing.jpg",
  },
  "vs-techno": {
    homeImage: "/artists/vs-techno-blue-smoke.jpg",
    heroImage: "/artists/vs-techno-blue-smoke.jpg",
    featuredSound: {
      title: "VS - RAKATA (EXTENDED)",
      meta: "VS · SoundCloud officiel",
      cover: "https://i1.sndcdn.com/artworks-O0aeB4q0bn0JSMJC-oychhg-t500x500.jpg",
      href: "https://soundcloud.com/stefan-312457595/rakata",
    },
  },
  impact: {
    homeImage: "/artists/impact-dj-raw-photo.png",
    heroImage: "/artists/impact-dj-raw-photo.png",
  },
  "impact-dj-raw": {
    homeImage: "/artists/impact-dj-raw-photo.png",
    heroImage: "/artists/impact-dj-raw-photo.png",
  },
  dante: {
    homeImage: "/artists/dante-techno-photo.png",
    heroImage: "/artists/dante-techno-photo.png",
  },
  "dante-techno": {
    homeImage: "/artists/dante-techno-photo.png",
    heroImage: "/artists/dante-techno-photo.png",
  },
  enkor: {
    homeImage: "/artists/enkor-photo.png",
    heroImage: "/artists/enkor-photo.png",
  },
  vielusos: {
    homeImage: "/artists/vielusos-photo.png",
    heroImage: "/artists/vielusos-photo.png",
  },
  tiito: {
    homeImage: "/artists/tiito-photo.png",
    heroImage: "/artists/tiito-photo.png",
  },
  "wolvi-akela": {
    homeImage: "/artists/wolvi-photo-1.jpg",
    heroImage: "/artists/wolvi-photo-1.jpg",
  },
  wolvi: {
    homeImage: "/artists/wolvi-photo-1.jpg",
    heroImage: "/artists/wolvi-photo-1.jpg",
  },
};

function normalizedKey(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function firstText(...values: Array<string | null | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim().length)?.trim();
}

function versionedAssetUrl(url?: string | null, version?: string | null) {
  const cleanUrl = firstText(url);
  const cleanVersion = firstText(version);
  if (!cleanUrl || !cleanVersion || cleanUrl.startsWith("data:") || cleanUrl.startsWith("blob:")) return cleanUrl;
  if (cleanUrl.startsWith("/")) return cleanUrl;
  const separator = cleanUrl.includes("?") ? "&" : "?";
  return `${cleanUrl}${separator}v=${encodeURIComponent(cleanVersion)}`;
}

function normalizeKnownArtistImage(artist: { slug?: string | null; name?: string | null }, url?: string) {
  const key = canonicalArtistKey(artist);
  if (key === "enkor" && (!url || url.includes("vs-techno") || url.includes("blue-smoke") || url.includes("vs-photo"))) {
    return "/artists/enkor-photo.png";
  }
  if (key === "paga" && (!url || url.includes("home-paga-real-blue") || url.endsWith("/artists/paga.png"))) {
    return "/artists/paga-home-mixing.jpg";
  }
  if (key === "vs-techno" && (!url || url.includes("enkor-photo") || url.includes("impact-dj-raw") || url.includes("andrea-tutti"))) {
    return "/artists/vs-techno-blue-smoke.jpg";
  }
  return url;
}

export function cleanPublicText(value?: string | null, fallback = "") {
  return String(value || fallback)
    .replace(/쨌|夷/g, "·")
    .replace(/횪/g, "à")
    .replace(/챕|챗|챔/g, "é")
    .replace(/�/g, "")
    .replace(/\s+\?\s+/g, " · ")
    .replace(/\s*·\s*/g, " · ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
function canonicalArtistKey(artist: { slug?: string | null; name?: string | null }) {
  const key = normalizedKey(`${artist.slug || ""}-${artist.name || ""}`);
  const compactKey = key.replace(/-/g, "");
  if (compactKey.includes("cgl") || compactKey.includes("cagoule")) return "cgl";
  if (compactKey.includes("nova")) return "nova";
  if (compactKey.includes("enkor")) return "enkor";
  // « vs » et « vs-techno » sont deux profils DISTINCTS (on ne les fusionne plus).
  if (key.includes("impact")) return "impact-dj-raw";
  if (key.includes("dante")) return "dante-techno";
  if (key.includes("vielusos")) return "vielusos";
  if (key.includes("tiito")) return "tiito";
  if (key.includes("wolvi")) return "wolvi-akela";
  return normalizedKey(artist.slug || artist.name || "");
}

function publicArtistName(artist: { slug?: string | null; name?: string | null }) {
  const key = canonicalArtistKey(artist);
  if (key === "cgl") return "CGL";
  if (key === "paga") return "PAGA";
  if (key === "nova") return "N.O.V.A.";
  if (key === "vs-techno") return "VS TECHNO";
  return cleanPublicText(artist.name, "SKORM");
}

function uniqueArtists(list: PublicArtist[]) {
  const seen = new Set<string>();
  return list.filter((artist) => {
    const key = canonicalArtistKey(artist);
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getAdminVisualFallback(artist: AdminData["artists"][number]) {
  const slugKey = normalizedKey(artist.slug);
  const nameKey = normalizedKey(artist.name);
  if (adminArtistVisualFallbacks[slugKey]) return adminArtistVisualFallbacks[slugKey];
  if (adminArtistVisualFallbacks[nameKey]) return adminArtistVisualFallbacks[nameKey];
  if (slugKey.includes("paga") || nameKey.includes("paga")) return adminArtistVisualFallbacks.paga;
  if (slugKey.includes("enkor") || nameKey.includes("enkor")) return adminArtistVisualFallbacks.enkor;
  if (slugKey === "vs-techno" || slugKey === "vs" || nameKey === "vs-techno" || nameKey === "vs") {
    return adminArtistVisualFallbacks["vs-techno"];
  }
  if (slugKey.includes("impact") || nameKey.includes("impact")) return adminArtistVisualFallbacks["impact-dj-raw"];
  if (slugKey.includes("dante") || nameKey.includes("dante")) return adminArtistVisualFallbacks["dante-techno"];
  if (slugKey.includes("vielusos") || nameKey.includes("vielusos")) return adminArtistVisualFallbacks.vielusos;
  if (slugKey.includes("tiito") || nameKey.includes("tiito")) return adminArtistVisualFallbacks.tiito;
  if (slugKey.includes("wolvi") || nameKey.includes("wolvi")) return adminArtistVisualFallbacks["wolvi-akela"];
  return null;
}

function readableStatus(value?: string | null) {
  const status = String(value || "").toLowerCase();
  if (status === "confirmed") return "Confirmé";
  if (status === "option") return "Option";
  if (status === "tba") return "TBA";
  return cleanPublicText(value, "Confirmé");
}

function fallbackArtistToPublic(artist: (typeof fallbackArtists)[number]): PublicArtist {
  const media = artistMedia[artist.slug as keyof typeof artistMedia];
  return {
    ...artist,
    name: publicArtistName(artist),
    genre: cleanPublicText(artist.genre, "DJ · Performer"),
    bio: cleanPublicText(artist.bio, "Profil artiste SKORM."),
    instagram: artist.instagram,
    featuredSound: getFeaturedAudioForArtist(artist) || null,
    filters: { genres: [], styles: [], bpm: undefined, country: undefined, location: undefined },
    media: {
      sounds: [...(media?.sounds || [])],
      releases: [...(media?.releases || [])],
      videos: [...(media?.videos || [])],
    },
  };
}

function mediaFromArtistOrStatic(
  artist: AdminData["artists"][number],
  field: "media_sounds" | "media_releases" | "media_videos",
  staticItems: readonly PublicMediaItem[] = [],
) {
  const adminItems = mediaArrayFromUnknown(artist[field]);
  return Array.isArray(artist[field]) ? adminItems : Array.from(staticItems);
}

export function publicArtistsFromAdmin(data: AdminData): PublicArtist[] {
  if (!data.artists.length) {
    return uniqueArtists(fallbackArtists.map(fallbackArtistToPublic));
  }

  const adminArtists = data.artists.map((artist) => {
    const fallback = fallbackArtists.find((item) => canonicalArtistKey(item) === canonicalArtistKey(artist));
    const visualFallback = getAdminVisualFallback(artist);
    const staticMedia = artistMedia[(fallback?.slug || artist.slug) as keyof typeof artistMedia];
    const sounds = mediaFromArtistOrStatic(artist, "media_sounds", staticMedia?.sounds || []);
    const releases = mediaFromArtistOrStatic(artist, "media_releases", staticMedia?.releases || []);
    const videos = mediaFromArtistOrStatic(artist, "media_videos", staticMedia?.videos || []);
    const profileMedia = mediaItemFromUnknown(artist.featured_sound);
    const featured =
      (profileMedia?.title ? profileMedia : null) ||
      [fallback && getFeaturedAudioForArtist(fallback), ...sounds, ...releases].find(isPlayableAudioItem) ||
      visualFallback?.featuredSound ||
      null;
    const publishedSounds = [...sounds];
    if (profileMedia && (profileMedia.href || profileMedia.audioUrl || profileMedia.fullAudioUrl) && !publishedSounds.some(item => (item.href && item.href === profileMedia.href) || (item.audioUrl && item.audioUrl === profileMedia.audioUrl))) publishedSounds.unshift(profileMedia);
    const instagram = artist.instagram_url || fallback?.instagram || "#";
    const homeImageSource = firstText(artist.home_image_url);
    const heroImageSource = firstText(artist.image_url);
    const homeImageUrl = homeImageSource ? homeImageSource : undefined;
    const heroImageUrl = heroImageSource ? heroImageSource : undefined;
    const adminHomeImage = versionedAssetUrl(homeImageUrl, artist.updated_at);
    const adminHeroImage = versionedAssetUrl(heroImageUrl, artist.updated_at);
    const normalizedHomeImage =
      adminHomeImage ||
      normalizeKnownArtistImage(
        artist,
        visualFallback?.homeImage || (fallback ? fallback.homeImage || fallback.heroImage : undefined),
      );
    const normalizedHeroImage =
      adminHeroImage ||
      normalizeKnownArtistImage(
        artist,
        visualFallback?.heroImage || (fallback ? fallback.heroImage || fallback.homeImage : undefined),
      );

    return {
      slug: artist.slug,
      name: publicArtistName(artist),
      genre: cleanPublicText(artist.tagline || fallback?.genre, "DJ · Performer"),
      bio: cleanPublicText(artist.bio || fallback?.bio, "Profil artiste SKORM."),
      role: fallback?.role,
      instagram,
      homeImage: normalizedHomeImage,
      heroImage: normalizedHeroImage,
      socials: [
        { label: "Instagram", href: instagram },
        { label: "Booking", href: "/contact" },
      ],
      featuredSound: featured,
      filters: { genres: profileMedia?.genres || [], styles: profileMedia?.styles || [], bpm: profileMedia?.bpm, country: profileMedia?.country, location: profileMedia?.location },
      media: { sounds: publishedSounds, releases, videos },
    };
  });

  // Le roster public reflète exactement l'admin : on ne ré-ajoute plus les
  // artistes statiques manquants, sinon un artiste supprimé dans l'admin
  // réapparaîtrait ici (bug « impossible à supprimer »).
  return uniqueArtists(adminArtists);
}

export function publicDatesFromAdmin(data: AdminData): PublicDate[] {
  const adminDates = data.events
    .filter((event) => event.is_published !== false)
    .map((event) => {
      const parts = dateParts(event.starts_at);
      return {
        ...parts,
        past: !isUpcoming(event.starts_at),
        imageUrl: event.image_url || undefined,
        artistSlug: data.artists.find(artist => artist.id === event.artist_id)?.slug,
        artist: cleanPublicText(
          data.artists.find(artist => artist.id === event.artist_id)?.name || event.artist_name,
          "SKORM",
        ),
        event: cleanPublicText(event.title),
        location: cleanPublicText(event.city, "Lieu à confirmer"),
        status: readableStatus(event.status),
      };
    });

  const staticDates = fallbackDates
    .filter((date) => isUpcoming(`${date.iso}T00:00:00`))
    .map((date) => ({ ...date, status: readableStatus(date.status) }));

  const existing = new Set(adminDates.map((date) => `${date.iso}|${date.artist}|${date.event}`.toLowerCase()));
  const mergedStaticDates = staticDates.filter(
    (date) => !existing.has(`${date.iso}|${date.artist}|${date.event}`.toLowerCase()),
  );

  return [...adminDates, ...mergedStaticDates].sort((a, b) => a.iso.localeCompare(b.iso));
}

export async function getPublicSiteData() {
  const adminData = process.env.SKORM_PREPROD_LIVE_DATA === "1"
    ? await (await import("@/lib/production-public-data")).getProductionPublicData()
    : await getAdminData();
  return {
    adminData,
    artists: publicArtistsFromAdmin(adminData),
    dates: publicDatesFromAdmin(adminData),
  };
}
