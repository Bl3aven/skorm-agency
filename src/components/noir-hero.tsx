"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useState } from "react";

export function NoirHero({ en = false }: { en?: boolean }) {
  const [slide, setSlide] = useState(0);
  const base = en ? "/en" : "";
  const slides = en ? [
    { kicker: "DARK-TECH & ELECTRONIC MUSIC AGENCY", text: "An agency shaping image, content, dates and opportunities around electronic artists, AI artists and ambitious creative projects.", action: "Discover the roster", href: "#roster", image: "/agency/noir-dj-hero.webp" },
    { kicker: "ON STAGE. ACROSS EUROPE.", text: "Connecting artists, promoters and audiences. Explore the next dates and imagine the next stage together.", action: "Explore the agenda", href: "/en/agenda", image: "/agency/agency-stage.webp" },
    { kicker: "AN IDENTITY. A VISION. A CAREER.", text: "Art direction, communication and artist development. A shared vision to bring ambitious projects to life.", action: "Meet the agency", href: "/en/comment-ca-marche", image: "/agency/light-trails-stage.webp" },
  ] : [
    { kicker: "AGENCE DARK-TECH & ÉLECTRONIQUE", text: "Une agence qui structure l’image, les contenus, les dates et les opportunités autour d’artistes électroniques, d’artistes IA et de projets créatifs ambitieux.", action: "Découvrir le roster", href: "#roster", image: "/agency/noir-dj-hero.webp" },
    { kicker: "SUR SCÈNE. PARTOUT EN EUROPE.", text: "Connecter les artistes, les organisateurs et le public. Découvrez les prochaines dates et imaginons ensemble la prochaine scène.", action: "Explorer l’agenda", href: "/agenda", image: "/agency/agency-stage.webp" },
    { kicker: "UNE IDENTITÉ. UNE VISION. UNE CARRIÈRE.", text: "Direction artistique, communication et développement de carrière. Une vision commune pour donner vie aux projets ambitieux.", action: "Découvrir l’agence", href: "/comment-ca-marche", image: "/agency/light-trails-stage.webp" },
  ];
  const current = slides[slide];
  return <section className="noir-hero" aria-label={en ? "SKORM Agency introduction" : "Présentation de SKORM Agency"}>
    <div className="noir-hero-visual" key={current.image}><Image src={current.image} alt="" fill sizes="100vw" preload={slide === 0} unoptimized /></div>
    <div className="noir-hero-shade" /><div className="noir-orbit noir-hero-orbit" aria-hidden="true" />
    <div className="noir-hero-inner">
      <div className="noir-hero-copy" key={current.kicker} aria-live="polite"><p className="noir-eyebrow noir-hero-eyebrow">{current.kicker}</p><h1><img src="/skorm-logo.webp" alt="SKORM Agency" width={560} height={140} /></h1><p className="noir-hero-description">{current.text}</p><div className="noir-hero-actions"><Link className="noir-button noir-button-primary" href={current.href}>{current.action}<ArrowRight size={17} /></Link><Link className="noir-button noir-button-outline" href={`${base}/contact`}>Contact</Link></div></div>
      <div className="noir-hero-controls" aria-label={en ? "Hero slides" : "Diapositives de présentation"}>{slides.map((item, i) => <button type="button" key={item.kicker} aria-label={`${en ? "Show slide" : "Afficher la diapositive"} ${i + 1}`} aria-pressed={slide === i} onClick={() => setSlide(i)}><span>{String(i + 1).padStart(2, "0")}</span><i /></button>)}</div>
      <a className="noir-scroll" href="#dates"><span><ArrowDown size={19} /></span><small>{en ? "SCROLL" : "SCROLLER"}</small></a>
    </div>
  </section>;
}
