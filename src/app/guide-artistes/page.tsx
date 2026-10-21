import { InfoPage } from "@/components/info-page";

export default function ArtistGuidePage() {
  return (
    <InfoPage
      label="Artistes"
      title="Préparer un dossier artiste complet."
      intro="La page de dépôt sert à comprendre rapidement ton univers, ton niveau d’avancement et ce que tu attends réellement de SKORM."
      cta={{ label: "Déposer un profil artiste", href: "/rejoindre-agence" }}
      sections={[
        {
          title: "Identité et univers",
          text: "Nom d’artiste, ville, style musical, esthétique, références, direction scénique et tout ce qui rend le projet reconnaissable.",
          items: ["nom d’artiste", "style", "bio courte", "ville / pays", "positionnement"],
        },
        {
          title: "Réseaux et présence",
          text: "Les liens permettent d’évaluer l’image actuelle, la régularité des contenus, la communauté et les formats déjà performants.",
          items: ["Instagram", "TikTok", "YouTube", "Spotify", "SoundCloud"],
        },
        {
          title: "Sons, vocaux et presskit",
          text: "Le formulaire accepte des liens Drive, Dropbox, WeTransfer ou SoundCloud privés pour écouter les démos, vocaux, edits et packs presse.",
          items: ["démos privées", "vocaux", "photos HD", "logo", "EPK / presskit"],
        },
      ]}
    />
  );
}
