import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function InfoPage({
  label,
  title,
  intro,
  sections,
  cta,
  lang = "fr",
}: {
  label: string;
  title: string;
  intro: string;
  sections: { title: string; text: string; items?: string[] }[];
  cta?: { label: string; href: string };
  lang?: "fr" | "en";
}) {
  const isEn = lang === "en";

  return (
    <main className="info-page">
      <Link href={isEn ? "/en" : "/"} className="info-back"><ArrowLeft size={14} /> {isEn ? "Back" : "Retour"}</Link>
      <section className="info-hero">
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <section className="info-grid">
        {sections.map((section, index) => (
          <article key={section.title}>
            <small>{String(index + 1).padStart(2, "0")}</small>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
            {section.items && (
              <ul>
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </article>
        ))}
      </section>
      {cta && <Link className="info-cta" href={cta.href}>{cta.label} <span>→</span></Link>}
    </main>
  );
}
