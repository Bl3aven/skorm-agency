"use client";

import { FormEvent, useMemo, useState } from "react";

type FormVariant = "contact" | "artist" | "sponsor";
type Lang = "fr" | "en";

const variantCopy = {
  fr: {
    contact: {
      type: "booking",
      eyebrow: "Demande professionnelle",
      title: "Envoyer un brief clair",
      intro: "Booking, média, partenariat ou question directe pour l’agence.",
      steps: ["Contact", "Projet", "Envoi"],
      submit: "Envoyer la demande",
    },
    artist: {
      type: "artist",
      eyebrow: "Dépôt artiste",
      title: "Présenter ton projet",
      intro: "Profil, réseaux, sons, vocaux, dates et besoins d’accompagnement.",
      steps: ["Identité", "Musique", "Objectifs"],
      submit: "Déposer le profil",
    },
    sponsor: {
      type: "brand",
      eyebrow: "Brief marque",
      title: "Proposer une activation",
      intro: "Sponsoring, campagne, événement, contenu social ou partenariat artiste.",
      steps: ["Marque", "Activation", "Budget"],
      submit: "Envoyer le brief",
    },
  },
  en: {
    contact: {
      type: "booking",
      eyebrow: "Professional request",
      title: "Send a clear brief",
      intro: "Booking, press, partnership or direct agency request.",
      steps: ["Contact", "Project", "Send"],
      submit: "Send request",
    },
    artist: {
      type: "artist",
      eyebrow: "Artist submission",
      title: "Present your project",
      intro: "Profile, socials, music, voice notes, dates and management needs.",
      steps: ["Identity", "Music", "Goals"],
      submit: "Submit profile",
    },
    sponsor: {
      type: "brand",
      eyebrow: "Brand brief",
      title: "Propose an activation",
      intro: "Sponsorship, campaign, event, social content or artist partnership.",
      steps: ["Brand", "Activation", "Budget"],
      submit: "Send brief",
    },
  },
} as const;

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} />
    </label>
  );
}

function TextArea({
  label,
  name,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="field field-wide">
      <span>{label}</span>
      <textarea name={name} required={required} placeholder={placeholder} />
    </label>
  );
}

export function ContactForm({ variant = "contact", lang = "fr" }: { variant?: FormVariant; lang?: Lang }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const copy = variantCopy[lang][variant];
  const isEn = lang === "en";

  const subjectOptions = useMemo(() => {
    if (variant === "artist") return [{ value: "artist", label: isEn ? "Artist submission" : "Proposition d’artiste" }];
    if (variant === "sponsor") return [{ value: "brand", label: isEn ? "Brand / sponsor collaboration" : "Collaboration de marque / sponsor" }];
    return [
      { value: "booking", label: isEn ? "Booking / programming" : "Booking / programmation" },
      { value: "brand", label: isEn ? "Brand collaboration" : "Collaboration de marque" },
      { value: "press", label: isEn ? "Press / media" : "Presse / média" },
      { value: "artist", label: isEn ? "Artist submission" : "Proposition d’artiste" },
      { value: "other", label: isEn ? "Other project" : "Autre projet" },
    ];
  }, [variant, isEn]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const form = event.currentTarget;
    const data = new FormData(form);
    const entries = Array.from(data.entries()).map(([key, value]) => [key, String(value).trim()]);
    const get = (key: string) => String(data.get(key) || "").trim();

    const details = entries
      .filter(([key, value]) => value && !["type", "name", "company", "email", "artist"].includes(key))
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const payload = {
      type: get("type") || copy.type,
      name: get("name"),
      company: get("company"),
      email: get("email"),
      artist: get("artist") || "general",
      message: details || get("message"),
    };

    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setStatus(response.ok ? "success" : "error");
    if (response.ok) {
      form.reset();
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  if (status === "success") {
    return (
      <section className={`contact-form lumen-form ${variant} form-success-panel`}>
        <div className="success-orb" />
        <p className="eyebrow">{isEn ? "Request sent" : "Demande transmise"}</p>
        <h1>{isEn ? "It has been sent." : "C’est bien envoyé."}</h1>
        <p>
          {isEn
            ? "Thank you. The request has been saved in the SKORM back office."
            : "Merci, la demande a été enregistrée dans le back-office SKORM."}
        </p>
        <button className="submit-button" type="button" onClick={() => setStatus("idle")}>
          {isEn ? "Send another request" : "Envoyer une autre demande"}
        </button>
      </section>
    );
  }

  return (
    <form className={`contact-form lumen-form ${variant}`} onSubmit={submit}>
      <div className="lumen-form-head">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <div className="lumen-steps">
          {copy.steps.map((step, index) => (
            <span key={step}><b>{index + 1}</b>{step}</span>
          ))}
        </div>
      </div>

      <div className="form-row">
        <label className="field">
          <span>{isEn ? "Request type" : "Votre demande"}</span>
          <select name="type" required defaultValue={subjectOptions[0].value}>
            {subjectOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
        <Field label={isEn ? "Name" : "Nom / prénom"} name="name" required autoComplete="name" />
      </div>

      <div className="form-row">
        <Field label={variant === "artist" ? (isEn ? "Artist name" : "Nom d’artiste") : (isEn ? "Company / organization" : "Société / organisation")} name="company" required={variant !== "contact"} autoComplete="organization" />
        <Field label={isEn ? "Professional e-mail" : "E-mail professionnel"} name="email" type="email" required autoComplete="email" />
      </div>

      {variant === "contact" && (
        <>
          <div className="form-row">
            <label className="field">
              <span>{isEn ? "Artist concerned" : "Artiste concerné"}</span>
              <select name="artist" defaultValue="general">
                <option value="general">{isEn ? "SKORM / general request" : "SKORM / demande générale"}</option>
                <option value="cgl-rave-unit">CGL</option>
                <option value="paga">Paga</option>
              </select>
            </label>
            <Field label={isEn ? "City / country" : "Ville / pays"} name="lieu" placeholder="Paris, Belgium, Switzerland..." />
          </div>
          <div className="form-row">
            <Field label={isEn ? "Preferred date" : "Date souhaitée"} name="date" type="date" />
            <Field label={isEn ? "Budget range" : "Budget indicatif"} name="budget" placeholder={isEn ? "Fee, envelope or to define" : "Cachet, enveloppe ou à définir"} />
          </div>
          <TextArea label={isEn ? "Project / request" : "Projet / demande"} name="message" required placeholder={isEn ? "Event type, context, artist, timing, expectations..." : "Type d’événement, contexte, artiste visé, timing, attentes..."} />
        </>
      )}

      {variant === "artist" && (
        <>
          <div className="form-row">
            <label className="field">
              <span>{isEn ? "Profile type" : "Type de profil"}</span>
              <select name="profile_type" required defaultValue="artist">
                <option value="artist">{isEn ? "Artist" : "Artiste"}</option>
                <option value="singer">{isEn ? "Singer" : "Chanteur"}</option>
                <option value="ai_artist">{isEn ? "AI artist" : "Artiste IA"}</option>
              </select>
            </label>
            <Field label={isEn ? "Music style" : "Style musical"} name="style" required placeholder="Techno, house, rave, afro..." />
          </div>
          <div className="form-row">
            <Field label={isEn ? "City / country" : "Ville / pays"} name="location" required />
            <Field label="Instagram" name="instagram" placeholder="https://instagram.com/..." />
          </div>
          <div className="form-row">
            <Field label="TikTok / YouTube" name="social_video" placeholder={isEn ? "Profile or channel link" : "Lien profil ou chaîne"} />
            <Field label="Spotify / Apple Music" name="streaming" placeholder={isEn ? "Artist or latest release link" : "Lien artiste ou dernière sortie"} />
          </div>
          <div className="form-row">
            <Field label="SoundCloud / démos privées" name="soundcloud" placeholder={isEn ? "Private links accepted" : "Lien privé accepté"} />
            <Field label={isEn ? "Sounds / voice notes folder" : "Dossier sons / vocaux"} name="audio_folder" placeholder="Drive, WeTransfer, Dropbox..." />
          </div>
          <div className="form-row">
            <Field label="Presskit / photos HD" name="presskit" placeholder="EPK, bio, photos, logo..." />
            <Field label={isEn ? "Past dates" : "Dernières dates jouées"} name="past_dates" placeholder={isEn ? "Clubs, festivals, cities..." : "Clubs, festivals, villes..."} />
          </div>
          <TextArea label={isEn ? "What you expect from SKORM" : "Ce que tu attends de SKORM"} name="message" required placeholder={isEn ? "Communication, European booking, image, management, content, brands..." : "Communication, booking Europe, image, management, contenus, marques..."} />
          <TextArea label={isEn ? "Important information" : "Infos importantes"} name="extra_notes" placeholder={isEn ? "Current team, labels, constraints, goals, availability..." : "Équipe actuelle, labels, contraintes, objectifs, disponibilités..."} />
        </>
      )}

      {variant === "sponsor" && (
        <>
          <div className="form-row">
            <Field label={isEn ? "Brand name" : "Nom de marque"} name="brand_name" required />
            <Field label={isEn ? "Website / main social" : "Site / réseau principal"} name="brand_link" placeholder="https://..." />
          </div>
          <div className="form-row">
            <label className="field">
              <span>{isEn ? "Partnership target" : "Destination du partenariat"}</span>
              <select name="sponsor_scope" required defaultValue="agency">
                <option value="agency">{isEn ? "Full agency / SKORM roster" : "Agence complète / roster SKORM"}</option>
                <option value="artist">{isEn ? "A specific artist" : "Un artiste précis"}</option>
              </select>
            </label>
            <label className="field">
              <span>{isEn ? "Selected artist" : "Artiste visé"}</span>
              <select name="artist" defaultValue="general">
                <option value="general">{isEn ? "Full agency / no specific artist" : "Agence complète / aucun artiste précis"}</option>
                <option value="paga">Paga</option>
                <option value="cgl-rave-unit">CGL</option>
                <option value="enkor">ENKOR</option>
                <option value="nova-hardlab">Nova Hardlab</option>
                <option value="oskana">Oskana</option>
                <option value="andrea-tutti">Andrea Tutti</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <Field label={isEn ? "Activation type" : "Type d’activation"} name="activation_type" placeholder="Sponsoring, event, content, ambassador..." required />
            <Field label={isEn ? "Territory" : "Territoire"} name="territory" placeholder="France, Europe, local..." />
          </div>
          <div className="form-row">
            <Field label={isEn ? "Budget range" : "Budget indicatif"} name="budget" placeholder={isEn ? "Starting from..." : "À partir de..."} />
            <Field label="Timing" name="timing" placeholder={isEn ? "Date, period, launch..." : "Date, période, lancement..."} />
          </div>
          <TextArea label={isEn ? "Campaign brief" : "Brief de campagne"} name="message" required placeholder={isEn ? "Goal, target, deliverables, context, constraints, KPI..." : "Objectif, cible, livrables, contexte, contraintes, KPI..."} />
          <TextArea label={isEn ? "Useful links" : "Liens utiles"} name="links" placeholder="Moodboard, assets, deck, examples, drive..." />
        </>
      )}

      <button className="submit-button" disabled={status === "sending"}>
        {status === "sending" ? (isEn ? "Sending..." : "Envoi...") : copy.submit}
      </button>
      {status === "error" && <p className="form-message error">{isEn ? "Unable to send right now." : "Impossible d’envoyer pour le moment."}</p>}
    </form>
  );
}
