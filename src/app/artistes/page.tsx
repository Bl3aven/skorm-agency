import { ContactForm } from "@/components/contact-form";
import { RosterBrowser } from "@/components/roster-browser";
import { getPublicSiteData } from "@/lib/public-site-data";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const { artists } = await getPublicSiteData();

  return (
    <main className="roster-page">
      <section className="roster-page-head">
        <p className="eyebrow">Roster</p>
        <h1>Les artistes suivis par SKORM</h1>
        <p>
          Des univers hard, club et performatifs, avec la même exigence :
          image, dates, contenus et suivi professionnel.
        </p>
      </section>

      <RosterBrowser artists={artists} />

      <section className="roster-join-form" id="rejoindre-roster">
        <div>
          <p className="eyebrow">Candidature artiste</p>
          <h2>Présenter un projet au roster</h2>
          <p>
            Dépose ton univers, tes réseaux, tes sons, tes vidéos et ce que tu attends
            d’un accompagnement SKORM.
          </p>
        </div>
        <ContactForm variant="artist" />
      </section>
    </main>
  );
}
