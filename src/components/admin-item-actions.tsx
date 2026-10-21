"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";

type Kind = "artist" | "event" | "booking" | "campaign" | "content" | "contact" | "task" | "finance";
type Field = { name: string; label: string; type?: string; options?: string[] };

const fieldsByKind: Record<Kind, Field[]> = {
  artist: [
    { name: "name", label: "Nom" },
    { name: "slug", label: "URL" },
    { name: "tagline", label: "Positionnement" },
    { name: "bio", label: "Bio" },
    { name: "instagram_url", label: "Instagram" },
    { name: "image_url", label: "Image profil / bannière" },
    { name: "home_image_url", label: "Image affichée sur la home" },
    { name: "display_order", label: "Ordre", type: "number" },
    { name: "featured_sound", label: "Son mis en avant sur la home (JSON)", type: "json" },
    { name: "media_sounds", label: "Sons / tracks (JSON)", type: "json" },
    { name: "media_releases", label: "Sorties / plateformes (JSON)", type: "json" },
    { name: "media_videos", label: "Vidéos (JSON)", type: "json" },
  ],
  event: [
    { name: "title", label: "Titre" },
    { name: "venue", label: "Lieu" },
    { name: "city", label: "Ville" },
    { name: "country_code", label: "Pays" },
    { name: "starts_at", label: "Date", type: "datetime-local" },
    { name: "status", label: "Statut" },
  ],
  booking: [
    { name: "event_name", label: "Événement" },
    { name: "venue", label: "Lieu" },
    { name: "city", label: "Ville" },
    { name: "event_date", label: "Date", type: "date" },
    { name: "fee", label: "Cachet", type: "number" },
    { name: "status", label: "Statut", options: ["lead", "negotiation", "option", "confirmed", "completed", "cancelled"] },
    { name: "payment_status", label: "Paiement", options: ["not_applicable", "pending", "invoiced", "partial", "paid", "late"] },
  ],
  campaign: [
    { name: "brand_name", label: "Marque" },
    { name: "title", label: "Campagne" },
    { name: "budget", label: "Budget", type: "number" },
    { name: "status", label: "Statut", options: ["proposal", "negotiation", "active", "review", "completed", "declined"] },
    { name: "deadline", label: "Échéance", type: "date" },
    { name: "brief", label: "Brief" },
    { name: "deliverables", label: "Livrables" },
  ],
  content: [
    { name: "title", label: "Titre" },
    { name: "platform", label: "Plateforme" },
    { name: "content_type", label: "Type" },
    { name: "status", label: "Statut", options: ["idea", "production", "review", "scheduled", "published", "cancelled"] },
    { name: "publish_at", label: "Publication", type: "datetime-local" },
    { name: "caption", label: "Légende" },
    { name: "asset_url", label: "Asset" },
  ],
  contact: [
    { name: "full_name", label: "Nom" },
    { name: "company", label: "Société" },
    { name: "email", label: "Email" },
    { name: "phone", label: "Téléphone" },
    { name: "category", label: "Catégorie" },
    { name: "relationship", label: "Relation" },
  ],
  task: [
    { name: "title", label: "Tâche" },
    { name: "category", label: "Catégorie" },
    { name: "priority", label: "Priorité", options: ["low", "normal", "high", "urgent"] },
    { name: "status", label: "Statut", options: ["todo", "doing", "done", "cancelled"] },
    { name: "due_at", label: "Échéance", type: "datetime-local" },
  ],
  finance: [
    { name: "label", label: "Libellé" },
    { name: "type", label: "Type", options: ["income", "expense"] },
    { name: "amount", label: "Montant", type: "number" },
    { name: "status", label: "Statut", options: ["pending", "invoiced", "paid", "late", "cancelled"] },
    { name: "transaction_date", label: "Date", type: "date" },
    { name: "invoice_number", label: "Facture" },
  ],
};

function inputValue(value: unknown, type?: string) {
  if (!value) return "";
  if (type === "json") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  if (type === "datetime-local") {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }
  return String(value);
}

export function AdminItemActions({ kind, item }: { kind: Kind; item: { id: string } & object }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const fields = useMemo(() => fieldsByKind[kind], [kind]);
  const values = item as Record<string, unknown> & { id: string };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Enregistrement...");
    const payload: Record<string, unknown> = Object.fromEntries(new FormData(event.currentTarget).entries());
    for (const field of fields) {
      if (field.type !== "json") continue;
      const raw = payload[field.name];
      if (typeof raw !== "string" || !raw.trim()) {
        payload[field.name] = [];
        continue;
      }
      try {
        payload[field.name] = JSON.parse(raw);
      } catch {
        setMessage(`JSON invalide : ${field.label}`);
        return;
      }
    }
    const response = await fetch("/api/admin/item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", kind, id: values.id, payload }),
    });
    setMessage(response.ok ? "Modifié." : "Erreur.");
    if (response.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  async function remove() {
    if (!window.confirm("Supprimer cet élément ?")) return;
    const response = await fetch("/api/admin/item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", kind, id: values.id }),
    });
    if (response.ok) router.refresh();
    else setMessage("Suppression impossible.");
  }

  return (
    <>
      <div className="admin-row-actions">
        <button type="button" onClick={() => setOpen(true)}>
          <Pencil size={14} /> Modifier
        </button>
        <button type="button" onClick={remove}>
          <Trash2 size={14} /> Supprimer
        </button>
      </div>
      {open && (
        <div className="admin-modal-backdrop">
          <form className="admin-create-modal admin-edit-modal" onSubmit={submit}>
            <header>
              <h2>Modifier</h2>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </header>
            <div className="admin-edit-grid">
              {fields.map((field) => (
                <label key={field.name}>
                  {field.label}
                  {field.options ? (
                    <select name={field.name} defaultValue={inputValue(values[field.name], field.type)}>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "json" ? (
                    <textarea
                      name={field.name}
                      defaultValue={inputValue(values[field.name], field.type)}
                      rows={8}
                    />
                  ) : (
                    <input
                      name={field.name}
                      type={field.type || "text"}
                      defaultValue={inputValue(values[field.name], field.type)}
                    />
                  )}
                </label>
              ))}
            </div>
            <footer>
              <span>{message}</span>
              <button type="submit">Sauvegarder</button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}
