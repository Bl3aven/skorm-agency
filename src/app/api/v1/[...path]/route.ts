import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key";
import { randomUUID } from "node:crypto";

/**
 * Passerelle API v1 — gestion complète des artistes et des données métier.
 *
 * POST   /api/v1/{resource}          -> créer une entrée
 * GET    /api/v1/{resource}          -> lister (filtres ?field=value, ?limit, ?offset, ?order)
 * GET    /api/v1/{resource}/{id}     -> lire une entrée
 * PATCH  /api/v1/{resource}/{id}     -> mettre à jour (partiel)
 * PUT    /api/v1/{resource}/{id}     -> remplacer
 * DELETE /api/v1/{resource}/{id}     -> supprimer
 *
 * Authentification : header `Authorization: Bearer <ADMIN_API_KEY>`
 */

type ResourceConfig = {
  table: string;
  columns: Record<string, "string" | "number" | "boolean" | "json" | "date">;
  required?: string[];
  idCol: string;
  hasCreatedAt?: boolean;
  hasUpdatedAt?: boolean;
};

const text = "string" as const;
const num = "number" as const;
const bool = "boolean" as const;
const json = "json" as const;
const date = "date" as const;

const RESOURCES: Record<string, ResourceConfig> = {
  artists: {
    table: "artists",
    idCol: "id",
    hasCreatedAt: true,
    hasUpdatedAt: true,
    columns: {
      id: text, slug: text, name: text, tagline: text, bio: text,
      instagram_url: text, image_url: text, is_active: bool, display_order: num,
      created_at: date, updated_at: date, media_sounds: json, media_releases: json,
      media_videos: json, home_image_url: text, featured_sound: json,
    },
  },
  events: {
    table: "events",
    idCol: "id",
    hasCreatedAt: true,
    columns: {
      id: text, artist_id: text, title: text, venue: text, city: text,
      country_code: text, starts_at: date, ticket_url: text, status: text,
      is_published: bool, image_url: text, created_at: date,
    },
  },
  inquiries: {
    table: "inquiries",
    idCol: "id",
    hasCreatedAt: true,
    hasUpdatedAt: true,
    columns: {
      id: text, inquiry_type: text, contact_name: text, company: text, email: text,
      phone: text, artist_slug: text, event_date: date, budget_range: text,
      message: text, source: text, status: text, internal_notes: text,
      assigned_to: text, created_at: date, updated_at: date,
    },
  },
  bookings: {
    table: "bookings",
    idCol: "id",
    hasCreatedAt: true,
    hasUpdatedAt: true,
    columns: {
      id: text, artist_id: text, event_name: text, venue: text, city: text,
      country_code: text, event_date: date, contact_name: text, contact_email: text,
      fee: num, currency: text, status: text, payment_status: text, contract_url: text,
      notes: text, created_at: date, updated_at: date,
    },
  },
  campaigns: {
    table: "campaigns",
    idCol: "id",
    hasCreatedAt: true,
    hasUpdatedAt: true,
    columns: {
      id: text, artist_id: text, brand_name: text, title: text, brief: text,
      deliverables: text, budget: num, status: text, deadline: date,
      contact_name: text, contact_email: text, created_at: date, updated_at: date,
    },
  },
  content_items: {
    table: "content_items",
    idCol: "id",
    hasCreatedAt: true,
    columns: {
      id: text, artist_id: text, title: text, content_type: text, platform: text,
      status: text, caption: text, asset_url: text, publish_at: date, created_at: date,
    },
  },
  contacts: {
    table: "contacts",
    idCol: "id",
    hasCreatedAt: true,
    columns: {
      id: text, full_name: text, company: text, email: text, phone: text,
      category: text, country: text, relationship: text, notes: text, created_at: date,
    },
  },
  tasks: {
    table: "tasks",
    idCol: "id",
    hasCreatedAt: true,
    columns: {
      id: text, artist_id: text, title: text, category: text, priority: text,
      status: text, due_at: date, assigned_to: text, created_at: date,
    },
  },
  financial_transactions: {
    table: "financial_transactions",
    idCol: "id",
    hasCreatedAt: true,
    columns: {
      id: text, artist_id: text, booking_id: text, campaign_id: text, label: text,
      type: text, amount: num, currency: text, status: text, transaction_date: date,
      invoice_number: text, notes: text, created_at: date,
    },
  },
  org_entries: {
    table: "org_entries",
    idCol: "id",
    hasCreatedAt: true,
    hasUpdatedAt: true,
    columns: {
      id: text, task: text, first_name: text, mission: text, status: text,
      commission_rate: text, notes: text, created_at: date, updated_at: date,
    },
  },
  death_note_entries: {
    table: "death_note_entries",
    idCol: "id",
    hasCreatedAt: true,
    hasUpdatedAt: true,
    columns: {
      id: text, name: text, entry_type: text, reason: text, status: text,
      notes: text, created_at: date, updated_at: date,
    },
  },
  service_pricing_entries: {
    table: "service_pricing_entries",
    idCol: "id",
    hasCreatedAt: true,
    hasUpdatedAt: true,
    columns: {
      id: text, seed_key: text, category: text, prestation: text, detail: text,
      target: text, price: text, billing_type: text, notes: text, sort_order: num,
      is_active: bool, created_at: date, updated_at: date,
    },
  },
  artist_private_events: {
    table: "artist_private_events",
    idCol: "id",
    hasCreatedAt: true,
    hasUpdatedAt: true,
    columns: {
      id: text, artist_id: text, title: text, starts_at: date, ends_at: date,
      location: text, category: text, notes: text, created_at: date, updated_at: date,
    },
  },
  artist_notes: {
    table: "artist_notes",
    idCol: "artist_id", // clé composite -> on gère via artist_id
    hasUpdatedAt: true,
    columns: { artist_id: text, content: text, updated_at: date },
  },
  team_members: {
    table: "team_members",
    idCol: "user_id",
    hasCreatedAt: true,
    columns: { user_id: text, display_name: text, role: text, created_at: date },
  },
};

const resourceSchema = z.enum(Object.keys(RESOURCES) as [string, ...string[]]);

function getConfig(resource: string): ResourceConfig | null {
  return RESOURCES[resource] ?? null;
}

/** Convertit un objet JSON en valeurs SQL (JSON.stringify pour json, bool -> 1/0) */
function toSqlValue(cfg: ResourceConfig, key: string, value: unknown): unknown {
  const type = cfg.columns[key];
  if (value === null || value === undefined) return null;
  if (type === "json") return typeof value === "string" ? value : JSON.stringify(value);
  if (type === "boolean") return value ? 1 : 0;
  return value;
}

function fromSqlRow(cfg: ResourceConfig, row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  for (const [k, t] of Object.entries(cfg.columns)) {
    if (t === "json" && out[k] != null && typeof out[k] === "string") {
      try { out[k] = JSON.parse(out[k] as string); } catch { /* keep raw */ }
    }
    if (t === "boolean") out[k] = out[k] === 1 || out[k] === true || out[k] === "1";
  }
  return out;
}

async function requireAuth(req: NextRequest) {
  const auth = await validateApiKey(req.headers.get("authorization"));
  if (!auth.ok) return null;
  return auth;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const auth = await requireAuth(req);
  if (!auth) return jsonError("Unauthorized: clé API manquante ou invalide", 401);

  const { path } = await params;
  const [resource, id] = path as [string, string | undefined];
  const conf = getConfig(resource);
  if (!conf) return jsonError(`Ressource inconnue: ${resource}`, 404);

  const db = await getDb();
  const url = new URL(req.url);
  const query = url.searchParams;

  try {
    if (id) {
      const { data, error } = await db
        .from(conf.table)
        .select("*")
        .eq(conf.idCol, id)
        .maybeSingle();
      if (error) return jsonError(error.message, 500);
      if (!data) return jsonError("Introuvable", 404);
      return NextResponse.json(fromSqlRow(conf, data as Record<string, unknown>));
    }

    // Filtres ?field=value (les clés autorisées)
    const filter: Record<string, unknown> = {};
    for (const [k, v] of query.entries()) {
      if (["limit", "offset", "order", "desc"].includes(k)) continue;
      if (k in conf.columns) filter[k] = v === "" ? null : v;
    }
    const limit = Number(query.get("limit") || 100);
    const offset = Number(query.get("offset") || 0);
    const orderCol = query.get("order") || conf.idCol;
    const desc = query.get("desc") === "1" || query.get("desc") === "true";

    let q: any = db.from(conf.table).select("*");
    for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
    if (orderCol in conf.columns) q = q.order(orderCol, desc ? "DESC" : "ASC");
    q = q.limit(Math.min(limit, 500)).offset(offset);
    const { data, error } = await q;
    if (error) return jsonError(error.message, 500);
    const rows = (data as Record<string, unknown>[]) || [];
    return NextResponse.json({ count: rows.length, items: rows.map((r) => fromSqlRow(conf, r)) });
  } catch (e: any) {
    return jsonError(e?.message || "Erreur serveur", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const auth = await requireAuth(req);
  if (!auth) return jsonError("Unauthorized: clé API manquante ou invalide", 401);

  const { path } = await params;
  const [resource] = path as [string];
  const conf = getConfig(resource);
  if (!conf) return jsonError(`Ressource inconnue: ${resource}`, 404);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("Body JSON invalide", 400);

  const allowed = Object.keys(conf.columns);
  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (allowed.includes(k)) payload[k] = v;
  }
  if (conf.required) {
    for (const r of conf.required) {
      if (payload[r] === undefined || payload[r] === null || payload[r] === "") {
        return jsonError(`Champ requis: ${r}`, 400);
      }
    }
  }

  const dto: Record<string, unknown> = { ...payload };
  if (dto[conf.idCol] == null) dto[conf.idCol] = randomUUID();
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (conf.hasCreatedAt && dto.created_at == null) dto.created_at = now;
  if (conf.hasUpdatedAt && dto.updated_at == null) dto.updated_at = now;

  // La colonne FK idcol de l'artiste doit exister pour les ressources liées
  const db = await getDb();
  try {
    const { data, error } = await db.from(conf.table).insert(dto);
    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ ok: true, id: data?.id ?? dto[conf.idCol] }, { status: 201 });
  } catch (e: any) {
    return jsonError(e?.message || "Erreur serveur", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const auth = await requireAuth(req);
  if (!auth) return jsonError("Unauthorized: clé API manquante ou invalide", 401);

  const { path } = await params;
  const [resource, id] = path as [string, string | undefined];
  if (!id) return jsonError("ID requis", 400);
  const conf = getConfig(resource);
  if (!conf) return jsonError(`Ressource inconnue: ${resource}`, 404);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("Body JSON invalide", 400);

  const allowed = Object.keys(conf.columns);
  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (allowed.includes(k) && k !== conf.idCol) payload[k] = v;
  }
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (conf.hasUpdatedAt) payload.updated_at = now;

  const db = await getDb();
  try {
    const upd = await db.from(conf.table).update(payload).eq(conf.idCol, id);
    if (upd.error) return jsonError(upd.error.message, 500);
    // MySQL UPDATE ne renvoie pas la ligne : on relit après mise à jour
    const { data, error } = await db.from(conf.table).select("*").eq(conf.idCol, id).maybeSingle();
    if (error) return jsonError(error.message, 500);
    if (!data) return jsonError("Introuvable", 404);
    return NextResponse.json({ ok: true, data: fromSqlRow(conf, data as Record<string, unknown>) });
  } catch (e: any) {
    return jsonError(e?.message || "Erreur serveur", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const auth = await requireAuth(req);
  if (!auth) return jsonError("Unauthorized: clé API manquante ou invalide", 401);

  const { path } = await params;
  const [resource, id] = path as [string, string | undefined];
  if (!id) return jsonError("ID requis", 400);
  const conf = getConfig(resource);
  if (!conf) return jsonError(`Ressource inconnue: ${resource}`, 404);

  const db = await getDb();
  try {
    const { data, error } = await db.from(conf.table).delete().eq(conf.idCol, id).maybeSingle();
    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ ok: true, deleted: !!data, id });
  } catch (e: any) {
    return jsonError(e?.message || "Erreur serveur", 500);
  }
}
