import { InfoPage } from "@/components/info-page";

export default function EnglishArtistGuidePage() {
  return (
    <InfoPage
      label="Artists"
      title="What to prepare before joining SKORM."
      intro="The artist application page helps us understand your universe, your current stage and the kind of support you need."
      cta={{ label: "Submit a profile", href: "/en/rejoindre-agence" }}
      lang="en"
      sections={[
        {
          title: "Identity",
          text: "Artist name, city, music style, biography, stage experience and the direction you want to build.",
        },
        {
          title: "Music & visuals",
          text: "Send official tracks, demos, SoundCloud or Spotify links, videos, live sets, press kit and strong images.",
        },
        {
          title: "Socials",
          text: "Instagram, TikTok, YouTube, Spotify, SoundCloud and any channel that shows your current audience or aesthetic.",
        },
        {
          title: "Needs",
          text: "Explain what you expect: communication, European booking, image direction, management, brands or AI artist development.",
        },
      ]}
    />
  );
}
