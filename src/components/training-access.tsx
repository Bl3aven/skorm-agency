"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FINAL_PASS_SCORE,
  MODULE_PASS_SCORE,
  expertFinalExam,
  expertTrainingLevels,
  finalExam,
  trainingLevels,
  type QuizQuestion,
} from "@/lib/training-course";

type Course = "beginner" | "expert";
type Stage = "intro" | "lesson" | "quiz" | "final" | "practical" | "done";

function emptyAnswers(length: number) {
  return Array.from({ length }, () => -1);
}

function scoreQuiz(questions: QuizQuestion[], answers: number[]) {
  return questions.reduce((score, question, index) => score + (answers[index] === question.answer ? 1 : 0), 0);
}

export function TrainingAccess({
  sessionId,
  testAccess = false,
}: {
  sessionId?: string;
  testAccess?: boolean;
}) {
  const [paid, setPaid] = useState(testAccess);
  const [checking, setChecking] = useState(Boolean(sessionId) && !testAccess);
  const [email, setEmail] = useState(testAccess ? "test@skorm-agency.com" : "");
  const [course, setCourse] = useState<Course>("beginner");
  const [stage, setStage] = useState<Stage>("intro");
  const [levelIndex, setLevelIndex] = useState(0);
  const levels = course === "expert" ? expertTrainingLevels : trainingLevels;
  const exam = course === "expert" ? expertFinalExam : finalExam;
  const [quizAnswers, setQuizAnswers] = useState<number[]>(emptyAnswers(levels[0].quiz.length));
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [validatedLevels, setValidatedLevels] = useState<number[]>([]);
  const [finalAnswers, setFinalAnswers] = useState<number[]>(emptyAnswers(exam.length));
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [compositionSent, setCompositionSent] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const storageKey = email ? `skorm-training:${email}:${course}` : "";

  useEffect(() => {
    if (testAccess || !sessionId) return;
    fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((data) => {
        const product = String(data.product || "");
        setPaid(Boolean(data.paid && (product === "suno-essential" || product === "suno-expert")));
        setCourse(product === "suno-expert" ? "expert" : "beginner");
        setEmail(data.email || "");
      })
      .finally(() => setChecking(false));
  }, [sessionId, testAccess]);

  useEffect(() => {
    if (!paid || !storageKey) return;
    setHydrated(false);
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      setHydrated(true);
      return;
    }
    try {
      const data = JSON.parse(saved) as {
        stage?: Stage;
        levelIndex?: number;
        validatedLevels?: number[];
        finalScore?: number | null;
        compositionSent?: boolean;
      };
      if (data.stage) setStage(data.stage);
      if (typeof data.levelIndex === "number") setLevelIndex(Math.min(data.levelIndex, levels.length - 1));
      if (Array.isArray(data.validatedLevels)) setValidatedLevels(data.validatedLevels);
      if (typeof data.finalScore === "number") setFinalScore(data.finalScore);
      if (typeof data.compositionSent === "boolean") setCompositionSent(data.compositionSent);
    } catch {}
    setHydrated(true);
  }, [paid, storageKey, levels.length]);

  useEffect(() => {
    setQuizAnswers(emptyAnswers(levels[levelIndex]?.quiz.length || levels[0].quiz.length));
    setQuizScore(null);
    setFinalAnswers(emptyAnswers(exam.length));
  }, [course, levelIndex, levels, exam.length]);

  useEffect(() => {
    if (!paid || !storageKey || !hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify({
      stage,
      levelIndex,
      validatedLevels,
      finalScore,
      compositionSent,
    }));
  }, [paid, storageKey, hydrated, stage, levelIndex, validatedLevels, finalScore, compositionSent]);

  const currentLevel = levels[levelIndex];
  const progress = useMemo(() => {
    if (stage === "intro") return Math.round((validatedLevels.length / levels.length) * 84);
    if (stage === "final") return 92;
    if (stage === "practical") return 96;
    if (stage === "done") return 100;
    const base = (validatedLevels.length / levels.length) * 84;
    return Math.min(90, Math.round(base + (stage === "quiz" ? 10 : 4)));
  }, [stage, validatedLevels.length, levels.length]);

  function reportProgress(nextStage = stage, nextProgress = progress, extra: Record<string, string | number | boolean> = {}) {
    if (!email) return;
    fetch("/api/training-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        course,
        progress: nextProgress,
        stage: nextStage,
        status: nextProgress >= 100 ? "validated" : nextStage === "practical" ? "composition_pending" : "in_progress",
        ...extra,
      }),
    }).catch(() => {});
  }

  function startLevel(index = levelIndex) {
    setLevelIndex(index);
    setQuizAnswers(emptyAnswers(levels[index].quiz.length));
    setQuizScore(null);
    setStage("lesson");
    reportProgress("lesson", Math.max(progress, Math.round((index / levels.length) * 84)));
  }

  function submitLevelQuiz() {
    const score = scoreQuiz(currentLevel.quiz, quizAnswers);
    setQuizScore(score);
    if (score >= MODULE_PASS_SCORE) {
      setValidatedLevels((current) => Array.from(new Set([...current, levelIndex])).sort((a, b) => a - b));
      reportProgress("quiz", Math.round(((levelIndex + 1) / levels.length) * 84), { level: levelIndex + 1, score });
    }
  }

  function nextLevel() {
    const next = levelIndex + 1;
    if (next >= levels.length) {
      setStage("final");
      setFinalScore(null);
      setFinalAnswers(emptyAnswers(exam.length));
      reportProgress("final", 92);
      return;
    }
    startLevel(next);
  }

  function submitFinal() {
    const score = scoreQuiz(exam, finalAnswers);
    setFinalScore(score);
    if (score >= FINAL_PASS_SCORE) reportProgress(course === "expert" ? "practical" : "done", course === "expert" ? 96 : 100, { finalScore: score });
  }

  if (checking) {
    return (
      <main className="training-page">
        <section className="training-hero"><p>Vérification du paiement...</p></section>
      </main>
    );
  }

  if (!paid) {
    return (
      <main className="training-page">
        <section className="training-hero">
          <p className="eyebrow">Accès formation</p>
          <h1>Accès réservé après paiement.</h1>
          <p>Si tu viens de payer, rouvre le lien de confirmation Stripe. Sinon, retourne à la page formation.</p>
          <a className="training-link" href="/formation-ia">Retour formation</a>
        </section>
      </main>
    );
  }

  return (
    <main className="training-page training-course-page">
      <section className="training-progress-shell">
        <div className="training-progress-head">
          <span>{testAccess ? "Accès test complet" : "Formation débloquée"}</span>
          <strong>{progress}%</strong>
        </div>
        <div className="training-progress-track"><span style={{ width: `${progress}%` }} /></div>
      </section>

      {stage === "intro" && (
        <section className="training-hero training-start">
          <p className="eyebrow">{course === "expert" ? "Production musicale IA — Expert" : "Création musicale IA — Fondations"}</p>
          <h1>{course === "expert" ? "Parcours expert, examen et composition finale." : "Un parcours guidé, niveau par niveau."}</h1>
          <p>
            La formation se débloque dans l’ordre : cours du niveau, exercice, QCM sur 10,
            validation à 8/10 minimum, puis niveau suivant. La progression est sauvegardée :
            tu peux quitter et reprendre ici quand tu veux.
          </p>
          {testAccess && (
            <div className="training-course-switch">
              <button type="button" className={course === "beginner" ? "active" : ""} onClick={() => { setCourse("beginner"); setStage("intro"); setValidatedLevels([]); setLevelIndex(0); }}>Niveau 1</button>
              <button type="button" className={course === "expert" ? "active" : ""} onClick={() => { setCourse("expert"); setStage("intro"); setValidatedLevels([]); setLevelIndex(0); }}>Expert</button>
            </div>
          )}
          <button className="training-primary-action" type="button" onClick={() => startLevel(0)}>
            {validatedLevels.length ? "Reprendre la formation" : "Démarrer la formation"}
          </button>
        </section>
      )}

      {stage === "lesson" && (
        <section className="training-step-card">
          <p className="eyebrow">{currentLevel.eyebrow}</p>
          <h1>{currentLevel.title}</h1>
          <p className="training-step-intro">{currentLevel.intro}</p>
          <div className="training-lesson-list">
            {currentLevel.lessons.map((lesson, index) => (
              <article key={lesson}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{lesson}</p>
              </article>
            ))}
          </div>
          <div className="training-exercise">
            <span>Exercice</span>
            <p>{currentLevel.exercise}</p>
          </div>
          <button className="training-primary-action" type="button" onClick={() => setStage("quiz")}>
            Suivant : questionnaire du niveau
          </button>
        </section>
      )}

      {stage === "quiz" && (
        <section className="training-step-card">
          <p className="eyebrow">{currentLevel.eyebrow} · QCM</p>
          <h1>Questionnaire sur 10</h1>
          <p className="training-step-intro">Il faut obtenir au moins {MODULE_PASS_SCORE}/10 pour passer au niveau suivant.</p>
          <QuizForm questions={currentLevel.quiz} answers={quizAnswers} onChange={setQuizAnswers} />
          <div className="training-result-bar">
            <button className="training-primary-action" type="button" onClick={submitLevelQuiz}>Corriger le questionnaire</button>
            {quizScore !== null && (
              <strong className={quizScore >= MODULE_PASS_SCORE ? "passed" : "failed"}>Résultat : {quizScore}/10</strong>
            )}
          </div>
          {quizScore !== null && quizScore < MODULE_PASS_SCORE && (
            <p className="training-warning">Score insuffisant : relis le cours du niveau puis retente le QCM.</p>
          )}
          {quizScore !== null && quizScore >= MODULE_PASS_SCORE && (
            <button className="training-secondary-action" type="button" onClick={nextLevel}>
              {levelIndex + 1 >= levels.length ? "Passer l’examen final" : "Niveau suivant"}
            </button>
          )}
        </section>
      )}

      {stage === "final" && (
        <section className="training-step-card final-exam">
          <p className="eyebrow">Examen final</p>
          <h1>Questionnaire final de 100 questions</h1>
          <p className="training-step-intro">
            Validation à partir de {FINAL_PASS_SCORE}/100.
            {course === "expert" ? " Ensuite, tu passes l’épreuve pratique : composition finale + explication complète de méthode." : " Une fois validé, tu peux continuer vers le niveau Expert si tu veux aller plus loin."}
          </p>
          <QuizForm questions={exam} answers={finalAnswers} onChange={setFinalAnswers} compact />
          <div className="training-result-bar">
            <button className="training-primary-action" type="button" onClick={submitFinal}>Corriger l’examen final</button>
            {finalScore !== null && (
              <strong className={finalScore >= FINAL_PASS_SCORE ? "passed" : "failed"}>Résultat : {finalScore}/100</strong>
            )}
          </div>
          {finalScore !== null && finalScore < FINAL_PASS_SCORE && (
            <p className="training-warning">Tu es proche : reprends les niveaux faibles puis retente l’examen.</p>
          )}
          {finalScore !== null && finalScore >= FINAL_PASS_SCORE && (
            <button className="training-secondary-action" type="button" onClick={() => course === "expert" ? setStage("practical") : setStage("done")}>
              {course === "expert" ? "Passer l’épreuve pratique" : "Valider la formation"}
            </button>
          )}
        </section>
      )}

      {stage === "practical" && (
        <section className="training-step-card final-exam">
          <p className="eyebrow">Certification expert</p>
          <h1>Composition finale à soumettre</h1>
          <p className="training-step-intro">
            Compose un morceau complet, puis explique précisément ta méthode :
            prompt, outils, structure, Extend, corrections, export, intention artistique et choix de rendu.
          </p>
          <form
            className="training-practical-form"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              reportProgress("practical", 96, {
                status: "composition_pending",
                composition_link: String(data.get("composition_link") || ""),
                tools: String(data.get("tools") || ""),
                method: String(data.get("method") || ""),
                certificate: true,
              });
              setCompositionSent(true);
            }}
          >
            <label>Lien du morceau final<input name="composition_link" required placeholder="SoundCloud, Drive, Dropbox, WeTransfer..." /></label>
            <label>Outils utilisés<input name="tools" required placeholder="Suno V5.5, DAW, EQ, mastering, visuels..." /></label>
            <label>Explication complète<textarea name="method" required placeholder="Prompt de départ, versions testées, structure, choix Extend, corrections, export, intention artistique..." /></label>
            <button className="training-primary-action" type="submit">Envoyer la composition finale</button>
          </form>
          {compositionSent && (
            <div className="training-practical-sent">
              Composition finale envoyée. Statut admin : en attente de validation et d’envoi du certificat.
              <button type="button" onClick={() => { reportProgress("done", 100, { status: "validated" }); setStage("done"); }}>Marquer comme terminé</button>
            </div>
          )}
        </section>
      )}

      {stage === "done" && (
        <section className="training-hero training-complete">
          <p className="eyebrow">Formation validée</p>
          <h1>{course === "expert" ? "Parcours expert terminé." : "Niveau 1 terminé."}</h1>
          <p>
            {course === "expert"
              ? "Ton parcours expert est complet. L’équipe SKORM peut maintenant vérifier ta composition finale et préparer la validation."
              : "Tu as validé les bases. Si tu veux passer au niveau production, tu peux continuer avec le parcours Expert."}
          </p>
          {course === "beginner" && <a className="training-link" href="/formation-ia">Découvrir le niveau Expert</a>}
        </section>
      )}
    </main>
  );
}

function QuizForm({
  questions,
  answers,
  onChange,
  compact = false,
}: {
  questions: QuizQuestion[];
  answers: number[];
  onChange: (answers: number[]) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "training-qcm compact" : "training-qcm"}>
      {questions.map((question, questionIndex) => (
        <article className="training-question" key={`${question.prompt}-${questionIndex}`}>
          <h2><span>{String(questionIndex + 1).padStart(2, "0")}</span>{question.prompt.replace(/^\d+\. /, "")}</h2>
          <div>
            {question.options.map((option, optionIndex) => (
              <label key={option}>
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  checked={answers[questionIndex] === optionIndex}
                  onChange={() => {
                    const next = [...answers];
                    next[questionIndex] = optionIndex;
                    onChange(next);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
