import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-key";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { generateApiKey, hashApiKey } from "@/lib/api-key";
import { hasAdminSession } from "@/lib/admin-auth";

/**
 * Gestion de la clé API admin (à utiliser depuis le back-office).
 *  GET  /api/admin/api-key/status  -> état (clé définie ? hash, pas la clé en clair)
 *  POST /api/admin/api-key/generate -> génère et renvoie UNE FOIS la clé en clair
 * Nécessite une session admin (cookie SKORM_admin) OU la clé API existante.
 */

async function authorized(req: Request) {
  if (await hasAdminSession()) return true;
  const auth = await validateApiKey(req.headers.get("authorization"));
  return auth.ok;
}

export async function GET(req: Request) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const { data } = await db
    .from("auth_users")
    .select("email, role, api_key_hash")
    .eq("role", "admin")
    .limit(5);
  const rows = (data as any[]) || [];
  return NextResponse.json({
    apiKeyConfigured: rows.some((r) => r.api_key_hash),
    envApiKeyConfigured: Boolean(process.env.ADMIN_API_KEY),
    accounts: rows.map((r) => ({ email: r.email, role: r.role, hasApiKey: Boolean(r.api_key_hash) })),
  });
}

const genSchema = z.object({
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = genSchema.safeParse(body ?? {});
  const { email } = parsed.success ? parsed.data : {};

  const db = await getDb();
  // Si l'email est fourni, cibler ce compte admin; sinon le premier rôle admin
  let target: any = null;
  if (email) {
    const { data } = await db.from("auth_users").select("*").eq("email", email).maybeSingle();
    target = data;
  } else {
    const { data } = await db.from("auth_users").select("*").eq("role", "admin").limit(1).then((r: any) => r);
    target = (data as any[])?.[0] ?? null;
  }
  if (!target) {
    return NextResponse.json({ error: "Aucun compte admin trouvé" }, { status: 404 });
  }

  const { raw, hash } = generateApiKey();
  // Stocker le hash (jamais la clé en clair)
  const { error } = await db.from("auth_users").update({ api_key_hash: hash }).eq("id", target.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // La clé en clair n'est renvoyée qu'UNE fois (l'utilisateur doit la copier)
  return NextResponse.json({
    ok: true,
    apiKey: raw,
    message: "Clé API générée. Copiez-la maintenant : elle ne sera plus affichée.",
  });
}
