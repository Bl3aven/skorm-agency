import { AdminArtistActions, AdminArtistCreateButton } from "@/components/admin-artist-actions";
import { AdminPageHeading, MetricCard, Status } from "@/components/admin-ui";
import { getAdminData } from "@/lib/admin-data";

export default async function AdminArtistsPage() {
  const { artists: data } = await getAdminData();

  return (
    <main className="admin-main admin-artists-page">
      <AdminPageHeading
        title="Artistes"
        description="Profils, informations professionnelles, médias, tarifs, accès et disponibilités."
        action={<AdminArtistCreateButton />}
      />
      <section className="metrics-grid three admin-artists-metrics">
        <MetricCard label="Artistes actifs" value={data.length} hint="Roster SKORM" />
        <MetricCard
          label="Profils complets"
          value={`${data.filter((artist) => artist.bio && artist.image_url).length}/${data.length}`}
          hint="Bio, photos, liens et documents"
        />
        <MetricCard label="Disponibles" value={data.length} hint="Ouverts aux propositions" />
      </section>
      <section className="artist-admin-grid">
        {data.map((artist) => (
          <article className="artist-admin-card" key={artist.id}>
            <div className="artist-admin-cover">
              <span>{artist.name.slice(0, 2).toUpperCase()}</span>
              <Status tone="good">Actif</Status>
            </div>
            <div>
              <small>{artist.tagline}</small>
              <h2>{artist.name}</h2>
              <p>{artist.bio || "Bio et positionnement à compléter."}</p>
              <p className="artist-login-hint">
                Accès artiste : <b>{artist.slug}</b> / <b>SKORM26!</b>
              </p>
            </div>
            <footer>
              <span>Instagram</span>
              <b>{artist.instagram_url ? "Connecté" : "À connecter"}</b>
              <AdminArtistActions item={artist} />
            </footer>
          </article>
        ))}
      </section>
    </main>
  );
}
