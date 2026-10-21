"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Artist = { id: string; name: string };
type Kind = "artist" | "event" | "booking" | "campaign" | "content" | "contact" | "task" | "finance";

const labels: Record<Kind, string> = {
  artist: "Nouvel artiste",
  event: "Nouvelle date publique",
  booking: "Nouveau booking",
  campaign: "Nouvelle campagne",
  content: "Nouveau contenu",
  contact: "Nouveau contact",
  task: "Nouvelle tâche",
  finance: "Nouvelle opération",
};

export function AdminCreateButton({ kind, artists = [] }: { kind: Kind; artists?: Artist[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Enregistrement...");
    const form = event.currentTarget;
    const payload: Record<string, unknown> = Object.fromEntries(new FormData(form).entries());

    if (kind === "artist") {
      for (const field of ["featured_sound", "media_sounds", "media_releases", "media_videos"]) {
        const raw = payload[field];
        if (typeof raw !== "string" || !raw.trim()) {
          payload[field] = field === "featured_sound" ? null : [];
          continue;
        }
        try {
          payload[field] = JSON.parse(raw);
        } catch {
          setStatus(`JSON invalide : ${field}`);
          return;
        }
      }
    }

    const response = await fetch("/api/admin/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, payload }),
    });

    if (response.ok) {
      setStatus("Ajouté.");
      form.reset();
      router.refresh();
      window.setTimeout(() => setOpen(false), 450);
    } else {
      const data = await response.json().catch(() => null);
      setStatus(data?.error || "Erreur lors de l'ajout.");
    }
  }

  return (
    <>
      <button className="admin-add-button" onClick={() => setOpen(true)} type="button">
        + {labels[kind]}
      </button>
      {open && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <form className="admin-create-modal" onSubmit={submit}>
            <header>
              <h2>{labels[kind]}</h2>
              <button type="button" onClick={() => setOpen(false)}>
                Fermer
              </button>
            </header>
            <Fields kind={kind} artists={artists} />
            <footer>
              <button type="submit">Enregistrer</button>
              {status && <span>{status}</span>}
            </footer>
          </form>
        </div>
      )}
    </>
  );
}

function ArtistSelect({ artists }: { artists: Artist[] }) {
  return (
    <label>
      Artiste
      <select name="artist_id" defaultValue="">
        <option value="">Agence / général</option>
        {artists.map((artist) => (
          <option value={artist.id} key={artist.id}>
            {artist.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Fields({ kind, artists }: { kind: Kind; artists: Artist[] }) {
  if (kind === "artist") {
    return (
      <>
        <label>
          Nom
          <input name="name" required />
        </label>
        <label>
          Identifiant URL
          <input name="slug" required placeholder="nom-artiste" />
        </label>
        <label>
          Positionnement
          <input name="tagline" placeholder="DJ · Producer · Performer" />
        </label>
        <label>
          Instagram
          <input name="instagram_url" placeholder="https://instagram.com/..." />
        </label>
        <label>
          Image profil / bannière
          <input name="image_url" placeholder="/artists/photo.png ou URL" />
        </label>
        <label>
          Image affichée sur la home
          <input name="home_image_url" placeholder="/artists/photo-home.png ou URL" />
        </label>
        <label>
          Ordre
          <input name="display_order" type="number" />
        </label>
        <label className="wide">
          Bio
          <textarea name="bio" />
        </label>
        <label className="wide">
          Son mis en avant sur la home (JSON)
          <textarea name="featured_sound" rows={5} placeholder='{"title":"Titre","meta":"Artiste","cover":"/artists/cover.jpg","href":"https://..."}' />
        </label>
        <label className="wide">
          Sons / tracks (JSON)
          <textarea name="media_sounds" rows={7} placeholder='[{"title":"Titre","meta":"Artiste · plateforme","cover":"/artists/cover.jpg","href":"https://..."}]' />
        </label>
        <label className="wide">
          Sorties / plateformes (JSON)
          <textarea name="media_releases" rows={7} placeholder='[{"title":"Sortie","meta":"Spotify officiel","cover":"/artists/cover.jpg","href":"https://..."}]' />
        </label>
        <label className="wide">
          Vidéos (JSON)
          <textarea name="media_videos" rows={7} placeholder='[{"title":"Live set","meta":"YouTube officiel","cover":"/artists/thumb.jpg","href":"https://..."}]' />
        </label>
      </>
    );
  }

  if (kind === "event") {
    return (
      <>
        <ArtistSelect artists={artists} />
        <label>
          Titre
          <input name="title" required />
        </label>
        <label>
          Date / heure (optionnel — mettre seulement la date si l'heure n'est pas connue)
          <input name="starts_at" type="datetime-local" />
        </label>
        <label>
          Ville
          <input name="city" required />
        </label>
        <label>
          Pays
          <input name="country_code" maxLength={2} defaultValue="FR" />
        </label>
        <label>
          Lieu
          <input name="venue" />
        </label>
        <label>
          Statut
          <select name="status" defaultValue="confirmed">
            <option value="confirmed">Confirmé</option>
            <option value="tba">TBA</option>
            <option value="option">Option</option>
          </select>
        </label>
      </>
    );
  }

  if (kind === "booking") {
    return (
      <>
        <ArtistSelect artists={artists} />
        <label>
          Évènement
          <input name="event_name" required />
        </label>
        <label>
          Date
          <input name="event_date" type="date" />
        </label>
        <label>
          Ville
          <input name="city" />
        </label>
        <label>
          Cachet
          <input name="fee" type="number" step="0.01" />
        </label>
        <label>
          Contact
          <input name="contact_name" />
        </label>
        <label>
          Email
          <input name="contact_email" type="email" />
        </label>
        <label>
          Statut
          <select name="status" defaultValue="lead">
            <option value="lead">Lead</option>
            <option value="negotiation">Négociation</option>
            <option value="option">Option</option>
            <option value="confirmed">Confirmé</option>
          </select>
        </label>
        <label className="wide">
          Notes
          <textarea name="notes" />
        </label>
      </>
    );
  }

  if (kind === "campaign") {
    return (
      <>
        <ArtistSelect artists={artists} />
        <label>
          Marque
          <input name="brand_name" required />
        </label>
        <label>
          Titre
          <input name="title" required />
        </label>
        <label>
          Budget
          <input name="budget" type="number" step="0.01" />
        </label>
        <label>
          Échéance
          <input name="deadline" type="date" />
        </label>
        <label>
          Contact
          <input name="contact_name" />
        </label>
        <label>
          Email
          <input name="contact_email" type="email" />
        </label>
        <label className="wide">
          Brief
          <textarea name="brief" />
        </label>
        <label className="wide">
          Livrables
          <textarea name="deliverables" />
        </label>
      </>
    );
  }

  if (kind === "content") {
    return (
      <>
        <ArtistSelect artists={artists} />
        <label>
          Titre
          <input name="title" required />
        </label>
        <label>
          Plateforme
          <input name="platform" defaultValue="instagram" />
        </label>
        <label>
          Type
          <input name="content_type" defaultValue="post" />
        </label>
        <label>
          Publication
          <input name="publish_at" type="datetime-local" />
        </label>
        <label>
          Statut
          <select name="status" defaultValue="idea">
            <option value="idea">Idée</option>
            <option value="production">Production</option>
            <option value="review">Validation</option>
            <option value="scheduled">Programmé</option>
          </select>
        </label>
        <label className="wide">
          Caption
          <textarea name="caption" />
        </label>
      </>
    );
  }

  if (kind === "contact") {
    return (
      <>
        <label>
          Nom
          <input name="full_name" required />
        </label>
        <label>
          Société
          <input name="company" />
        </label>
        <label>
          Email
          <input name="email" type="email" />
        </label>
        <label>
          Téléphone
          <input name="phone" />
        </label>
        <label>
          Catégorie
          <input name="category" defaultValue="booker" />
        </label>
        <label>
          Pays
          <input name="country" />
        </label>
        <label>
          Relation
          <input name="relationship" defaultValue="prospect" />
        </label>
        <label className="wide">
          Notes
          <textarea name="notes" />
        </label>
      </>
    );
  }

  if (kind === "task") {
    return (
      <>
        <ArtistSelect artists={artists} />
        <label>
          Tâche
          <input name="title" required />
        </label>
        <label>
          Catégorie
          <input name="category" defaultValue="general" />
        </label>
        <label>
          Échéance
          <input name="due_at" type="datetime-local" />
        </label>
        <label>
          Priorité
          <select name="priority" defaultValue="normal">
            <option value="low">Basse</option>
            <option value="normal">Normale</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </label>
      </>
    );
  }

  return (
    <>
      <ArtistSelect artists={artists} />
      <label>
        Libellé
        <input name="label" required />
      </label>
      <label>
        Montant
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        Type
        <select name="type" defaultValue="income">
          <option value="income">Entrée</option>
          <option value="expense">Dépense</option>
        </select>
      </label>
      <label>
        Date
        <input name="transaction_date" type="date" />
      </label>
      <label>
        Statut
        <select name="status" defaultValue="pending">
          <option value="pending">À faire</option>
          <option value="invoiced">Facturé</option>
          <option value="paid">Payé</option>
          <option value="late">Retard</option>
        </select>
      </label>
      <label>
        Facture
        <input name="invoice_number" />
      </label>
      <label className="wide">
        Notes
        <textarea name="notes" />
      </label>
    </>
  );
}
