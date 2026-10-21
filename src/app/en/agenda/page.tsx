import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublicSiteData } from "@/lib/public-site-data";

export const dynamic = "force-dynamic";

export default async function EnglishAgendaPage() {
  const { dates } = await getPublicSiteData();

  return (
    <main className="inner-page">
      <section className="page-heading">
        <Link href="/en" className="back-link"><ArrowLeft size={14} /> Back</Link>
        <p className="eyebrow">Live</p>
        <h1>Agenda</h1>
        <p className="page-intro">France, Europe and beyond.</p>
      </section>
      <section className="agenda-list">
        {dates.map((date) => (
          <article key={`${date.iso}-${date.event}`}>
            {date.imageUrl && <img src={date.imageUrl} alt={`Poster ${date.event}`} className="event-poster" />}
            <time><b>{date.day}</b><span>{date.month}</span></time>
            <div><small>{date.artist}</small><h2>{date.event}</h2></div>
            <p>{date.location}</p>
            <span className="status-pill">{date.status}</span>
          </article>
        ))}
        {!dates.length && (
          <article>
            <time><b>--</b><span>TBA</span></time>
            <div><small>SKORM</small><h2>Dates in preparation</h2></div>
            <p>Upcoming announcements will be added from the admin.</p>
            <span className="status-pill">Soon</span>
          </article>
        )}
      </section>
    </main>
  );
}
