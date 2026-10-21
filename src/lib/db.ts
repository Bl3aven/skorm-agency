import mysql, { RowDataPacket, ResultSetHeader, Pool } from "mysql2/promise";

// ---------------------------------------------------------------------------
// SKORM → portage Supabase vers MySQL (MariaDB o2switch).
// Ce module remplace getSupabaseServerClient() et fournit une API minimale
// compatible avec ce que le code attend : rpc(name, params) -> {data, error}
// et from(table) -> { select, insert, eq, single, ... subset de Supabase }.
// Les RPC admin_*/artist_* sont implémentées en JavaScript (requêtes directes).
// ---------------------------------------------------------------------------

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    // DATABASE_URL format: mysql://user:pass@host:port/db
    pool = mysql.createPool({
      uri: url,
      connectionLimit: 5,
      waitForConnections: true,
      namedPlaceholders: false,
      dateStrings: true,
    });
  }
  return pool;
}

export type AppError = Error & { code?: string; message: string };
export type DbResult<T = any> = { data: T | null; error: AppError | null };

function nowIso(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function hasSecret(): boolean {
  return Boolean(process.env.ADMIN_DB_SECRET);
}

function checkSecret(secret?: string): void {
  if (!hasSecret() || secret !== process.env.ADMIN_DB_SECRET) {
    throw new Error("Invalid ADMIN_DB_SECRET");
  }
}

// ---------------------------------------------------------------------------
// $table + helpers
// ---------------------------------------------------------------------------

function tableFor(kind: string): string {
  const map: Record<string, string> = {
    artist: "artists",
    event: "events",
    booking: "bookings",
    campaign: "campaigns",
    content: "content_items",
    contact: "contacts",
    task: "tasks",
    finance: "financial_transactions",
    inquiry: "inquiries",
  };
  const t = map[kind];
  if (!t) throw new Error(`Unknown kind: ${kind}`);
  return t;
}

function rowsToCamel(rows: RowDataPacket[]): Record<string, unknown>[] {
  return rows.map((r) => {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(r)) {
      out[k] = (r as Record<string, unknown>)[k];
    }
    return out;
  });
}

// ---------------------------------------------------------------------------
// RPC implementations (les 23 fonctions Supabase appelées par le code)
// ---------------------------------------------------------------------------

type RpcParams = Record<string, unknown>;

function normalizePayload(p: RpcParams, table: string): Record<string, unknown> {
  // p_payload est un objet {col: val} déjà en camelCase dans certains cas ;
  // le code envoie des clés camelCase (ex. contactName). On tente de mapper vers snake_case.
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    let key = k;
    // camelCase -> snake_case
    key = key.replace(/([A-Z])/g, (_, c: string) => "_" + c.toLowerCase());
    out[key] = v;
  }
  return out;
}


function asThenable<T>(p: Promise<DbResult<T>>): DbResult<T> & { abortSignal: (s?: unknown) => typeof wrapped } {
  const wrapped = {
    then: (onfulfilled: (v: DbResult<T>) => unknown, onrejected?: (e: unknown) => unknown) => p.then(onfulfilled, onrejected),
    catch: (onrejected: (e: unknown) => unknown) => p.catch(onrejected),
    finally: (onfinally: () => void) => p.finally(onfinally),
    abortSignal: () => wrapped,
  };
  return wrapped as unknown as DbResult<T> & { abortSignal: (s?: unknown) => typeof wrapped };
}

export async function rpc(name: string, params: RpcParams = {}): Promise<DbResult> {
  const secret = (params.p_secret as string) || undefined;
  const pool = getPool();
  try {
    checkSecret(secret);
    // eslint-disable-next-line no-console
    console.log(`[db.rpc] ${name}`, Object.keys(params).filter((k) => k !== "p_secret"));
    switch (name) {
      // ---- artists / public ----
      case "admin_upsert_public_artist": {
        const id = (params.p_id as string) || null;
        const slug = params.p_slug as string;
        const payload = (params.p_payload as RpcParams) || {};
        if (id) {
          await (pool as any).execute("UPDATE artists SET name=?, tagline=?, bio=?, instagram_url=?, image_url=?, home_image_url=?, media_sounds=?, media_releases=?, media_videos=?, featured_sound=?, updated_at=? WHERE id=?", [
            payload.name ?? null, payload.tagline ?? null, payload.bio ?? null,
            payload.instagram_url ?? null, payload.image_url ?? null, payload.home_image_url ?? null,
            JSON.stringify(payload.media_sounds ?? []), JSON.stringify(payload.media_releases ?? []),
            JSON.stringify(payload.media_videos ?? []), JSON.stringify(payload.featured_sound ?? null),
            nowIso(), id,
          ]);
          return { data: id, error: null };
        }
        const nuid = crypto.randomUUID();
        await (pool as any).execute(
          "INSERT INTO artists (id, slug, name, tagline, bio, instagram_url, image_url, home_image_url, media_sounds, media_releases, media_videos, featured_sound, display_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [nuid, slug, payload.name ?? "", payload.tagline ?? null, payload.bio ?? null,
           payload.instagram_url ?? null, payload.image_url ?? null, payload.home_image_url ?? null,
           JSON.stringify(payload.media_sounds ?? []), JSON.stringify(payload.media_releases ?? []),
           JSON.stringify(payload.media_videos ?? []), JSON.stringify(payload.featured_sound ?? null), payload.display_order ?? 0]
        );
        return { data: nuid, error: null };
      }
      case "admin_create_artist": {
        const slug = params.p_slug as string;
        const nuid = crypto.randomUUID();
        await (pool as any).execute(
          "INSERT INTO artists (id, slug, name, tagline, instagram_url, display_order) VALUES (?,?,?,?,?,100)",
          [nuid, slug, params.p_name ?? "", params.p_tagline ?? null, params.p_instagram_url ?? null]
        );
        return { data: nuid, error: null };
      }
      case "admin_delete_backoffice_item": {
        const t = tableFor(params.p_kind as string);
        await (pool as any).execute(`DELETE FROM ${t} WHERE id=?`, [params.p_id as string]);
        return { data: true, error: null };
      }
      case "admin_update_backoffice_item": {
        const t = tableFor(params.p_kind as string);
        const payload = normalizePayload((params.p_payload as RpcParams) || {}, t);
        if (params.p_kind === "artist" && params.p_id) {
          await (pool as any).execute(
            "UPDATE artists SET name=?, tagline=?, bio=?, instagram_url=?, updated_at=? WHERE id=?",
            [payload.name ?? null, payload.tagline ?? null, payload.bio ?? null, payload.instagram_url ?? null, nowIso(), params.p_id]
          );
        } else {
          const keys = Object.keys(payload);
          if (keys.length > 0) {
            const sets = keys.map((k) => `${k}=?`).join(", ");
            await (pool as any).execute(`UPDATE ${t} SET ${sets}, updated_at=? WHERE id=?`, [...keys.map((k) => payload[k]), nowIso(), params.p_id]);
          }
        }
        return { data: true, error: null };
      }
      case "admin_create_backoffice_item": {
        const t = tableFor(params.p_kind as string);
        const payload = normalizePayload((params.p_payload as RpcParams) || {}, t);
        const nuid = crypto.randomUUID();
        const keys = Object.keys(payload).filter((k) => k !== "id");
        const vals = keys.map((k) => payload[k]);
        const cols = ["id", ...keys];
        await (pool as any).execute(`INSERT INTO ${t} (${cols.join(",")}) VALUES (?,${keys.map(() => "?").join(",")})`, [nuid, ...vals]);
        return { data: nuid, error: null };
      }
      case "admin_get_backoffice": {
        const [artists] = await (pool as any).execute("SELECT * FROM artists ORDER BY display_order, name");
        const [events] = await (pool as any).execute("SELECT * FROM events ORDER BY starts_at");
        const [bookings] = await (pool as any).execute("SELECT * FROM bookings ORDER BY event_date DESC");
        const [campaigns] = await (pool as any).execute("SELECT * FROM campaigns ORDER BY created_at DESC");
        const [content] = await (pool as any).execute("SELECT * FROM content_items ORDER BY created_at DESC");
        const [contacts] = await (pool as any).execute("SELECT * FROM contacts ORDER BY created_at DESC");
        const [tasks] = await (pool as any).execute("SELECT * FROM tasks ORDER BY due_at");
        const [finances] = await (pool as any).execute("SELECT * FROM financial_transactions ORDER BY transaction_date DESC");
        const [inquiries] = await (pool as any).execute("SELECT * FROM inquiries ORDER BY created_at DESC");
        return {
          data: {
            artists: rowsToCamel(artists as RowDataPacket[]),
            events: rowsToCamel(events as RowDataPacket[]),
            bookings: rowsToCamel(bookings as RowDataPacket[]),
            campaigns: rowsToCamel(campaigns as RowDataPacket[]),
            content: rowsToCamel(content as RowDataPacket[]),
            contacts: rowsToCamel(contacts as RowDataPacket[]),
            tasks: rowsToCamel(tasks as RowDataPacket[]),
            finances: rowsToCamel(finances as RowDataPacket[]),
            inquiries: rowsToCamel(inquiries as RowDataPacket[]),
          },
          error: null,
        };
      }
      case "admin_get_artist_workspace": {
        const [artists] = await (pool as any).execute("SELECT * FROM artists ORDER BY display_order, name");
        const [pe] = await (pool as any).execute("SELECT * FROM artist_private_events ORDER BY starts_at");
        const [notes] = await (pool as any).execute("SELECT * FROM artist_notes");
        return {
          data: {
            artists: rowsToCamel(artists as RowDataPacket[]),
            events: rowsToCamel(pe as RowDataPacket[]),
            notes: rowsToCamel(notes as RowDataPacket[]),
          },
          error: null,
        };
      }
      case "admin_create_private_event": {
        const nuid = crypto.randomUUID();
        await (pool as any).execute(
          "INSERT INTO artist_private_events (id, artist_id, title, starts_at, ends_at, location, category, notes) VALUES (?,?,?,?,?,?,?,?)",
          [nuid, params.p_artist_id, params.p_title, params.p_starts_at, params.p_ends_at ?? null,
           params.p_location ?? null, params.p_category ?? "rendez-vous", params.p_notes ?? null]
        );
        return { data: nuid, error: null };
      }
      case "admin_update_private_event": {
        await (pool as any).execute(
          "UPDATE artist_private_events SET title=?, starts_at=?, ends_at=?, location=?, category=?, notes=?, updated_at=? WHERE id=?",
          [params.p_title, params.p_starts_at, params.p_ends_at ?? null, params.p_location ?? null,
           params.p_category, params.p_notes ?? null, nowIso(), params.p_id]
        );
        return { data: true, error: null };
      }
      case "admin_delete_private_event": {
        await (pool as any).execute("DELETE FROM artist_private_events WHERE id=?", [params.p_id as string]);
        return { data: true, error: null };
      }
      case "admin_save_artist_note": {
        await (pool as any).execute(
          "INSERT INTO artist_notes (artist_id, content, updated_at) VALUES (?,?,?) ON DUPLICATE KEY UPDATE content=VALUES(content), updated_at=VALUES(updated_at)",
          [params.p_artist_id, params.p_content ?? "", nowIso()]
        );
        return { data: true, error: null };
      }
      case "admin_get_service_pricing_entries": {
        const [rows] = await (pool as any).execute("SELECT * FROM service_pricing_entries ORDER BY sort_order, category");
        return { data: rowsToCamel(rows as RowDataPacket[]), error: null };
      }
      case "admin_upsert_service_pricing_entry": {
        const id = params.p_id as string || crypto.randomUUID();
        const p = (params.p_payload as RpcParams) || {};
        await (pool as any).execute(
          `INSERT INTO service_pricing_entries (id, seed_key, category, prestation, detail, target, price, billing_type, notes, sort_order, is_active, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
           ON DUPLICATE KEY UPDATE category=VALUES(category), prestation=VALUES(prestation), detail=VALUES(detail), target=VALUES(target), price=VALUES(price), billing_type=VALUES(billing_type), notes=VALUES(notes), sort_order=VALUES(sort_order), is_active=VALUES(is_active), updated_at=VALUES(updated_at)`,
          [id, p.seed_key ?? null, p.category ?? "", p.prestation ?? "", p.detail ?? "", p.target ?? "",
           p.price ?? "", p.billing_type ?? "", p.notes ?? "", p.sort_order ?? 0, p.is_active !== false ? 1 : 0, nowIso()]
        );
        return { data: id, error: null };
      }
      case "admin_delete_service_pricing_entry": {
        await (pool as any).execute("DELETE FROM service_pricing_entries WHERE id=?", [params.p_id as string]);
        return { data: true, error: null };
      }
      case "admin_get_private_lists": {
        const [org] = await (pool as any).execute("SELECT * FROM org_entries ORDER BY created_at DESC");
        const [death] = await (pool as any).execute("SELECT * FROM death_note_entries ORDER BY created_at DESC");
        return { data: { org: rowsToCamel(org as RowDataPacket[]), death: rowsToCamel(death as RowDataPacket[]) }, error: null };
      }
      case "admin_upsert_org_entry":
      case "admin_upsert_death_note_entry": {
        const tbl = name === "admin_upsert_org_entry" ? "org_entries" : "death_note_entries";
        const id = params.p_id as string || crypto.randomUUID();
        const p = (params.p_payload as RpcParams) || {};
        const keys = Object.keys(p).filter((k) => k !== "id").map((k) => k.replace(/([A-Z])/g, (_, c: string) => "_" + c.toLowerCase()));
        const vals = keys.map((k) => p[k.replace(/([A-Z])/g, (_, c: string) => "_" + c.toLowerCase())]);
        await (pool as any).execute(
          `INSERT INTO ${tbl} (id, ${keys.join(",")}) VALUES (?,${keys.map(() => "?").join(",")})
           ON DUPLICATE KEY UPDATE ${keys.map((k) => `${k}=VALUES(${k})`).join(",")}`,
          [id, ...vals]
        );
        return { data: id, error: null };
      }
      case "admin_delete_org_entry": {
        await (pool as any).execute("DELETE FROM org_entries WHERE id=?", [params.p_id as string]);
        return { data: true, error: null };
      }
      case "admin_delete_death_note_entry": {
        await (pool as any).execute("DELETE FROM death_note_entries WHERE id=?", [params.p_id as string]);
        return { data: true, error: null };
      }
      case "admin_delete_inquiry": {
        await (pool as any).execute("DELETE FROM inquiries WHERE id=?", [params.p_id as string]);
        return { data: true, error: null };
      }
      case "admin_update_inquiry": {
        await (pool as any).execute(
          "UPDATE inquiries SET status=?, internal_notes=?, updated_at=? WHERE id=?",
          [params.p_status ?? null, params.p_internal_notes ?? null, nowIso(), params.p_id]
        );
        return { data: true, error: null };
      }
      // ---- artist routes ----
      case "artist_save_profile": {
        const slug = params.p_slug as string;
        const p = (params.p_payload as RpcParams) || {};
        await (pool as any).execute(
          "UPDATE artists SET tagline=?, bio=?, instagram_url=?, image_url=?, home_image_url=?, featured_sound=?, media_sounds=?, media_releases=?, media_videos=?, updated_at=? WHERE slug=?",
          [p.tagline ?? null, p.bio ?? null, p.instagram_url ?? null, p.image_url ?? null, p.home_image_url ?? null,
           JSON.stringify(p.featured_sound ?? null), JSON.stringify(p.media_sounds ?? []),
           JSON.stringify(p.media_releases ?? []), JSON.stringify(p.media_videos ?? []), nowIso(), slug]
        );
        return { data: true, error: null };
      }
      case "artist_manage_public_event": {
        const action = params.p_action as string;
        if (action === "create") {
          const nuid = crypto.randomUUID();
          const startsAt = params.p_starts_at && String(params.p_starts_at).trim()
            ? params.p_starts_at
            : new Date().toISOString().slice(0, 10) + "T00:00:00";
          await (pool as any).execute(
            "INSERT INTO events (id, artist_id, title, venue, city, country_code, starts_at, status, is_published, image_url) VALUES (?,?,?,?,?,?,?,?,?,?)",
            [nuid, params.p_artist_id, params.p_title, params.p_location ?? "", params.p_city ?? "", "FR",
             startsAt, "confirmed", params.p_publish ? 1 : 1, params.p_image_url ?? null]
          );
          return { data: nuid, error: null };
        }
        await (pool as any).execute("UPDATE events SET title=?, venue=?, city=?, status=?, is_published=?, image_url=? WHERE id=?", [
          params.p_title, params.p_location ?? "", params.p_city ?? "", params.p_status ?? "confirmed",
          params.p_publish ? 1 : 0, params.p_image_url ?? null, params.p_id,
        ]);
        return { data: true, error: null };
      }
      default:
        return { data: null, error: new Error(`Unknown RPC: ${name}`) };
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`[db.rpc] ${name} ->`, e);
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

// ---------------------------------------------------------------------------
// from(table) — sous-ensemble compatible Supabase
// ---------------------------------------------------------------------------

interface QueryOpts {
 select?: string;
 eq?: [string, unknown][];
 single?: boolean;
 limitN?: number;
 maybeSingle?: boolean;
 insertRow?: Record<string, unknown>;
 order?: [string, string];
 offsetN?: number;
}

export function from(table: string) {
  const opts: QueryOpts = {};
  const builder = {
    select: (cols = "*") => {
      opts.select = cols;
      return builder;
    },
    insert: (row: Record<string, unknown>) => {
      opts.insertRow = row;
      return builder;
    },
    update: (row: Record<string, unknown>) => {
      opts.insertRow = row;
      (opts as { _update?: boolean })._update = true;
      return builder;
    },
    delete: () => {
      (opts as { _delete?: boolean })._delete = true;
      return builder;
    },
    eq: (col: string, val: unknown) => {
      opts.eq = opts.eq || [];
      opts.eq.push([col, val]);
      return builder;
    },
    single: () => {
      opts.single = true;
      return builder;
    },
    maybeSingle: () => {
      opts.maybeSingle = true;
      return builder;
    },
    limit: (n: number) => {
      opts.limitN = n;
      return builder;
    },
    offset: (n: number) => {
      opts.offsetN = n;
      return builder;
    },
    order: (col: string, dir: string) => {
      opts.order = [col, dir];
      return builder;
    },
    abortSignal: () => builder,
    then: async (resolve: (r: DbResult) => void) => {
      const r = await executeQuery(table, opts);
      resolve(r);
      return r;
    },
    // pour `await`
    toJSON: () => ({}),
  };
  return builder;
}

async function executeQuery(table: string, opts: QueryOpts): Promise<DbResult> {
  try {
    const pool = getPool();
    if (opts.insertRow) {
      // INSERT (ou UPDATE si _update + eq)
      const isUpdate = Boolean((opts as { _update?: boolean })._update);
      if (isUpdate && opts.eq && opts.eq.length > 0) {
        const sets = Object.keys(opts.insertRow).map((k) => `${k}=?`);
        const values = Object.values(opts.insertRow);
        const where = opts.eq.map(([c, v]) => `${c}=?`);
        const whereVals = opts.eq.map(([, v]) => v);
        await (pool as any).execute(`UPDATE ${table} SET ${sets.join(",")} WHERE ${where.join(" AND ")}`, [...values, ...whereVals]);
        return { data: null, error: null };
      }
      const row = { ...opts.insertRow };
      // Générer un id UUID si la table a une colonne id et qu'aucun n'est fourni
      // (toutes nos tables ont une clé primaire id CHAR(36) sans défaut MySQL)
      if (!row.id) {
        row.id = crypto.randomUUID();
      }
      // Convertir les objets en JSON (les colonnes JSON de MySQL attendent une chaîne)
      const keys = Object.keys(row);
      const vals = keys.map((k) => {
        const v = row[k];
        if (v === null || v === undefined) return null;
        if (typeof v === "object") return JSON.stringify(v);
        return v;
      });
      await (pool as any).execute(
        `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
        vals
      );
      return { data: null, error: null };
    }
    if ((opts as { _delete?: boolean })._delete) {
      if (!opts.eq || opts.eq.length === 0) return { data: null, error: new Error("DELETE sans WHERE: interdit") };
      const where = opts.eq.map(([c, v]) => `${c}=?`);
      const whereVals = opts.eq.map(([, v]) => v);
      const [result] = await (pool as any).execute(`DELETE FROM ${table} WHERE ${where.join(" AND ")}`, whereVals);
      return { data: { affectedRows: (result as any)?.affectedRows ?? 0 }, error: null };
    }
    let sql = `SELECT * FROM ${table}`;
    const params: unknown[] = [];
    if (opts.eq && opts.eq.length > 0) {
      sql += ` WHERE ` + opts.eq.map(([c, v]) => `${c}=?`).join(" AND ");
      for (const [, v] of opts.eq) params.push(v);
    }
    if (opts.order) sql += ` ORDER BY ${opts.order[0]} ${opts.order[1]}`;
    if (opts.limitN) sql += ` LIMIT ${opts.limitN}`;
    if (opts.offsetN) sql += ` OFFSET ${opts.offsetN}`;
    if (opts.single || opts.maybeSingle) sql += " LIMIT 1";
    const [rows] = await (pool as any).execute(sql, params);
    const out = rowsToCamel(rows as RowDataPacket[]);
    if (opts.single || opts.maybeSingle) {
      return { data: out[0] ?? null, error: null };
    }
    return { data: out, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

// ---------------------------------------------------------------------------
// getDb() — le point d'entrée que les routes devront importer
// ---------------------------------------------------------------------------

export async function getDb() {
  return {
    pool: getPool(),
    rpc,
    from,
    execute: (sql: string, params: unknown[] = []) => (getPool() as any).execute(sql, params),
    query: (sql: string, params: unknown[] = []) => (getPool() as any).query(sql, params),
  };
}

export default { getDb, getPool, rpc, from };
