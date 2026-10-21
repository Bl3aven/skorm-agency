import { InfoPage } from "@/components/info-page";

export default function EnglishPressBrandsPage() {
  return (
    <InfoPage
      label="Press & brands"
      title="One clean entry point for professional requests."
      intro="SKORM handles media, sponsors, activations, content campaigns and brand partnerships around artists and events."
      cta={{ label: "Contact SKORM", href: "/en/contact" }}
      lang="en"
      sections={[
        {
          title: "Brand partnerships",
          text: "Sponsors, activations, product placement, event visibility and ambassador opportunities are reviewed with the artist’s image in mind.",
        },
        {
          title: "Media requests",
          text: "Interviews, press features, podcasts, editorial formats and image requests are centralised and prioritised.",
        },
        {
          title: "Booking requests",
          text: "Clubs, festivals and private events can submit dates, budgets, location, timing and technical expectations.",
        },
        {
          title: "Campaign follow-up",
          text: "SKORM keeps a clear line between the artist, the partner and the operational details so execution stays clean.",
        },
      ]}
    />
  );
}
