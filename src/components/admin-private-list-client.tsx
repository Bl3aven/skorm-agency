"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { DeathNoteEntry, OrgEntry } from "@/lib/private-admin";

type Mode = "org" | "death";

const orgStatuses = [
  { value: "todo", label: "À faire" },
  { value: "doing", label: "En cours" },
  { value: "done", label: "Terminé" },
  { value: "paused", label: "En pause" },
];

const deathTypes = [
  { value: "person", label: "Personne" },
  { value: "brand", label: "Marque" },
  { value: "venue", label: "Lieu / event" },
  { value: "other", label: "Autre" },
];

const deathStatuses = [
  { value: "active", label: "Blacklisté" },
  { value: "watch", label: "À surveiller" },
  { value: "resolved", label: "Réglé" },
];

const missionSuggestions = [
  "Management artiste",
  "Booking Europe",
  "Communication",
  "Gestion réseaux sociaux",
  "Relations marques",
  "Relations presse",
  "Direction image",
  "Création artiste IA",
  "Suivi contenus",
  "Administration / contrats",
];

function statusLabel(value: string, list: { value: string; label: string }[]) {
  return list.find((item) => item.value === value)?.label || value || "—";
}

function Modal({
  mode,
  entry,
  onClose,
}: {
  mode: Mode;
  entry?: OrgEntry | DeathNoteEntry | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const values = (entry || {}) as Record<string, string>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Enregistrement…");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/admin/private-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        list: mode,
        id: values.id || null,
        payload,
      }),
    });

    if (!response.ok) {
      setMessage("Erreur, impossible d’enregistrer.");
      return;
    }

    setMessage("Enregistré.");
    onClose();
    router.refresh();
  }

  return (
    <div className="admin-modal-backdrop">
      <form className="admin-create-modal admin-edit-modal private-edit-modal" onSubmit={submit}>
        <header>
          <h2>{entry ? "Modifier" : "Ajouter"}</h2>
          <button type="button" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        {mode === "org" ? (
          <div className="admin-edit-grid">
            <label>
              Tâche
              <input name="task" required defaultValue={values.task || ""} placeholder="Ex : relancer festival, préparer deck…" />
            </label>
            <label>
              Prénom
              <input name="first_name" defaultValue={values.first_name || ""} placeholder="Personne en charge" />
            </label>
            <label>
              Mission
              <input name="mission" required list="mission-suggestions" defaultValue={values.mission || ""} placeholder="Choisir ou écrire librement" />
              <datalist id="mission-suggestions">
                {missionSuggestions.map((mission) => <option key={mission} value={mission} />)}
              </datalist>
            </label>
            <label>
              Statut
              <select name="status" defaultValue={values.status || "todo"}>
                {orgStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </label>
            <label>
              Commission / tarif
              <input name="commission_rate" defaultValue={values.commission_rate || ""} placeholder="10%, 300€, forfait…" />
            </label>
            <label>
              Notes
              <textarea name="notes" defaultValue={values.notes || ""} placeholder="Détails, échéance, contexte…" />
            </label>
          </div>
        ) : (
          <div className="admin-edit-grid">
            <label>
              Nom
              <input name="name" required defaultValue={values.name || ""} placeholder="Personne, marque ou structure" />
            </label>
            <label>
              Type
              <select name="entry_type" defaultValue={values.entry_type || "person"}>
                {deathTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </label>
            <label>
              Statut
              <select name="status" defaultValue={values.status || "active"}>
                {deathStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </label>
            <label>
              Raison
              <input name="reason" defaultValue={values.reason || ""} placeholder="Pourquoi c’est bloqué / à éviter" />
            </label>
            <label>
              Notes privées
              <textarea name="notes" defaultValue={values.notes || ""} placeholder="Contexte, preuves, détails utiles…" />
            </label>
          </div>
        )}

        <footer>
          <span>{message}</span>
          <button type="submit">Sauvegarder</button>
        </footer>
      </form>
    </div>
  );
}

export function AdminOrgClient({ entries }: { entries: OrgEntry[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<OrgEntry | null | undefined>(undefined);
  const rows = useMemo(() => entries, [entries]);

  async function remove(id: string) {
    if (!window.confirm("Supprimer cette ligne ?")) return;
    const response = await fetch("/api/admin/private-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", list: "org", id }),
    });
    if (response.ok) router.refresh();
  }

  return (
    <section className="private-admin-list">
      <div className="private-admin-toolbar">
        <p>{rows.length} ligne{rows.length > 1 ? "s" : ""}</p>
        <button type="button" onClick={() => setEditing(null)}><Plus size={16} /> Ajouter une ligne</button>
      </div>
      <div className="private-admin-cards">
        {rows.map((entry) => (
          <article className="private-admin-card" key={entry.id}>
            <div>
              <span>{statusLabel(entry.status, orgStatuses)}</span>
              <h2>{entry.task || "Tâche sans titre"}</h2>
              <p>{entry.mission}</p>
            </div>
            <dl>
              <div><dt>Prénom</dt><dd>{entry.first_name || "—"}</dd></div>
              <div><dt>Commission / tarif</dt><dd>{entry.commission_rate || "—"}</dd></div>
              <div><dt>Notes</dt><dd>{entry.notes || "—"}</dd></div>
            </dl>
            <footer>
              <button type="button" onClick={() => setEditing(entry)}><Pencil size={14} /> Modifier</button>
              <button type="button" onClick={() => remove(entry.id)}><Trash2 size={14} /> Supprimer</button>
            </footer>
          </article>
        ))}
      </div>
      {editing !== undefined && <Modal mode="org" entry={editing} onClose={() => setEditing(undefined)} />}
    </section>
  );
}

export function AdminDeathNoteClient({ entries }: { entries: DeathNoteEntry[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<DeathNoteEntry | null | undefined>(undefined);

  async function remove(id: string) {
    if (!window.confirm("Supprimer cette entrée Death Note ?")) return;
    const response = await fetch("/api/admin/private-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", list: "death", id }),
    });
    if (response.ok) router.refresh();
  }

  return (
    <section className="private-admin-list death-note-list">
      <div className="private-admin-toolbar">
        <p>{entries.length} entrée{entries.length > 1 ? "s" : ""}</p>
        <button type="button" onClick={() => setEditing(null)}><Plus size={16} /> Ajouter</button>
      </div>
      <div className="private-admin-cards">
        {entries.map((entry) => (
          <article className="private-admin-card" key={entry.id}>
            <div>
              <span>{statusLabel(entry.status, deathStatuses)} · {statusLabel(entry.entry_type, deathTypes)}</span>
              <h2>{entry.name}</h2>
              <p>{entry.reason || "Aucune raison renseignée."}</p>
            </div>
            <dl>
              <div><dt>Notes privées</dt><dd>{entry.notes || "—"}</dd></div>
            </dl>
            <footer>
              <button type="button" onClick={() => setEditing(entry)}><Pencil size={14} /> Modifier</button>
              <button type="button" onClick={() => remove(entry.id)}><Trash2 size={14} /> Supprimer</button>
            </footer>
          </article>
        ))}
      </div>
      {editing !== undefined && <Modal mode="death" entry={editing} onClose={() => setEditing(undefined)} />}
    </section>
  );
}
