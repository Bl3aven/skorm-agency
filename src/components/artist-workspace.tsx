"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Artist = { id: string; name: string; slug: string; tagline: string | null };
type PrivateEvent = {
  id: string;
  artist_id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  category: string;
  notes: string | null;
};
type Note = { artist_id: string; content: string; updated_at: string };

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

const categories = ["rendez-vous", "booking", "contenu", "presse", "personnel", "déplacement"];

export function ArtistWorkspace({ artists, events, notes }: { artists: Artist[]; events: PrivateEvent[]; notes: Note[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(artists[0]?.id ?? "");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [note, setNote] = useState(notes.find((item) => item.artist_id === selectedId)?.content ?? "");
  const [message, setMessage] = useState("");
  const selectedArtist = artists.find((artist) => artist.id === selectedId);
  const artistEvents = useMemo(() => events.filter((event) => event.artist_id === selectedId), [events, selectedId]);
  const editingEvent = events.find((event) => event.id === editingId);

  function selectArtist(id: string) {
    setSelectedId(id);
    setEditingId(null);
    setNote(notes.find((item) => item.artist_id === id)?.content ?? "");
    setMessage("");
  }

  async function submitAction(action: string, payload: Record<string, unknown>) {
    setMessage("Enregistrement…");
    const response = await fetch("/api/admin/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    setMessage(response.ok ? "Enregistré." : "Une erreur est survenue.");
    if (response.ok) {
      setEditingId(null);
      router.refresh();
    }
  }

  async function createArtist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    await submitAction("create_artist", Object.fromEntries(new FormData(form).entries()));
    form.reset();
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    await submitAction("create_event", { ...Object.fromEntries(new FormData(form).entries()), artist_id: selectedId });
    form.reset();
  }

  async function updateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    const form = event.currentTarget;
    await submitAction("update_event", { ...Object.fromEntries(new FormData(form).entries()), id: editingId });
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("Supprimer ce rendez-vous ?")) return;
    await submitAction("delete_event", { id });
  }

  return (
    <div className="workspace-layout">
      <aside className="workspace-artists">
        <header><div><small>Portefeuille</small><h2>Artistes</h2></div><span>{artists.length}</span></header>
        <div className="workspace-artist-list">
          {artists.map((artist) => (
            <button className={artist.id === selectedId ? "active" : ""} onClick={() => selectArtist(artist.id)} key={artist.id}>
              <i>{artist.name.slice(0, 2).toUpperCase()}</i><span><b>{artist.name}</b><small>{artist.tagline || "Profil à compléter"}</small></span>
            </button>
          ))}
        </div>
        <details className="create-artist-box">
          <summary><Plus size={14} /> Créer un artiste</summary>
          <form onSubmit={createArtist}>
            <label>Nom<input name="name" required /></label>
            <label>Identifiant URL<input name="slug" placeholder="nom-artiste" required /></label>
            <label>Positionnement<input name="tagline" /></label>
            <label>Instagram<input name="instagram_url" /></label>
            <button>Ajouter au roster</button>
          </form>
        </details>
      </aside>

      <section className="workspace-center">
        <header className="workspace-title">
          <div><small>Agenda privé</small><h2>{selectedArtist?.name || "Sélectionner un artiste"}</h2></div>
          <span>{artistEvents.length} rendez-vous</span>
        </header>

        <form className="event-quick-form" onSubmit={editingEvent ? updateEvent : createEvent}>
          <div className="event-form-title">
            <CalendarPlus size={17} />
            <b>{editingEvent ? "Modifier le rendez-vous" : "Ajouter un rendez-vous"}</b>
            {editingEvent && <button type="button" className="admin-icon-action" onClick={() => setEditingId(null)}><X size={14} /> Annuler</button>}
          </div>
          <div className="event-form-grid" key={editingEvent?.id || "new-event"}>
            <label>Objet<input name="title" required placeholder="Call, tournage, rendez-vous…" defaultValue={editingEvent?.title ?? ""} /></label>
            <label>Catégorie<select name="category" defaultValue={editingEvent?.category ?? "rendez-vous"}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Début<input name="starts_at" type="datetime-local" required defaultValue={toDateTimeLocal(editingEvent?.starts_at ?? null)} /></label>
            <label>Fin<input name="ends_at" type="datetime-local" defaultValue={toDateTimeLocal(editingEvent?.ends_at ?? null)} /></label>
            <label>Lieu<input name="location" placeholder="Adresse ou visio" defaultValue={editingEvent?.location ?? ""} /></label>
            <label className="event-notes-field">Notes<input name="notes" placeholder="Informations utiles" defaultValue={editingEvent?.notes ?? ""} /></label>
          </div>
          <button disabled={!selectedId}>{editingEvent ? "Sauvegarder les modifications" : "Enregistrer"}</button>
        </form>

        <div className="private-event-list">
          <header><b>Prochains rendez-vous</b><span>Privé · jamais publié sur le site</span></header>
          {artistEvents.length ? artistEvents.map((item) => (
            <article key={item.id}>
              <time><b>{new Date(item.starts_at).toLocaleDateString("fr-FR", { day: "2-digit" })}</b><span>{new Date(item.starts_at).toLocaleDateString("fr-FR", { month: "short" })}</span></time>
              <div><small>{item.category}</small><h3>{item.title}</h3><p>{item.location || "Lieu à définir"} · {new Date(item.starts_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p></div>
              <div className="private-event-actions">
                <button type="button" onClick={() => setEditingId(item.id)}><Pencil size={14} /> Modifier</button>
                <button type="button" onClick={() => deleteEvent(item.id)}><Trash2 size={14} /> Supprimer</button>
              </div>
            </article>
          )) : <p className="admin-empty">Aucun rendez-vous privé pour cet artiste.</p>}
        </div>
      </section>

      <aside className="workspace-notes">
        <header><div><small>Mémo permanent</small><h2>Bloc-notes</h2></div><Save size={16} /></header>
        <p>Idées, relances, informations sensibles ou détails à ne pas oublier pour {selectedArtist?.name}.</p>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Écrire une note…" />
        <button disabled={!selectedId} onClick={() => submitAction("save_note", { artist_id: selectedId, content: note })}><Save size={14} /> Sauvegarder la note</button>
        {message && <small className="workspace-message">{message}</small>}
      </aside>
    </div>
  );
}
