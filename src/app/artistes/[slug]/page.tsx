import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ExternalLink, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { HorizontalRail } from "@/components/horizontal-rail";
import { MediaPlayButton } from "@/components/media-play-button";
import { artists as fallbackArtists, isPlayableAudioItem } from "@/lib/content";
import { getPublicSiteData, type PublicArtist, type PublicDate, type PublicMediaItem } from "@/lib/public-site-data";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return fallbackArtists.map(({ slug }) => ({ slug }));
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="instagram-glyph">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" />
    </svg>
  );
}

function datesForArtist(artist: PublicArtist, dates: PublicDate[]) {
  const artistName = normalize(artist.name);
  const artistSlug = normalize(artist.slug);
  return dates.filter((date) => {
    if (date.artistSlug) return date.artistSlug === artist.slug;
    const value = normalize(date.artist);
    return value === artistName || value === artistSlug || value.includes(artistName) || artistName.includes(value);
  });
}

function MediaRail({
  title,
  label,
  items,
  image,
  variant,
}: {
  title: string;
  label: string;
  image: string;
  variant: "sound" | "spotify" | "video";
  items: PublicMediaItem[];
}) {
  const publicItems = items.filter((item) => {
    const value = `${item.title} ${item.meta || ""} ${item.href || ""}`.toLowerCase();
    if (value.includes("press kit") || value.includes("presskit") || value.includes("bannière officielle")) return false;
    if ((variant === "sound" || variant === "spotify") && !isPlayableAudioItem(item) && !item.href) return false;
    return true;
  });

  if (!publicItems.length) return null;

  return (
    <section className="paga-rail-section">
      <div className="artist-section-heading">
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>
      <HorizontalRail className="artist-mini-rail">
        {publicItems.map((item, index) => (
          <article className={`artist-mini-card ${variant}`} key={`${title}-${item.title}-${index}`}>
            <div className={`artist-mini-thumb thumb-${index % 3}`}>
              {item.cover ? <img src={item.cover} alt={`Pochette officielle ${item.title}`} className="artist-mini-cover" /> : <div className="artist-mini-cover artist-mini-cover-empty" aria-label="Pochette non fournie par la plateforme" />}
            </div>
            <small>{label} · {String(index + 1).padStart(2, "0")}</small>
            <strong>{item.title}</strong>
            <p>{item.meta}</p>

            {(variant === "sound" || variant === "spotify") && (
              <div className={variant === "spotify" ? "spotify-preview" : "artist-card-actions"}>
                <MediaPlayButton
                  href={item.href}
                  audioUrl={item.audioUrl}
                  fullAudioUrl={item.fullAudioUrl}
                  src={item.src}
                  deezerId={item.deezerId}
                  previewUrl={item.previewUrl}
                  title={item.title}
                  label={variant === "sound" ? "Écouter" : "Lire"}
                />
                {variant === "sound" && item.href && (
                  <a href={item.href} target="_blank" rel="noreferrer" aria-label="Ouvrir la source officielle">
                    <ExternalLink size={14} />
                  </a>
                )}
                {variant === "spotify" && (
                  <>
                    <b>{item.title}</b>
                    <small>{item.meta}</small>
                  </>
                )}
              </div>
            )}

            {variant === "video" && (
              <div className="artist-card-actions">
                <MediaPlayButton href={item.href} title={item.title} label="Voir" />
              </div>
            )}
          </article>
        ))}
      </HorizontalRail>
    </section>
  );
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { artists, dates } = await getPublicSiteData();
  const artist = artists.find((item) => item.slug === slug);
  if (!artist) notFound();

  const artistDates = datesForArtist(artist, dates);
  const upcomingDates = artistDates.filter(date => !date.past);
  const heroImage = artist.heroImage || artist.homeImage || "/skorm-logo.webp";

  return (
    <main className="artist-page paga-like-page">
      <section className={`paga-like-hero artist-page-${artist.slug}`}>
        <Image src={heroImage} fill alt="" sizes="100vw" priority className="paga-like-hero-image" />
        <div className="paga-like-overlay" />

        <div className="paga-like-shell">
          <Link className="artist-back glass-panel" href="/artistes">
            <ArrowLeft size={14} /> Roster
          </Link>

          <div className="paga-like-copy">
            <p className="eyebrow">{artist.genre}</p>
            <h1>{artist.name}</h1>
            <p>{artist.bio}</p>
            <div className="artist-socials">
              {artist.socials.map((social) => (
                <Link href={social.href} key={`${social.label}-${social.href}`} target={social.href.startsWith("http") ? "_blank" : undefined}>
                  {social.label === "Instagram" && <InstagramGlyph />}
                  <span>{social.label}</span>
                  <ArrowUpRight size={14} />
                </Link>
              ))}
            </div>
          </div>

          <aside className="paga-hero-dates" aria-label="Prochaines dates">
            <p className="eyebrow">Next dates</p>
            <HorizontalRail className="hero-date-rail">
              {upcomingDates.length ? upcomingDates.slice(0, 5).map((date) => (
                <Link href="#dates" className="paga-date-card" key={`${date.iso}-${date.event}`}>
                  {date.imageUrl && <img src={date.imageUrl} alt={`Affiche ${date.event}`} className="event-poster" />}
                  <time><span>{date.day}</span>{date.month}</time>
                  <strong>{date.event}</strong>
                  <small>{date.location}</small>
                </Link>
              )) : (
                <div className="paga-date-card"><strong>Dates en préparation</strong><small>À annoncer</small></div>
              )}
            </HorizontalRail>
          </aside>
        </div>
      </section>

      <section id="dates" className="artist-section-shell artist-date-section">
        <div className="artist-section-heading">
          <p className="eyebrow">Live</p>
          <h2>Dates & historique</h2>
        </div>
        <div className="paga-date-list">
          {artistDates.length ? [...artistDates].sort((a,b)=>Number(Boolean(a.past))-Number(Boolean(b.past)) || (a.past ? b.iso.localeCompare(a.iso) : a.iso.localeCompare(b.iso))).map((date) => (
            <details className="paga-date-row" key={`${date.iso}-${date.event}`}>
              <summary>
                <time><span>{date.day}</span>{date.month} {date.iso.slice(0,4)}</time>
                <div className="paga-date-main">
                  <span>{date.past ? "Date passée" : "À venir"}</span>
                  <strong>{date.event}</strong>
                  <small><MapPin size={11} /> {date.location} / {date.artist}</small>
                </div>
                <em>Détails</em>
              </summary>
              <div>
                <p><b>Artiste :</b> {date.artist}</p>
                <p><b>Statut :</b> {date.status}</p>
                {date.imageUrl && <img src={date.imageUrl} alt={`Affiche ${date.event}`} className="event-poster" />}
                <p><b>Lieu :</b> {date.location}</p>
              </div>
            </details>
          )) : <p className="empty-copy">Les prochaines dates seront annoncées ici.</p>}
        </div>
      </section>

      <section className="artist-section-shell artist-media-area">
        <MediaRail title="Derniers sons" label="Sounds" variant="sound" image={artist.homeImage || heroImage} items={artist.media.sounds} />
        <MediaRail title="Écoute directe" label="Streaming" variant="spotify" image={artist.homeImage || heroImage} items={artist.media.releases} />
        <MediaRail title="Dernières vidéos" label="Videos" variant="video" image={heroImage} items={artist.media.videos.filter((item) => item.mediaType !== "photo")} />
      </section>
    </main>
  );
}
