import { InfoPage } from "@/components/info-page";

export default function EnglishHowItWorksPage() {
  return (
    <InfoPage
      label="Method"
      title="A clear operating structure around the artist."
      intro="SKORM acts as a central point between the artist, venues, brands, media and partners: clarify, organise, defend and move forward."
      cta={{ label: "Send a request", href: "/en/contact" }}
      lang="en"
      sections={[
        {
          title: "Understand",
          text: "We read the universe, the rhythm, the current assets, the audience and what must be protected before anything is exposed publicly.",
        },
        {
          title: "Organise",
          text: "Dates, releases, content, brand requests and priorities are structured so every action has a place.",
        },
        {
          title: "Develop",
          text: "SKORM defends the artist with clubs, festivals, brands, media and partners through a consistent professional narrative.",
        },
        {
          title: "Follow up",
          text: "Requests, decisions, deadlines and opportunities are tracked so the artist and the agency keep a clean overview.",
        },
      ]}
    />
  );
}
