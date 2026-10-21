import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { TrainingCheckoutButton } from "@/components/checkout-form";
import { commerce } from "@/lib/commerce";
import { expertTrainingLevels, trainingLevels } from "@/lib/training-course";

const essentialSummary = [
  "Understand how AI music tools interpret an artistic intention.",
  "Write clean prompts: emotion, style, BPM, voice and texture.",
  "Structure lyrics, sections, exports and a first mini-catalogue.",
  "Validate each level with quizzes, then pass the final exam.",
];

const expertSummary = [
  "Advanced prompts, exclusions, variants and artistic direction.",
  "Extend, long versions, dynamic structure and targeted corrections.",
  "Studio workflow: DAW, stems, EQ, export and documentation.",
  "Voices/personas, AI artist identity and final certified composition.",
];

export default function EnglishTrainingPage() {
  return (
    <main className="training-page">
      <Link href="/en" className="lumen-back"><ArrowLeft size={14} /> Back</Link>

      <section className="training-hero">
        <p className="eyebrow">SKORM training</p>
        <h1>Create, produce and structure a credible AI artist.</h1>
        <p>
          Two separate tracks built like a real learning platform:
          detailed lessons, exercises, level quizzes, automatic resume and final exam.
        </p>
      </section>

      <section className="training-offer-grid clean">
        <article className="training-offer-card active">
          <p className="eyebrow">Level 1</p>
          <h2>AI Music Creation — Foundations</h2>
          <strong>{commerce.sunoEssential.displayPrice}</strong>
          <p>Unlimited access. Learn how to frame, generate, correct and present clean AI music.</p>
          <ul>{essentialSummary.map((item) => <li key={item}><CheckCircle2 size={15} /> {item}</li>)}</ul>
          <TrainingCheckoutButton lang="en" product="suno-essential" />
        </article>

        <article className="training-offer-card expert">
          <p className="eyebrow">Expert level</p>
          <h2>AI Music Production — Expert</h2>
          <strong>{commerce.sunoExpert.displayPrice}</strong>
          <p>Payable in 3 installments. Professional track with final exam and composition submission.</p>
          <ul>{expertSummary.map((item) => <li key={item}><CheckCircle2 size={15} /> {item}</li>)}</ul>
          <TrainingCheckoutButton lang="en" product="suno-expert" />
          <Link className="training-mini-link" href="/en/contact">Ask for 3-installment payment</Link>
        </article>
      </section>

      <section className="training-group-quote glass-panel">
        <p className="eyebrow">Collectives, schools, labels</p>
        <h2>Group training on quote.</h2>
        <p>
          SKORM can adapt the program for a team, school, label or collective:
          live workshop, practical cases, project review and tailored follow-up.
        </p>
        <Link href="/en/contact">Request a quote</Link>
      </section>

      <section className="training-program-preview">
        <article>
          <p className="eyebrow">Level 1 track</p>
          <h2>What the student actually learns</h2>
          <div className="training-program-list">
            {trainingLevels.map((level) => (
              <div key={level.id}>
                <span>{level.eyebrow}</span>
                <strong>{level.title}</strong>
                <p>{level.intro}</p>
              </div>
            ))}
          </div>
        </article>
        <article>
          <p className="eyebrow">Expert track</p>
          <h2>To produce and defend a real project</h2>
          <div className="training-program-list">
            {expertTrainingLevels.map((level) => (
              <div key={level.id}>
                <span>{level.eyebrow}</span>
                <strong>{level.title}</strong>
                <p>{level.intro}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
