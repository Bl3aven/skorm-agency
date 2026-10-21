"use client";

import { useEffect, useState } from "react";

/**
 * Documentation de l'API v1 de SKORM Agency.
 * Accessible sur https://skorm-agency.com/api-docs
 * La clé API est affichée après connexion admin (profil) — ici on montre la doc.
 */

const RESOURCES: { name: string; desc: string; fields: string }[] = [
  { name: "artists", desc: "Artistes (créer, modifier, supprimer, médias)", fields: "slug, name, tagline, bio, instagram_url, image_url, home_image_url, is_active, display_order, media_sounds (JSON), media_releases (JSON), media_videos (JSON), featured_sound (JSON)" },
  { name: "events", desc: "Événements/dates (agenda public)", fields: "artist_id, title, venue, city, country_code, starts_at, ticket_url, status (confirmed/cancelled...), is_published, image_url" },
  { name: "inquiries", desc: "Demandes de booking", fields: "inquiry_type, contact_name, company, email, phone, artist_slug, event_date, budget_range, message, source, status, internal_notes, assigned_to" },
  { name: "bookings", desc: "Bookings confirmés", fields: "artist_id, event_name, venue, city, country_code, event_date, contact_name, contact_email, fee, currency, status, payment_status, contract_url, notes" },
  { name: "campaigns", desc: "Campagnes (marques)", fields: "artist_id, brand_name, title, brief, deliverables, budget, status, deadline, contact_name, contact_email" },
  { name: "content_items", desc: "Contenus (posts, reels...)", fields: "artist_id, title, content_type, platform, status, caption, asset_url, publish_at" },
  { name: "contacts", desc: "Contacts (prospects/partenaires)", fields: "full_name, company, email, phone, category, country, relationship, notes" },
  { name: "tasks", desc: "Tâches internes", fields: "artist_id, title, category, priority, status, due_at, assigned_to" },
  { name: "financial_transactions", desc: "Finances (transactions)", fields: "artist_id, booking_id, campaign_id, label, type, amount, currency, status, transaction_date, invoice_number, notes" },
  { name: "org_entries", desc: "Organigramme", fields: "task, first_name, mission, status, commission_rate, notes" },
  { name: "death_note_entries", desc: "Death Note", fields: "name, entry_type, reason, status, notes" },
  { name: "service_pricing_entries", desc: "Prestations & tarifs", fields: "seed_key, category, prestation, detail, target, price, billing_type, notes, sort_order, is_active" },
  { name: "artist_private_events", desc: "Événements privés artistes", fields: "artist_id, title, starts_at, ends_at, location, category, notes" },
  { name: "artist_notes", desc: "Notes artistes", fields: "artist_id, content" },
  { name: "team_members", desc: "Équipe", fields: "user_id, display_name, role" },
];

export default function ApiDocsPage() {
  const [apiKeyStatus, setApiKeyStatus] = useState<null | { configured: boolean; accounts: any[] }>(null);
  const [email, setEmail] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/api-key/status").then((r) => r.json()).then(setApiKeyStatus).catch(() => {});
  }, []);

  async function generate() {
    setMsg("");
    setGeneratedKey("");
    const res = await fetch("/api/admin/api-key/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || undefined }),
    });
    const data = await res.json();
    if (res.ok && data.apiKey) {
      setGeneratedKey(data.apiKey);
      setMsg("Clé générée — copiez-la maintenant (affichée une seule fois)");
    } else {
      setMsg(data.error || "Erreur");
    }
  }

  const base = "https://skorm-agency.com/api/v1";

  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 1000, margin: "0 auto", color: "#111" }}>
      <h1>📡 API SKORM Agency — Documentation</h1>
      <p>
        Passerelle RESTful pour gérer les artistes, les dates, le back-office.
        <br />
        Base : <code>{base}</code>
      </p>

      <section style={{ background: "#f5f5f5", padding: "1rem", borderRadius: 8 }}>
        <h2>🔑 Authentification</h2>
        <p>Toutes les requêtes nécessitent un header :</p>
        <pre style={{ background: "#111", color: "#0f0", padding: "0.6rem", borderRadius: 6 }}>Authorization: Bearer &lt;VOTRE_CLÉ_API&gt;</pre>
        <p>
          La clé API se génère depuis le <b>profil admin</b> ou ici (réservé admin). Elle est stockée
          hashée (sha256), jamais en clair.
        </p>
        <button onClick={generate} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          Générer une nouvelle clé API
        </button>
        {generatedKey && (
          <pre style={{ background: "#111", color: "#ff0", padding: "0.5rem", marginTop: "0.5rem" }}>
            {generatedKey}
          </pre>
        )}
        {msg && <p style={{ color: "green" }}>{msg}</p>}
      </section>

      <section>
        <h2>📋 Ressources disponibles</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
              <th style={{ padding: "0.4rem" }}>Ressource</th>
              <th style={{ padding: "0.4rem" }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map((r) => (
              <tr key={r.name} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.4rem" }}>
                  <code style={{ color: "#084" }}>{r.name}</code>
                </td>
                <td style={{ padding: "0.4rem" }}>{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>⚡ Endpoints</h2>
        <pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: 6, lineHeight: 1.6 }}>{[
'GET    ' + base + '/{resource}              → Lister (filtres ?field=value, ?limit, ?offset, ?order, ?desc=1)',
'GET    ' + base + '/{resource}/{id}        → Détail',
'POST   ' + base + '/{resource}              → Créer (body JSON)',
'PATCH  ' + base + '/{resource}/{id}        → Mettre à jour partiel',
'DELETE ' + base + '/{resource}/{id}        → Supprimer',
'',
'Exemples :',
'  # Lister les artistes actifs',
'  curl -H "Authorization: Bearer CLE" "' + base + '/artists?is_active=1&order=display_order"',
'',
'  # Créer un artiste',
'  curl -X POST -H "Authorization: Bearer CLE" -H "Content-Type: application/json" \\',
'    -d "{\\"name\\":\\"Nouvel Artiste\\",\\"slug\\":\\"nouvel-artiste\\",\\"tagline\\":\\"Hard Techno\\"}" \\',
'    "' + base + '/artists"',
'',
'  # Ajouter une date (événement)',
'  curl -X POST -H "Authorization: Bearer CLE" -H "Content-Type: application/json" \\',
'    -d "{\\"artist_id\\":\\"UUID\\",\\"title\\":\\"Festival\\",\\"city\\":\\"Lyon\\",\\"country_code\\":\\"FR\\",\\"starts_at\\":\\"2026-11-01 20:00:00\\"}" \\',
'    "' + base + '/events"',
'',
'  # Mettre à jour un artiste',
'  curl -X PATCH -H "Authorization: Bearer CLE" -H "Content-Type: application/json" \\',
'    -d "{\\"bio\\":\\"Nouvelle bio\\",\\"is_active\\":1}" "' + base + '/artists/UUID"',
'',
'  # Supprimer une date',
'  curl -X DELETE -H "Authorization: Bearer CLE" "' + base + '/events/UUID"'
].join('\n')}</pre>
      </section>

      <section>
        <h2>📝 Champs par ressource</h2>
        {RESOURCES.map((r) => (
          <details key={r.name} style={{ marginBottom: "0.5rem" }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>{r.name}</summary>
            <code style={{ display: "block", padding: "0.5rem", background: "#fafafa" }}>{r.fields}</code>
          </details>
        ))}
      </section>

      <footer style={{ marginTop: "2rem", fontSize: "0.8rem", color: "#777" }}>
        API v1 — SKORM Agency · Portage MySQL (o2switch) · générée le 14/10/2026
      </footer>
    </main>
  );
}
