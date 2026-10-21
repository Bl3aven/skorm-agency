"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, FileText, Mail, MessageCircle, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

const guideLinksFr = [
  { icon: UsersRound, title: "Artistes", text: "Dossier, sons, réseaux, dates", href: "/guide-artistes" },
  { icon: MessageCircle, title: "FAQ", text: "Demandes, booking, suivi", href: "/faq" },
  { icon: FileText, title: "Presse & marques", text: "Sponsors, médias, campagnes", href: "/presse-marques" },
];

const guideLinksEn = [
  { icon: UsersRound, title: "Artists", text: "Profile, tracks, socials, dates", href: "/en/guide-artistes" },
  { icon: MessageCircle, title: "FAQ", text: "Requests, booking, follow-up", href: "/en/faq" },
  { icon: FileText, title: "Press & brands", text: "Sponsors, media, campaigns", href: "/en/presse-marques" },
];

const trustItemsFr = [
  { icon: Sparkles, title: "Direction artistique", text: "Univers, image, cohérence visuelle" },
  { icon: ShieldCheck, title: "Communication 360°", text: "Réseaux, contenus, sorties" },
  { icon: Mail, title: "Demandes pros", text: "Booking, médias, marques" },
  { icon: CalendarCheck, title: "Gestion de carrière", text: "Dates, priorités, développement" },
];

const trustItemsEn = [
  { icon: Sparkles, title: "Art direction", text: "Universe, image, visual consistency" },
  { icon: ShieldCheck, title: "360° communication", text: "Socials, content, releases" },
  { icon: Mail, title: "Professional requests", text: "Booking, media, brands" },
  { icon: CalendarCheck, title: "Career management", text: "Dates, priorities, development" },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname === "/connexion" || pathname.startsWith("/espace-artiste")) return null;

  const isEn = pathname.startsWith("/en");
  const isHome = pathname === "/" || pathname === "/en";
  const guideLinks = isEn ? guideLinksEn : guideLinksFr;
  const trustItems = isEn ? trustItemsEn : trustItemsFr;

  return (
    <footer className={`site-footer ${isHome ? "footer-home" : "footer-inner"}`}>
      {isHome && (
        <section className="footer-guide" aria-label={isEn ? "Useful links" : "Accès utiles"}>
          <h2>{isEn ? "How to move forward?" : "Comment avancer ?"}</h2>
          <div>
            {guideLinks.map(({ icon: Icon, title, text, href }) => (
              <Link href={href} key={title}>
                <span><Icon size={18} /></span>
                <strong>{title}</strong>
                <small>{text}</small>
                <em aria-hidden="true">→</em>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="footer-dark">
        <div className="footer-trust">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={18} />
              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="footer-newsletter footer-newsletter-compact">
          <p className="eyebrow">Newsletter</p>
          <form action={isEn ? "/en/contact" : "/contact"} method="get">
            <input
              type="email"
              name="email"
              placeholder={isEn ? "your@email.com" : "votre@email.com"}
              aria-label={isEn ? "Email address" : "Adresse email"}
              required
            />
            <button type="submit">{isEn ? "Subscribe" : "S'inscrire"}</button>
          </form>
          <a className="footer-mail" href="mailto:hello@skorm-agency.com">hello@skorm-agency.com</a>
        </div>

        <div className="footer-bottom">
          <div className="footer-intro">
            <Link className="footer-brand footer-logo" href={isEn ? "/en" : "/"} aria-label="SKORM Agency">
              <img src="/skorm-logo.webp" alt="SKORM Agency" />
            </Link>
            <p>
              {isEn
                ? "Management, communication, partnerships, AI and training for electronic artists."
                : "Management, communication, partenariats, IA et formation pour artistes électroniques."}
            </p>
            <a href="https://www.instagram.com/skormagency/" target="_blank" rel="noreferrer">Instagram</a>
          </div>

          <div className="footer-columns">
            <nav>
              <span>{isEn ? "Agency" : "Agence"}</span>
              <Link href={isEn ? "/en/comment-ca-marche" : "/comment-ca-marche"}>
                {isEn ? "How it works" : "Comment ça marche"}
              </Link>
              <Link href={isEn ? "/en/artistes" : "/artistes"}>{isEn ? "Artists" : "Artistes"}</Link>
              <Link href={isEn ? "/en/agenda" : "/agenda"}>Agenda</Link>
              <Link href={isEn ? "/en/formation-ia" : "/formation-ia"}>{isEn ? "AI training" : "Formation IA"}</Link>
              <Link href={isEn ? "/en/contact" : "/contact"}>Contact</Link>
            </nav>
            <nav>
              <span>{isEn ? "Entry points" : "Entrées"}</span>
              <Link href={isEn ? "/en/rejoindre-agence" : "/rejoindre-agence"}>
                {isEn ? "Submit a profile" : "Déposer un profil"}
              </Link>
              <Link href={isEn ? "/en/devenir-sponsor" : "/devenir-sponsor"}>Sponsor</Link>
              <Link href={isEn ? "/en/contact" : "/contact"}>Booking</Link>
              <a href="mailto:hello@skorm-agency.com">hello@skorm-agency.com</a>
            </nav>
            <nav>
              <span>{isEn ? "Information" : "Informations"}</span>
              <Link href={isEn ? "/en/faq" : "/faq"}>FAQ</Link>
              <Link href={isEn ? "/en/presse-marques" : "/presse-marques"}>
                {isEn ? "Press & brands" : "Presse & marques"}
              </Link>
              <Link href="/mentions-legales">{isEn ? "Legal notice" : "Mentions légales"}</Link>
              <Link href="/cgv">CGV</Link>
              <Link href="/cookies">Cookies</Link>
            </nav>
          </div>
        </div>
      </section>
    </footer>
  );
}
