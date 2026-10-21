import { InfoPage } from "@/components/info-page";

export default function EnglishFaqPage() {
  return (
    <InfoPage
      label="FAQ"
      title="Answers before sending a request."
      intro="This page clarifies the most common requests: booking, artists, brands, timing, follow-up and the information SKORM needs."
      cta={{ label: "Contact the agency", href: "/en/contact" }}
      lang="en"
      sections={[
        {
          title: "How do I request a date?",
          text: "Send the event context, city, target date, artist, indicative budget, schedule and decision-maker contact.",
        },
        {
          title: "Can an artist join the agency?",
          text: "Yes, but the request must be complete: identity, tracks, social links, press kit, recent dates, goals and precise needs.",
        },
        {
          title: "Is the AI training available after payment?",
          text: "Yes. Payment unlocks the access page with modules, exercises, module quizzes and the final questionnaire.",
        },
      ]}
    />
  );
}
