import { PageShell } from "@/components/page-shell";

export default function TermsPage() {
  return (
    <PageShell label="Légal" title="Conditions générales" intro="Base provisoire à valider juridiquement avant usage contractuel." light>
      <section className="legal-copy glass-panel">
        <p>Les demandes effectuées via le site ne valent pas contrat.</p>
        <p>Chaque collaboration, booking, campagne ou accompagnement fait l’objet d’une proposition dédiée.</p>
        <p>Les conditions financières, délais, droits d’image, livrables et modalités d’annulation sont précisés au cas par cas.</p>
      </section>
    </PageShell>
  );
}
