"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, CirclePlay, FileText, Link2, Mail, ShieldCheck, UsersRound } from "lucide-react";

export function SiteFooter() {
  const pathname = usePathname();
  const en = pathname.startsWith("/en");
  const base = en ? "/en" : "";
  const home = pathname === "/" || pathname === "/en";
  if (pathname.startsWith("/admin") || pathname === "/connexion" || pathname.startsWith("/espace-artiste")) return null;
  const guides = [
    { icon: UsersRound, title: en ? "Artists" : "Artistes", text: en ? "Profiles, tracks, socials, dates" : "Dossiers, sons, réseaux, dates", href: "/guide-artistes" },
    { icon: CirclePlay, title: "FAQ", text: en ? "Requests, booking, follow-up" : "Demandes, booking, suivi", href: "/faq" },
    { icon: FileText, title: en ? "Press & brands" : "Presse & marques", text: en ? "Sponsors, media, campaigns" : "Sponsors, médias, campagnes", href: "/presse-marques" },
  ];
  const services = [
    { icon: Link2, title: en ? "Art direction" : "Direction artistique", text: en ? "Identity, image, visual consistency" : "Univers, image, cohérence visuelle" },
    { icon: ShieldCheck, title: en ? "360° communication" : "Communication 360°", text: en ? "Socials, content, releases" : "Réseaux, contenus, sorties" },
    { icon: Mail, title: en ? "Professional requests" : "Demandes pros", text: en ? "Booking, media, brands" : "Booking, médias, marques" },
    { icon: BriefcaseBusiness, title: en ? "Career management" : "Gestion de carrière", text: en ? "Dates, priorities, development" : "Dates, priorités, développement" },
  ];
  return <footer className="noir-footer"><div className="noir-container">
    {home && <section className="noir-guide"><h2>{en ? "How to move forward?" : "Comment avancer ?"}</h2><div className="noir-guide-grid">{guides.map(({ icon: Icon, title, text, href }) => <Link href={`${base}${href}`} key={href}><span className="noir-icon-box"><Icon size={27} strokeWidth={1.6} /></span><div><strong>{title}</strong><small>{text}</small></div><ArrowRight size={18} /></Link>)}</div></section>}
    <div className="noir-trust">{services.map(({ icon: Icon, title, text }) => <div key={title}><Icon size={23} strokeWidth={1.7} /><p><strong>{title}</strong><span>{text}</span></p></div>)}</div>
    <div className="noir-newsletter"><label className="noir-eyebrow" htmlFor="noir-newsletter-email">Newsletter</label><form action={`${base}/contact`} method="get"><input type="hidden" name="subject" value="newsletter" /><input id="noir-newsletter-email" type="email" name="email" placeholder={en ? "your@email.com" : "votre@email.com"} required autoComplete="email" /><button type="submit">{en ? "Subscribe" : "S’inscrire"}<ArrowRight size={17} /></button></form></div>
    <div className="noir-footer-bottom"><div className="noir-footer-intro"><Link href={base || "/"} aria-label="SKORM Agency"><img src="/skorm-logo.webp" alt="SKORM Agency" width={190} height={50} /></Link><p>{en ? "Management, communication, partnerships, AI and training for electronic artists." : "Management, communication, partenariats, IA et formation pour artistes électroniques."}</p><a className="noir-instagram" href="https://www.instagram.com/skorm_agency?mdxt=ZG9zY2J5NjVoNXp1" target="_blank" rel="noreferrer" aria-label="SKORM Agency sur Instagram"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg></a></div>
    <nav aria-label={en ? "Agency" : "Agence"}><h3>{en ? "Agency" : "Agence"}</h3><Link href={`${base}/comment-ca-marche`}>{en ? "How it works" : "Comment ça marche"}</Link><Link href={`${base}/artistes`}>{en ? "Artists" : "Artistes"}</Link><Link href={`${base}/agenda`}>Agenda</Link><Link href={`${base}/formation-ia`}>{en ? "AI training" : "Formation IA"}</Link><Link href={`${base}/contact`}>Contact</Link></nav>
    <nav aria-label={en ? "Entry points" : "Entrées"}><h3>{en ? "Entry points" : "Entrées"}</h3><Link href={`${base}/rejoindre-agence`}>{en ? "Submit a profile" : "Déposer un profil"}</Link><Link href={`${base}/devenir-sponsor`}>Sponsor</Link><Link href={`${base}/contact`}>Booking</Link><a href="mailto:hello@skorm-agency.com">hello@skorm-agency.com</a></nav>
    <nav aria-label={en ? "Information" : "Informations"}><h3>{en ? "Information" : "Informations"}</h3><Link href={`${base}/faq`}>FAQ</Link><Link href={`${base}/presse-marques`}>{en ? "Press & brands" : "Presse & marques"}</Link><Link href="/mentions-legales">{en ? "Legal notice" : "Mentions légales"}</Link><Link href="/cgv">CGV</Link><Link href="/cookies">Cookies</Link></nav></div>
  </div></footer>;
}
