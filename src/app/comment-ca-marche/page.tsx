import { InfoPage } from "@/components/info-page";

export default function HowItWorksPage() {
  return (
    <InfoPage
      label="Fonctionnement"
      title="Un accompagnement structuré, sans bruit inutile."
      intro="SKORM agit comme un point central entre l’artiste, les lieux, les marques, les médias et les partenaires. L’objectif : clarifier, organiser, défendre et faire avancer."
      cta={{ label: "Envoyer une demande", href: "/contact" }}
      sections={[
        {
          title: "Comprendre l’univers",
          text: "Avant d’agir, l’agence analyse le projet : identité artistique, positionnement, public, énergie scénique, contenus existants et objectifs prioritaires.",
          items: ["direction artistique", "forces du profil", "rythme de prise de parole", "besoins immédiats"],
        },
        {
          title: "Organiser le suivi",
          text: "Les dates, options, demandes entrantes, rendez-vous et relances sont centralisés pour éviter les oublis et garder une vision claire.",
          items: ["agenda artiste", "notes privées", "suivi des demandes", "priorités hebdomadaires"],
        },
        {
          title: "Développer les opportunités",
          text: "SKORM défend l’artiste auprès des clubs, festivals, marques, médias et partenaires avec un discours cohérent et adapté.",
          items: ["booking Europe", "partenariats", "campagnes social media", "médias et presse"],
        },
      ]}
    />
  );
}
