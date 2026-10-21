import { HomeArtistCard } from "@/components/home-artist-card";
import { getPublicSiteData } from "@/lib/public-site-data";

export const dynamic = "force-dynamic";

export default async function EnglishArtistsPage() {
  const { artists } = await getPublicSiteData();

  return (
    <main className="roster-page">
      <section className="roster-page-head">
        <p className="eyebrow">Roster</p>
        <h1>Artists represented by SKORM</h1>
        <p>Multiple universes, one standard: image, dates, content and professional follow-up.</p>
      </section>
      <section className="roster-gallery">
        {artists.map((artist) => (
          <HomeArtistCard
            key={artist.slug}
            artist={artist}
            release={artist.featuredSound || undefined}
          />
        ))}
      </section>
    </main>
  );
}
