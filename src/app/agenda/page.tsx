import { PageShell } from "@/components/page-shell";
import { getPublicSiteData } from "@/lib/public-site-data";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const { dates } = await getPublicSiteData();

  return (
    <PageShell label="Live" title="Agenda" intro="France, Europe et ailleurs.">
      <section className="agenda-list">
        {dates.map((date) => (
          <article key={`${date.iso}-${date.event}`}>
            {date.imageUrl && <img src={date.imageUrl} alt={`Affiche ${date.event}`} className="event-poster" />}
            <time><b>{date.day}</b><span>{date.month}</span></time>
            <div><small>{date.artist}</small><h2>{date.event}</h2></div>
            <p>{date.location}</p>
            <span className="status-pill">{date.status}</span>
          </article>
        ))}
        {!dates.length && (
          <article>
            <time><b>--</b><span>TBA</span></time>
            <div><small>SKORM</small><h2>Dates en préparation</h2></div>
            <p>Les prochaines annonces seront ajoutées ici depuis l’admin.</p>
            <span className="status-pill">À venir</span>
          </article>
        )}
      </section>
    </PageShell>
  );
}
