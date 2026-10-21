import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Gestion de la clé API administratrice pour la passerelle API v1.
 *
 * La clé administrative est stockée dans la table auth_users (colonne api_key_hash)
 * et/ou fournie via l'environnement ADMIN_API_KEY. On valide en temps constant.
 *
 * !!! La clé en clair n'est JAMAIS stockée : seul son hash (sha256) est conservé.
 */

const API_KEY_HASH_COLUMN = "api_key_hash";

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(): { raw: string; hash: string } {
  const raw = "skorm_" + randomBytes(32).toString("base64url");
  return { raw, hash: hashApiKey(raw) };
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Validation du header Authorization: Bearer <clé>.
 * Accepte la clé si elle correspond à :
 *  - l'environnement ADMIN_API_KEY (si défini), ou
 *  - la table auth_users (hash sha256) pour un compte de rôle admin/owner.
 */
export async function validateApiKey(authHeader: string | null): Promise<{ ok: boolean; role?: string }> {
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return { ok: false };
  }
  const raw = authHeader.slice(7).trim();
  if (!raw) return { ok: false };

  // 1) Env ADMIN_API_KEY (fallback/opérationnel)
  const envKey = process.env.ADMIN_API_KEY;
  if (envKey && safeEqual(hashApiKey(raw), hashApiKey(envKey))) {
    return { ok: true, role: "admin" };
  }

  // 2) Table auth_users (hash stocké)
  try {
    const { getDb } = await import("@/lib/db");
    const db = await getDb();
    const { data } = await db
      .from("auth_users")
      .select("role, api_key_hash")
      .eq("api_key_hash", hashApiKey(raw))
      .maybeSingle();
    if (data && (data.role === "admin" || data.role === "owner")) {
      return { ok: true, role: data.role };
    }
  } catch {
    // silencieux : si la DB est indisponible, la clé env seule reste active
  }
  return { ok: false };
}
