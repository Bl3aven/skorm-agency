"use client";

import { useEffect, useState } from "react";

/**
 * Page admin : gestion de la clé API.
 * Permet de :
 *  - voir l'état (clé configurée ? compte admin)
 *  - générer / régénérer la clé (affichée une seule fois)
 *  - copier la clé et accéder à la doc API
 */
export default function AdminApiPage() {
  const [status, setStatus] = useState<any>(null);
  const [generated, setGenerated] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/api-key/status");
    setStatus(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function generate() {
    setLoading(true);
    setMsg(""); setGenerated("");
    const r = await fetch("/api/admin/api-key/generate", { method: "POST" });
    const d = await r.json();
    setLoading(false);
    if (r.ok && d.apiKey) { setGenerated(d.apiKey); setMsg(d.message || "Clé générée"); }
    else setMsg(d.error || "Erreur");
    load();
  }

  async function copy() {
    try { await navigator.clipboard.writeText(generated); setMsg("Copié !"); } catch { setMsg("Copie manuelle : sélectionnez la clé"); }
  }

  return (
    <div style={{ maxWidth: 720, padding: "2rem" }}>
      <h1>🔑 Clé API</h1>
      <p>Clé d'accès à la passerelle <code>/api/v1</code> (artistes, dates, booking, contenu…).</p>

      <section style={{ background: "#f7f7f7", padding: "1rem", borderRadius: 8, marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>État</h2>
        {status ? (
          <ul>
            <li>Clé configurée : <b>{status.apiKeyConfigured ? "Oui" : "Non"}</b> {status.envApiKeyConfigured ? "(env)" : ""}</li>
            <li>Compte admin : {status.accounts?.map((a: any) => `${a.email} (${a.role}${a.hasApiKey ? ", clé ✓" : ""})`).join(", ") || "—"}</li>
          </ul>
        ) : <p>Chargement…</p>}
        <button onClick={generate} disabled={loading} style={{ padding: "0.6rem 1.2rem", cursor: "pointer", background: "#111", color: "#fff", border: 0, borderRadius: 6 }}>
          {loading ? "Génération…" : "Générer une clé API"}
        </button>
        {msg && <p style={{ color: "#0a0" }}>{msg}</p>}
        {generated && (
          <div style={{ marginTop: "0.8rem" }}>
            <pre style={{ background: "#111", color: "#ffd700", padding: "0.8rem", borderRadius: 6, wordBreak: "break-all", userSelect: "all" }}>{generated}</pre>
            <button onClick={copy} style={{ padding: "0.4rem 0.8rem", cursor: "pointer" }}>📋 Copier</button>
            <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.4rem" }}>
              ⚠️ Cette clé n'est affichée qu'une fois. Stockez-la dans votre gestionnaire de secrets.
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem" }}>📖 Documentation</h2>
        <p>Doc complète : <a href="/api-docs" target="_blank" style={{ color: "#056" }}>/api-docs</a></p>
        <p>
          Base : <code>https://skorm-agency.com/api/v1</code><br />
          Header : <code>Authorization: Bearer &lt;clé&gt;</code>
        </p>
        <p>Ressources : <code>artists, events, inquiries, bookings, campaigns, content_items, contacts, tasks, financial_transactions, org_entries, death_note_entries, service_pricing_entries, artist_private_events, artist_notes, team_members</code></p>
      </section>
    </div>
  );
}
