"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, X } from "lucide-react";
import { Status } from "@/components/admin-ui";

type Inquiry = {
  id: string;
  contact_name: string;
  company: string | null;
  email: string;
  phone?: string | null;
  inquiry_type: string;
  artist_slug: string | null;
  message: string;
  status: string;
  created_at: string;
  source?: string | null;
};

const filters = [
  { label: "Toutes", value: "all" },
  { label: "Nouvelles", value: "new" },
  { label: "Qualifiées", value: "qualified" },
  { label: "En cours", value: "in_progress" },
  { label: "Gagnées", value: "won" },
  { label: "Archivées", value: "archived" },
];

const statuses = ["new", "qualified", "in_progress", "won", "declined", "archived"];

const statusLabels: Record<string, string> = {
  new: "Nouvelle",
  qualified: "Qualifiée",
  in_progress: "En cours",
  won: "Acceptée",
  declined: "Refusée",
  archived: "Archivée",
};

const typeLabels: Record<string, string> = {
  booking: "Demande de booking",
  brand: "Proposition de partenariat",
  press: "Demande presse / média",
  artist: "Candidature artiste",
  other: "Demande générale",
};

const fieldLabels: Record<string, string> = {
  lieu: "Ville / pays",
  date: "Date souhaitée",
  budget: "Budget indicatif",
  message: "Message",
  style: "Style musical",
  location: "Localisation",
  instagram: "Instagram",
  social_video: "TikTok / YouTube",
  streaming: "Spotify / Apple Music",
  soundcloud: "SoundCloud / démos",
  audio_folder: "Sons / vocaux",
  presskit: "Presskit / photos HD",
  past_dates: "Dernières dates jouées",
  upcoming_dates: "Prochaines dates",
  extra_notes: "Informations importantes",
  brand_name: "Nom de la marque",
  brand_link: "Site / réseau de la marque",
  sponsor_scope: "Partenariat destiné à",
  activation_type: "Type d’activation",
  territory: "Territoire",
  timing: "Période / timing",
  phone: "Téléphone",
  decision_contact: "Contact décisionnaire",
  links: "Liens utiles",
};

function statusTone(status: string) {
  if (status === "new") return "warn";
  if (status === "won" || status === "qualified") return "good";
  return "neutral";
}

function parseDetails(message: string) {
  return message.split("\n").map((line) => {
    const separator = line.indexOf(":");
    if (separator < 0) return { key: "message", label: "Message", value: line.trim() };
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    const value = key === "sponsor_scope"
      ? rawValue === "artist" ? "Un artiste précis" : "L’ensemble de l’agence"
      : rawValue;
    return { key, label: fieldLabels[key] || key.replaceAll("_", " "), value };
  }).filter((item) => item.value);
}

function getPreview(item: Inquiry) {
  const details = parseDetails(item.message);
  return details.find((detail) => detail.key === "message")?.value
    || details.find((detail) => detail.key === "brand_name")?.value
    || details[0]?.value
    || "Aucun détail";
}

export function AdminRequestsClient({ inquiries }: { inquiries: Inquiry[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [feedback, setFeedback] = useState("");
  const visible = useMemo(() => filter === "all" ? inquiries : inquiries.filter((item) => item.status === filter), [filter, inquiries]);
  const selectedDetails = useMemo(() => selected ? parseDetails(selected.message) : [], [selected]);

  async function updateStatus(item: Inquiry, status: string) {
    setFeedback("Mise à jour…");
    const response = await fetch("/api/admin/item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", kind: "inquiry", id: item.id, payload: { status } }),
    });
    setFeedback(response.ok ? "Statut mis à jour." : "Erreur pendant la mise à jour.");
    if (response.ok) {
      setSelected((current) => current && current.id === item.id ? { ...current, status } : current);
      router.refresh();
    }
  }

  async function remove(item: Inquiry) {
    if (!window.confirm("Supprimer définitivement cette demande ?")) return;
    const response = await fetch("/api/admin/item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", kind: "inquiry", id: item.id }),
    });
    if (response.ok) {
      setSelected(null);
      router.refresh();
    } else {
      setFeedback("Suppression impossible.");
    }
  }

  return (
    <>
      <div className="admin-filters">
        {filters.map((item) => (
          <button type="button" className={filter === item.value ? "active" : ""} onClick={() => setFilter(item.value)} key={item.value}>
            {item.label}
          </button>
        ))}
      </div>

      <section className="admin-panel full">
        <div className="admin-table requests">
          <div className="admin-table-head"><span>Contact</span><span>Demande</span><span>Artiste</span><span>Reçue le</span><span>Statut</span><span>Actions</span></div>
          {visible.length ? visible.map((item) => (
            <div className="admin-table-row" key={item.id}>
              <span><b>{item.contact_name}</b><small>{item.company || item.email}</small></span>
              <span><b>{typeLabels[item.inquiry_type] || "Demande"}</b><small>{getPreview(item).slice(0, 100)}</small></span>
              <span>{item.artist_slug || "Général"}</span>
              <span>{new Date(item.created_at).toLocaleDateString("fr-FR")}</span>
              <span><Status tone={statusTone(item.status)}>{statusLabels[item.status] || item.status}</Status></span>
              <span className="admin-row-actions">
                <button type="button" onClick={() => { setSelected(item); setFeedback(""); }}><Eye size={14} /> Consulter</button>
                <button type="button" onClick={() => remove(item)}><Trash2 size={14} /> Supprimer</button>
              </span>
            </div>
          )) : <p className="admin-empty">Aucune demande dans ce filtre.</p>}
        </div>
      </section>

      {selected && (
        <div className="admin-modal-backdrop">
          <section className="admin-create-modal inquiry-detail-modal">
            <header className="inquiry-modal-header">
              <div>
                <small>{new Date(selected.created_at).toLocaleString("fr-FR")}</small>
                <h2>{typeLabels[selected.inquiry_type] || "Nouvelle demande"}</h2>
                <p>{selected.contact_name}{selected.company ? ` · ${selected.company}` : ""}</p>
              </div>
              <button type="button" aria-label="Fermer" onClick={() => setSelected(null)}><X size={16} /></button>
            </header>

            <div className="inquiry-contact-strip">
              <div><span>Email</span><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
              <div><span>Artiste concerné</span><b>{selected.artist_slug || "Demande générale"}</b></div>
            </div>

            <div className="inquiry-readable-details">
              {selectedDetails.map((detail, index) => (
                <article className={detail.key === "message" || detail.key === "extra_notes" ? "wide" : ""} key={`${detail.key}-${index}`}>
                  <span>{detail.label}</span>
                  {/^https?:\/\//i.test(detail.value)
                    ? <a href={detail.value} target="_blank" rel="noreferrer">Ouvrir le lien</a>
                    : <p>{detail.value}</p>}
                </article>
              ))}
            </div>

            <footer>
              <label>
                Statut de la demande
                <select value={selected.status} onChange={(event) => updateStatus(selected, event.target.value)}>
                  {statuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}
                </select>
              </label>
              <span>{feedback}</span>
              <button type="button" onClick={() => remove(selected)}><Trash2 size={14} /> Supprimer</button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
