import { PageShell } from "@/components/page-shell";

export default function LegalPage() {
  return (
    <PageShell label="Légal" title="Mentions légales" intro="Informations à compléter avec les données juridiques définitives." light>
      <section className="legal-copy glass-panel">
        <p>Éditeur : SKORM Agency.</p>
        <p>Activité : communication, management, booking, formation IA et partenariats pour artistes.</p>
        <p>Contact : via le formulaire du site ou Instagram @skormagency.</p>
        <p>Hébergement : Vercel Inc.</p>
      </section>
    </PageShell>
  );
}
