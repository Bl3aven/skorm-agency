import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { TrainingCheckoutButton } from "@/components/checkout-form";
import { commerce } from "@/lib/commerce";
import { expertTrainingLevels, trainingLevels } from "@/lib/training-course";

const essentialSummary = [
  "Comprendre comment une IA musicale interprète une intention.",
  "Écrire des prompts propres : émotion, style, BPM, voix, texture.",
  "Structurer paroles, sections, exports et mini-catalogue.",
  "Valider chaque niveau par QCM puis examen final.",
];

const expertSummary = [
  "Prompts avancés, exclusions, variantes et direction artistique.",
  "Extend, versions longues, structure dynamique et corrections ciblées.",
  "Workflow studio : DAW, stems, EQ, export et documentation.",
  "Voix/personas, identité d’artiste IA et composition finale certifiante.",
];

export default function TrainingPage() {
  return (
    <main className="training-page">
      <Link href="/" className="lumen-back"><ArrowLeft size={14} /> Retour</Link>

      <section className="training-hero">
        <p className="eyebrow">Formations SKORM</p>
        <h1>Créer, produire et structurer un artiste IA crédible.</h1>
        <p>
          Deux parcours séparés, pensés comme une vraie plateforme de formation :
          cours détaillés, exercices, QCM par niveau, reprise automatique et examen final.
        </p>
      </section>

      <section className="training-offer-grid clean">
        <article className="training-offer-card active">
          <p className="eyebrow">Niveau 1</p>
          <h2>Création musicale IA — Fondations</h2>
          <strong>{commerce.sunoEssential.displayPrice}</strong>
          <p>Accès illimité. Pour apprendre à cadrer, générer, corriger et présenter des morceaux propres.</p>
          <ul>{essentialSummary.map((item) => <li key={item}><CheckCircle2 size={15} /> {item}</li>)}</ul>
          <TrainingCheckoutButton product="suno-essential" />
        </article>

        <article className="training-offer-card expert">
          <p className="eyebrow">Niveau Expert</p>
          <h2>Production musicale IA — Expert</h2>
          <strong>{commerce.sunoExpert.displayPrice}</strong>
          <p>Payable en 3 fois. Parcours pro avec examen final et composition à soumettre pour validation.</p>
          <ul>{expertSummary.map((item) => <li key={item}><CheckCircle2 size={15} /> {item}</li>)}</ul>
          <TrainingCheckoutButton product="suno-expert" />
          <Link className="training-mini-link" href="/contact">Demander le paiement en 3 fois</Link>
        </article>
      </section>

      <section className="training-group-quote glass-panel">
        <p className="eyebrow">Collectifs, écoles, labels</p>
        <h2>Formation en groupe sur devis.</h2>
        <p>
          SKORM peut adapter le programme pour une équipe, une école, un label ou un collectif :
          atelier live, cas pratiques, correction de projets et suivi personnalisé.
        </p>
        <Link href="/contact">Demande sur devis</Link>
      </section>

      <section className="training-program-preview">
        <article>
          <p className="eyebrow">Parcours niveau 1</p>
          <h2>Ce que l’élève apprend concrètement</h2>
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
          <p className="eyebrow">Parcours expert</p>
          <h2>Pour produire et défendre un vrai projet</h2>
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
