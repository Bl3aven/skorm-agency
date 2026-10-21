"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ban,
  CalendarDays,
  CircleDollarSign,
  ContactRound,
  ExternalLink,
  FileText,
  GraduationCap,
  Handshake,
  Images,
  Inbox,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Music2,
  Network,
  ReceiptText,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Vue d’ensemble", icon: LayoutDashboard },
  { href: "/admin/demandes", label: "Demandes", icon: Inbox },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap },
  { href: "/admin/artistes", label: "Artistes", icon: Music2 },
  { href: "/admin/diapo-medias", label: "Diapo médias", icon: Images },
  { href: "/admin/calendriers", label: "Agendas privés", icon: CalendarDays },
  { href: "/admin/prestations-tarifs", label: "Prestations & tarifs", icon: ReceiptText },
  { href: "/admin/organigramme", label: "Organigramme", icon: Network },
  { href: "/admin/death-note", label: "Death Note", icon: Ban },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/campagnes", label: "Campagnes", icon: Handshake },
  { href: "/admin/contenus", label: "Contenus", icon: FileText },
  { href: "/admin/contacts", label: "Contacts", icon: ContactRound },
  { href: "/admin/finances", label: "Finances", icon: CircleDollarSign },
  { href: "/admin/taches", label: "Tâches", icon: ListChecks },
  { href: "/admin/api", label: "API & Clé", icon: KeyRound },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-logo admin-logo-image" aria-label="SKORM Back Office">
          <img src="/skorm-logo.webp" alt="SKORM" />
          <span>BACK OFFICE</span>
        </Link>
        <nav>
          {items.map(({ href, label, icon: Icon }) => (
            <Link className={pathname === href ? "active" : ""} href={href} key={href}>
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <Link href="/" className="admin-site-link">
          Voir le site <ExternalLink size={14} />
        </Link>
      </aside>
      <div className="admin-content">
        <header className="admin-topbar">
          <div>
            <span>Agence</span>
            <strong>SKORM Agency</strong>
          </div>
          <div className="admin-avatar">SK</div>
        </header>
        {children}
      </div>
    </div>
  );
}
