import { InfoPage } from "@/components/info-page";

export default function PressBrandsPage() {
  return (
    <InfoPage
      label="Presse & marques"
      title="Proposer une présence utile autour des artistes."
      intro="SKORM traite les demandes médias, sponsors, activations événementielles, campagnes de contenus et partenariats de marque."
      cta={{ label: "Envoyer un brief marque", href: "/devenir-sponsor" }}
      sections={[
        {
          title: "Sponsoring",
          text: "Présence sur une date, soutien de tournée, visibilité autour d’un artiste, opération locale ou activation européenne.",
          items: ["objectif", "budget", "territoire", "artiste souhaité", "timing"],
        },
        {
          title: "Campagnes social media",
          text: "Création de contenus, formats courts, relais sur les réseaux, teasing de sortie, présence événementielle ou ambassadeur.",
          items: ["livrables", "plateformes", "droits d’usage", "calendrier", "KPI"],
        },
        {
          title: "Médias & presse",
          text: "Demandes d’interview, sujets éditoriaux, annonces de dates, communiqués, contenus backstage ou focus artiste.",
          items: ["angle éditorial", "date de publication", "format", "contact rédaction"],
        },
      ]}
    />
  );
}
