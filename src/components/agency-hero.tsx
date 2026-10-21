"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { HorizontalRail } from "@/components/horizontal-rail";
import type { PublicDate } from "@/lib/public-site-data";

type Lang = "fr" | "en";

export function AgencyHero({ lang = "fr", dates = [] }: { lang?: Lang; dates?: PublicDate[] }) {
  const isEn = lang === "en";
  const base = isEn ? "/en" : "";
  dates = dates.filter(date => !date.past);

  return (
    <section className="agency-paga-hero agency-centered-hero agency-hero-clean">
      <div className="agency-paga-overlay" />

      <div className="agency-paga-shell">
        <div className="agency-paga-copy">
          <p className="eyebrow">
            {isEn
              ? "Management · Communication · Partnerships · AI · Training"
              : "Management · Communication · Partenariats · IA · Formation"}
          </p>
          <img className="agency-hero-logo" src="/skorm-logo.webp" alt="SKORM Agency" />
          <p>
            {isEn
              ? "A dark-tech agency shaping image, content, dates and opportunities around electronic artists, AI artists and ambitious creative projects."
              : "Une agence dark-tech qui structure l’image, les contenus, les dates et les opportunités autour d’artistes électroniques, d’artistes IA et de projets créatifs ambitieux."}
          </p>
          <div className="agency-hero-actions">
            <Link href="#roster">{isEn ? "Discover the roster" : "Découvrir le roster"}</Link>
            <Link href={`${base}/contact`}>Contact</Link>
          </div>
        </div>

        <div className="agency-hero-date-strip">
          <div className="agency-paga-date-head">
            <p className="eyebrow">{isEn ? "Upcoming dates" : "Prochaines dates"}</p>
            <span>{String(dates.length).padStart(2, "0")} events</span>
          </div>
          <HorizontalRail className="agency-date-rail">
            {dates.length ? dates.map((date) => (
              <Link href={`${base}/agenda`} className="agency-active-date" key={`${date.iso}-${date.event}`}>
                <div>
                  <time><b>{date.day}</b>{date.month}</time>
                  <span>{date.status}</span>
                </div>
                <strong>{date.event}</strong>
                <small><MapPin size={12} /> {date.location} · {date.artist}</small>
              </Link>
            )) : (
              <Link href={`${base}/agenda`} className="agency-active-date">
                <div>
                  <time><b>--</b>TBA</time>
                  <span>{isEn ? "Soon" : "À venir"}</span>
                </div>
                <strong>{isEn ? "Dates in preparation" : "Dates en préparation"}</strong>
                <small><MapPin size={12} /> SKORM · roster</small>
              </Link>
            )}
          </HorizontalRail>
        </div>
      </div>
    </section>
  );
}
