import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageShell({
  label,
  title,
  intro,
  children,
  light = false,
}: {
  label: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <main className={`inner-page ${light ? "inner-light" : ""}`}>
      <section className="page-heading">
        <Link href="/" className="back-link"><ArrowLeft size={14} /> Retour</Link>
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        {intro && <p className="page-intro">{intro}</p>}
      </section>
      {children}
    </main>
  );
}
