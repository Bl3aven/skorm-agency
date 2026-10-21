"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import type { PricingEntry } from "@/lib/pricing-admin";

const billingOptions = [
  { value: "", label: "Libre" },
  { value: "one_shot", label: "Ponctuel" },
  { value: "monthly", label: "Mensuel" },
  { value: "pack", label: "Pack" },
  { value: "commission", label: "Commission" },
  { value: "project", label: "Projet" },
  { value: "hybrid", label: "Hybride" },
  { value: "training", label: "Formation" },
  { value: "option", label: "Option" },
  { value: "quote", label: "Sur devis" },
];

function billingLabel(value: string) {
  return billingOptions.find((option) => option.value === value)?.label || value || "Libre";
}

function PricingModal({
  entry,
  nextOrder,
  onClose,
}: {
  entry?: PricingEntry | null;
  nextOrder: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const values = (entry || {}) as Partial<PricingEntry>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Enregistrement…");
    const payload: Record<string, unknown> = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.is_active = payload.is_active === "true";

    const response = await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        id: values.id || null,
        payload,
      }),
    });

    if (!response.ok) {
      setMessage("Erreur, impossible d’enregistrer.");
      return;
    }

    onClose();
    router.refresh();
  }

  return (
    <div className="admin-modal-backdrop">
      <form className="admin-create-modal admin-edit-modal pricing-edit-modal" onSubmit={submit}>
        <header>
          <h2>{entry ? "Modifier la prestation" : "Ajouter une prestation"}</h2>
          <button type="button" onClick={onClose}><X size={16} /></button>
        </header>
        <div className="admin-edit-grid pricing-edit-grid">
          <label>
            Catégorie
            <input name="category" required defaultValue={values.category || ""} placeholder="Direction artistique, Booking…" />
          </label>
          <label>
            Prestation
            <input name="prestation" required defaultValue={values.prestation || ""} placeholder="Nom de la prestation" />
          </label>
          <label>
            Tarif
            <input name="price" required defaultValue={values.price || ""} placeholder="150 €, Sur devis, 10%…" />
          </label>
          <label>
            Type
            <select name="billing_type" defaultValue={values.billing_type || ""}>
              {billingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            Cible
            <input name="target" defaultValue={values.target || ""} placeholder="Artiste débutant, marque, entreprise…" />
          </label>
          <label>
            Ordre
            <input name="sort_order" type="number" defaultValue={String(values.sort_order ?? nextOrder)} />
          </label>
          <label>
            Visible
            <select name="is_active" defaultValue={String(values.is_active ?? true)}>
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </label>
          <label className="pricing-wide-field">
            Détail
            <textarea name="detail" defaultValue={values.detail || ""} placeholder="Ce qui est inclus, livrables, contexte…" />
          </label>
          <label className="pricing-wide-field">
            Notes internes
            <textarea name="notes" defaultValue={values.notes || ""} placeholder="Marge, conditions, exceptions, négociation…" />
          </label>
        </div>
        <footer>
          <span>{message}</span>
          <button type="submit">Sauvegarder</button>
        </footer>
      </form>
    </div>
  );
}

export function AdminPricingClient({ entries }: { entries: PricingEntry[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<PricingEntry | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(entries.map((entry) => entry.category).filter(Boolean)))],
    [entries],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const inCategory = category === "all" || entry.category === category;
      const haystack = [entry.category, entry.prestation, entry.detail, entry.target, entry.price, entry.notes]
        .join(" ")
        .toLowerCase();
      return inCategory && (!needle || haystack.includes(needle));
    });
  }, [entries, query, category]);

  const nextOrder = Math.max(0, ...entries.map((entry) => Number(entry.sort_order) || 0)) + 10;

  async function remove(id: string) {
    if (!window.confirm("Supprimer cette prestation ?")) return;
    const response = await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (response.ok) router.refresh();
  }

  return (
    <section className="pricing-admin">
      <div className="private-admin-toolbar pricing-toolbar">
        <p>{filtered.length} prestation{filtered.length > 1 ? "s" : ""}</p>
        <div className="pricing-filters">
          <label>
            <Search size={14} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher…" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item === "all" ? "Toutes les catégories" : item}</option>)}
          </select>
          <button type="button" onClick={() => setEditing(null)}><Plus size={16} /> Ajouter</button>
        </div>
      </div>

      <div className="pricing-grid-table">
        <div className="pricing-grid-head">
          <span>Catégorie</span>
          <span>Prestation</span>
          <span>Détail</span>
          <span>Tarif</span>
          <span>Type</span>
          <span>Actions</span>
        </div>
        {filtered.map((entry) => (
          <article className={!entry.is_active ? "is-disabled" : ""} key={entry.id}>
            <div data-label="Catégorie"><b>{entry.category}</b><small>#{entry.sort_order}</small></div>
            <div data-label="Prestation"><strong>{entry.prestation}</strong>{entry.target && <small>{entry.target}</small>}</div>
            <div data-label="Détail"><p>{entry.detail || "—"}</p>{entry.notes && <small>Note : {entry.notes}</small>}</div>
            <div data-label="Tarif"><strong>{entry.price}</strong></div>
            <div data-label="Type"><span>{billingLabel(entry.billing_type)}</span>{!entry.is_active && <small>Masqué</small>}</div>
            <div className="pricing-row-actions" data-label="Actions">
              <button type="button" onClick={() => setEditing(entry)}><Pencil size={14} /> Modifier</button>
              <button type="button" onClick={() => remove(entry.id)}><Trash2 size={14} /> Supprimer</button>
            </div>
          </article>
        ))}
      </div>

      {editing !== undefined && <PricingModal entry={editing} nextOrder={nextOrder} onClose={() => setEditing(undefined)} />}
    </section>
  );
}
