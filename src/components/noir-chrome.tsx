"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { NoirMotion } from "@/components/noir-motion";

export function SiteChrome() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const en = pathname.startsWith("/en");
  const base = en ? "/en" : "";
  if (pathname.startsWith("/admin") || pathname === "/connexion" || pathname.startsWith("/espace-artiste")) return null;
  const links = [{ href: `${base}/artistes`, label: en ? "Artists" : "Artistes" }, { href: `${base}/formation-ia`, label: en ? "Training" : "Formation" }, { href: `${base}/agenda`, label: "Agenda" }, { href: `${base}/contact`, label: "Contact" }, { href: "https://skorm-agency.com/connexion", label: en ? "Login" : "Connexion" }];
  const translatedRoutes = new Set(["/", "/artistes", "/agenda", "/formation-ia", "/contact", "/comment-ca-marche", "/devenir-sponsor", "/faq", "/guide-artistes", "/presse-marques", "/rejoindre-agence"]);
  const languageHref = en ? pathname.replace(/^\/en/, "") || "/" : translatedRoutes.has(pathname) ? pathname === "/" ? "/en" : `/en${pathname}` : "/en";
  return <>
    <a className="noir-skip" href="#main-content">{en ? "Skip to content" : "Aller au contenu"}</a>
    <header className="noir-header"><Link className="noir-brand" href={base || "/"} aria-label="SKORM Agency — accueil"><img src="/skorm-header-logo.webp" alt="" width={35} height={42} /></Link><nav aria-label={en ? "Main navigation" : "Navigation principale"}>{links.map(({ href, label }, i) => <Link key={href} href={href} className={pathname === href || (pathname === base || pathname === "/") && i === 0 ? "active" : ""} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav><Link className="noir-language" href={languageHref} lang={en ? "fr" : "en"}>{en ? "FR" : "EN"}</Link><NoirMotion en={en} /><button className="noir-menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? en ? "Close menu" : "Fermer le menu" : en ? "Open menu" : "Ouvrir le menu"} aria-expanded={menuOpen} aria-controls="noir-mobile-menu">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></header>
    {menuOpen && <><button className="noir-menu-backdrop" type="button" onClick={() => setMenuOpen(false)} aria-label={en ? "Close menu" : "Fermer le menu"} /><nav className="noir-mobile-menu" id="noir-mobile-menu" aria-label={en ? "Mobile navigation" : "Navigation mobile"}>{links.map(({ href, label }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)}>{label}<span>↗</span></Link>)}<Link href={languageHref} onClick={() => setMenuOpen(false)}>{en ? "Version française" : "English version"}<span>{en ? "FR" : "EN"}</span></Link></nav></>}
  </>;
}
