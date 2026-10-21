"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

function withBase(base: string, href: string) {
  if (href === "/") return base || "/";
  return `${base}${href}`;
}

export function SiteChrome() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isEn = pathname.startsWith("/en");
  const base = isEn ? "/en" : "";

  if (pathname.startsWith("/admin") || pathname === "/connexion" || pathname.startsWith("/espace-artiste")) return null;

  const mobileLinks = [
    { href: withBase(base, "/"), label: isEn ? "Home" : "Accueil" },
    { href: withBase(base, "/artistes"), label: isEn ? "Artists" : "Artistes" },
    { href: withBase(base, "/agenda"), label: "Agenda" },
    { href: withBase(base, "/formation-ia"), label: isEn ? "AI training" : "Formation IA" },
    { href: withBase(base, "/rejoindre-agence"), label: isEn ? "Join the agency" : "Rejoindre l'agence" },
    { href: withBase(base, "/devenir-sponsor"), label: isEn ? "Become a sponsor" : "Devenir sponsor" },
    { href: withBase(base, "/contact"), label: "Contact" },
    { href: "/connexion", label: isEn ? "Login" : "Connexion" },
  ];

  return (
    <>
      <header className="floating-header">
        <Link className="brand brand-logo" href={base || "/"} aria-label="SKORM Agency">
          <img src="/skorm-header-logo.webp" alt="SKORM Agency" />
        </Link>
        <nav>
          <Link href={withBase(base, "/artistes")}>{isEn ? "Artists" : "Artistes"}</Link>
          <Link href={withBase(base, "/formation-ia")}>{isEn ? "Training" : "Formation"}</Link>
          <Link href={withBase(base, "/agenda")}>Agenda</Link>
          <Link className="header-contact" href={withBase(base, "/contact")}>Contact</Link>
          <Link href="/connexion">{isEn ? "Login" : "Connexion"}</Link>
          <Link href={isEn ? "/" : "/en"}>{isEn ? "FR" : "EN"}</Link>
        </nav>
        <button
          className="mobile-menu"
          type="button"
          aria-label={menuOpen ? (isEn ? "Close menu" : "Fermer le menu") : (isEn ? "Open menu" : "Ouvrir le menu")}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <div id="mobile-navigation" className={`mobile-navigation ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <nav aria-label={isEn ? "Mobile menu" : "Menu mobile"}>
          {mobileLinks.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className={pathname === item.href ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              <span>{item.label}</span>
              <small>{isEn ? "Open" : "Ouvrir"}</small>
            </Link>
          ))}
          <Link href={isEn ? "/" : "/en"} onClick={() => setMenuOpen(false)}>
            <span>{isEn ? "Version française" : "English version"}</span>
            <small>{isEn ? "Switch" : "Changer"}</small>
          </Link>
        </nav>
      </div>

      {menuOpen && (
        <button
          className="mobile-menu-backdrop"
          type="button"
          aria-label={isEn ? "Close menu" : "Fermer le menu"}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <nav className="floating-dock" aria-label={isEn ? "Quick navigation" : "Navigation rapide"}>
        <Link href={withBase(base, "/artistes")} aria-label="Artistes"><span>ARTISTES</span></Link>
        <Link className="dock-center" href={withBase(base, "/contact")} aria-label="Contact"><span>CONTACT</span></Link>
        <Link href={withBase(base, "/formation-ia")} aria-label={isEn ? "AI training" : "Formation IA"}><span>FORMATION</span></Link>
      </nav>
    </>
  );
}
