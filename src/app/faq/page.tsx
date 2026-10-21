import { InfoPage } from "@/components/info-page";

export default function FaqPage() {
  return (
    <InfoPage
      label="FAQ"
      title="Les réponses avant d’envoyer une demande."
      intro="Cette page clarifie les demandes les plus fréquentes : booking, artistes, marques, délais, suivi et informations à transmettre."
      cta={{ label: "Contacter l’agence", href: "/contact" }}
      sections={[
        {
          title: "Comment demander une date ?",
          text: "Il faut envoyer le contexte de l’événement, la ville, la date souhaitée, l’artiste visé, le budget indicatif, les horaires et le contact décisionnaire.",
        },
        {
          title: "Un artiste peut-il rejoindre l’agence ?",
          text: "Oui, mais la demande doit être complète : identité, sons, réseaux, presskit, dernières dates, objectifs et besoins précis.",
        },
        {
          title: "La formation IA est-elle accessible après paiement ?",
          text: "Oui. Le paiement débloque la page d’accès avec les modules, les exercices, les questionnaires de niveau et le questionnaire final.",
        },
      ]}
    />
  );
}
