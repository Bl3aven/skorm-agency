import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Link2, Mail, MapPin, UserRound } from "lucide-react";
import { NoirHero } from "@/components/noir-hero";
import { NoirRail } from "@/components/noir-rail";
import { HomeArtistCard } from "@/components/home-artist-card";
import { getPublicSiteData } from "@/lib/public-site-data";

export async function NoirHome({ en = false }: { en?: boolean }) {
  const { artists, dates } = await getPublicSiteData();
  const base = en ? "/en" : "";
  const upcoming = dates.filter(date => !date.past);
  // L’ordre est défini dans l’admin (display_order). La liste arrive déjà triée par la DB.
  const ordered = artists;
  const features = [
    { icon: Link2, title: en ? "Art direction" : "Direction d’image", text: en ? "Positioning, identity, content and visual consistency." : "Positionnement, identité, contenus et cohérence visuelle.", href: "/contact" },
    { icon: CalendarDays, title: en ? "European booking" : "Booking Europe", text: en ? "Dates, options, confirmations, follow-ups and field coordination." : "Dates, options, confirmations, relances et suivi terrain.", href: "/agenda" },
    { icon: Mail, title: en ? "Professional requests" : "Demandes pros", text: en ? "Bookers, media, brands and partners in one place." : "Bookers, médias, marques et partenariats au même endroit.", href: "/contact" },
    { icon: BriefcaseBusiness, title: en ? "Career management" : "Gestion de carrière", text: en ? "Priorities, strategy, decisions and long-term development." : "Priorités, stratégie, arbitrages et développement long terme.", href: "/rejoindre-agence" },
  ];
  return <main className="noir-home"><NoirHero en={en} />
    <section className="noir-dates noir-container" id="dates"><div className="noir-section-head"><p className="noir-eyebrow noir-line-label">{en ? "Upcoming dates" : "Prochaines dates"}</p><Link className="noir-text-link" href={`${base}/agenda`}>{en ? "All events" : "Voir tous les événements"}<ArrowRight size={17} /></Link></div>
      <NoirRail label={en ? "Upcoming dates" : "Prochaines dates"} className="noir-event-rail">{upcoming.length ? upcoming.map((date, i) => <Link href={`${base}/agenda`} className={`noir-event noir-event-${i % 3}`} key={`${date.iso}-${date.event}-${date.artist}`}><div className="noir-event-photo" style={{ backgroundImage: `url("${date.imageUrl && !date.imageUrl.startsWith("data:") ? date.imageUrl : i % 3 === 2 ? "/agency/light-trails-stage.webp" : "/agency/agency-stage.webp"}")` }} /><div className="noir-event-top"><time dateTime={date.iso}><b>{date.day}</b><span>{date.month}</span></time><span className="noir-event-status">{date.status}</span></div><div className="noir-event-copy"><h3>{date.event}</h3><p><MapPin size={13} />{date.location}</p><p><UserRound size={13} />{date.artist}</p></div></Link>) : <div className="noir-event noir-event-empty"><CalendarDays size={30} /><h3>{en ? "New dates coming soon" : "De nouvelles dates arrivent"}</h3><Link href={`${base}/contact`}>{en ? "Book an artist" : "Booker un artiste"}<ArrowRight size={16} /></Link></div>}</NoirRail>
    </section>
    <section className="noir-roster" id="roster"><div className="noir-container"><div className="noir-section-head noir-roster-heading"><div><p className="noir-eyebrow noir-line-label">Roster</p><h2>{en ? "Artists represented by SKORM." : "Les profils suivis par SKORM."}</h2></div><Link className="noir-text-link" href={`${base}/artistes`}>{en ? "All artists" : "Voir tous les artistes"}<ArrowRight size={17} /></Link></div><NoirRail label={en ? "Artists" : "Artistes"} className="noir-artist-rail">{ordered.map(artist => <HomeArtistCard key={artist.slug} artist={artist} release={artist.featuredSound || undefined} en={en} />)}</NoirRail></div></section>
    <section className="noir-services noir-container" aria-label={en ? "Our services" : "Nos accompagnements"}><div className="noir-service-grid">{features.map(({ icon: Icon, title, text, href }) => <Link className="noir-service" href={`${base}${href}`} key={title}><span className="noir-icon-box"><Icon size={30} strokeWidth={1.7} /></span><div><h3>{title}</h3><p>{text}</p></div></Link>)}</div><div className="noir-service-art" aria-hidden="true"><i /><i /><i /><span /></div></section>
  </main>;
}
