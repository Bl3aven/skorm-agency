import { PageShell } from "@/components/page-shell";

export default function CookiesPage() {
  return (
    <PageShell label="Confidentialité" title="Cookies" intro="Le site utilise uniquement les éléments nécessaires à son fonctionnement." light>
      <section className="legal-copy glass-panel">
        <p>Aucun outil publicitaire externe n’est activé par défaut.</p>
        <p>Les cookies techniques peuvent être utilisés pour la navigation, les formulaires et l’accès administrateur.</p>
        <p>Cette page pourra être complétée si des outils d’analyse ou de suivi sont ajoutés.</p>
      </section>
    </PageShell>
  );
}
